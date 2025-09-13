-- Scheduled Job for Automatic Reorder Alerts
-- This creates a scheduled function to check stock levels and generate reorder alerts

-- Create a function to run the reorder alert check
CREATE OR REPLACE FUNCTION public.run_scheduled_reorder_check()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Clean up expired reservations first
  PERFORM public.cleanup_expired_reservations();
  
  -- Check and create reorder alerts
  PERFORM public.check_reorder_alerts();
  
  -- Log the execution
  INSERT INTO public.system_logs (log_type, message, created_at)
  VALUES ('reorder_check', 'Scheduled reorder alert check completed', now());
  
EXCEPTION WHEN OTHERS THEN
  -- Log any errors
  INSERT INTO public.system_logs (log_type, message, error_details, created_at)
  VALUES ('reorder_check_error', 'Scheduled reorder alert check failed', SQLERRM, now());
END;
$$;

-- Create system logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.system_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    log_type text NOT NULL,
    message text NOT NULL,
    error_details text,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON public.system_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_logs_type ON public.system_logs(log_type);

-- Note: In production, you would set up a cron job or use pg_cron extension
-- For now, we'll create a function that can be called manually or via external scheduler

-- Example cron job setup (requires pg_cron extension):
-- SELECT cron.schedule('reorder-alerts', '0 9 * * *', 'SELECT public.run_scheduled_reorder_check();');

-- Alternative: Create a function to be called by external scheduler
CREATE OR REPLACE FUNCTION public.manual_reorder_check()
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  result json;
  alert_count integer;
  cleanup_count integer;
BEGIN
  -- Clean up expired reservations
  SELECT COUNT(*) INTO cleanup_count
  FROM public.stock_reservations
  WHERE expires_at < now() AND is_active = true;
  
  PERFORM public.cleanup_expired_reservations();
  
  -- Get current alert count before check
  SELECT COUNT(*) INTO alert_count
  FROM public.reorder_alerts
  WHERE is_acknowledged = false AND DATE(created_at) = CURRENT_DATE;
  
  -- Run reorder check
  PERFORM public.check_reorder_alerts();
  
  -- Get new alert count
  SELECT COUNT(*) - alert_count INTO alert_count
  FROM public.reorder_alerts
  WHERE is_acknowledged = false AND DATE(created_at) = CURRENT_DATE;
  
  result := json_build_object(
    'success', true,
    'timestamp', now(),
    'expired_reservations_cleaned', cleanup_count,
    'new_alerts_created', GREATEST(alert_count, 0),
    'message', 'Reorder check completed successfully'
  );
  
  RETURN result;
  
EXCEPTION WHEN OTHERS THEN
  result := json_build_object(
    'success', false,
    'timestamp', now(),
    'error', SQLERRM,
    'message', 'Reorder check failed'
  );
  
  RETURN result;
END;
$$;

-- Create a function to get reorder alert statistics
CREATE OR REPLACE FUNCTION public.get_reorder_alert_stats()
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'total_alerts', COUNT(*),
    'pending_alerts', COUNT(*) FILTER (WHERE is_acknowledged = false),
    'critical_alerts', COUNT(*) FILTER (WHERE alert_level = 'critical' AND is_acknowledged = false),
    'out_of_stock_alerts', COUNT(*) FILTER (WHERE alert_level = 'out_of_stock' AND is_acknowledged = false),
    'todays_alerts', COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE),
    'last_check', MAX(created_at)
  ) INTO result
  FROM public.reorder_alerts;
  
  RETURN result;
END;
$$;
