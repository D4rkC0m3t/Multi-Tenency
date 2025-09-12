# Design Document

## Overview

The enhanced purchase form will be redesigned as a modern, multi-step wizard-style interface that guides users through the purchase creation process while maintaining all functionality in a single dialog. The design focuses on improved UX patterns, better visual hierarchy, real-time validation, and enhanced productivity features.

## Architecture

### Component Structure
```
EnhancedPurchaseForm/
├── PurchaseFormDialog.tsx          # Main dialog container
├── components/
│   ├── PurchaseFormHeader.tsx      # Form header with progress indicator
│   ├── SupplierSection.tsx         # Supplier selection and details
│   ├── ProductsSection.tsx         # Enhanced product selection table
│   ├── CalculationsSection.tsx     # Tax, discount, and totals
│   ├── PaymentSection.tsx          # Payment method and status
│   └── FormActions.tsx             # Save, cancel, and utility actions
├── hooks/
│   ├── usePurchaseForm.tsx         # Form state management
│   ├── useProductSearch.tsx        # Product search and filtering
│   └── useCalculations.tsx         # Real-time calculations
└── utils/
    ├── validation.ts               # Form validation rules
    ├── calculations.ts             # Financial calculations
    └── formatters.ts               # Data formatting utilities
```

### State Management
- **Form State**: React Hook Form with TypeScript for type safety
- **Product Search**: Debounced search with local caching
- **Calculations**: Real-time updates using computed values
- **Validation**: Schema-based validation with immediate feedback

## Components and Interfaces

### 1. Enhanced Form Dialog

**PurchaseFormDialog Component**
```typescript
interface PurchaseFormDialogProps {
  open: boolean;
  purchase?: Purchase | null;
  onClose: () => void;
  onSave: (purchase: Purchase) => void;
}

interface EnhancedPurchaseFormData extends PurchaseFormData {
  // Enhanced fields
  supplier_details?: Supplier;
  payment_terms?: string;
  expected_delivery_date?: string;
  purchase_order_number?: string;
  
  // Calculated fields
  subtotal_before_discount: number;
  total_tax_amount: number;
  final_amount: number;
  
  // UI state
  is_draft: boolean;
  validation_errors: Record<string, string>;
}
```

**Key Features:**
- Responsive dialog that adapts to screen size
- Progress indicator showing form completion status
- Auto-save functionality for draft purchases
- Keyboard shortcuts for common actions

### 2. Supplier Selection Section

**SupplierSection Component**
- Enhanced autocomplete with supplier search
- Display of supplier details (contact, payment terms, recent purchases)
- Quick supplier creation option
- Supplier-specific default settings (payment terms, tax rates)

```typescript
interface SupplierSectionProps {
  control: Control<EnhancedPurchaseFormData>;
  suppliers: Supplier[];
  onSupplierSelect: (supplier: Supplier) => void;
  onCreateSupplier: () => void;
}
```

### 3. Enhanced Products Section

**ProductsSection Component**
- Advanced product search with filters (category, brand, stock status)
- Inline product addition with real-time search
- Bulk operations (add multiple quantities, apply bulk discounts)
- Product information display (current stock, last purchase price, supplier history)
- Drag-and-drop reordering of items

```typescript
interface ProductsSectionProps {
  control: Control<EnhancedPurchaseFormData>;
  products: Product[];
  onProductAdd: (product: Product) => void;
  onProductRemove: (index: number) => void;
  onBulkOperation: (operation: BulkOperation) => void;
}

interface ProductRowData {
  id: string;
  product: Product;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  discount_amount: number;
  tax_rate: number;
  line_total: number;
  batch_number?: string;
  expiry_date?: string;
  notes?: string;
}
```

### 4. Smart Calculations Section

**CalculationsSection Component**
- Real-time calculation display
- Tax configuration (multiple tax rates, tax-inclusive/exclusive)
- Discount management (percentage or fixed amount, per-item or total)
- Currency formatting and rounding rules
- Payment breakdown for partial payments

