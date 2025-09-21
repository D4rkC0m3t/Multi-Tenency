// GST Calculation Utilities for Inter-state and Intra-state transactions
// Handles IGST vs CGST+SGST logic based on state codes

export interface GSTBreakdown {
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  isInterstate: boolean;
  totalGstAmount: number;
}

export interface StateInfo {
  stateName: string;
  stateCode: string;
  gstStateCode: string;
}

// Indian States with GST State Codes
export const INDIAN_STATES_GST_CODES: Record<string, StateInfo> = {
  'andhra pradesh': { stateName: 'Andhra Pradesh', stateCode: 'AP', gstStateCode: '37' },
  'arunachal pradesh': { stateName: 'Arunachal Pradesh', stateCode: 'AR', gstStateCode: '12' },
  'assam': { stateName: 'Assam', stateCode: 'AS', gstStateCode: '18' },
  'bihar': { stateName: 'Bihar', stateCode: 'BR', gstStateCode: '10' },
  'chhattisgarh': { stateName: 'Chhattisgarh', stateCode: 'CG', gstStateCode: '22' },
  'goa': { stateName: 'Goa', stateCode: 'GA', gstStateCode: '30' },
  'gujarat': { stateName: 'Gujarat', stateCode: 'GJ', gstStateCode: '24' },
  'haryana': { stateName: 'Haryana', stateCode: 'HR', gstStateCode: '06' },
  'himachal pradesh': { stateName: 'Himachal Pradesh', stateCode: 'HP', gstStateCode: '02' },
  'jharkhand': { stateName: 'Jharkhand', stateCode: 'JH', gstStateCode: '20' },
  'karnataka': { stateName: 'Karnataka', stateCode: 'KA', gstStateCode: '29' },
  'kerala': { stateName: 'Kerala', stateCode: 'KL', gstStateCode: '32' },
  'madhya pradesh': { stateName: 'Madhya Pradesh', stateCode: 'MP', gstStateCode: '23' },
  'maharashtra': { stateName: 'Maharashtra', stateCode: 'MH', gstStateCode: '27' },
  'manipur': { stateName: 'Manipur', stateCode: 'MN', gstStateCode: '14' },
  'meghalaya': { stateName: 'Meghalaya', stateCode: 'ML', gstStateCode: '17' },
  'mizoram': { stateName: 'Mizoram', stateCode: 'MZ', gstStateCode: '15' },
  'nagaland': { stateName: 'Nagaland', stateCode: 'NL', gstStateCode: '13' },
  'odisha': { stateName: 'Odisha', stateCode: 'OR', gstStateCode: '21' },
  'punjab': { stateName: 'Punjab', stateCode: 'PB', gstStateCode: '03' },
  'rajasthan': { stateName: 'Rajasthan', stateCode: 'RJ', gstStateCode: '08' },
  'sikkim': { stateName: 'Sikkim', stateCode: 'SK', gstStateCode: '11' },
  'tamil nadu': { stateName: 'Tamil Nadu', stateCode: 'TN', gstStateCode: '33' },
  'telangana': { stateName: 'Telangana', stateCode: 'TS', gstStateCode: '36' },
  'tripura': { stateName: 'Tripura', stateCode: 'TR', gstStateCode: '16' },
  'uttar pradesh': { stateName: 'Uttar Pradesh', stateCode: 'UP', gstStateCode: '09' },
  'uttarakhand': { stateName: 'Uttarakhand', stateCode: 'UK', gstStateCode: '05' },
  'west bengal': { stateName: 'West Bengal', stateCode: 'WB', gstStateCode: '19' },
  'andaman and nicobar islands': { stateName: 'Andaman and Nicobar Islands', stateCode: 'AN', gstStateCode: '35' },
  'chandigarh': { stateName: 'Chandigarh', stateCode: 'CH', gstStateCode: '04' },
  'dadra and nagar haveli and daman and diu': { stateName: 'Dadra and Nagar Haveli and Daman and Diu', stateCode: 'DH', gstStateCode: '26' },
  'delhi': { stateName: 'Delhi', stateCode: 'DL', gstStateCode: '07' },
  'jammu and kashmir': { stateName: 'Jammu and Kashmir', stateCode: 'JK', gstStateCode: '01' },
  'ladakh': { stateName: 'Ladakh', stateCode: 'LA', gstStateCode: '38' },
  'lakshadweep': { stateName: 'Lakshadweep', stateCode: 'LD', gstStateCode: '31' },
  'puducherry': { stateName: 'Puducherry', stateCode: 'PY', gstStateCode: '34' }
};

