-- Enhanced Stock Management Functions and Triggers
-- Handles batch tracking, FEFO logic, reservations, and reorder alerts

-- Function to get available stock (current - reserved)
CREATE OR REPLACE FUNCTION public.get_available_stock(product_id_param uuid)
RETURNS numeric
LANGUAGE plpgsql
AS $$
DECLARE
    available_qty numeric;
BEGIN
    SELECT COALESCE(current_stock, 0) - COALESCE(reserved_stock, 0)
    INTO available_qty
    FROM public.products
    WHERE id = product_id_param;
    
    RETURN COALESCE(available_qty, 0);
END;
$$;

-- Function to get next expiring batch (FEFO - First Expired, First Out)
CREATE OR REPLACE FUNCTION public.get_next_expiring_batch(product_id_param uuid, merchant_id_param uuid)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
    batch_id_result uuid;
BEGIN
    SELECT id INTO batch_id_result
    FROM public.product_batches
    WHERE product_id = product_id_param 
      AND merchant_id = merchant_id_param
      AND is_active = true
      AND current_stock > reserved_stock
    ORDER BY expiry_date ASC, created_at ASC
    LIMIT 1;
    
    RETURN batch_id_result;
END;
$$;

-- Function to allocate stock from batches (FEFO logic)
CREATE OR REPLACE FUNCTION public.allocate_stock_from_batches(
    product_id_param uuid,
    merchant_id_param uuid,
    quantity_needed numeric,
    reservation_type_param text DEFAULT 'sale',
    reference_id_param uuid DEFAULT NULL
)
RETURNS TABLE(batch_id uuid, allocated_quantity numeric)
LANGUAGE plpgsql
AS $$
DECLARE
    batch_record RECORD;
    remaining_qty numeric := quantity_needed;
    allocated_qty numeric;
BEGIN
    -- Loop through batches in FEFO order
    FOR batch_record IN
        SELECT id, current_stock, reserved_stock
        FROM public.product_batches
        WHERE product_id = product_id_param 
          AND merchant_id = merchant_id_param
          AND is_active = true
          AND current_stock > reserved_stock
        ORDER BY expiry_date ASC, created_at ASC
    LOOP
        EXIT WHEN remaining_qty <= 0;
        
        -- Calculate how much we can allocate from this batch
        allocated_qty := LEAST(remaining_qty, batch_record.current_stock - batch_record.reserved_stock);
        
        IF allocated_qty > 0 THEN
            -- Reserve the stock in this batch
            UPDATE public.product_batches
            SET reserved_stock = reserved_stock + allocated_qty
            WHERE id = batch_record.id;
            
            -- Create reservation record
            INSERT INTO public.stock_reservations (
                merchant_id, product_id, batch_id, quantity, 
                reservation_type, reference_id, expires_at
            ) VALUES (
                merchant_id_param, product_id_param, batch_record.id, allocated_qty,
                reservation_type_param, reference_id_param, 
                now() + interval '24 hours' -- Default 24h expiry
            );
            
            -- Return the allocation
            batch_id := batch_record.id;
            allocated_quantity := allocated_qty;
            RETURN NEXT;
            
            remaining_qty := remaining_qty - allocated_qty;
        END IF;
    END LOOP;
    
    -- Update product reserved stock
    UPDATE public.products
    SET reserved_stock = reserved_stock + (quantity_needed - remaining_qty)
    WHERE id = product_id_param;
END;
$$;

