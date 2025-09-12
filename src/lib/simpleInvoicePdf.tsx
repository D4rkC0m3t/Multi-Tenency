// Simple Invoice PDF Generator - Clean and Readable Format
// Fixes overlapping text and formatting issues

import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";

export type SimpleInvoiceItem = {
  sr: number;
  name: string;
  hsn: string;
  qty: number;
  unit: string;
  rate: number;
  amount: number;
  gst: number;
};

export type SimpleInvoiceData = {
  // Invoice header
  invoiceNo: string;
  invoiceDate: string;
  
  // Company details
  company: {
    name: string;
    address: string;
    gstin: string;
    mobile?: string;
    email?: string;
  };
  
  // Customer details
  customer: {
    name: string;
    address: string;
    gstin?: string;
    mobile?: string;
  };
  
  // Items
  items: SimpleInvoiceItem[];
  
  // Totals
  subtotal: number;
  taxAmount: number;
  total: number;
  amountInWords: string;
};

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 10,
    fontFamily: 'Helvetica',
    lineHeight: 1.4
  },
  
  // Header
  header: {
    textAlign: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#000'
  },
  
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5
  },
  
  subtitle: {
    fontSize: 12,
    marginBottom: 3
  },
  
  // Invoice info
  invoiceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f5f5f5'
  },
  
  // Party details
  partySection: {
    flexDirection: 'row',
    marginBottom: 20
  },
  
  partyBox: {
    flex: 1,
    padding: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#000'
  },
  
  partyTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
    textDecoration: 'underline'
  },
  
  // Table
  table: {
    marginBottom: 20
  },
  
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e0e0e0',
    borderWidth: 1,
    borderColor: '#000',
    fontWeight: 'bold',
    fontSize: 9
  },
  
  tableRow: {
    flexDirection: 'row',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#000',
    minHeight: 25,
    alignItems: 'center'
  },
  
  // Column styles
  col1: { width: '8%', padding: 3, textAlign: 'center' },
  col2: { width: '35%', padding: 3 },
  col3: { width: '10%', padding: 3, textAlign: 'center' },
  col4: { width: '8%', padding: 3, textAlign: 'center' },
  col5: { width: '10%', padding: 3, textAlign: 'right' },
  col6: { width: '12%', padding: 3, textAlign: 'right' },
  col7: { width: '8%', padding: 3, textAlign: 'center' },
  col8: { width: '9%', padding: 3, textAlign: 'right' },
  
  // Totals section
  totalsSection: {
    flexDirection: 'row',
    marginBottom: 20
  },
  
  amountWords: {
    flex: 2,
    padding: 10,
    marginRight: 10
  },
  
  totalsBox: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#000'
  },
  
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3
  },
  
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#000',
    fontWeight: 'bold',
    fontSize: 12
  },
  
  // Footer
  footer: {
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: '#000',
    paddingTop: 15
  },
  
  signatures: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40
  },
  
  // Utility
  bold: { fontWeight: 'bold' },
  center: { textAlign: 'center' },
  right: { textAlign: 'right' }
});

