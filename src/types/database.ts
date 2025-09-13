export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          phone: string | null
          role: 'admin' | 'manager' | 'cashier' | 'staff' | 'super_admin'
          merchant_id: string | null
          is_active: boolean
          is_platform_admin: boolean | null
          admin_permissions: string[] | null
          last_admin_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          phone?: string | null
          role: 'admin' | 'manager' | 'cashier' | 'staff' | 'super_admin'
          merchant_id?: string | null
          is_active?: boolean
          is_platform_admin?: boolean | null
          admin_permissions?: string[] | null
          last_admin_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          phone?: string | null
          role?: 'admin' | 'manager' | 'cashier' | 'staff' | 'super_admin'
          merchant_id?: string | null
          is_active?: boolean
          is_platform_admin?: boolean | null
          admin_permissions?: string[] | null
          last_admin_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          }
        ]
      }
      merchants: {
        Row: {
          id: string
          name: string
          business_name: string | null
          address: string | null
          phone: string | null
          email: string | null
          website: string | null
          state: string | null
          state_code: string | null
          pin_code: string | null
          gstin: string | null
          pan_number: string | null
          cin_number: string | null
          business_type: string | null
          fertilizer_license: string | null
          seed_license: string | null
          pesticide_license: string | null
          dealer_registration_id: string | null
          bank_name: string | null
          bank_account_number: string | null
          account_number: string | null
          bank_ifsc_code: string | null
          ifsc_code: string | null
          bank_branch: string | null
          upi_id: string | null
          owner_id: string | null
          is_active: boolean
          settings: Json
          logo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          business_name?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          state?: string | null
          state_code?: string | null
          pin_code?: string | null
          gstin?: string | null
          pan_number?: string | null
          cin_number?: string | null
          business_type?: string | null
          fertilizer_license?: string | null
          seed_license?: string | null
          pesticide_license?: string | null
          dealer_registration_id?: string | null
          bank_name?: string | null
          bank_account_number?: string | null
          account_number?: string | null
          bank_ifsc_code?: string | null
          ifsc_code?: string | null
          bank_branch?: string | null
          upi_id?: string | null
          owner_id?: string | null
          is_active?: boolean
          settings?: Json
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          business_name?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          state?: string | null
          state_code?: string | null
          pin_code?: string | null
          gstin?: string | null
          pan_number?: string | null
          cin_number?: string | null
          business_type?: string | null
          fertilizer_license?: string | null
          seed_license?: string | null
          pesticide_license?: string | null
          dealer_registration_id?: string | null
          bank_name?: string | null
          bank_account_number?: string | null
          account_number?: string | null
          bank_ifsc_code?: string | null
          ifsc_code?: string | null
          bank_branch?: string | null
          upi_id?: string | null
          owner_id?: string | null
          is_active?: boolean
          settings?: Json
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          id: string
          merchant_id: string
          category_id: string | null
          name: string
          sku: string | null
          fertilizer_type: string | null
          brand: string | null
          unit: string
          unit_size: number | null
          base_unit: string | null
          purchase_price: number | null
          sale_price: number | null
          current_stock: number
          minimum_stock: number | null
          maximum_stock: number | null
          batch_number: string | null
          expiry_date: string | null
          manufacturing_date: string | null
          hsn_code: string | null
          gst_rate: number | null
          cess_rate: number | null
          manufacturer: string | null
          manufacturing_company: string | null
          packing_details: string | null
          importing_company: string | null
          origin_country: string | null
          status: 'active' | 'discontinued' | 'out_of_stock'
          description: string | null
          image_path: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          merchant_id: string
          category_id?: string | null
          name: string
          sku?: string | null
          fertilizer_type?: string | null
          brand?: string | null
          unit: string
          unit_size?: number | null
          base_unit?: string | null
          purchase_price?: number | null
          sale_price?: number | null
          current_stock?: number
          minimum_stock?: number | null
          maximum_stock?: number | null
          batch_number?: string | null
          expiry_date?: string | null
          manufacturing_date?: string | null
          hsn_code?: string | null
          gst_rate?: number | null
          cess_rate?: number | null
          manufacturer?: string | null
          manufacturing_company?: string | null
          packing_details?: string | null
          importing_company?: string | null
          origin_country?: string | null
          status?: 'active' | 'discontinued' | 'out_of_stock'
          description?: string | null
          image_path?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          merchant_id?: string
          category_id?: string | null
          name?: string
          sku?: string | null
          fertilizer_type?: string | null
          brand?: string | null
          unit?: string
          unit_size?: number | null
          base_unit?: string | null
          purchase_price?: number | null
          sale_price?: number | null
          current_stock?: number
          minimum_stock?: number | null
          maximum_stock?: number | null
          batch_number?: string | null
          expiry_date?: string | null
          manufacturing_date?: string | null
          hsn_code?: string | null
          gst_rate?: number | null
          cess_rate?: number | null
          manufacturer?: string | null
          manufacturing_company?: string | null
          packing_details?: string | null
          importing_company?: string | null
          origin_country?: string | null
          status?: 'active' | 'discontinued' | 'out_of_stock'
          description?: string | null
          image_path?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          }
        ]
      }
      categories: {
        Row: {
          id: string
          merchant_id: string
          name: string
          description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          merchant_id: string
          name: string
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          merchant_id?: string
          name?: string
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          }
        ]
      }
      customers: {
        Row: {
          id: string
          merchant_id: string
          name: string
          customer_type: string
          phone: string | null
          email: string | null
          address: string | null
          village: string | null
          district: string | null
          state: string | null
          state_code: string | null
          pin_code: string | null
          pincode: string | null
          gst_number: string | null
          credit_limit: number
          outstanding_balance: number
          is_active: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          merchant_id: string
          name: string
          customer_type: string
          phone?: string | null
          email?: string | null
          address?: string | null
          village?: string | null
          district?: string | null
          state?: string | null
          state_code?: string | null
          pin_code?: string | null
          pincode?: string | null
          gst_number?: string | null
          credit_limit?: number
          outstanding_balance?: number
          is_active?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          merchant_id?: string
          name?: string
          customer_type?: string
          phone?: string | null
          email?: string | null
          address?: string | null
          village?: string | null
          district?: string | null
          state?: string | null
          state_code?: string | null
          pin_code?: string | null
          pincode?: string | null
          gst_number?: string | null
          credit_limit?: number
          outstanding_balance?: number
          is_active?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          }
        ]
      }
      suppliers: {
        Row: {
          id: string
          merchant_id: string
          name: string
          company_name: string | null
          phone: string | null
          email: string | null
          address: string | null
          city: string | null
          state: string | null
          pincode: string | null
          gst_number: string | null
          contact_person: string | null
          payment_terms: string | null
          is_active: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          merchant_id: string
          name: string
          company_name?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          pincode?: string | null
          gst_number?: string | null
          contact_person?: string | null
          payment_terms?: string | null
          is_active?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          merchant_id?: string
          name?: string
          company_name?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          pincode?: string | null
          gst_number?: string | null
          contact_person?: string | null
          payment_terms?: string | null
          is_active?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          }
        ]
      }
      sales: {
        Row: {
          id: string
          merchant_id: string
          customer_id: string
          invoice_number: string
          sale_date: string
          total_amount: number
          tax_amount: number
          subtotal: number
          discount_amount: number | null
          paid_amount: number | null
          payment_method: string | null
          payment_status: 'pending' | 'partial' | 'paid'
          notes: string | null
          einvoice_status: 'not_applicable' | 'pending' | 'generated' | 'cancelled' | 'error'
          is_einvoice_eligible: boolean
          buyer_gstin: string | null
          eway_bill_no: string | null
          eway_bill_date: string | null
          vehicle_no: string | null
          transport_mode: string | null
          despatch_through: string | null
          destination: string | null
          supply_date_time: string | null
          other_references: string | null
          cgst_amount: number
          sgst_amount: number
          igst_amount: number
          cess_amount: number
          round_off_amount: number
          previous_outstanding: number
          total_outstanding: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          merchant_id: string
          customer_id: string
          invoice_number: string
          sale_date: string
          total_amount: number
          tax_amount: number
          subtotal: number
          discount_amount?: number | null
          paid_amount?: number | null
          payment_method?: string | null
          payment_status: 'pending' | 'partial' | 'paid'
          notes?: string | null
          einvoice_status?: 'not_applicable' | 'pending' | 'generated' | 'cancelled' | 'error'
          is_einvoice_eligible?: boolean
          buyer_gstin?: string | null
          eway_bill_no?: string | null
          eway_bill_date?: string | null
          vehicle_no?: string | null
          transport_mode?: string | null
          despatch_through?: string | null
          destination?: string | null
          supply_date_time?: string | null
          other_references?: string | null
          cgst_amount?: number
          sgst_amount?: number
          igst_amount?: number
          cess_amount?: number
          round_off_amount?: number
          previous_outstanding?: number
          total_outstanding?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          merchant_id?: string
          customer_id?: string
          invoice_number?: string
          sale_date?: string
          total_amount?: number
          tax_amount?: number
          subtotal?: number
          discount_amount?: number | null
          paid_amount?: number | null
          payment_method?: string | null
          payment_status?: 'pending' | 'partial' | 'paid'
          notes?: string | null
          einvoice_status?: 'not_applicable' | 'pending' | 'generated' | 'cancelled' | 'error'
          is_einvoice_eligible?: boolean
          buyer_gstin?: string | null
          eway_bill_no?: string | null
          eway_bill_date?: string | null
          vehicle_no?: string | null
          transport_mode?: string | null
          despatch_through?: string | null
          destination?: string | null
          supply_date_time?: string | null
          other_references?: string | null
          cgst_amount?: number
          sgst_amount?: number
          igst_amount?: number
          cess_amount?: number
          round_off_amount?: number
          previous_outstanding?: number
          total_outstanding?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          }
        ]
      }
      sale_items: {
        Row: {
          id: string
          sale_id: string
          product_id: string
          quantity: number
          unit_price: number
          total_price: number
          total_amount: number
          manufacturing_date: string | null
          expiry_date: string | null
          batch_number: string | null
          inclusive_rate: number | null
          taxable_amount: number
          cgst_amount: number
          sgst_amount: number
          igst_amount: number
          cess_amount: number
          created_at: string
        }
        Insert: {
          id?: string
          sale_id: string
          product_id: string
          quantity: number
          unit_price: number
          total_price: number
          total_amount: number
          manufacturing_date?: string | null
          expiry_date?: string | null
          batch_number?: string | null
          inclusive_rate?: number | null
          taxable_amount: number
          cgst_amount: number
          sgst_amount: number
          igst_amount: number
          cess_amount: number
          created_at?: string
        }
        Update: {
          id?: string
          sale_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
          total_price?: number
          total_amount?: number
          manufacturing_date?: string | null
          expiry_date?: string | null
          batch_number?: string | null
          inclusive_rate?: number | null
          taxable_amount?: number
          cgst_amount?: number
          sgst_amount?: number
          igst_amount?: number
          cess_amount?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sale_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          }
        ]
      }
      purchases: {
        Row: {
          id: string
          merchant_id: string
          supplier_id: string | null
          invoice_number: string
          purchase_date: string
          subtotal: number
          tax_amount: number
          discount_amount: number
          total_amount: number
          payment_method: string
          payment_status: string
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          merchant_id: string
          supplier_id?: string | null
          invoice_number: string
          purchase_date: string
          subtotal: number
          tax_amount: number
          discount_amount: number
          total_amount: number
          payment_method: string
          payment_status: string
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          merchant_id?: string
          supplier_id?: string | null
          invoice_number?: string
          purchase_date?: string
          subtotal?: number
          tax_amount?: number
          discount_amount?: number
          total_amount?: number
          payment_method?: string
          payment_status?: string
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          }
        ]
      }
      purchase_items: {
        Row: {
          id: string
          purchase_id: string
          product_id: string
          quantity: number
          unit_price: number
          total_price: number
          batch_number: string | null
          expiry_date: string | null
          manufacturing_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          purchase_id: string
          product_id: string
          quantity: number
          unit_price: number
          total_price: number
          batch_number?: string | null
          expiry_date?: string | null
          manufacturing_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          purchase_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
          total_price?: number
          batch_number?: string | null
          expiry_date?: string | null
          manufacturing_date?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_items_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Type helpers for easier usage
export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"])
  ? (Database["public"]["Tables"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"])[TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"])
  ? (Database["public"]["Tables"])[PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"])[TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"])
  ? (Database["public"]["Tables"])[PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof (Database["public"]["Enums"])
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicEnumNameOrOptions["schema"]]["Enums"])
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicEnumNameOrOptions["schema"]]["Enums"])[EnumName]
  : PublicEnumNameOrOptions extends keyof (Database["public"]["Enums"])
  ? (Database["public"]["Enums"])[PublicEnumNameOrOptions]
  : never
