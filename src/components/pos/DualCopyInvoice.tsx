import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';

// Register fonts for better rendering
Font.register({
  family: 'Roboto',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf'
});

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Roboto',
    fontSize: 10,
    padding: 0,
    margin: 0,
  },
  section: {
    height: '50%',
    padding: '10px 15px',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 8,
  },
  companyInfo: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  logoContainer: {
    marginRight: 10,
  },
  logo: {
    width: 40,
    height: 40,
  },
  companyDetailsContainer: {
    flex: 1,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  companyDetails: {
    fontSize: 9,
    lineHeight: 1.3,
  },
  invoiceInfo: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  invoiceDetails: {
    flex: 1,
    textAlign: 'right',
  },
  qrContainer: {
    marginLeft: 10,
    alignItems: 'center',
  },
  qrCode: {
    width: 60,
    height: 60,
  },
  invoiceText: {
    fontSize: 9,
    lineHeight: 1.3,
  },
  table: {
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    borderBottomStyle: 'solid',
    minHeight: 20,
  },
  tableHeader: {
    backgroundColor: '#f5f5f5',
    fontWeight: 'bold',
    fontSize: 8,
  },
  tableCell: {
    flex: 1,
    padding: 3,
    fontSize: 8,
    textAlign: 'center',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
    borderRightStyle: 'solid',
  },
  tableCellLast: {
    borderRightWidth: 0,
  },
  gstSummary: {
    marginTop: 8,
  },
  gstSummaryTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  footer: {
    marginTop: 'auto',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 8,
    fontSize: 8,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  footerText: {
    fontSize: 9,
    lineHeight: 1.2,
  },
  copyLabel: {
    textAlign: 'center',
    fontSize: 8,
    fontWeight: 'bold',
    marginTop: 4,
    marginBottom: 2,
    padding: 2,
    backgroundColor: '#f5f5f5',
    borderRadius: 2,
  },
  totalSection: {
    marginTop: 8,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    alignItems: 'flex-end',
  },
  totalText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 0,
  },
  totalRow: {
    backgroundColor: '#f9f9f9',
    fontWeight: 'bold',
  },
});

interface InvoiceItem {
  sno: number;
  description: string;
  hsn: string;
  batch: string;
  expiry: string;
  qty: number;
  unit: string;
  rate: number;
  amount: number;
  taxable: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
}

interface DualCopyInvoiceProps {
  companyName: string;
  companyAddress: string;
  companyGSTIN: string;
  companyLogo?: string;
  companyPhone?: string;
  companyEmail?: string;
  // License Information
  fertilizerLicense?: string;
  seedLicense?: string;
  pesticideLicense?: string;
  dealerRegistration?: string;
  invoiceNumber: string;
  invoiceDate: string;
  invoiceTitle?: string;
  customerName: string;
  customerAddress: string;
  customerPhone?: string;
  customerGSTIN?: string;
  customerVillage?: string;
  customerDistrict?: string;
  customerState?: string;
  customerPincode?: string;
  customerType?: string;
  items: InvoiceItem[];
  totalAmount: number;
  amountInWords: string;
  paymentMethod: string;
  qrCodeData?: string;
}

