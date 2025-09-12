// Enhanced Invoice PDF Generator with E-Invoice Support
// Includes IRN, signed QR code, and full GST compliance

import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  PDFDownloadLink,
  Image,
} from "@react-pdf/renderer";

export type EInvoiceItem = {
  sr: number;
  name: string;
  description?: string;
  lotBatch?: string;
  hsn: string;
  gst: number;
  mfd?: string;
  expiry?: string;
  qty: string;
  unit?: string;
  inclRate?: number;
  rate: number;
  amount: number;
  manufacturer?: string;
  packingDetails?: string;
};

export type EInvoiceData = {
  // E-Invoice specific fields
  irn?: string;
  ackNo?: string;
  ackDate?: string;
  signedQRCode?: string; // Base64 encoded QR from IRP
  einvoiceStatus: 'not_applicable' | 'pending' | 'generated' | 'cancelled' | 'error';
  
  // Invoice header
  title: string;
  invoiceNo: string;
  invoiceDate: string;
  
  // Company details
  company: {
    name: string;
    businessName?: string;
    addressLines: string[];
    gstin: string;
    state: string;
    stateCode?: string;
    mobile?: string;
    email?: string;
    website?: string;
    // Licenses for FCO compliance
    fertilizerLicense?: string;
    seedLicense?: string;
    pesticideLicense?: string;
    panNumber?: string;
  };
  
  // Customer details
  buyer: {
    name: string;
    addressLines: string[];
    gstin?: string;
    state?: string;
    stateCode?: string;
    mobile?: string;
    email?: string;
    village?: string;
    district?: string;
  };
  
  // Transport details
  eWayBillNo?: string;
  eWayBillDate?: string;
  despatchThrough?: string;
  destination?: string;
  vehicleNo?: string;
  
  // Items
  items: EInvoiceItem[];
  
  // Amounts
  taxableValue: number;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  cessAmount?: number;
  totalTaxAmount: number;
  invoiceTotal: number;
  amountInWords: string;
  roundOffAmount?: number;
  
  // Payment details
  paymentMethod?: string;
  paidAmount?: number;
  outstandingPrev?: number;
  
  // Bank details
  bankDetails?: {
    bankName: string;
    accountNumber: string; // Masked
    ifscCode: string;
    upiId?: string;
  };
  
  // Additional info
  jurisdiction?: string;
  placeOfSupply?: string;
  reverseCharge?: boolean;
  
  // Terms and conditions
  terms?: string[];
};

const styles = StyleSheet.create({
  page: { 
    padding: 15, 
    fontSize: 8,
    fontFamily: 'Helvetica',
    lineHeight: 1.2
  },
  
  // Header styles
  header: { 
    flexDirection: "row", 
    justifyContent: "space-between",
    marginBottom: 10,
    borderBottom: 1,
    paddingBottom: 8
  },
  companyInfo: {
    flex: 2,
    paddingRight: 10
  },
  einvoiceInfo: {
    flex: 1,
    alignItems: 'flex-end'
  },
  
  // Title styles
  mainTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
    textTransform: 'uppercase'
  },
  subTitle: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 3
  },
  
  // Section styles
  section: { 
    marginVertical: 3,
    padding: 3
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 2,
    textDecoration: 'underline'
  },
  
  // Invoice details
  invoiceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
    padding: 5,
    backgroundColor: '#f5f5f5'
  },
  
  // Party details
  partySection: {
    flexDirection: 'row',
    marginVertical: 5
  },
  sellerDetails: {
    flex: 1,
    paddingRight: 5,
    borderRight: 1
  },
  buyerDetails: {
    flex: 1,
    paddingLeft: 5
  },
  
  // Table styles
  table: { 
    display: "table", 
    width: "auto", 
    borderStyle: "solid", 
    borderWidth: 1,
    borderColor: '#000',
    marginVertical: 5
  },
  tableHeader: {
    backgroundColor: '#e0e0e0',
    fontWeight: 'bold'
  },
  tableRow: { 
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    minHeight: 20,
    alignItems: 'center'
  },
  tableCol: { 
    borderStyle: "solid", 
    borderRightWidth: 1,
    borderRightColor: '#000',
    padding: 2,
    fontSize: 7,
    textAlign: 'center'
  },
  tableColLeft: {
    textAlign: 'left'
  },
  tableColRight: {
    textAlign: 'right'
  },
  
  // Amount section
  amountSection: {
    flexDirection: 'row',
    marginVertical: 5
  },
  amountDetails: {
    flex: 2,
    paddingRight: 10
  },
  totalSection: {
    flex: 1,
    borderWidth: 1,
    padding: 5
  },
  
  // Footer styles
  footer: {
    marginTop: 10,
    borderTop: 1,
    paddingTop: 5
  },
  termsSection: {
    marginVertical: 5
  },
  signatureSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    paddingTop: 10
  },
  
  // Utility styles
  bold: { 
    fontWeight: "bold" 
  },
  center: {
    textAlign: 'center'
  },
  right: {
    textAlign: 'right'
  },
  small: {
    fontSize: 6
  },
  qrCode: {
    width: 80,
    height: 80,
    marginBottom: 5
  },
  
  // E-Invoice specific styles
  einvoiceHeader: {
    backgroundColor: '#e3f2fd',
    padding: 5,
    marginBottom: 5,
    borderRadius: 3
  },
  irnText: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#1976d2'
  },
  
  // Compliance styles
  complianceSection: {
    backgroundColor: '#fff3e0',
    padding: 5,
    marginVertical: 5,
    borderRadius: 3
  }
});