```typescript
interface CalculationBreakdown {
  subtotal: number;
  total_discount: number;
  taxable_amount: number;
  tax_breakdown: TaxBreakdown[];
  total_tax: number;
  final_total: number;
  rounding_adjustment: number;
}

interface TaxBreakdown {
  tax_name: string;
  tax_rate: number;
  taxable_amount: number;
  tax_amount: number;
}
```

### 5. Payment and Terms Section

**PaymentSection Component**
- Payment method selection with method-specific fields
- Payment status with partial payment tracking
- Payment terms and due date calculation
- Integration with supplier payment terms
- Payment schedule for installments

## Data Models

### Enhanced Purchase Model
```typescript
interface EnhancedPurchase extends Purchase {
  // Additional fields for enhanced functionality
  purchase_order_number?: string;
  expected_delivery_date?: string;
  actual_delivery_date?: string;
  payment_terms?: string;
  payment_due_date?: string;
  
  // Calculation fields
  subtotal_before_discount: number;
  total_discount_amount: number;
  total_tax_amount: number;
  rounding_adjustment: number;
  
  // Metadata
  created_by_name?: string;
  last_modified_by?: string;
  last_modified_at?: string;
  form_version: string;
}
```

### Product Search Index
```typescript
interface ProductSearchIndex {
  id: string;
  name: string;
  sku: string;
  category: string;
  brand: string;
  current_stock: number;
  cost_price: number;
  last_purchase_price: number;
  last_purchase_date: string;
  supplier_history: string[];
  search_terms: string; // Concatenated searchable fields
}
```

## Error Handling

### Validation Strategy
1. **Field-level validation**: Immediate feedback on blur/change
2. **Cross-field validation**: Validate relationships between fields
3. **Business rule validation**: Check business constraints
4. **Server-side validation**: Final validation before save

### Error Display Patterns
- **Inline errors**: Show errors directly below form fields
- **Summary errors**: Display all errors at the top of form sections
- **Toast notifications**: For system errors and success messages
- **Confirmation dialogs**: For destructive actions or data conflicts

### Error Recovery
- **Auto-save drafts**: Prevent data loss during errors
- **Retry mechanisms**: Automatic retry for network failures
- **Offline support**: Queue operations when offline
- **Conflict resolution**: Handle concurrent editing scenarios

## Testing Strategy

### Unit Testing
- Form validation logic
- Calculation functions
- Data transformation utilities
- Component rendering and interactions

### Integration Testing
- Form submission workflows
- API integration points
- Real-time calculation updates
- Cross-component communication

### User Experience Testing
- Keyboard navigation and shortcuts
- Mobile responsiveness
- Accessibility compliance (WCAG 2.1 AA)
- Performance with large product catalogs

### Performance Considerations
- **Lazy loading**: Load products and suppliers on demand
- **Debounced search**: Prevent excessive API calls
- **Memoization**: Cache calculated values and search results
- **Virtual scrolling**: Handle large product lists efficiently
- **Code splitting**: Load form components only when needed

## Accessibility Features

### Keyboard Navigation
- Tab order follows logical flow
- Keyboard shortcuts for common actions
- Focus management in modal dialogs
- Escape key handling for cancellation

### Screen Reader Support
- Proper ARIA labels and descriptions
- Live regions for dynamic content updates
- Semantic HTML structure
- Alternative text for visual indicators

### Visual Accessibility
- High contrast color schemes
- Scalable text and UI elements
- Clear visual hierarchy
- Error indication beyond color alone

## Mobile Optimization

### Responsive Design
- Collapsible sections for smaller screens
- Touch-friendly input controls
- Optimized table layouts for mobile
- Swipe gestures for navigation

### Performance Optimization
- Reduced bundle size for mobile
- Optimized images and assets
- Efficient rendering for touch devices
- Battery-conscious animations

## Security Considerations

### Input Validation
- Sanitize all user inputs
- Validate numeric ranges and formats
- Prevent injection attacks
- Rate limiting for API calls

### Data Protection
- Encrypt sensitive data in transit
- Audit trail for all changes
- Role-based access control
- Secure session management