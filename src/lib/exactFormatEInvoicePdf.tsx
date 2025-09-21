// Exact Format E-Invoice PDF Generator matching the sample layout
// This creates a PDF that closely matches the government E-Invoice format

import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  PDFDownloadLink,
  Image,
  BlobProvider,
} from "@react-pdf/renderer";

export type ExactEInvoiceItem = {
  sr: number;
  description: string;
  lotBatch?: string;
  hsn: string;
  gst: number;
  mfgDate?: string;
  expiryDate?: string;
  qty: number;
  unit?: string;
  inclRate?: number;
  rate: number;
  amount: number;
  manufacturer?: string;
  packingDetails?: string;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
};

export type ExactEInvoiceData = {
  // E-Invoice Header
  ackNo: string;
  ackDate: string;
  irn: string;
  signedQRCode?: string;
  
  // Company Details
  companyName: string;
  companyAddress: string[];
  companyLogo?: string;
  gstin: string;
  stateName: string;
  stateCode: string;
  mobile?: string;
  email?: string;
  
  // Fertilizer Licensing Details
  fertilizerLicense?: string;
  seedLicense?: string;
  pesticideLicense?: string;
  
  // Invoice Details
  invoiceNo: string;
  invoiceDate: string;
  eWayBillNo?: string;
  eWayBillDate?: string;
  despatchThrough?: string;
  destination?: string;
  modeTermsOfPayment?: string;
  otherReferences?: string;
  vehicleNo?: string;
  dateTimeOfSupply?: string;
  
  // Buyer Details
  buyerName: string;
  buyerAddress: string[];
  buyerGstin?: string;
  buyerStateName?: string;
  buyerStateCode?: string;
  buyerMobile?: string;
  buyerContactDetails?: string;
  
  // Items
  items: ExactEInvoiceItem[];
  
  // Tax Summary
  hsnSac: string;
  taxableValue: number;
  gstRate: number;
  gstAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  taxAmount: number;
  roundOff: number;
  invoiceTotal: number;
  isInterstate: boolean;
  
  // Amount in Words
  amountInWords: string;
  
  // Outstanding Details
  previousOutstanding?: number;
  currentInvoice: number;
  totalOutstanding: number;
  
  // Bank Details
  bankName?: string;
  accountNo?: string;
  branchIfsc?: string;
  
  // Footer
  jurisdiction?: string;
};