// Column widths for the items table
const colWidths = {
  sr: '4%',
  item: '25%',
  hsn: '8%',
  batch: '10%',
  mfg: '6%',
  exp: '6%',
  qty: '6%',
  rate: '8%',
  amount: '10%',
  gst: '5%',
  tax: '12%'
};

export function EInvoiceDocument({ data }: { data: EInvoiceData }) {
  // Helper function to render QR code
  const renderQRCode = () => {
    if (data.signedQRCode && data.einvoiceStatus === 'generated') {
      try {
        // Convert base64 to data URI for PDF rendering
        const qrDataUri = `data:image/png;base64,${data.signedQRCode}`;
        return <Image style={styles.qrCode} src={qrDataUri} />;
      } catch (error) {
        return <Text style={styles.small}>QR Code Error</Text>;
      }
    }
    return <Text style={styles.small}>No QR Code</Text>;
  };

  // Calculate tax breakdown
  const taxBreakdown = () => {
    const breakdown = [];
    if (data.cgstAmount && data.cgstAmount > 0) {
      breakdown.push(`CGST: ₹${data.cgstAmount.toFixed(2)}`);
    }
    if (data.sgstAmount && data.sgstAmount > 0) {
      breakdown.push(`SGST: ₹${data.sgstAmount.toFixed(2)}`);
    }
    if (data.igstAmount && data.igstAmount > 0) {
      breakdown.push(`IGST: ₹${data.igstAmount.toFixed(2)}`);
    }
    if (data.cessAmount && data.cessAmount > 0) {
      breakdown.push(`Cess: ₹${data.cessAmount.toFixed(2)}`);
    }
    return breakdown;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* E-Invoice Header (if applicable) */}
        {data.einvoiceStatus === 'generated' && data.irn && (
          <View style={styles.einvoiceHeader}>
            <Text style={styles.irnText}>E-INVOICE</Text>
            <Text style={styles.small}>IRN: {data.irn}</Text>
            <Text style={styles.small}>Ack No: {data.ackNo} | Ack Date: {data.ackDate}</Text>
          </View>
        )}

        {/* Main Header */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <Text style={styles.mainTitle}>{data.company.name}</Text>
            {data.company.businessName && (
              <Text style={styles.subTitle}>({data.company.businessName})</Text>
            )}
            {data.company.addressLines.map((line, i) => (
              <Text key={i} style={styles.small}>{line}</Text>
            ))}
            <Text style={styles.small}>GSTIN: {data.company.gstin}</Text>
            <Text style={styles.small}>State: {data.company.state} ({data.company.stateCode})</Text>
            {data.company.mobile && <Text style={styles.small}>Mobile: {data.company.mobile}</Text>}
            {data.company.email && <Text style={styles.small}>Email: {data.company.email}</Text>}
            
            {/* FCO Compliance - License Numbers */}
            {data.company.fertilizerLicense && (
              <Text style={styles.small}>Fertilizer License: {data.company.fertilizerLicense}</Text>
            )}
            {data.company.seedLicense && (
              <Text style={styles.small}>Seed License: {data.company.seedLicense}</Text>
            )}
            {data.company.pesticideLicense && (
              <Text style={styles.small}>Pesticide License: {data.company.pesticideLicense}</Text>
            )}
          </View>
          
          <View style={styles.einvoiceInfo}>
            {renderQRCode()}
            <Text style={styles.small}>Scan for E-Invoice Verification</Text>
          </View>
        </View>

        {/* Invoice Details */}
        <View style={styles.invoiceDetails}>
          <View>
            <Text style={styles.bold}>Invoice No: {data.invoiceNo}</Text>
            <Text>Date: {data.invoiceDate}</Text>
            {data.eWayBillNo && <Text>E-Way Bill: {data.eWayBillNo}</Text>}
            {data.vehicleNo && <Text>Vehicle: {data.vehicleNo}</Text>}
          </View>
          <View>
            <Text>Place of Supply: {data.placeOfSupply || data.buyer.state}</Text>
            <Text>Reverse Charge: {data.reverseCharge ? 'Yes' : 'No'}</Text>
            {data.paymentMethod && <Text>Payment: {data.paymentMethod.toUpperCase()}</Text>}
          </View>
        </View>

        {/* Party Details */}
        <View style={styles.partySection}>
          <View style={styles.sellerDetails}>
            <Text style={styles.sectionTitle}>SELLER DETAILS</Text>
            <Text style={styles.bold}>{data.company.name}</Text>
            {data.company.addressLines.map((line, i) => (
              <Text key={i}>{line}</Text>
            ))}
            <Text>GSTIN: {data.company.gstin}</Text>
            <Text>State: {data.company.state}</Text>
            {data.company.panNumber && <Text>PAN: {data.company.panNumber}</Text>}
          </View>
          
          <View style={styles.buyerDetails}>
            <Text style={styles.sectionTitle}>BUYER DETAILS</Text>
            <Text style={styles.bold}>{data.buyer.name}</Text>
            {data.buyer.addressLines.map((line, i) => (
              <Text key={i}>{line}</Text>
            ))}
            {data.buyer.village && <Text>Village: {data.buyer.village}</Text>}
            {data.buyer.district && <Text>District: {data.buyer.district}</Text>}
            <Text>GSTIN: {data.buyer.gstin || 'Unregistered'}</Text>
            <Text>State: {data.buyer.state} ({data.buyer.stateCode})</Text>
            {data.buyer.mobile && <Text>Mobile: {data.buyer.mobile}</Text>}
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCol, { width: colWidths.sr }]}>Sr</Text>
            <Text style={[styles.tableCol, styles.tableColLeft, { width: colWidths.item }]}>Item Description</Text>
            <Text style={[styles.tableCol, { width: colWidths.hsn }]}>HSN</Text>
            <Text style={[styles.tableCol, { width: colWidths.batch }]}>Batch/Lot</Text>
            <Text style={[styles.tableCol, { width: colWidths.mfg }]}>Mfg</Text>
            <Text style={[styles.tableCol, { width: colWidths.exp }]}>Exp</Text>
            <Text style={[styles.tableCol, { width: colWidths.qty }]}>Qty</Text>
            <Text style={[styles.tableCol, { width: colWidths.rate }]}>Rate</Text>
            <Text style={[styles.tableCol, { width: colWidths.amount }]}>Amount</Text>
            <Text style={[styles.tableCol, { width: colWidths.gst }]}>GST%</Text>
            <Text style={[styles.tableCol, { width: colWidths.tax }]}>Tax Amount</Text>
          </View>
          
          {/* Table Rows */}
          {data.items.map((item) => {
            const taxAmount = (item.amount * item.gst) / (100 + item.gst);
            return (
              <View style={styles.tableRow} key={item.sr}>
                <Text style={[styles.tableCol, { width: colWidths.sr }]}>{item.sr}</Text>
                <View style={[styles.tableCol, styles.tableColLeft, { width: colWidths.item }]}>
                  <Text style={styles.bold}>{item.name}</Text>
                  {item.manufacturer && <Text style={styles.small}>Mfr: {item.manufacturer}</Text>}
                  {item.packingDetails && <Text style={styles.small}>{item.packingDetails}</Text>}
                </View>
                <Text style={[styles.tableCol, { width: colWidths.hsn }]}>{item.hsn}</Text>
                <Text style={[styles.tableCol, { width: colWidths.batch }]}>{item.lotBatch || '-'}</Text>
                <Text style={[styles.tableCol, { width: colWidths.mfg }]}>{item.mfd || '-'}</Text>
                <Text style={[styles.tableCol, { width: colWidths.exp }]}>{item.expiry || '-'}</Text>
                <Text style={[styles.tableCol, { width: colWidths.qty }]}>{item.qty} {item.unit || ''}</Text>
                <Text style={[styles.tableCol, styles.tableColRight, { width: colWidths.rate }]}>₹{item.rate.toFixed(2)}</Text>
                <Text style={[styles.tableCol, styles.tableColRight, { width: colWidths.amount }]}>₹{item.amount.toFixed(2)}</Text>
                <Text style={[styles.tableCol, { width: colWidths.gst }]}>{item.gst}%</Text>
                <Text style={[styles.tableCol, styles.tableColRight, { width: colWidths.tax }]}>₹{taxAmount.toFixed(2)}</Text>
              </View>
            );
          })}
        </View>

        {/* Amount Section */}
        <View style={styles.amountSection}>
          <View style={styles.amountDetails}>
            <Text style={styles.bold}>Amount in Words:</Text>
            <Text>{data.amountInWords}</Text>
            
            {/* Tax Breakdown */}
            <View style={{ marginTop: 10 }}>
              <Text style={styles.bold}>Tax Breakdown:</Text>
              {taxBreakdown().map((tax, i) => (
                <Text key={i}>{tax}</Text>
              ))}
            </View>
            
            {/* Bank Details */}
            {data.bankDetails && (
              <View style={{ marginTop: 10 }}>
                <Text style={styles.bold}>Bank Details:</Text>
                <Text>Bank: {data.bankDetails.bankName}</Text>
                <Text>A/c: {data.bankDetails.accountNumber}</Text>
                <Text>IFSC: {data.bankDetails.ifscCode}</Text>
                {data.bankDetails.upiId && <Text>UPI: {data.bankDetails.upiId}</Text>}
              </View>
            )}
          </View>
          
          <View style={styles.totalSection}>
            <Text>Taxable Value: ₹{data.taxableValue.toFixed(2)}</Text>
            {data.cgstAmount && data.cgstAmount > 0 && (
              <Text>CGST: ₹{data.cgstAmount.toFixed(2)}</Text>
            )}
            {data.sgstAmount && data.sgstAmount > 0 && (
              <Text>SGST: ₹{data.sgstAmount.toFixed(2)}</Text>
            )}
            {data.igstAmount && data.igstAmount > 0 && (
              <Text>IGST: ₹{data.igstAmount.toFixed(2)}</Text>
            )}
            {data.cessAmount && data.cessAmount > 0 && (
              <Text>Cess: ₹{data.cessAmount.toFixed(2)}</Text>
            )}
            {data.roundOffAmount && (
              <Text>Round Off: ₹{data.roundOffAmount.toFixed(2)}</Text>
            )}
            <Text style={styles.bold}>Total: ₹{data.invoiceTotal.toFixed(2)}</Text>
            
            {/* Outstanding Amount */}
            {data.outstandingPrev && data.outstandingPrev > 0 && (
              <>
                <Text>Previous Outstanding: ₹{data.outstandingPrev.toFixed(2)}</Text>
                <Text style={styles.bold}>
                  Total Outstanding: ₹{(data.outstandingPrev + data.invoiceTotal - (data.paidAmount || 0)).toFixed(2)}
                </Text>
              </>
            )}
          </View>
        </View>

        {/* FCO Compliance Section */}
        <View style={styles.complianceSection}>
          <Text style={styles.bold}>FERTILIZER CONTROL ORDER 1985 & SEED ACT COMPLIANCE:</Text>
          <Text style={styles.small}>
            • All fertilizers sold are as per FCO 1985 specifications and carry valid batch numbers and expiry dates.
          </Text>
          <Text style={styles.small}>
            • Seeds sold are certified/truthfully labeled as per Seed Act provisions.
          </Text>
          <Text style={styles.small}>
            • Buyer is advised to check batch numbers, manufacturing dates, and expiry dates before use.
          </Text>
          <Text style={styles.small}>
            • This invoice is computer generated and does not require physical signature.
          </Text>
        </View>

        {/* Terms and Conditions */}
        {data.terms && data.terms.length > 0 && (
          <View style={styles.termsSection}>
            <Text style={styles.sectionTitle}>Terms & Conditions:</Text>
            {data.terms.map((term, i) => (
              <Text key={i} style={styles.small}>• {term}</Text>
            ))}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.signatureSection}>
            <View>
              <Text>Customer Signature & Seal</Text>
              <Text style={styles.small}>(Goods received in good condition)</Text>
            </View>
            <View style={styles.right}>
              <Text style={styles.bold}>For {data.company.name}</Text>
              <Text style={{ marginTop: 20 }}>Authorized Signatory</Text>
            </View>
          </View>
          
          {/* E-Invoice Footer */}
          {data.einvoiceStatus === 'generated' && (
            <View style={[styles.center, { marginTop: 10 }]}>
              <Text style={styles.small}>
                This is a system generated E-Invoice as per GST rules. 
                IRN and QR code validate the authenticity of this invoice.
              </Text>
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
}

// Enhanced PDF Download Component
export default function EInvoicePDF({ data }: { data: EInvoiceData }) {
  const fileName = `${data.einvoiceStatus === 'generated' ? 'einvoice' : 'invoice'}_${data.invoiceNo.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  
  return (
    <PDFDownloadLink
      document={<EInvoiceDocument data={data} />}
      fileName={fileName}
    >
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
              Download {data.einvoiceStatus === 'generated' ? 'E-Invoice' : 'Invoice'}
            </>
          )}
        </button>
      )}
    </PDFDownloadLink>
  );
}