-- Function to release stock reservations
CREATE OR REPLACE FUNCTION public.release_stock_reservation(reservation_id_param uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    reservation_record RECORD;
BEGIN
    SELECT * INTO reservation_record
    FROM public.stock_reservations
    WHERE id = reservation_id_param AND is_active = true;
    
    IF FOUND THEN
        -- Release from batch if batch-specific
        IF reservation_record.batch_id IS NOT NULL THEN
            UPDATE public.product_batches
            SET reserved_stock = reserved_stock - reservation_record.quantity
            WHERE id = reservation_record.batch_id;
        END IF;
        
        -- Release from product
        UPDATE public.products
        SET reserved_stock = reserved_stock - reservation_record.quantity
        WHERE id = reservation_record.product_id;
        
        -- Mark reservation as inactive
        UPDATE public.stock_reservations
        SET is_active = false, updated_at = now()
        WHERE id = reservation_id_param;
    END IF;
END;
$$;

-- Function to consume reserved stock (when sale is confirmed)
CREATE OR REPLACE FUNCTION public.consume_reserved_stock(
    product_id_param uuid,
    merchant_id_param uuid,
    quantity_param numeric,
    reference_id_param uuid
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    reservation_record RECORD;
    remaining_qty numeric := quantity_param;
    consume_qty numeric;
BEGIN
    -- Find and consume reservations for this reference
    FOR reservation_record IN
        SELECT * FROM public.stock_reservations
        WHERE product_id = product_id_param 
          AND merchant_id = merchant_id_param
          AND reference_id = reference_id_param
          AND is_active = true
        ORDER BY created_at ASC
    LOOP
        EXIT WHEN remaining_qty <= 0;
        
        consume_qty := LEAST(remaining_qty, reservation_record.quantity);
        
        -- Consume from batch
        IF reservation_record.batch_id IS NOT NULL THEN
            UPDATE public.product_batches
            SET 
                current_stock = current_stock - consume_qty,
                reserved_stock = reserved_stock - consume_qty
            WHERE id = reservation_record.batch_id;
        END IF;
        
        -- Update reservation
        IF consume_qty = reservation_record.quantity THEN
            -- Fully consumed
            UPDATE public.stock_reservations
            SET is_active = false, updated_at = now()
            WHERE id = reservation_record.id;
        ELSE
            -- Partially consumed
            UPDATE public.stock_reservations
            SET quantity = quantity - consume_qty, updated_at = now()
            WHERE id = reservation_record.id;
        END IF;
        
        remaining_qty := remaining_qty - consume_qty;
    END LOOP;
    
    -- Update product stock
    UPDATE public.products
    SET 
        current_stock = current_stock - quantity_param,
        reserved_stock = reserved_stock - quantity_param
    WHERE id = product_id_param;
END;
$$;

-- Function to check and create reorder alerts
CREATE OR REPLACE FUNCTION public.check_reorder_alerts()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    product_record RECORD;
    alert_level_val text;
    available_stock_val numeric;
BEGIN
    FOR product_record IN
        SELECT id, merchant_id, name, current_stock, reserved_stock, reorder_point, reorder_quantity
        FROM public.products
        WHERE reorder_point > 0 AND status = 'active'
    LOOP
        available_stock_val := product_record.current_stock - product_record.reserved_stock;
        
        -- Determine alert level
        IF available_stock_val <= 0 THEN
            alert_level_val := 'out_of_stock';
        ELSIF available_stock_val <= (product_record.reorder_point * 0.5) THEN
            alert_level_val := 'critical';
        ELSIF available_stock_val <= product_record.reorder_point THEN
            alert_level_val := 'low';
        ELSE
            CONTINUE; -- No alert needed
        END IF;
        
        -- Check if alert already exists for today
        IF NOT EXISTS (
            SELECT 1 FROM public.reorder_alerts
            WHERE product_id = product_record.id
              AND DATE(created_at) = CURRENT_DATE
              AND is_acknowledged = false
        ) THEN
            -- Create new alert
            INSERT INTO public.reorder_alerts (
                merchant_id, product_id, current_stock, reorder_point,
                suggested_quantity, alert_level
            ) VALUES (
                product_record.merchant_id, product_record.id, available_stock_val,
                product_record.reorder_point, product_record.reorder_quantity, alert_level_val
            );
        END IF;
    END LOOP;
END;
$$;

-- Function to handle expired reservations cleanup
CREATE OR REPLACE FUNCTION public.cleanup_expired_reservations()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    expired_reservation RECORD;
BEGIN
    FOR expired_reservation IN
        SELECT id FROM public.stock_reservations
        WHERE expires_at < now() AND is_active = true
    LOOP
        PERFORM public.release_stock_reservation(expired_reservation.id);
    END LOOP;
END;
$$;

-- Enhanced sale items trigger with batch allocation
CREATE OR REPLACE FUNCTION public.enhanced_sale_items_after_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_merchant uuid;
    v_product RECORD;
BEGIN
    SELECT s.merchant_id INTO v_merchant FROM public.sales s WHERE s.id = NEW.sale_id;
    IF v_merchant IS NULL THEN
        RETURN NEW;
    END IF;
    
    SELECT * INTO v_product FROM public.products WHERE id = NEW.product_id;
    
    -- If product requires batch tracking, consume from batches
    IF v_product.requires_batch_tracking THEN
        PERFORM public.consume_reserved_stock(NEW.product_id, v_merchant, NEW.quantity, NEW.sale_id);
    ELSE
        -- Simple stock deduction for non-batch products
        UPDATE public.products
        SET current_stock = current_stock - NEW.quantity
        WHERE id = NEW.product_id;
    END IF;
    
    -- Log stock movement
    INSERT INTO public.stock_movements (merchant_id, product_id, transaction_type, transaction_id, quantity_change)
    VALUES (v_merchant, NEW.product_id, 'sale', NEW.sale_id, -1 * NEW.quantity);
    
    -- Check for reorder alerts
    PERFORM public.check_reorder_alerts();
    
    RETURN NEW;
END;
$$;

-- Enhanced purchase items trigger with batch creation
CREATE OR REPLACE FUNCTION public.enhanced_purchase_items_after_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_merchant uuid;
    v_product RECORD;
    v_batch_id uuid;
    v_expiry_date date;
BEGIN
    SELECT p.merchant_id INTO v_merchant FROM public.purchases p WHERE p.id = NEW.purchase_id;
    IF v_merchant IS NULL THEN
        RETURN NEW;
    END IF;
    
    SELECT * INTO v_product FROM public.products WHERE id = NEW.product_id;
    
    -- If product requires batch tracking, create batch
    IF v_product.requires_batch_tracking THEN
        -- Calculate expiry date
        v_expiry_date := CURRENT_DATE + (v_product.shelf_life_days || ' days')::interval;
        
        -- Create batch record
        INSERT INTO public.product_batches (
            merchant_id, product_id, batch_number, manufacturing_date, 
            expiry_date, purchase_price, current_stock, purchase_id
        ) VALUES (
            v_merchant, NEW.product_id, 
            COALESCE(NEW.batch_number, 'BATCH-' || to_char(now(), 'YYYYMMDD') || '-' || substring(gen_random_uuid()::text, 1, 8)),
            CURRENT_DATE, v_expiry_date, COALESCE(NEW.unit_price, 0), NEW.quantity, NEW.purchase_id
        ) RETURNING id INTO v_batch_id;
    END IF;
    
    -- Update product stock
    UPDATE public.products
    SET current_stock = current_stock + NEW.quantity
    WHERE id = NEW.product_id;
    
    -- Log stock movement
    INSERT INTO public.stock_movements (merchant_id, product_id, transaction_type, transaction_id, quantity_change)
    VALUES (v_merchant, NEW.product_id, 'purchase', NEW.purchase_id, NEW.quantity);
    
    RETURN NEW;
END;
$$;

-- Replace existing triggers with enhanced versions
DROP TRIGGER IF EXISTS trg_sale_items_ai ON public.sale_items;
CREATE TRIGGER trg_sale_items_ai
AFTER INSERT ON public.sale_items
FOR EACH ROW EXECUTE FUNCTION public.enhanced_sale_items_after_insert();

DROP TRIGGER IF EXISTS trg_purchase_items_ai ON public.purchase_items;
CREATE TRIGGER trg_purchase_items_ai
AFTER INSERT ON public.purchase_items
FOR EACH ROW EXECUTE FUNCTION public.enhanced_purchase_items_after_insert();