const styles = StyleSheet.create({
  page: {
    padding: 15,
    fontSize: 7,
    fontFamily: 'Helvetica',
    lineHeight: 1.1
  },
  
  // Header Section
  headerSection: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#000',
    marginBottom: 2
  },
  
  topHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderBottomColor: '#000'
  },
  
  ackSection: {
    flex: 1,
    padding: 3,
    borderRightWidth: 1,
    borderStyle: 'solid',
    borderRightColor: '#000'
  },
  
  taxInvoiceTitleSection: {
    flex: 1,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderStyle: 'solid',
    borderRightColor: '#000'
  },
  
  originalSection: {
    width: 120,
    padding: 3,
    alignItems: 'center'
  },
  
  irnSection: {
    flexDirection: 'row',
    padding: 3,
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderBottomColor: '#000'
  },
  
  irnLeft: {
    flex: 1,
    paddingRight: 5
  },
  
  qrSection: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  // Company Section
  companySection: {
    padding: 12,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#000',
    marginBottom: 2,
    minHeight: 120
  },
  
  companyLeft: {
    alignItems: 'center'
  },
  
  // Company Header
  companyHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 8,
    justifyContent: 'space-between'
  },
  
  companyName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2
  },
  
  logoSection: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  companyDetails: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10
  },
  
  taxInvoiceTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    textDecoration: 'underline'
  },
  
  headerTaxInvoiceTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    textDecoration: 'underline'
  },
  
  // Invoice Details Section
  invoiceDetailsSection: {
    flexDirection: 'row',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#000',
    marginBottom: 2
  },
  
  invoiceLeft: {
    flex: 1,
    padding: 4,
    borderRightWidth: 1,
    borderStyle: 'solid',
    borderRightColor: '#000'
  },
  
  invoiceRight: {
    flex: 1,
    padding: 4
  },
  
  // Party Details Section
  partySection: {
    flexDirection: 'row',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#000',
    marginBottom: 2
  },
  
  buyerSection: {
    flex: 1,
    padding: 4,
    borderRightWidth: 1,
    borderStyle: 'solid',
    borderRightColor: '#000'
  },
  
  consigneeSection: {
    flex: 1,
    padding: 4
  },
  
  // Table Styles
  table: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#000',
    marginBottom: 2
  },
  
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderBottomColor: '#000',
    fontWeight: 'bold',
    fontSize: 6,
    minHeight: 12
  },
  
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderStyle: 'solid',
    borderBottomColor: '#000',
    minHeight: 18,
    alignItems: 'center'
  },
  
  // Column widths optimized for better layout
  col1: { width: '4%', padding: 2, borderRightWidth: 0.5, borderStyle: 'solid', borderRightColor: '#000', textAlign: 'center', fontSize: 6 },
  col2: { width: '25%', padding: 2, borderRightWidth: 0.5, borderStyle: 'solid', borderRightColor: '#000', fontSize: 6 },
  col3: { width: '9%', padding: 2, borderRightWidth: 0.5, borderStyle: 'solid', borderRightColor: '#000', textAlign: 'center', fontSize: 6 },
  col4: { width: '6%', padding: 2, borderRightWidth: 0.5, borderStyle: 'solid', borderRightColor: '#000', textAlign: 'center', fontSize: 6 },
  col5: { width: '8%', padding: 2, borderRightWidth: 0.5, borderStyle: 'solid', borderRightColor: '#000', textAlign: 'center', fontSize: 6 },
  col6: { width: '8%', padding: 2, borderRightWidth: 0.5, borderStyle: 'solid', borderRightColor: '#000', textAlign: 'center', fontSize: 6 },
  col7: { width: '8%', padding: 2, borderRightWidth: 0.5, borderStyle: 'solid', borderRightColor: '#000', textAlign: 'center', fontSize: 6 },
  col8: { width: '8%', padding: 2, borderRightWidth: 0.5, borderStyle: 'solid', borderRightColor: '#000', textAlign: 'right', fontSize: 6 },
  col9: { width: '10%', padding: 2, borderRightWidth: 0.5, borderStyle: 'solid', borderRightColor: '#000', textAlign: 'right', fontSize: 6 },
  col10: { width: '14%', padding: 2, textAlign: 'right', fontSize: 6 },
  col11: { width: '10%', padding: 1, borderRightWidth: 0.5, borderStyle: 'solid', borderRightColor: '#000', textAlign: 'right' },
  col12: { width: '14%', padding: 1, textAlign: 'right' },

  // Tax Summary Section
  taxSummarySection: {
    flexDirection: 'row',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#000',
    marginBottom: 2
  },

  taxLeft: {
    flex: 2,
    padding: 4
  },

  taxRight: {
    flex: 1,
    padding: 4,
    borderLeftWidth: 1,
    borderStyle: 'solid',
    borderLeftColor: '#000'
  },
  
  taxTable: {
    borderWidth: 1,
    borderColor: '#000'
  },
  
  taxTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderBottomColor: '#000',
    fontWeight: 'bold'
  },
  
  taxTableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderStyle: 'solid',
    borderBottomColor: '#000'
  },
  
  // Outstanding Details Section
  outstandingSection: {
    flexDirection: 'row',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#000',
    marginBottom: 2
  },
  
  outstandingLeft: {
    flex: 1,
    padding: 4,
    borderRightWidth: 1,
    borderStyle: 'solid',
    borderRightColor: '#000'
  },
  
  outstandingRight: {
    flex: 1,
    padding: 4
  },
  
  // Terms Section
  termsSection: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#000',
    padding: 4,
    marginBottom: 2
  },

  // Footer Section
  footerSection: {
    flexDirection: 'row',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#000',
    padding: 6,
    marginBottom: 2
  },
  
  footerLeft: {
    flex: 1,
    paddingRight: 8
  },
  
  footerRight: {
    flex: 1,
    padding: 3,
    alignItems: 'flex-end',
    justifyContent: 'flex-end'
  },
  
  // Utility Styles
  bold: { fontWeight: 'bold' },
  center: { textAlign: 'center' },
  right: { textAlign: 'right' },
  underline: { textDecoration: 'underline' },
  
  qrCode: {
    width: 50,
    height: 50
  }
});

