import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: 'admin' | 'manager' | 'cashier' | 'staff' | 'super_admin';
  merchant_id?: string;
  is_active: boolean;
  is_platform_admin?: boolean;
  admin_permissions?: string[];
  last_admin_login?: string;

  created_at: string;
  updated_at: string;
}



export interface Merchant {
  id: string;
  name: string;
  business_name?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  state?: string;
  state_code?: string;
  pin_code?: string;
  gstin?: string;
  pan_number?: string;
  cin_number?: string;
  business_type?: string;
  fertilizer_license?: string;
  seed_license?: string;
  pesticide_license?: string;
  dealer_registration_id?: string;
  bank_name?: string;
  bank_account_number?: string;
  account_number?: string; // Legacy field
  bank_ifsc_code?: string;
  ifsc_code?: string; // Legacy field
  bank_branch?: string;
  upi_id?: string;
  owner_id?: string;
  is_active: boolean;
  settings: Record<string, any>;
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  merchant_id: string;
  category_id?: string;
  name: string;
  sku?: string;
  fertilizer_type?: string;
  brand?: string;
  unit: string;
  unit_size?: number; // Size of one unit (e.g., 50 for 50kg bag)
  base_unit?: string; // Base unit for calculations (kg, litre, etc.)
  purchase_price?: number;
  sale_price?: number;
  current_stock: number;
  minimum_stock?: number;
  maximum_stock?: number;
  batch_number?: string;
  expiry_date?: string;
  manufacturing_date?: string;
  hsn_code?: string;
  gst_rate?: number;
  cess_rate?: number;
  manufacturer?: string;
  manufacturing_company?: string;
  packing_details?: string;
  importing_company?: string;
  origin_country?: string;
  status: 'active' | 'discontinued' | 'out_of_stock';
  description?: string;
  image_path?: string;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface Category {
  id: string;
  merchant_id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  merchant_id: string;
  name: string;
  customer_type: string;
  phone?: string;
  email?: string;
  address?: string;
  village?: string;
  district?: string;
  state?: string;
  state_code?: string;
  pin_code?: string;
  pincode?: string; // Legacy field
  gst_number?: string;
  credit_limit: number;
  outstanding_balance: number;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  merchant_id: string;
  name: string;
  company_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  gst_number?: string;
  contact_person?: string;
  payment_terms?: string;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: string;
  merchant_id: string;
  customer_id: string;
  invoice_number: string;
  sale_date: string;
  total_amount: number;
  tax_amount: number;
  subtotal: number;
  discount_amount?: number;
  paid_amount?: number;
  payment_method?: string;
  payment_status: 'pending' | 'partial' | 'paid';
  notes?: string;
  
  // E-Invoice specific fields
  einvoice_status: 'not_applicable' | 'pending' | 'generated' | 'cancelled' | 'error';
  is_einvoice_eligible: boolean;
  buyer_gstin?: string;
  
  // E-Way Bill details
  eway_bill_no?: string;
  eway_bill_date?: string;
  
  // Transport details
  vehicle_no?: string;
  transport_mode?: string;
  despatch_through?: string;
  destination?: string;
  supply_date_time?: string;
  
  // Document references
  other_references?: string;
  
  // Tax breakdown
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  cess_amount: number;
  round_off_amount: number;
  
  // Outstanding amounts
  previous_outstanding: number;
  total_outstanding: number;
  
  created_at: string;
  updated_at: string;
  customer?: Customer;
  sale_items?: SaleItem[];
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  total_amount: number; // Alias for total_price for E-Invoice compatibility
  
  // E-Invoice specific fields
  manufacturing_date?: string;
  expiry_date?: string;
  batch_number?: string;
  inclusive_rate?: number;
  
  // Tax amounts per item
  taxable_amount: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  cess_amount: number;
  
  created_at: string;
  product?: Product;
}

export interface Purchase {
  id: string;
  merchant_id: string;
  supplier_id?: string;
  invoice_number: string;
  purchase_date: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  supplier?: Supplier;
  purchase_items?: PurchaseItem[];
}

export interface PurchaseItem {
  id: string;
  purchase_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  batch_number?: string;
  expiry_date?: string;
  manufacturing_date?: string;
  created_at: string;
  product?: Product;
}

// DevAdmin Types
export interface AuditLog {
  id: string;
  merchant_id?: string;
  user_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  metadata?: Record<string, any>;
  created_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  price_monthly?: number;
  price_yearly?: number;
  currency: string;
  features: Record<string, any>;
  max_users: number;
  max_products: number;
  max_invoices_per_month: number;
  max_storage_mb: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MerchantSubscription {
  id: string;
  merchant_id: string;
  plan_id: string;
  status: 'active' | 'cancelled' | 'expired' | 'suspended';
  billing_cycle: 'monthly' | 'yearly';
  current_period_start: string;
  current_period_end: string;
  trial_end?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  razorpay_customer_id?: string;
  razorpay_subscription_id?: string;
  last_payment_date?: string;
  next_payment_date?: string;
  payment_method?: string;
  auto_renew: boolean;
  created_at: string;
  updated_at: string;
  plan?: SubscriptionPlan;
  merchant?: Merchant;
}

export interface SystemMetric {
  id: string;
  metric_type: string;
  metric_name: string;
  value: number;
  unit?: string;
  labels?: Record<string, any>;
  recorded_at: string;
}

export interface PlatformNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  target_audience: 'all' | 'merchants' | 'admins';
  target_plan?: string;
  is_active: boolean;
  show_until?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface UsageStatistics {
  id: string;
  merchant_id: string;
  period_start: string;
  period_end: string;
  users_count: number;
  products_count: number;
  invoices_count: number;
  customers_count: number;
  sales_amount: number;
  storage_used_mb: number;
  api_calls_count: number;
  login_count: number;
  created_at: string;
}

export interface MerchantUsage {
  users_count: number;
  products_count: number;
  invoices_count: number;
  customers_count: number;
  storage_used_mb: number;
}

export interface PlanLimit {
  limit_type: string;
  current_usage: number;
  plan_limit: number;
  is_exceeded: boolean;
}

// DevAdmin Dashboard Stats
export interface DashboardStats {
  total_merchants: number;
  active_users: number;
  total_invoices_today: number;
  total_revenue: number;
  system_health: 'healthy' | 'warning' | 'critical';
  recent_signups: number;
  subscription_renewals_due: number;
}

// Extended Merchant interface for DevAdmin view
export interface MerchantWithStats extends Merchant {
  subscription?: MerchantSubscription;
  usage?: MerchantUsage;
  user_count?: number;
  last_activity?: string;
  plan_limits?: PlanLimit[];
}
