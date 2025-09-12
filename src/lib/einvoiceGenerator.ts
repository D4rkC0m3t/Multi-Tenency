// E-Invoice JSON Payload Generator for GSTN Schema Compliance
// This module generates the JSON payload required by IRP (Invoice Registration Portal)

import { Sale, SaleItem, Customer, Merchant, Product } from './supabase';

// GSTN E-Invoice Schema Types
export interface EInvoicePayload {
  Version: string;
  TranDtls: TransactionDetails;
  DocDtls: DocumentDetails;
  SellerDtls: SellerDetails;
  BuyerDtls: BuyerDetails;
  DispDtls?: DispatchDetails;
  ShipDtls?: ShippingDetails;
  ItemList: ItemDetails[];
  ValDtls: ValueDetails;
  PayDtls?: PaymentDetails;
  RefDtls?: ReferenceDetails;
  AddlDocDtls?: AdditionalDocumentDetails[];
  ExpDtls?: ExportDetails;
  EwbDtls?: EWayBillDetails;
}

interface TransactionDetails {
  TaxSch: string; // Tax Scheme - "GST"
  SupTyp: string; // Supply Type - "B2B", "SEZWP", "SEZWOP", "EXPWP", "EXPWOP", "DEXP"
  RegRev?: string; // Reverse Charge - "Y" or "N"
  EcmGstin?: string; // E-commerce GSTIN
  IgstOnIntra?: string; // IGST on Intra State - "Y" or "N"
}

interface DocumentDetails {
  Typ: string; // Document Type - "INV", "CRN", "DBN"
  No: string; // Document Number
  Dt: string; // Document Date (DD/MM/YYYY)
}

interface SellerDetails {
  Gstin: string; // Seller GSTIN
  LglNm: string; // Legal Name
  TrdNm?: string; // Trade Name
  Addr1: string; // Address Line 1
  Addr2?: string; // Address Line 2
  Loc: string; // Location
  Pin: number; // PIN Code
  Stcd: string; // State Code
  Ph?: string; // Phone
  Em?: string; // Email
}

interface BuyerDetails {
  Gstin?: string; // Buyer GSTIN (optional for B2C)
  LglNm: string; // Legal Name
  TrdNm?: string; // Trade Name
  Pos: string; // Place of Supply State Code
  Addr1: string; // Address Line 1
  Addr2?: string; // Address Line 2
  Loc: string; // Location
  Pin: number; // PIN Code
  Stcd: string; // State Code
  Ph?: string; // Phone
  Em?: string; // Email
}

interface DispatchDetails {
  Nm: string; // Name
  Addr1: string; // Address Line 1
  Addr2?: string; // Address Line 2
  Loc: string; // Location
  Pin: number; // PIN Code
  Stcd: string; // State Code
}

interface ShippingDetails {
  Gstin?: string; // Shipping GSTIN
  LglNm: string; // Legal Name
  TrdNm?: string; // Trade Name
  Addr1: string; // Address Line 1
  Addr2?: string; // Address Line 2
  Loc: string; // Location
  Pin: number; // PIN Code
  Stcd: string; // State Code
}

interface ItemDetails {
  SlNo: string; // Serial Number
  PrdDesc: string; // Product Description
  IsServc: string; // Is Service - "Y" or "N"
  HsnCd: string; // HSN Code
  Barcde?: string; // Barcode
  Qty?: number; // Quantity
  FreeQty?: number; // Free Quantity
  Unit?: string; // Unit
  UnitPrice: number; // Unit Price
  TotAmt: number; // Total Amount
  Discount?: number; // Discount
  PreTaxVal?: number; // Pre Tax Value
  AssAmt: number; // Assessable Amount
  GstRt: number; // GST Rate
  IgstAmt?: number; // IGST Amount
  CgstAmt?: number; // CGST Amount
  SgstAmt?: number; // SGST Amount
  CesRt?: number; // Cess Rate
  CesAmt?: number; // Cess Amount
  CesNonAdvlAmt?: number; // Cess Non Advalorem Amount
  StateCesRt?: number; // State Cess Rate
  StateCesAmt?: number; // State Cess Amount
  StateCesNonAdvlAmt?: number; // State Cess Non Advalorem Amount
  OthChrg?: number; // Other Charges
  TotItemVal: number; // Total Item Value
  OrdLineRef?: string; // Order Line Reference
  OrgCntry?: string; // Origin Country
  PrdSlNo?: string; // Product Serial Number
  BchDtls?: BatchDetails; // Batch Details
  AttribDtls?: AttributeDetails[]; // Attribute Details
}