/**
 * Get GST state code from state name
 */
export function getGSTStateCode(stateName: string): string {
  if (!stateName) return '27'; // Default to Maharashtra
  
  const normalizedState = stateName.toLowerCase().trim();
  const stateInfo = INDIAN_STATES_GST_CODES[normalizedState];
  
  return stateInfo?.gstStateCode || '27'; // Default to Maharashtra
}

/**
 * Get state info from state name
 */
export function getStateInfo(stateName: string): StateInfo | null {
  if (!stateName) return null;
  
  const normalizedState = stateName.toLowerCase().trim();
  return INDIAN_STATES_GST_CODES[normalizedState] || null;
}

/**
 * Check if transaction is interstate based on state names
 */
export function isInterstateTransaction(merchantState: string, customerState: string): boolean {
  if (!merchantState || !customerState) return false;
  
  const merchantGSTCode = getGSTStateCode(merchantState);
  const customerGSTCode = getGSTStateCode(customerState);
  
  return merchantGSTCode !== customerGSTCode;
}

/**
 * Calculate GST breakdown based on state codes
 */
export function calculateGSTBreakdown(
  taxAmount: number,
  merchantState: string,
  customerState: string
): GSTBreakdown {
  const interstate = isInterstateTransaction(merchantState, customerState);
  
  if (interstate) {
    // Interstate: Full tax as IGST
    return {
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: taxAmount,
      isInterstate: true,
      totalGstAmount: taxAmount
    };
  } else {
    // Intrastate: Split equally between CGST and SGST
    const halfTax = taxAmount / 2;
    return {
      cgstAmount: halfTax,
      sgstAmount: halfTax,
      igstAmount: 0,
      isInterstate: false,
      totalGstAmount: taxAmount
    };
  }
}

/**
 * Calculate total amount with GST breakdown
 */
export function calculateTotalWithGST(
  subtotal: number,
  gstRate: number,
  merchantState: string,
  customerState: string,
  discountAmount: number = 0
): {
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  gstBreakdown: GSTBreakdown;
  total: number;
} {
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = (taxableAmount * gstRate) / 100;
  const gstBreakdown = calculateGSTBreakdown(taxAmount, merchantState, customerState);
  const total = taxableAmount + taxAmount;
  
  return {
    subtotal,
    discountAmount,
    taxableAmount,
    gstBreakdown,
    total
  };
}

/**
 * Get all Indian states for dropdown
 */
export function getAllIndianStates(): StateInfo[] {
  return Object.values(INDIAN_STATES_GST_CODES).sort((a, b) => 
    a.stateName.localeCompare(b.stateName)
  );
}

/**
 * Validate GST state code
 */
export function isValidGSTStateCode(gstStateCode: string): boolean {
  return Object.values(INDIAN_STATES_GST_CODES).some(
    state => state.gstStateCode === gstStateCode
  );
}

/**
 * Format GST breakdown for display
 */
export function formatGSTBreakdown(gstBreakdown: GSTBreakdown): string {
  if (gstBreakdown.isInterstate) {
    return `IGST: ₹${gstBreakdown.igstAmount.toFixed(2)}`;
  } else {
    return `CGST: ₹${gstBreakdown.cgstAmount.toFixed(2)} + SGST: ₹${gstBreakdown.sgstAmount.toFixed(2)}`;
  }
}

/**
 * Get GST breakdown for invoice display
 */
export function getGSTBreakdownForInvoice(gstBreakdown: GSTBreakdown) {
  return {
    cgst: {
      rate: gstBreakdown.isInterstate ? 0 : 9, // 9% for intrastate
      amount: gstBreakdown.cgstAmount
    },
    sgst: {
      rate: gstBreakdown.isInterstate ? 0 : 9, // 9% for intrastate
      amount: gstBreakdown.sgstAmount
    },
    igst: {
      rate: gstBreakdown.isInterstate ? 18 : 0, // 18% for interstate
      amount: gstBreakdown.igstAmount
    },
    total: gstBreakdown.totalGstAmount,
    isInterstate: gstBreakdown.isInterstate
  };
}
