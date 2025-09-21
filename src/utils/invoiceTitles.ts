// Invoice Title Utilities for Dynamic GST-based Invoice Titles
// Handles Tax Invoice, Bill of Supply, and E-way Bill requirements

export interface InvoiceTypeInfo {
  type: 'tax_invoice' | 'bill_of_supply' | 'eway_bill';
  title: string;
  ewayRequired: boolean;
  description: string;
}

export interface MerchantGSTInfo {
  gstRegistrationType: 'regular' | 'composition' | 'exempt' | 'unregistered';
  compositionDealer: boolean;
  exemptSupplies: boolean;
  gstin?: string;
}

export interface CustomerGSTInfo {
  gstin?: string;
}

/**
 * Determine invoice type based on GST rules
 */
export function determineInvoiceType(
  merchantInfo: MerchantGSTInfo,
  customerInfo: CustomerGSTInfo,
  totalAmount: number
): InvoiceTypeInfo {
  const hasMerchantGSTIN = merchantInfo.gstin && merchantInfo.gstin.length === 15;
  const hasCustomerGSTIN = customerInfo.gstin && customerInfo.gstin.length === 15;
  
  // Check if interstate transaction
  const isInterstate = hasMerchantGSTIN && hasCustomerGSTIN && 
    merchantInfo.gstin!.substring(0, 2) !== customerInfo.gstin!.substring(0, 2);

  // Rule 1: Composition dealer or exempt supplies = Bill of Supply
  if (
    merchantInfo.compositionDealer || 
    merchantInfo.exemptSupplies || 
    merchantInfo.gstRegistrationType === 'composition' || 
    merchantInfo.gstRegistrationType === 'exempt'
  ) {
    return {
      type: 'bill_of_supply',
      title: 'BILL OF SUPPLY',
      ewayRequired: totalAmount > 50000,
      description: 'Composition dealer or exempt supplies'
    };
  }

  // Rule 2: Unregistered dealer = Bill of Supply
  if (merchantInfo.gstRegistrationType === 'unregistered' || !hasMerchantGSTIN) {
    return {
      type: 'bill_of_supply',
      title: 'BILL OF SUPPLY',
      ewayRequired: false,
      description: 'Unregistered dealer'
    };
  }

  // Rule 3: Regular GST dealer = Tax Invoice
  // E-way bill required for:
  // - Interstate transactions > ₹50,000
  // - Intrastate transactions > ₹1,00,000
  const ewayRequired = (isInterstate && totalAmount > 50000) || 
                      (!isInterstate && totalAmount > 100000);

  if (ewayRequired) {
    return {
      type: 'eway_bill',
      title: 'TAX INVOICE (E-WAY BILL REQUIRED)',
      ewayRequired: true,
      description: `E-way bill required for ${isInterstate ? 'interstate' : 'intrastate'} transaction above threshold`
    };
  }

  return {
    type: 'tax_invoice',
    title: 'TAX INVOICE',
    ewayRequired: false,
    description: 'Regular GST transaction'
  };
}

/**
 * Get invoice title from invoice type
 */
export function getInvoiceTitle(invoiceType: string): string {
  switch (invoiceType) {
    case 'tax_invoice':
      return 'TAX INVOICE';
    case 'bill_of_supply':
      return 'BILL OF SUPPLY';
    case 'eway_bill':
      return 'TAX INVOICE (E-WAY BILL REQUIRED)';
    default:
      return 'INVOICE';
  }
}

/**
 * Get invoice type description
 */
export function getInvoiceTypeDescription(invoiceType: string): string {
  switch (invoiceType) {
    case 'tax_invoice':
      return 'Regular GST invoice for registered dealers';
    case 'bill_of_supply':
      return 'For composition dealers, exempt supplies, or unregistered dealers';
    case 'eway_bill':
      return 'Tax invoice with mandatory E-way bill for high-value transactions';
    default:
      return 'Standard invoice';
  }
}

/**
 * Check if E-way bill is required
 */
export function isEwayBillRequired(
  totalAmount: number,
  isInterstate: boolean,
  merchantType: string
): boolean {
  // E-way bill not required for composition dealers or unregistered
  if (merchantType === 'composition' || merchantType === 'unregistered') {
    return false;
  }

  // E-way bill thresholds
  if (isInterstate && totalAmount > 50000) return true;
  if (!isInterstate && totalAmount > 100000) return true;
  
  return false;
}

/**
 * Get invoice type badge color for UI
 */
export function getInvoiceTypeBadgeColor(invoiceType: string): string {
  switch (invoiceType) {
    case 'tax_invoice':
      return 'success'; // Green
    case 'bill_of_supply':
      return 'info'; // Blue
    case 'eway_bill':
      return 'warning'; // Orange
    default:
      return 'default'; // Gray
  }
}

/**
 * Format invoice title for display with styling
 */
export function formatInvoiceTitleForDisplay(invoiceType: string, ewayBillNumber?: string): {
  title: string;
  subtitle?: string;
  color: string;
} {
  switch (invoiceType) {
    case 'tax_invoice':
      return {
        title: 'TAX INVOICE',
        color: '#059669'
      };
    case 'bill_of_supply':
      return {
        title: 'BILL OF SUPPLY',
        subtitle: 'As per GST Rules',
        color: '#0ea5e9'
      };
    case 'eway_bill':
      return {
        title: 'TAX INVOICE',
        subtitle: ewayBillNumber ? `E-Way Bill: ${ewayBillNumber}` : 'E-Way Bill Required',
        color: '#f59e0b'
      };
    default:
      return {
        title: 'INVOICE',
        color: '#6b7280'
      };
  }
}

/**
 * Validate GST registration type
 */
export function isValidGSTRegistrationType(type: string): boolean {
  return ['regular', 'composition', 'exempt', 'unregistered'].includes(type);
}

/**
 * Get GST registration type display name
 */
export function getGSTRegistrationTypeDisplayName(type: string): string {
  switch (type) {
    case 'regular':
      return 'Regular GST';
    case 'composition':
      return 'Composition Scheme';
    case 'exempt':
      return 'Exempt Supplies';
    case 'unregistered':
      return 'Unregistered';
    default:
      return 'Unknown';
  }
}

/**
 * Get invoice compliance requirements
 */
export function getInvoiceComplianceRequirements(invoiceType: string): {
  requirements: string[];
  warnings: string[];
} {
  switch (invoiceType) {
    case 'tax_invoice':
      return {
        requirements: [
          'Valid GST registration required',
          'Proper GST breakdown (CGST+SGST or IGST)',
          'HSN/SAC codes mandatory'
        ],
        warnings: []
      };
    case 'bill_of_supply':
      return {
        requirements: [
          'No GST charges applicable',
          'Clear mention of composition scheme or exemption',
          'HSN/SAC codes recommended'
        ],
        warnings: [
          'Cannot claim input tax credit',
          'Limited to composition scheme turnover limits'
        ]
      };
    case 'eway_bill':
      return {
        requirements: [
          'E-way bill generation mandatory',
          'Valid transporter details',
          'Vehicle number required',
          'Proper GST breakdown'
        ],
        warnings: [
          'Heavy penalties for non-compliance',
          'Real-time tracking required'
        ]
      };
    default:
      return {
        requirements: [],
        warnings: []
      };
  }
}