interface BatchDetails {
  Nm: string; // Batch Name
  ExpDt?: string; // Expiry Date
  WrDt?: string; // Warranty Date
}

interface AttributeDetails {
  Nm: string; // Attribute Name
  Val: string; // Attribute Value
}

interface ValueDetails {
  AssVal: number; // Assessable Value
  CgstVal?: number; // CGST Value
  SgstVal?: number; // SGST Value
  IgstVal?: number; // IGST Value
  CesVal?: number; // Cess Value
  StCesVal?: number; // State Cess Value
  Discount?: number; // Discount
  OthChrg?: number; // Other Charges
  RndOffAmt?: number; // Round Off Amount
  TotInvVal: number; // Total Invoice Value
  TotInvValFc?: number; // Total Invoice Value in Foreign Currency
}

interface PaymentDetails {
  Nm?: string; // Payee Name
  AccDet?: string; // Account Details
  Mode?: string; // Payment Mode
  FinInsBr?: string; // Financial Institution Branch
  PayTerm?: string; // Payment Terms
  PayInstr?: string; // Payment Instruction
  CrTrn?: string; // Credit Transfer
  DirDr?: string; // Direct Debit
  CrDay?: number; // Credit Days
  PaidAmt?: number; // Paid Amount
  PaymtDue?: number; // Payment Due
}

interface ReferenceDetails {
  InvRm?: string; // Invoice Remarks
  DocPerdDtls?: DocumentPeriodDetails; // Document Period Details
  PrecDocDtls?: PrecedingDocumentDetails[]; // Preceding Document Details
  ContrDtls?: ContractDetails[]; // Contract Details
}

interface DocumentPeriodDetails {
  InvStDt: string; // Invoice Start Date
  InvEndDt: string; // Invoice End Date
}

interface PrecedingDocumentDetails {
  InvNo: string; // Invoice Number
  InvDt: string; // Invoice Date
  OthRefNo?: string; // Other Reference Number
}

interface ContractDetails {
  RecAdvRefr?: string; // Receipt Advance Reference
  RecAdvDt?: string; // Receipt Advance Date
  TendRefr?: string; // Tender Reference
  ContrRefr?: string; // Contract Reference
  ExtRefr?: string; // External Reference
  ProjRefr?: string; // Project Reference
  PORefr?: string; // Purchase Order Reference
  PORefDt?: string; // Purchase Order Reference Date
}

interface AdditionalDocumentDetails {
  Url?: string; // URL
  Docs?: string; // Documents
  Info?: string; // Information
}

interface ExportDetails {
  ShipBNo?: string; // Shipping Bill Number
  ShipBDt?: string; // Shipping Bill Date
  Port?: string; // Port Code
  RefClm?: string; // Reference Claim
  ForCur?: string; // Foreign Currency
  CntCode?: string; // Country Code
  ExpDuty?: number; // Export Duty
}

interface EWayBillDetails {
  TransId?: string; // Transporter ID
  TransName?: string; // Transporter Name
  TransMode?: string; // Transport Mode
  Distance?: number; // Distance
  TransDocNo?: string; // Transport Document Number
  TransDocDt?: string; // Transport Document Date
  VehNo?: string; // Vehicle Number
  VehType?: string; // Vehicle Type
}