// Dual copy version: two properly scaled copies on separate pages
export function DualExactEInvoicePDF({ data }: { data: ExactEInvoiceData }) {
  const fileName = `einvoice_dual_${data.invoiceNo.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  const DualDocument = (
    <Document>
      <Page size="A4" style={styles.page}>
        <ExactEInvoiceContent data={data} />
      </Page>
      <Page size="A4" style={styles.page}>
        <ExactEInvoiceContent data={data} />
      </Page>
    </Document>
  );

  return (
    <PDFDownloadLink document={DualDocument} fileName={fileName}>
      {({ loading }) => (
        <span className={`px-4 py-2 rounded-lg inline-flex items-center gap-2 ${loading ? 'bg-gray-400' : 'bg-emerald-600 hover:bg-emerald-700'} text-white`}>
          {loading ? (
            <>
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              Generating Dual Copy PDF...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Dual Invoice (2 Pages)
            </>
          )}
        </span>
      )}
    </PDFDownloadLink>
  );
}

// Open in new tab for preview/print (helps if downloads are blocked by the browser)
export function ViewExactEInvoiceLink({ data }: { data: ExactEInvoiceData }) {
  const doc = <ExactEInvoiceDocument data={data} />;
  return (
    <BlobProvider document={doc}>
      {({ url, loading }) => (
        <a
          href={url || undefined}
          target="_blank"
          rel="noopener noreferrer"
          className={`px-4 py-2 rounded-lg text-white ${loading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
        >
          {loading ? 'Preparing Preview…' : 'View in New Tab / Print'}
        </a>
      )}
    </BlobProvider>
  );
}