export function SimpleInvoiceDocument({ data }: { data: SimpleInvoiceData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{data.company.name}</Text>
          <Text style={styles.subtitle}>TAX INVOICE</Text>
          <Text>{data.company.address}</Text>
          <Text>GSTIN: {data.company.gstin}</Text>
          {data.company.mobile && <Text>Mobile: {data.company.mobile}</Text>}
          {data.company.email && <Text>Email: {data.company.email}</Text>}
        </View>

        {/* Invoice Info */}
        <View style={styles.invoiceInfo}>
          <View>
            <Text style={styles.bold}>Invoice No: {data.invoiceNo}</Text>
            <Text>Invoice Date: {data.invoiceDate}</Text>
          </View>
          <View>
            <Text>Place of Supply: As per customer address</Text>
            <Text>Reverse Charge: No</Text>
          </View>
        </View>

        {/* Party Details */}
        <View style={styles.partySection}>
          <View style={styles.partyBox}>
            <Text style={styles.partyTitle}>BILL TO</Text>
            <Text style={styles.bold}>{data.customer.name}</Text>
            <Text>{data.customer.address}</Text>
            <Text>GSTIN: {data.customer.gstin || 'Unregistered'}</Text>
            {data.customer.mobile && <Text>Mobile: {data.customer.mobile}</Text>}
          </View>
          
          <View style={styles.partyBox}>
            <Text style={styles.partyTitle}>SHIP TO</Text>
            <Text style={styles.bold}>{data.customer.name}</Text>
            <Text>{data.customer.address}</Text>
            <Text>GSTIN: {data.customer.gstin || 'Unregistered'}</Text>
            {data.customer.mobile && <Text>Mobile: {data.customer.mobile}</Text>}
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          {/* Header */}
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Sr.</Text>
            <Text style={styles.col2}>Item Description</Text>
            <Text style={styles.col3}>HSN Code</Text>
            <Text style={styles.col4}>Qty</Text>
            <Text style={styles.col5}>Rate</Text>
            <Text style={styles.col6}>Amount</Text>
            <Text style={styles.col7}>GST%</Text>
            <Text style={styles.col8}>Tax Amt</Text>
          </View>
          
          {/* Rows */}
          {data.items.map((item) => {
            const taxAmount = (item.amount * item.gst) / 100;
            return (
              <View style={styles.tableRow} key={item.sr}>
                <Text style={styles.col1}>{item.sr}</Text>
                <Text style={styles.col2}>{item.name}</Text>
                <Text style={styles.col3}>{item.hsn}</Text>
                <Text style={styles.col4}>{item.qty} {item.unit}</Text>
                <Text style={styles.col5}>₹{item.rate.toFixed(2)}</Text>
                <Text style={styles.col6}>₹{item.amount.toFixed(2)}</Text>
                <Text style={styles.col7}>{item.gst}%</Text>
                <Text style={styles.col8}>₹{taxAmount.toFixed(2)}</Text>
              </View>
            );
          })}
        </View>

        {/* Totals Section */}
        <View style={styles.totalsSection}>
          <View style={styles.amountWords}>
            <Text style={styles.bold}>Amount in Words:</Text>
            <Text>{data.amountInWords}</Text>
            
            <View style={{ marginTop: 15 }}>
              <Text style={styles.bold}>Terms & Conditions:</Text>
              <Text>• Goods once sold will not be taken back</Text>
              <Text>• Payment due within 30 days</Text>
              <Text>• Subject to local jurisdiction</Text>
            </View>
          </View>
          
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text>Subtotal:</Text>
              <Text>₹{data.subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text>Tax Amount:</Text>
              <Text>₹{data.taxAmount.toFixed(2)}</Text>
            </View>
            <View style={styles.grandTotal}>
              <Text>TOTAL:</Text>
              <Text>₹{data.total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.center}>
            This is a computer generated invoice and does not require physical signature
          </Text>
          
          <View style={styles.signatures}>
            <View>
              <Text>Customer Signature</Text>
            </View>
            <View style={styles.right}>
              <Text style={styles.bold}>For {data.company.name}</Text>
              <Text style={{ marginTop: 30 }}>Authorized Signatory</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}

// Single Invoice PDF
export function SimpleInvoicePDF({ data }: { data: SimpleInvoiceData }) {
  const fileName = `invoice_${data.invoiceNo.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  
  return (
    <PDFDownloadLink document={<SimpleInvoiceDocument data={data} />} fileName={fileName}>
      {({ loading }) => (
        <button
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Generating PDF...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Invoice
            </>
          )}
        </button>
      )}
    </PDFDownloadLink>
  );
}

// Dual Copy PDF - Two separate pages
export function DualSimpleInvoicePDF({ data }: { data: SimpleInvoiceData }) {
  const fileName = `invoice_dual_${data.invoiceNo.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  
  const DualDocument = (
    <Document>
      <Page size="A4" style={styles.page}>
        <SimpleInvoiceDocument data={data} />
      </Page>
      <Page size="A4" style={styles.page}>
        <SimpleInvoiceDocument data={data} />
      </Page>
    </Document>
  );

  return (
    <PDFDownloadLink document={DualDocument} fileName={fileName}>
      {({ loading }) => (
        <button
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Generating Dual PDF...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Dual Copy (2 Pages)
            </>
          )}
        </button>
      )}
    </PDFDownloadLink>
  );
}

export default SimpleInvoicePDF;