// State code mapping for Indian states
const STATE_CODES: Record<string, string> = {
  'Andhra Pradesh': '37',
  'Arunachal Pradesh': '12',
  'Assam': '18',
  'Bihar': '10',
  'Chhattisgarh': '22',
  'Goa': '30',
  'Gujarat': '24',
  'Haryana': '06',
  'Himachal Pradesh': '02',
  'Jharkhand': '20',
  'Karnataka': '29',
  'Kerala': '32',
  'Madhya Pradesh': '23',
  'Maharashtra': '27',
  'Manipur': '14',
  'Meghalaya': '17',
  'Mizoram': '15',
  'Nagaland': '13',
  'Odisha': '21',
  'Punjab': '03',
  'Rajasthan': '08',
  'Sikkim': '11',
  'Tamil Nadu': '33',
  'Telangana': '36',
  'Tripura': '16',
  'Uttar Pradesh': '09',
  'Uttarakhand': '05',
  'West Bengal': '19',
  'Andaman and Nicobar Islands': '35',
  'Chandigarh': '04',
  'Dadra and Nagar Haveli and Daman and Diu': '26',
  'Delhi': '07',
  'Jammu and Kashmir': '01',
  'Ladakh': '38',
  'Lakshadweep': '31',
  'Puducherry': '34'
};