export function ExactEInvoiceContent({ data }: { data: ExactEInvoiceData }) {
  // Convert number to words function
  const numberToWords = (num: number): string => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    const convertHundreds = (n: number): string => {
      let result = '';
      if (n >= 100) {
        result += ones[Math.floor(n / 100)] + ' Hundred ';
        n %= 100;
      }
      if (n >= 20) {
        result += tens[Math.floor(n / 10)] + ' ';
        n %= 10;
      } else if (n >= 10) {
        result += teens[n - 10] + ' ';
        return result;
      }
      if (n > 0) {
        result += ones[n] + ' ';
      }
      return result;
    };
    
    if (num === 0) return 'Zero Rupees Only';
    
    const integerPart = Math.floor(num);
    const decimalPart = Math.round((num - integerPart) * 100);
    
    let result = '';
    const crores = Math.floor(integerPart / 10000000);
    const lakhs = Math.floor((integerPart % 10000000) / 100000);
    const thousands = Math.floor((integerPart % 100000) / 1000);
    const hundreds = integerPart % 1000;
    
    if (crores > 0) result += convertHundreds(crores) + 'Crore ';
    if (lakhs > 0) result += convertHundreds(lakhs) + 'Lakh ';
    if (thousands > 0) result += convertHundreds(thousands) + 'Thousand ';
    if (hundreds > 0) result += convertHundreds(hundreds);
    
    result = result.trim() + ' Rupees';
    
    if (decimalPart > 0) {
      result += ' and ' + convertHundreds(decimalPart).trim() + ' Paise';
    }
    
    return result + ' Only';
  };

  const renderQRCode = () => {
    if (data.signedQRCode) {
      try {
        // Handle both base64 with and without data URI prefix
        const base64Data = data.signedQRCode.startsWith('data:') 
          ? data.signedQRCode 
          : `data:image/png;base64,${data.signedQRCode}`;
        return <Image style={styles.qrCode} src={base64Data} />;
      } catch (error) {
        console.error('QR Code rendering error:', error);
        return <Text style={[styles.center, { fontSize: 6 }]}>QR Error</Text>;
      }
    }
    // Generate E-Invoice QR code data string (Government format)
    const qrData = `${data.gstin}|${data.buyerGstin || ''}|${data.invoiceNo}|${data.invoiceDate}|${data.invoiceTotal.toFixed(2)}|${data.irn}|${data.ackNo}|${data.ackDate}`;
    return (
      <View style={[styles.qrCode, { justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#000', backgroundColor: '#fff' }]}>
        <Text style={{ fontSize: 4, textAlign: 'center', lineHeight: 1.2, padding: 2 }}>
          E-Invoice QR Code{'\n'}
          IRN: {data.irn.substring(0, 20)}...{'\n'}
          Amount: ₹{data.invoiceTotal.toFixed(2)}
        </Text>
      </View>
    );
  };

  return (
    <>
        {/* Header Section */}
        <View style={styles.headerSection}>
          {/* Top Header with Ack Details */}
          <View style={styles.topHeader}>
            <View style={styles.ackSection}>
              <Text style={styles.bold}>Ack No.: {data.ackNo}</Text>
              <Text style={styles.bold}>Ack Date: {data.ackDate}</Text>
            </View>
            <View style={styles.taxInvoiceTitleSection}>
              <Text style={styles.headerTaxInvoiceTitle}>TAX INVOICE</Text>
            </View>
            <View style={styles.originalSection}>
              <Text style={styles.bold}>(ORIGINAL FOR RECIPIENT)</Text>
            </View>
          </View>
          
          {/* IRN Section */}
          <View style={styles.irnSection}>
            <View style={styles.irnLeft}>
              <Text style={styles.bold}>IRN: {data.irn}</Text>
            </View>
            <View style={styles.qrSection}>
              {renderQRCode()}
            </View>
          </View>
        </View>

        {/* Company Section */}
        <View style={styles.companySection}>
          {/* Company Header with Logo and Details */}
          <View style={styles.companyHeader}>
            {/* Company Logo */}
            <View style={styles.logoSection}>
              {data.companyLogo ? (
                <Image style={{ width: 70, height: 70 }} src={data.companyLogo} />
              ) : (
                <View style={{ width: 70, height: 70, borderWidth: 1, borderColor: '#ccc', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9f9f9' }}>
                  <Text style={{ fontSize: 6, textAlign: 'center', color: '#666' }}>[Company{"\n"}Logo]</Text>
                </View>
              )}
            </View>
            
            {/* Company Details - Centered */}
            <View style={styles.companyDetails}>
              {/* Company Name with more spacing */}
              <Text style={[styles.bold, styles.center, { fontSize: 16, marginBottom: 8, fontWeight: 'bold' }]}>
                {data.companyName}
              </Text>
              
              {/* Address with spacing */}
              {data.companyAddress && data.companyAddress.map((line, index) => (
                <Text key={index} style={[styles.center, { fontSize: 8, marginBottom: 2, lineHeight: 1.2 }]}>
                  {line}
                </Text>
              ))}
              
              {/* GSTIN and State with spacing */}
              <Text style={[styles.center, { fontSize: 8, marginBottom: 2, marginTop: 3 }]}>
                GSTIN/UIN: {data.gstin}, State Name: {data.stateName}, Code: {data.stateCode}
              </Text>
              
              {/* Contact details with spacing */}
              <Text style={[styles.center, { fontSize: 8, marginBottom: 4 }]}>
                Mobile Number: {data.mobile}, E-Mail: {data.email}
              </Text>
              
              {/* Fertilizer Licensing Information with better spacing */}
              {(data.fertilizerLicense || data.seedLicense || data.pesticideLicense) && (
                <Text style={[styles.center, { fontSize: 7, marginTop: 4, backgroundColor: '#f8f9fa', padding: 2, borderRadius: 2 }]}>
                  {[
                    data.fertilizerLicense && `Fertilizer License: ${data.fertilizerLicense}`,
                    data.seedLicense && `Seed License: ${data.seedLicense}`,
                    data.pesticideLicense && `Pesticide License: ${data.pesticideLicense}`
                  ].filter(Boolean).join(' | ')}
                </Text>
              )}
            </View>
            
            {/* Empty space for balance (same width as logo) */}
            <View style={{ width: 80 }} />
          </View>
        </View>

        {/* Invoice Details Section */}
        <View style={styles.invoiceDetailsSection}>
          <View style={styles.invoiceLeft}>
            <Text style={{ fontSize: 7 }}>Invoice No.: {data.invoiceNo}</Text>
            <Text style={{ fontSize: 7 }}>Invoice Date: {data.invoiceDate}</Text>
            <Text style={{ fontSize: 7 }}>Despatch through: {data.despatchThrough || 'Four Wheeler/Tata Ace'}</Text>
            <Text style={{ fontSize: 7 }}>Destination: {data.destination || 'Customer Location'}</Text>
            <Text style={{ fontSize: 7 }}>Mode/Terms of payment: {data.modeTermsOfPayment || 'CASH'}</Text>
          </View>
          <View style={styles.invoiceRight}>
            <Text style={{ fontSize: 7 }}>e-WayBill No.: {data.eWayBillNo || 'N/A'}</Text>
            <Text style={{ fontSize: 7 }}>e-WayBill Date: {data.eWayBillDate || 'N/A'}</Text>
            <Text style={{ fontSize: 7 }}>Other References: {data.otherReferences || 'N/A'}</Text>
            <Text style={{ fontSize: 7 }}>Vehicle No.: {data.vehicleNo || 'N/A'}</Text>
            <Text style={{ fontSize: 7 }}>Time of Supply: {new Date().toLocaleTimeString('en-IN')}</Text>
          </View>
        </View>

        {/* Party Details */}
        <View style={styles.partySection}>
          <View style={styles.buyerSection}>
            <Text style={[styles.bold, styles.underline]}>Buyer (if other than consignee)</Text>
            <Text style={styles.bold}>{data.buyerName}</Text>
            {data.buyerAddress.map((line, i) => (
              <Text key={i}>{line}</Text>
            ))}
            <Text>GSTIN/UIN: {data.buyerGstin || ''}</Text>
            <Text>State Name: {data.buyerStateName || ''}, Code: {data.buyerStateCode || ''}</Text>
            <Text>Contact Details: {data.buyerContactDetails || ''}</Text>
          </View>
          <View style={styles.consigneeSection}>
            <Text style={[styles.bold, styles.underline]}>Buyer</Text>
            <Text style={styles.bold}>{data.buyerName}</Text>
            {data.buyerAddress.map((line, i) => (
              <Text key={i}>{line}</Text>
            ))}
            <Text>GSTIN/UIN: {data.buyerGstin || ''}</Text>
            <Text>State Name: {data.buyerStateName || ''}, Code: {data.buyerStateCode || ''}</Text>
            <Text>Mobile Number: {data.buyerMobile || ''}</Text>
            <Text>Contact Details: {data.buyerContactDetails || ''}</Text>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Sr</Text>
            <Text style={styles.col2}>Item</Text>
            <Text style={styles.col3}>HSN</Text>
            <Text style={styles.col4}>GST</Text>
            <Text style={styles.col5}>Mfg</Text>
            <Text style={styles.col6}>Exp</Text>
            <Text style={styles.col7}>Qty</Text>
            <Text style={styles.col8}>Incl</Text>
            <Text style={styles.col9}>Rate</Text>
            <Text style={styles.col10}>Amount</Text>
          </View>
          
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>No</Text>
            <Text style={styles.col2}>Description</Text>
            <Text style={styles.col3}>Code</Text>
            <Text style={styles.col4}>%</Text>
            <Text style={styles.col5}>Date</Text>
            <Text style={styles.col6}>Date</Text>
            <Text style={styles.col7}></Text>
            <Text style={styles.col8}>Rate</Text>
            <Text style={styles.col9}></Text>
            <Text style={styles.col10}></Text>
          </View>

          {/* Table Rows */}
          {data.items.map((item) => (
            <View style={styles.tableRow} key={item.sr}>
              <Text style={styles.col1}>{item.sr}</Text>
              <View style={styles.col2}>
                <Text style={styles.bold}>{item.description}</Text>
                {item.lotBatch && <Text style={{ fontSize: 5 }}>LOT/Batch: {item.lotBatch}</Text>}
              </View>
              <Text style={styles.col3}>{item.hsn}</Text>
              <Text style={styles.col4}>{item.gst}</Text>
              <Text style={styles.col5}>{item.mfgDate || ''}</Text>
              <Text style={styles.col6}>{item.expiryDate || ''}</Text>
              <Text style={styles.col7}>{item.qty} {item.unit || 'PCS'}</Text>
              <Text style={styles.col8}>{item.inclRate?.toFixed(2) || ''}</Text>
              <Text style={styles.col9}>₹{item.rate.toFixed(2)}</Text>
              <Text style={styles.col10}>₹{item.amount.toFixed(2)}</Text>
            </View>
          ))}
          
          {/* Total Row */}
          <View style={[styles.tableRow, { backgroundColor: '#f0f0f0', borderBottomWidth: 1, borderBottomColor: '#000' }]}>
            <Text style={[styles.col1, styles.bold]}></Text>
            <Text style={[styles.col2, styles.bold]}></Text>
            <Text style={[styles.col3, styles.bold]}></Text>
            <Text style={[styles.col4, styles.bold]}></Text>
            <Text style={[styles.col5, styles.bold]}></Text>
            <Text style={[styles.col6, styles.bold]}></Text>
            <Text style={[styles.col7, styles.bold]}>{data.items.reduce((sum, item) => sum + item.qty, 0)} PCS</Text>
            <Text style={[styles.col8, styles.bold]}></Text>
            <Text style={[styles.col9, styles.bold]}></Text>
            <Text style={[styles.col10, styles.bold]}>₹{data.items.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}</Text>
          </View>
        </View>

        {/* Tax Summary */}
        <View style={styles.taxSummarySection}>
          <View style={styles.taxLeft}>
            <View style={[styles.taxTable, { borderWidth: 1, borderColor: '#000' }]}>
              <View style={[styles.taxTableHeader, { borderBottomWidth: 1, borderBottomColor: '#000', backgroundColor: '#f0f0f0' }]}>
                <Text style={[{ width: '25%', padding: 2, borderRight: 1, borderRightColor: '#000' }, styles.bold]}>HSN/SAC</Text>
                <Text style={[{ width: '25%', padding: 2, borderRight: 1, borderRightColor: '#000' }, styles.bold]}>Taxable Value</Text>
                <Text style={[{ width: '15%', padding: 2, borderRight: 1, borderRightColor: '#000' }, styles.bold]}>Rate</Text>
                <Text style={[{ width: '15%', padding: 2, borderRight: 1, borderRightColor: '#000' }, styles.bold]}>Amount</Text>
                <Text style={[{ width: '20%', padding: 2 }, styles.bold]}>Tax Amount</Text>
              </View>
              <View style={[styles.taxTableRow, { borderBottomWidth: 1, borderBottomColor: '#000' }]}>
                <Text style={{ width: '25%', padding: 2, borderRight: 1, borderRightColor: '#000' }}>{data.hsnSac}</Text>
                <Text style={{ width: '25%', padding: 2, borderRight: 1, borderRightColor: '#000' }}>₹{data.taxableValue.toFixed(2)}</Text>
                <Text style={{ width: '15%', padding: 2, borderRight: 1, borderRightColor: '#000' }}>{data.gstRate}%</Text>
                <Text style={{ width: '15%', padding: 2, borderRight: 1, borderRightColor: '#000' }}>₹{data.cgstAmount.toFixed(2)}</Text>
                <Text style={{ width: '20%', padding: 2 }}>₹{data.sgstAmount.toFixed(2)}</Text>
              </View>
              <View style={[styles.taxTableRow, { borderBottomWidth: 1, borderBottomColor: '#000', backgroundColor: '#f0f0f0' }]}>
                <Text style={[{ width: '25%', padding: 2, borderRight: 1, borderRightColor: '#000' }, styles.bold]}>Total</Text>
                <Text style={[{ width: '25%', padding: 2, borderRight: 1, borderRightColor: '#000' }, styles.bold]}>₹{data.taxableValue.toFixed(2)}</Text>
                <Text style={[{ width: '15%', padding: 2, borderRight: 1, borderRightColor: '#000' }, styles.bold]}></Text>
                <Text style={[{ width: '15%', padding: 2, borderRight: 1, borderRightColor: '#000' }, styles.bold]}>₹{data.gstAmount.toFixed(2)}</Text>
                <Text style={[{ width: '20%', padding: 2 }, styles.bold]}>₹{data.taxAmount.toFixed(2)}</Text>
              </View>
            </View>
            
            <View style={{ marginTop: 5, borderTopWidth: 1, borderTopColor: '#000', paddingTop: 3 }}>
              <Text style={[styles.bold, { fontSize: 8 }]}>Amount In Words: {numberToWords(Math.floor(data.invoiceTotal))}</Text>
            </View>
          </View>
          
          <View style={styles.taxRight}>
            {data.isInterstate ? (
              <View>
                <Text style={[styles.bold, { fontSize: 8 }]}>IGST @ {data.gstRate}%: ₹{data.igstAmount.toFixed(2)}</Text>
              </View>
            ) : (
              <View>
                <Text style={[styles.bold, { fontSize: 8 }]}>CGST @ {(data.gstRate/2)}%: ₹{data.cgstAmount.toFixed(2)}</Text>
                <Text style={[styles.bold, { fontSize: 8 }]}>SGST @ {(data.gstRate/2)}%: ₹{data.sgstAmount.toFixed(2)}</Text>
              </View>
            )}
            <Text style={[styles.bold, { fontSize: 7 }]}>Round Off: (₹{data.roundOff.toFixed(2)})</Text>
            <View style={{ marginTop: 3, paddingTop: 2, borderTopWidth: 1, borderTopColor: '#000' }}>
              <Text style={[styles.bold, { fontSize: 10, textAlign: 'right' }]}>Invoice Total: ₹{data.invoiceTotal.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Outstanding Details */}
        <View style={styles.outstandingSection}>
          <View style={styles.outstandingLeft}>
            <Text style={[styles.bold, styles.underline]}>Outstanding Details</Text>
            <Text>Previous Outstanding: {data.previousOutstanding?.toFixed(2) || '0.00'}</Text>
            <Text>Current Invoice: {data.currentInvoice.toFixed(2)}</Text>
            <Text style={styles.bold}>Total Outstanding: {data.totalOutstanding.toFixed(2)}</Text>
          </View>
          <View style={styles.outstandingRight}>
            <Text style={[styles.bold, styles.underline]}>Company's Bank Details</Text>
            <Text>Bank Name: {data.bankName || ''}</Text>
            <Text>A/c No.: {data.accountNo ? `****${data.accountNo.slice(-4)}` : ''}</Text>
            <Text>Branch & IFS Code: {data.branchIfsc || ''}</Text>
          </View>
        </View>

        {/* Terms & Conditions Section */}
        <View style={styles.termsSection}>
          <Text style={[styles.bold, { fontSize: 7, marginBottom: 3 }]}>
            Terms & Conditions:
          </Text>
          <Text style={{ fontSize: 6, marginBottom: 1 }}>
            • Please check batch number and expiry date before use
          </Text>
          <Text style={{ fontSize: 6, marginBottom: 1 }}>
            • Goods sold are subject to FCO 1985 and Seed Act compliance
          </Text>
          <Text style={{ fontSize: 6, marginBottom: 1 }}>
            • No returns accepted after 7 days of purchase
          </Text>
          <Text style={{ fontSize: 6, marginBottom: 1 }}>
            • Subject to {data.jurisdiction || 'Local'} jurisdiction only
          </Text>
        </View>

        {/* Footer Section */}
        <View style={styles.footerSection}>
          <View style={styles.footerLeft}>
            <Text style={{ fontSize: 7, fontWeight: 'bold' }}>Customer signature & seal</Text>
          </View>
          <View style={styles.footerRight}>
            <Text style={{ fontSize: 7, marginBottom: 5 }}>
              For {data.companyName}
            </Text>
            <Text style={{ fontSize: 7, marginTop: 15 }}>
              Authorized Signatory
            </Text>
          </View>
        </View>
        
    </>
  );
}

export function ExactEInvoiceDocument({ data }: { data: ExactEInvoiceData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <ExactEInvoiceContent data={data} />
      </Page>
    </Document>
  );
}

export default function ExactEInvoicePDF({ data }: { data: ExactEInvoiceData }) {
  const fileName = `einvoice_${data.invoiceNo.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  
  return (
    <PDFDownloadLink document={<ExactEInvoiceDocument data={data} />} fileName={fileName}>
      {({ loading }) => (
        <span className={`px-4 py-2 rounded-lg inline-flex items-center gap-2 ${loading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'} text-white`}>
          {loading ? (
            <>
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              Generating E-Invoice PDF...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download E-Invoice PDF
            </>
          )}
        </span>
      )}
    </PDFDownloadLink>
  );
}
