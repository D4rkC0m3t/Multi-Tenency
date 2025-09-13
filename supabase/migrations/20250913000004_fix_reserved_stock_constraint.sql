-- Fix reserved stock constraint violation in POS sales
-- The issue is that allocate_stock_fefo tries to subtract from reserved_stock even when there are no reservations

-- Drop and recreate the allocate_stock_fefo function with proper reservation handling
DROP FUNCTION IF EXISTS public.allocate_stock_fefo(uuid, uuid, numeric);

CREATE OR REPLACE FUNCTION public.allocate_stock_fefo(
    product_id_param uuid,
    merchant_id_param uuid,
    quantity_param numeric
)
RETURNS TABLE(batch_id uuid, allocated_quantity numeric)
LANGUAGE plpgsql
AS $$
DECLARE
    batch_record RECORD;
    remaining_qty numeric := quantity_param;
    allocate_qty numeric;
BEGIN
    -- Check if product has batch tracking enabled
    IF EXISTS (
        SELECT 1 FROM public.products 
        WHERE id = product_id_param 
        AND requires_batch_tracking = true
    ) THEN
        -- Allocate from batches using FEFO (First Expired, First Out)
        FOR batch_record IN
            SELECT id, current_stock, reserved_stock, expiry_date
            FROM public.product_batches
            WHERE product_id = product_id_param 
              AND merchant_id = merchant_id_param
              AND is_active = true
              AND (current_stock - reserved_stock) > 0
            ORDER BY 
                CASE WHEN expiry_date IS NULL THEN 1 ELSE 0 END,
                expiry_date ASC NULLS LAST
        LOOP
            EXIT WHEN remaining_qty <= 0;
            
            allocate_qty := LEAST(remaining_qty, batch_record.current_stock - batch_record.reserved_stock);
            
            -- Update batch stock
            UPDATE public.product_batches
            SET current_stock = current_stock - allocate_qty
            WHERE id = batch_record.id;
            
            -- Return allocation result
            batch_id := batch_record.id;
            allocated_quantity := allocate_qty;
            RETURN NEXT;
            
            remaining_qty := remaining_qty - allocate_qty;
        END LOOP;
    ELSE
        -- For non-batch tracked products, allocate directly from product stock
        allocate_qty := LEAST(remaining_qty, (
            SELECT current_stock - reserved_stock 
            FROM public.products 
            WHERE id = product_id_param
        ));
        
        IF allocate_qty > 0 THEN
            batch_id := NULL;
            allocated_quantity := allocate_qty;
            RETURN NEXT;
            remaining_qty := remaining_qty - allocate_qty;
        END IF;
    END IF;
    
    -- Update product stock (only subtract what was actually allocated)
    UPDATE public.products
    SET current_stock = current_stock - (quantity_param - remaining_qty)
    WHERE id = product_id_param;
    
    -- If we couldn't allocate the full quantity, raise an error
    IF remaining_qty > 0 THEN
        RAISE EXCEPTION 'Insufficient stock available. Requested: %, Available: %', 
            quantity_param, quantity_param - remaining_qty;
    END IF;
END;
$$;

-- Also fix the consume_reserved_stock function used by triggers
DROP FUNCTION IF EXISTS public.consume_reserved_stock(uuid, uuid, numeric, uuid);

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
    total_reserved numeric := 0;
BEGIN
    -- Calculate total reserved stock for this reference
    SELECT COALESCE(SUM(quantity), 0) INTO total_reserved
    FROM public.stock_reservations
    WHERE product_id = product_id_param 
      AND merchant_id = merchant_id_param
      AND reference_id = reference_id_param
      AND is_active = true;
    
    -- If no reservations exist, just deduct from current stock
    IF total_reserved = 0 THEN
        UPDATE public.products
        SET current_stock = current_stock - quantity_param
        WHERE id = product_id_param;
        RETURN;
    END IF;
    
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
                reserved_stock = GREATEST(0, reserved_stock - consume_qty)
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
    
    -- Update product stock - only subtract reserved stock if we actually had reservations
    UPDATE public.products
    SET 
        current_stock = current_stock - quantity_param,
        reserved_stock = GREATEST(0, reserved_stock - LEAST(total_reserved, quantity_param))
    WHERE id = product_id_param;
END;
$$;

-- Also fix the consume_stock_reservation function to handle cases where reserved_stock might be 0
DROP FUNCTION IF EXISTS public.consume_stock_reservation(uuid, uuid, uuid, numeric);

CREATE OR REPLACE FUNCTION public.consume_stock_reservation(
    product_id_param uuid,
    merchant_id_param uuid,
    reference_id_param uuid,
    quantity_param numeric
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    reservation_record RECORD;
    remaining_qty numeric := quantity_param;
    consume_qty numeric;
    total_reserved numeric := 0;
BEGIN
    -- Calculate total reserved stock for this reference
    SELECT COALESCE(SUM(quantity), 0) INTO total_reserved
    FROM public.stock_reservations
    WHERE product_id = product_id_param 
      AND merchant_id = merchant_id_param
      AND reference_id = reference_id_param
      AND is_active = true;
    
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
                reserved_stock = GREATEST(0, reserved_stock - consume_qty)
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
    
    -- Update product stock - only subtract reserved stock if we actually had reservations
    UPDATE public.products
    SET 
        current_stock = current_stock - quantity_param,
        reserved_stock = GREATEST(0, reserved_stock - LEAST(total_reserved, quantity_param))
    WHERE id = product_id_param;
END;
$$;