// Utility functions
function formatDate(date: Date | string): string {
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function getStateCode(stateName: string): string {
  return STATE_CODES[stateName] || '99'; // Default to 99 for unknown states
}

function parseAddress(address: string): { addr1: string; addr2?: string; loc: string; pin: number } {
  // Simple address parsing - in production, you might want more sophisticated parsing
  const lines = address.split(',').map(line => line.trim());
  
  // Extract PIN code (assuming it's a 6-digit number)
  const pinMatch = address.match(/\b\d{6}\b/);
  const pin = pinMatch ? parseInt(pinMatch[0]) : 999999;
  
  // Extract location (usually the last part before PIN)
  const loc = lines.length > 1 ? lines[lines.length - 2] : lines[0];
  
  return {
    addr1: lines[0] || address,
    addr2: lines.length > 2 ? lines[1] : undefined,
    loc: loc,
    pin: pin
  };
}

function calculateTaxAmounts(amount: number, gstRate: number, sellerState: string, buyerState: string) {
  const taxableAmount = amount / (1 + gstRate / 100);
  const totalTax = amount - taxableAmount;
  
  // If inter-state, use IGST; if intra-state, use CGST + SGST
  const isInterState = sellerState !== buyerState;
  
  if (isInterState) {
    return {
      igstAmt: totalTax,
      cgstAmt: 0,
      sgstAmt: 0,
      assessableAmount: taxableAmount
    };
  } else {
    return {
      igstAmt: 0,
      cgstAmt: totalTax / 2,
      sgstAmt: totalTax / 2,
      assessableAmount: taxableAmount
    };
  }
}

// Main function to generate E-Invoice payload
export function generateEInvoicePayload(
  sale: Sale,
  saleItems: (SaleItem & { product: Product })[],
  customer: Customer,
  merchant: Merchant
): EInvoicePayload {
  
  // Parse addresses
  const sellerAddress = parseAddress(merchant.address || '');
  const buyerAddress = parseAddress(customer.address || '');
  
  // Determine supply type
  const supplyType = customer.gst_number ? 'B2B' : 'B2C';
  
  // Get state codes
  const sellerStateCode = getStateCode(merchant.state || '');
  const buyerStateCode = getStateCode(customer.state || '');
  
  // Generate item list
  const itemList: ItemDetails[] = saleItems.map((item, index) => {
    const taxAmounts = calculateTaxAmounts(
      item.total_amount,
      item.product.gst_rate || 0,
      merchant.state || '',
      customer.state || ''
    );
    
    return {
      SlNo: (index + 1).toString(),
      PrdDesc: item.product.name,
      IsServc: 'N', // Fertilizers are goods, not services
      HsnCd: item.product.hsn_code || '31010000', // Default fertilizer HSN
      Qty: item.quantity,
      Unit: item.product.unit || 'KGS',
      UnitPrice: item.unit_price,
      TotAmt: item.total_amount,
      AssAmt: taxAmounts.assessableAmount,
      GstRt: item.product.gst_rate || 0,
      IgstAmt: taxAmounts.igstAmt,
      CgstAmt: taxAmounts.cgstAmt,
      SgstAmt: taxAmounts.sgstAmt,
      TotItemVal: item.total_amount,
      BchDtls: item.batch_number ? {
        Nm: item.batch_number,
        ExpDt: item.expiry_date ? formatDate(item.expiry_date) : undefined
      } : undefined
    };
  });
  
  // Calculate total values
  const totalAssessableValue = itemList.reduce((sum, item) => sum + item.AssAmt, 0);
  const totalIgst = itemList.reduce((sum, item) => sum + (item.IgstAmt || 0), 0);
  const totalCgst = itemList.reduce((sum, item) => sum + (item.CgstAmt || 0), 0);
  const totalSgst = itemList.reduce((sum, item) => sum + (item.SgstAmt || 0), 0);
  
  // Build the payload
  const payload: EInvoicePayload = {
    Version: '1.1',
    TranDtls: {
      TaxSch: 'GST',
      SupTyp: supplyType,
      RegRev: 'N', // Assuming no reverse charge
      IgstOnIntra: sellerStateCode === buyerStateCode ? 'N' : 'Y'
    },
    DocDtls: {
      Typ: 'INV',
      No: sale.invoice_number,
      Dt: formatDate(sale.sale_date)
    },
    SellerDtls: {
      Gstin: merchant.gstin || '',
      LglNm: merchant.name,
      TrdNm: merchant.business_name || merchant.name,
      Addr1: sellerAddress.addr1,
      Addr2: sellerAddress.addr2,
      Loc: sellerAddress.loc,
      Pin: sellerAddress.pin,
      Stcd: sellerStateCode,
      Ph: merchant.phone,
      Em: merchant.email
    },
    BuyerDtls: {
      Gstin: customer.gst_number || undefined,
      LglNm: customer.name,
      Pos: buyerStateCode, // Place of Supply
      Addr1: buyerAddress.addr1,
      Addr2: buyerAddress.addr2,
      Loc: buyerAddress.loc,
      Pin: buyerAddress.pin,
      Stcd: buyerStateCode,
      Ph: customer.phone,
      Em: customer.email
    },
    ItemList: itemList,
    ValDtls: {
      AssVal: totalAssessableValue,
      CgstVal: totalCgst > 0 ? totalCgst : undefined,
      SgstVal: totalSgst > 0 ? totalSgst : undefined,
      IgstVal: totalIgst > 0 ? totalIgst : undefined,
      TotInvVal: sale.total_amount
    }
  };
  
  // Add payment details if available
  if (sale.payment_method) {
    payload.PayDtls = {
      Mode: sale.payment_method.toUpperCase(),
      PaidAmt: sale.paid_amount || 0,
      PaymtDue: (sale.total_amount - (sale.paid_amount || 0))
    };
  }
  
  return payload;
}

// Validation function to check if payload meets GSTN requirements
export function validateEInvoicePayload(payload: EInvoicePayload): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Basic validations
  if (!payload.SellerDtls.Gstin || payload.SellerDtls.Gstin.length !== 15) {
    errors.push('Seller GSTIN must be 15 characters');
  }
  
  if (payload.TranDtls.SupTyp === 'B2B' && (!payload.BuyerDtls.Gstin || payload.BuyerDtls.Gstin.length !== 15)) {
    errors.push('Buyer GSTIN is required for B2B transactions and must be 15 characters');
  }
  
  if (!payload.DocDtls.No || payload.DocDtls.No.length > 16) {
    errors.push('Invoice number is required and must not exceed 16 characters');
  }
  
  if (payload.ItemList.length === 0) {
    errors.push('At least one item is required');
  }
  
  // Validate item details
  payload.ItemList.forEach((item, index) => {
    if (!item.HsnCd || item.HsnCd.length < 4) {
      errors.push(`Item ${index + 1}: HSN code must be at least 4 characters`);
    }
    
    if (item.GstRt < 0 || item.GstRt > 28) {
      errors.push(`Item ${index + 1}: GST rate must be between 0 and 28`);
    }
  });
  
  // Validate amounts
  if (payload.ValDtls.TotInvVal <= 0) {
    errors.push('Total invoice value must be greater than 0');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Helper function to generate IRN hash (simplified version)
export function generateIRNHash(payload: EInvoicePayload): string {
  // In production, this would be done by the IRP
  // This is just for demonstration
  const dataString = JSON.stringify(payload);
  return btoa(dataString).substring(0, 64);
}
