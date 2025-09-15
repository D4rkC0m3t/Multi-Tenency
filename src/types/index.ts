// Export database types
export type { Database, Tables, TablesInsert, TablesUpdate, Enums } from './database';

// Re-export application types from supabase.ts for backward compatibility
export type {
  Profile,
  Merchant,
  Product,
  Category,
  Customer,
  Supplier,
  Sale,
  SaleItem,
  Purchase,
  PurchaseItem,
  AuditLog,
  SubscriptionPlan,
  MerchantSubscription,
  SystemMetric,
  PlatformNotification,
  UsageStatistics,
  MerchantUsage,
  PlanLimit,
  DashboardStats,
  MerchantWithStats
} from '../lib/supabase';

// Enhanced stock management types (from memory)
export interface ProductBatch {
  id: string;
  product_id: string;
  batch_number: string;
  quantity: number;
  purchase_price: number;
  manufacturing_date?: string;
  expiry_date?: string;
  supplier_id?: string;
  purchase_id?: string;
  status: 'active' | 'expired' | 'recalled';
  created_at: string;
  updated_at: string;
}

export interface StockMovement {
  id: string;
  product_id: string;
  batch_id?: string;
  movement_type: 'sale' | 'purchase' | 'adjustment' | 'transfer' | 'return';
  quantity_change: number;
  previous_quantity: number;
  new_quantity: number;
  reference_id?: string;
  reference_type?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
}

export interface StockReservation {
  id: string;
  product_id: string;
  batch_id?: string;
  reserved_quantity: number;
  reservation_type: 'sale' | 'transfer' | 'manual';
  reference_id?: string;
  expires_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ReorderAlert {
  id: string;
  product_id: string;
  alert_type: 'low_stock' | 'out_of_stock' | 'critical';
  current_stock: number;
  minimum_stock: number;
  suggested_order_quantity: number;
  is_acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: string;
  created_at: string;
}

// API Response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
}

// Form types
export interface ProductFormData {
  name: string;
  sku?: string;
  category_id?: string;
  fertilizer_type?: string;
  brand?: string;
  unit: string;
  unit_size?: number;
  base_unit?: string;
  purchase_price?: number;
  sale_price?: number;
  current_stock: number;
  minimum_stock?: number;
  maximum_stock?: number;
  hsn_code?: string;
  gst_rate?: number;
  cess_rate?: number;
  manufacturer?: string;
  description?: string;
  status: 'active' | 'discontinued' | 'out_of_stock';
}

export interface CustomerFormData {
  name: string;
  customer_type: string;
  phone?: string;
  email?: string;
  gstin?: string;
  gst_number?: string;
  village?: string;
  district?: string;
  state?: string;
  address?: string;
  pin_code?: string;
  credit_limit: number;
}

export interface SaleFormData {
  customer_id: string;
  sale_date: string;
  payment_method?: string;
  payment_status: 'pending' | 'partial' | 'paid';
  notes?: string;
  items: SaleItemFormData[];
}

export interface SaleItemFormData {
  product_id: string;
  quantity: number;
  unit_price: number;
  batch_id?: string;
}

// Dashboard types  
export interface DashboardMetrics {
  total_sales_today: number;
  total_revenue_month: number;
  low_stock_products: number;
  pending_orders: number;
  top_selling_products: any[];
  recent_sales: any[];
  stock_alerts: ReorderAlert[];
}

// Filter and pagination types
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ProductFilters {
  category_id?: string;
  status?: string;
  search?: string;
  low_stock?: boolean;
}

export interface SaleFilters {
  customer_id?: string;
  payment_status?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}
