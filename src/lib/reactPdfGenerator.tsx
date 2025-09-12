import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf, Image } from '@react-pdf/renderer';
import QRCode from 'qrcode';

// Function to generate QR code as data URL
const generateQRCode = async (text: string): Promise<string> => {
  try {
    return await QRCode.toDataURL(text, { width: 200, margin: 1 });
  } catch (err) {
    // Return a simple placeholder if QR generation fails
    return 'data:image/svg+xml;base64,' + btoa(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f8f8f8"/>
        <text x="50%" y="50%" font-family="Arial" font-size="12" text-anchor="middle" dominant-baseline="middle" fill="#666">
          QR Code Placeholder
        </text>
      </svg>
    `);
  }
};

// Interface for invoice data
export interface InvoicePDFData {
  invoiceNo: string;
  date: string;
  merchantName: string;
  merchantAddress: string;
  merchantEmail: string;
  merchantGST: string;
  fertilizerLicense: string;
  seedLicense?: string;
  pesticideLicense?: string;
  merchantPhone: string;
  merchantLogo?: string; // Base64 encoded image or URL
  customerName: string;
  customerAddress: string;
  customerGST: string;
  customerPhone: string;
  paymentMethod: string;
  salesType: string;
  items: Array<{
    sn: number;
    description: string;
    hsn: string;
    packing: string;
    mfgDate: string;
    expDate: string;
    qty: string;
    rate: number;
    amount: number;
    gst: number;
    total: number;
  }>;
  subtotal: number;
  cgst: number;
  sgst: number;
  grandTotal: number;
  totalInWords: string;
  qrCodeData?: string; // Base64 encoded QR code image
}

// Styles for the PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 10,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  copyHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: '#f5f5f5',
    padding: 5,
    textAlign: 'center',
    marginBottom: 5,
  },
  headerSection: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  logoSection: {
    width: 80,
    height: 80,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    border: '1 solid #ddd',
  },
  leftColumn: {
    width: '40%',
    paddingRight: 15,
  },
  rightColumn: {
    width: '40%',
    textAlign: 'right',
  },
  qrSection: {
    width: 60,
    height: 60,
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
    border: '1 solid #ddd',
  },
  businessInfo: {
    marginBottom: 6,
  },
  licenseInfo: {
    marginBottom: 4,
  },
  merchantName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
    textAlign: 'center',
  },
  invoiceTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 3,
    textAlign: 'center',
  },
  merchantDetails: {
    fontSize: 10,
    marginBottom: 1,
    textAlign: 'center',
  },
  salesInfo: {
    fontSize: 10,
    marginBottom: 1,
    textAlign: 'center',
  },
  customerSection: {
    marginBottom: 3,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  customerInfo: {
    fontSize: 10,
    marginBottom: 1,
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    marginBottom: 3,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableHeader: {
    backgroundColor: '#f5f5f5',
    fontWeight: 'bold',
    fontSize: 9,
    padding: 3,
    textAlign: 'center',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
  },
  tableCell: {
    fontSize: 8,
    padding: 3,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
  },
  grandTotalRow: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
  },
  amountInWords: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  footerSection: {
    flexDirection: 'row',
    marginTop: 5,
  },
  termsSection: {
    flex: 1,
    paddingRight: 20,
  },
  termsHeader: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  terms: {
    fontSize: 9,
    marginBottom: 2,
  },
  totalsSection: {
    width: 150,
    textAlign: 'right',
  },
  totalBreakdown: {
    fontSize: 10,
    marginBottom: 2,
  },
  finalTotal: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  signatory: {
    fontSize: 10,
    marginBottom: 2,
  },
});

// Table column widths
const columnWidths = [25, 120, 50, 45, 45, 45, 50, 50, 50, 40, 60];

// Invoice Copy Component
const InvoiceCopy: React.FC<{ data: InvoicePDFData; copyType: string }> = ({ data, copyType }) => (
  <View>
    {/* Copy Header */}
    <Text style={styles.copyHeader}>{copyType}</Text>

    {/* Header Section */}
    <View style={styles.headerSection}>
      <View style={styles.logoSection}>
        {data.merchantLogo ? (
          <View style={{ width: 70, height: 70, position: 'relative' }}>
            <Image 
              src={data.merchantLogo} 
              style={{ 
                width: '100%', 
                height: '100%',
                objectFit: 'contain',
                maxWidth: '100%',
                maxHeight: '100%'
              }}
              cache={false}
            />
          </View>
        ) : (
          <View style={{ 
            width: 70, 
            height: 70, 
            backgroundColor: '#f8f8f8', 
            alignItems: 'center', 
            justifyContent: 'center',
            border: '1px solid #e0e0e0'
          }}>
            <Text style={{ fontSize: 8, textAlign: 'center', color: '#666' }}>COMPANY</Text>
            <Text style={{ fontSize: 8, textAlign: 'center', color: '#666' }}>LOGO</Text>
          </View>
        )}
      </View>
      
      <View style={styles.leftColumn}>
        <Text style={styles.merchantName}>{data.merchantName}</Text>
        <Text style={styles.invoiceTitle}>GST Invoice</Text>
        <Text style={styles.merchantDetails}>{data.merchantAddress}</Text>
        <Text style={styles.merchantDetails}>Phone: {data.merchantPhone}</Text>
        <Text style={styles.merchantDetails}>Email: {data.merchantEmail}</Text>
        <Text style={styles.merchantDetails}>GST No: {data.merchantGST}</Text>
        <View style={{ marginTop: 4 }}>
          <Text style={styles.salesInfo}>Sales Type: {data.salesType}</Text>
          <Text style={styles.salesInfo}>Payment: {data.paymentMethod}</Text>
        </View>
      </View>
      
      <View style={styles.rightColumn}>
        <Text style={[styles.customerInfo, { fontWeight: 'bold', fontSize: 11 }]}>Invoice No:</Text>
        <Text style={styles.customerInfo}>{data.invoiceNo}</Text>
        <Text style={[styles.customerInfo, { fontWeight: 'bold', fontSize: 11, marginTop: 4 }]}>Date:</Text>
        <Text style={styles.customerInfo}>{data.date}</Text>
        
        <View style={{ marginTop: 8 }}>
          <Text style={styles.sectionHeader}>Billed Customer (Bill to)</Text>
          <Text style={styles.customerInfo}>{data.customerName}</Text>
          <Text style={styles.customerInfo}>{data.customerAddress}</Text>
          <Text style={styles.customerInfo}>GST: {data.customerGST}</Text>
          <Text style={styles.customerInfo}>Phone: {data.customerPhone}</Text>
        </View>
      </View>
      
      <View style={styles.qrSection}>
        {data.qrCodeData ? (
          <Image 
            src={data.qrCodeData} 
            style={{ width: 50, height: 50, objectFit: 'contain' }} 
          />
        ) : (
          <View style={{ width: 50, height: 50, backgroundColor: '#f8f8f8', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 6, textAlign: 'center', color: '#666' }}>QR</Text>
            <Text style={{ fontSize: 6, textAlign: 'center', color: '#666' }}>CODE</Text>
          </View>
        )}
      </View>
    </View>

    {/* Items Table */}
    <View style={styles.table}>
      {/* Table Header */}
      <View style={styles.tableRow}>
        <Text style={[styles.tableHeader, { width: columnWidths[0] }]}>S/N</Text>
        <Text style={[styles.tableHeader, { width: columnWidths[1] }]}>Description of Goods</Text>
        <Text style={[styles.tableHeader, { width: columnWidths[2] }]}>HSN/SAC</Text>
        <Text style={[styles.tableHeader, { width: columnWidths[3] }]}>Packing</Text>
        <Text style={[styles.tableHeader, { width: columnWidths[4] }]}>Mfg Date</Text>
        <Text style={[styles.tableHeader, { width: columnWidths[5] }]}>Exp Date</Text>
        <Text style={[styles.tableHeader, { width: columnWidths[6] }]}>Qty & Unit</Text>
        <Text style={[styles.tableHeader, { width: columnWidths[7] }]}>Rate</Text>
        <Text style={[styles.tableHeader, { width: columnWidths[8] }]}>Amount</Text>
        <Text style={[styles.tableHeader, { width: columnWidths[9] }]}>GST</Text>
        <Text style={[styles.tableHeader, { width: columnWidths[10] }]}>Total</Text>
      </View>

      {/* Table Rows */}
      {data.items.map((item, index) => (
        <View key={index} style={styles.tableRow}>
          <Text style={[styles.tableCell, { width: columnWidths[0], textAlign: 'center' }]}>{item.sn}</Text>
          <Text style={[styles.tableCell, { width: columnWidths[1] }]}>{item.description}</Text>
          <Text style={[styles.tableCell, { width: columnWidths[2], textAlign: 'center' }]}>{item.hsn}</Text>
          <Text style={[styles.tableCell, { width: columnWidths[3], textAlign: 'center' }]}>{item.packing}</Text>
          <Text style={[styles.tableCell, { width: columnWidths[4], textAlign: 'center' }]}>{item.mfgDate}</Text>
          <Text style={[styles.tableCell, { width: columnWidths[5], textAlign: 'center' }]}>{item.expDate}</Text>
          <Text style={[styles.tableCell, { width: columnWidths[6], textAlign: 'center' }]}>{item.qty}</Text>
          <Text style={[styles.tableCell, { width: columnWidths[7], textAlign: 'right' }]}>₹{item.rate.toFixed(2)}</Text>
          <Text style={[styles.tableCell, { width: columnWidths[8], textAlign: 'right' }]}>₹{item.amount.toFixed(2)}</Text>
          <Text style={[styles.tableCell, { width: columnWidths[9], textAlign: 'right' }]}>₹{item.gst.toFixed(2)}</Text>
          <Text style={[styles.tableCell, { width: columnWidths[10], textAlign: 'right' }]}>₹{item.total.toFixed(2)}</Text>
        </View>
      ))}

      {/* Grand Total Row */}
      <View style={[styles.tableRow, styles.grandTotalRow]}>
        <Text style={[styles.tableCell, { width: columnWidths.slice(0, 10).reduce((a, b) => a + b, 0), textAlign: 'right', fontWeight: 'bold' }]}>Grand Total</Text>
        <Text style={[styles.tableCell, { width: columnWidths[10], textAlign: 'right', fontWeight: 'bold' }]}>₹{data.grandTotal.toFixed(2)}</Text>
      </View>
    </View>

    {/* Amount in Words */}
    <Text style={styles.amountInWords}>Total Invoice Value (in words): {data.totalInWords}</Text>

    {/* Footer Section */}
    <View style={styles.footerSection}>
      <View style={styles.termsSection}>
        <Text style={styles.termsHeader}>Terms & Conditions:</Text>
        <Text style={styles.terms}>• Goods once sold will not be taken back.</Text>
        <Text style={styles.terms}>• This invoice is not payable under reverse charge.</Text>
        <Text style={styles.terms}>• Check batch number & expiry date before use.</Text>
      </View>
      <View style={styles.totalsSection}>
        <Text style={styles.totalBreakdown}>Taxable Amount: ₹{data.subtotal.toFixed(2)}</Text>
        <Text style={styles.totalBreakdown}>CGST @ 9%: ₹{data.cgst.toFixed(2)}</Text>
        <Text style={styles.totalBreakdown}>SGST @ 9%: ₹{data.sgst.toFixed(2)}</Text>
        <Text style={styles.finalTotal}>Total Amount (Incl. GST): ₹{data.grandTotal.toFixed(2)}</Text>
      </View>
    </View>
  </View>
);

// Main Invoice Document Component
const InvoiceDocument: React.FC<{ data: InvoicePDFData; layout: 'portrait' | 'landscape' }> = ({ data, layout }) => (
  <Document>
    <Page size="A4" orientation={layout} style={styles.page}>
      {layout === 'landscape' ? (
        // Side-by-side layout for landscape
        <View style={{ flexDirection: 'row' }}>
          <View style={{ width: '50%', paddingRight: 5 }}>
            <InvoiceCopy data={data} copyType="OFFICE COPY" />
          </View>
          <View style={{ width: '50%', paddingLeft: 5 }}>
            <InvoiceCopy data={data} copyType="CUSTOMER COPY" />
          </View>
        </View>
      ) : (
        // Stacked layout for portrait - both copies on same page
        <View>
          <InvoiceCopy data={data} copyType="CUSTOMER COPY" />
          <View style={{ marginTop: 15, borderTop: '2 solid #ccc', paddingTop: 10 }}>
            <InvoiceCopy data={data} copyType="OFFICE COPY" />
          </View>
        </View>
      )}
    </Page>
  </Document>
);

// Number to words conversion (Indian format)
export const numberToWords = (num: number): string => {
  if (num === 0) return 'Zero Rupees Only';
  
  const inWords = (n: number): string => {
    if (n === 0) return '';
    if (n < 20) return ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'][n];
    if (n < 100) return ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'][Math.floor(n/10)] + (n % 10 ? ' ' + inWords(n % 10) : '');
    if (n < 1000) return inWords(Math.floor(n/100)) + ' Hundred' + (n % 100 ? ' ' + inWords(n % 100) : '');
    if (n < 100000) return inWords(Math.floor(n/1000)) + ' Thousand' + (n % 1000 ? ' ' + inWords(n % 1000) : '');
    if (n < 10000000) return inWords(Math.floor(n/100000)) + ' Lakh' + (n % 100000 ? ' ' + inWords(n % 100000) : '');
    return inWords(Math.floor(n/10000000)) + ' Crore' + (n % 10000000 ? ' ' + inWords(n % 10000000) : '');
  };
  
  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);
  let words = rupees === 0 ? 'Zero' : inWords(rupees);
  words += ' Rupees';
  if (paise > 0) words += ' and ' + inWords(paise) + ' Paise';
  return words + ' Only';
};

// Generate PDF functions
export const generateInvoicePDF = async (data: InvoicePDFData, layout: 'portrait' | 'landscape' = 'portrait') => {
  // Generate QR code if not provided
  const invoiceWithQR = { ...data };
  if (!invoiceWithQR.qrCodeData) {
    const qrText = `INVOICE DETAILS\n` +
      `----------------\n` +
      `Invoice No: ${data.invoiceNo}\n` +
      `Date: ${data.date}\n` +
      `\n` +
      `MERCHANT\n` +
      `----------------\n` +
      `${data.merchantName}\n` +
      `${data.merchantAddress}\n` +
      `GST: ${data.merchantGST}\n` +
      `\n` +
      `CUSTOMER\n` +
      `----------------\n` +
      `Name: ${data.customerName}\n` +
      `GST: ${data.customerGST || 'N/A'}\n` +
      `Phone: ${data.customerPhone || 'N/A'}\n` +
      `\n` +
      `AMOUNT\n` +
      `----------------\n` +
      `Subtotal: ₹${data.subtotal.toFixed(2)}\n` +
      `CGST (${(data.cgst / data.subtotal * 100).toFixed(2)}%): ₹${data.cgst.toFixed(2)}\n` +
      `SGST (${(data.sgst / data.subtotal * 100).toFixed(2)}%): ₹${data.sgst.toFixed(2)}\n` +
      `Total: ₹${data.grandTotal.toFixed(2)}\n` +
      `\n` +
      `Payment: ${data.paymentMethod}\n` +
      `Status: ${data.salesType}`;
      
    invoiceWithQR.qrCodeData = await generateQRCode(qrText);
  }
  
  return pdf(<InvoiceDocument data={invoiceWithQR} layout={layout} />).toBlob();
};

export const downloadInvoicePDF = async (data: InvoicePDFData, filename: string, layout: 'portrait' | 'landscape' = 'portrait') => {
  const blob = await generateInvoicePDF(data, layout);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const previewInvoicePDF = async (data: InvoicePDFData, layout: 'portrait' | 'landscape' = 'portrait') => {
  const blob = await generateInvoicePDF(data, layout);
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  // Don't revoke the URL immediately to allow the print dialog to work
  setTimeout(() => URL.revokeObjectURL(url), 10000);
};