const InvoiceSection: React.FC<{ 
  data: DualCopyInvoiceProps; 
  copyType: 'CUSTOMER COPY' | 'OFFICE COPY' 
}> = ({ data, copyType }) => {
  // Destructure only what we need
  const { companyLogo } = data;

  return (
    <View style={styles.section}>
      {/* Copy Label at Top */}
      <Text style={styles.copyLabel}>{copyType}</Text>
      
      {/* Invoice Title */}
      {data.invoiceTitle && (
        <Text style={[styles.companyName, { textAlign: 'center', marginBottom: 5, color: '#d97706' }]}>
          {data.invoiceTitle}
        </Text>
      )}
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.companyInfo}>
          {companyLogo && (
            <View style={styles.logoContainer}>
              <Image src={companyLogo} style={styles.logo} />
            </View>
          )}
          <View style={styles.companyDetailsContainer}>
            <Text style={styles.companyName}>{data.companyName}</Text>
            <Text style={styles.invoiceText}>{data.companyAddress}</Text>
            <Text style={styles.invoiceText}>GSTIN: {data.companyGSTIN}</Text>
            {data.companyPhone && (
              <Text style={styles.invoiceText}>Phone: {data.companyPhone}</Text>
            )}
            {data.companyEmail && (
              <Text style={styles.invoiceText}>Email: {data.companyEmail}</Text>
            )}
            {/* License Information - HORIZONTAL FORMAT APPLIED */}
            {(data.fertilizerLicense || data.seedLicense || data.pesticideLicense || data.dealerRegistration) && (
              <Text style={[styles.invoiceText, { marginTop: 2, backgroundColor: '#f0f0f0', padding: 1 }]}>
                Licenses: {[
                  data.fertilizerLicense && `Fertilizer: ${data.fertilizerLicense}`,
                  data.seedLicense && `Seed: ${data.seedLicense}`,
                  data.pesticideLicense && `Pesticide: ${data.pesticideLicense}`,
                  data.dealerRegistration && `Dealer: ${data.dealerRegistration}`
                ].filter(Boolean).join(' | ')}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.invoiceInfo}>
          <View style={styles.invoiceDetails}>
            <Text style={styles.invoiceText}>Invoice No: {data.invoiceNumber}</Text>
            <Text style={styles.invoiceText}>Date: {data.invoiceDate}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
              <View style={{ marginRight: 10 }}>
                <Text style={styles.invoiceText}>Payment: {data.paymentMethod}</Text>
                {data.qrCodeData && (
                  <Text style={[styles.invoiceText, { fontSize: 7, marginTop: 2 }]}>Scan to Pay</Text>
                )}
              </View>
              {data.qrCodeData && (
                <Image 
                  style={{ width: 50, height: 50 }} 
                  src={data.qrCodeData}
                />
              )}
            </View>
          </View>
        </View>
      </View>
      
      {/* Customer Details Section */}
      <View style={{ marginBottom: 8, padding: 8, backgroundColor: '#f9f9f9', borderRadius: 4 }}>
        <Text style={[styles.invoiceText, { fontWeight: 'bold', marginBottom: 4 }]}>Bill To:</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
          <Text style={[styles.invoiceText, { fontWeight: 'bold', marginRight: 8 }]}>{data.customerName}</Text>
          {data.customerType && (
            <Text style={[styles.invoiceText, { backgroundColor: '#e5e7eb', padding: 2, borderRadius: 2, fontSize: 7, fontWeight: 'bold', textTransform: 'uppercase' }]}>
              {data.customerType}
            </Text>
          )}
        </View>
        {/* All Customer Details - Single Horizontal Line */}
        <Text style={styles.invoiceText}>
          {[
            data.customerAddress,
            data.customerVillage && `Village: ${data.customerVillage}`,
            data.customerPhone && `Phone: ${data.customerPhone}`,
            data.customerPincode && `PIN: ${data.customerPincode}`,
            data.customerDistrict && data.customerState && `${data.customerDistrict}, ${data.customerState}`
          ].filter(Boolean).join(' • ')}
        </Text>
        
        {/* GSTIN on separate line if available */}
        {data.customerGSTIN && (
          <Text style={styles.invoiceText}>GSTIN: {data.customerGSTIN}</Text>
        )}
      </View>

    {/* Products Table */}
    <View style={styles.table}>
      {/* Table Header */}
      <View style={[styles.tableRow, styles.tableHeader]}>
        <Text style={[styles.tableCell, { flex: 0.5 }]}>S.No</Text>
        <Text style={[styles.tableCell, { flex: 2 }]}>Description</Text>
        <Text style={[styles.tableCell, { flex: 1 }]}>HSN</Text>
        <Text style={[styles.tableCell, { flex: 1 }]}>Batch</Text>
        <Text style={[styles.tableCell, { flex: 1 }]}>Expiry</Text>
        <Text style={[styles.tableCell, { flex: 0.7 }]}>Qty</Text>
        <Text style={[styles.tableCell, { flex: 0.7 }]}>Unit</Text>
        <Text style={[styles.tableCell, { flex: 1 }]}>Rate</Text>
        <Text style={[styles.tableCell, { flex: 1 }]}>Amount</Text>
        <Text style={[styles.tableCell, { flex: 1 }]}>Taxable</Text>
        <Text style={[styles.tableCell, { flex: 0.8 }]}>CGST</Text>
        <Text style={[styles.tableCell, { flex: 0.8 }]}>SGST</Text>
        <Text style={[styles.tableCell, { flex: 0.8 }]}>IGST</Text>
        <Text style={[styles.tableCell, styles.tableCellLast, { flex: 1 }]}>Total</Text>
      </View>

      {/* Table Rows */}
      {data.items.map((item) => (
        <View key={item.sno} style={styles.tableRow}>
          <Text style={[styles.tableCell, { flex: 0.5 }]}>{item.sno}</Text>
          <Text style={[styles.tableCell, { flex: 2 }]}>{item.description}</Text>
          <Text style={[styles.tableCell, { flex: 1 }]}>{item.hsn}</Text>
          <Text style={[styles.tableCell, { flex: 1 }]}>{item.batch}</Text>
          <Text style={[styles.tableCell, { flex: 1 }]}>{item.expiry}</Text>
          <Text style={[styles.tableCell, { flex: 0.7 }]}>{item.qty}</Text>
          <Text style={[styles.tableCell, { flex: 0.7 }]}>{item.unit}</Text>
          <Text style={[styles.tableCell, { flex: 1 }]}>₹{(item.rate || 0).toFixed(2)}</Text>
          <Text style={[styles.tableCell, { flex: 1 }]}>₹{(item.amount || 0).toFixed(2)}</Text>
          <Text style={[styles.tableCell, { flex: 1 }]}>₹{(item.taxable || 0).toFixed(2)}</Text>
          <Text style={[styles.tableCell, { flex: 0.8 }]}>₹{(item.cgst || 0).toFixed(2)}</Text>
          <Text style={[styles.tableCell, { flex: 0.8 }]}>₹{(item.sgst || 0).toFixed(2)}</Text>
          <Text style={[styles.tableCell, { flex: 0.8 }]}>₹{(item.igst || 0).toFixed(2)}</Text>
          <Text style={[styles.tableCell, styles.tableCellLast, { flex: 1 }]}>₹{(item.total || 0).toFixed(2)}</Text>
        </View>
      ))}
    </View>


    {/* Total Amount Section with Amount in Words */}
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 8, paddingTop: 5, borderTopWidth: 1, borderTopColor: '#ddd' }}>
      <View style={{ flex: 2, paddingRight: 10 }}>
        <Text style={[styles.footerText, { fontWeight: 'bold', marginBottom: 2 }]}>Amount in words:</Text>
        <Text style={styles.footerText}>{data.amountInWords}</Text>
      </View>
      <View style={{ flex: 1, alignItems: 'flex-end' }}>
        <Text style={styles.totalText}>Total: ₹{(data.totalAmount || 0).toFixed(2)}</Text>
      </View>
    </View>

    {/* Footer Details */}
    <View style={styles.footer}>
      <Text style={styles.footerText}>
        Payment Method: {data.paymentMethod}    Authorized Signatory
      </Text>
    </View>

    </View>
  );
};

const DualCopyInvoice: React.FC<DualCopyInvoiceProps> = (props) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Customer Copy */}
      <InvoiceSection data={props} copyType="CUSTOMER COPY" />
      
      {/* Divider */}
      <View style={styles.divider} />
      
      {/* Office Copy */}
      <InvoiceSection data={props} copyType="OFFICE COPY" />
    </Page>
  </Document>
);

export default DualCopyInvoice;
