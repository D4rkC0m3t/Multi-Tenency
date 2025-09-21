import { useEffect, useMemo, useState } from 'react';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Visibility as VisibilityIcon, Undo as UndoIcon, Receipt as ReceiptIcon } from '@mui/icons-material';
import { Box, Button, Typography, Paper, CircularProgress, IconButton, Grid, TextField, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Container, Stack, Tabs, Tab } from '@mui/material';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import { supabase, Sale } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { SaleForm } from './SaleForm';
import { ReturnForm } from './ReturnForm';
import EInvoiceManager from './EInvoiceManager';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { ExactEInvoiceData, ExactEInvoiceDocument, ExactEInvoiceContent } from '../../lib/exactFormatEInvoicePdf';
import { Document, Page, View, Text, StyleSheet, Image } from '@react-pdf/renderer';
import { pdf, PDFViewer } from '@react-pdf/renderer';
import { calculateGSTBreakdown, getGSTStateCode } from '../../utils/gstCalculations';

// Custom Preview Document with Single Header Row
const PreviewEInvoiceDocument = ({ data }: { data: ExactEInvoiceData }) => {
  // Read the original styles from the PDF component
  const styles = StyleSheet.create({
    page: {
      padding: 15,
      fontSize: 7,
      fontFamily: 'Helvetica',
      lineHeight: 1.1
    },
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
    originalSection: {
      width: 120,
      padding: 3,
      alignItems: 'center'
    },
    irnSection: {
      flexDirection: 'row',
      padding: 3,
    },
    irnLeft: {
      flex: 1
    },
    qrSection: {
      width: 80,
      height: 80,
      borderWidth: 1,
      borderColor: '#000',
      alignItems: 'center',
      justifyContent: 'center'
    },
    companySection: {
      borderWidth: 1,
      borderColor: '#000',
      marginBottom: 2,
      padding: 6,
      alignItems: 'center'
    },
    invoiceDetailsSection: {
      borderWidth: 1,
      borderColor: '#000',
      marginBottom: 2,
      flexDirection: 'row'
    },
    invoiceLeft: {
      flex: 1,
      padding: 3,
      borderRightWidth: 1,
      borderRightColor: '#000'
    },
    invoiceRight: {
      flex: 1,
      padding: 3
    },
    partySection: {
      borderWidth: 1,
      borderColor: '#000',
      marginBottom: 2,
      flexDirection: 'row'
    },
    buyerSection: {
      flex: 1,
      padding: 3,
      borderRightWidth: 1,
      borderRightColor: '#000'
    },
    consigneeSection: {
      flex: 1,
      padding: 3
    },
    table: {
      borderWidth: 1,
      borderColor: '#000',
      marginBottom: 5
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: '#f0f0f0',
      borderBottomWidth: 1,
      borderBottomColor: '#000'
    },
    tableRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#000'
    },
    col1: { width: '5%', padding: 2, borderRightWidth: 1, borderRightColor: '#000', textAlign: 'center', fontSize: 6 },
    col2: { width: '25%', padding: 2, borderRightWidth: 1, borderRightColor: '#000', fontSize: 6 },
    col3: { width: '8%', padding: 2, borderRightWidth: 1, borderRightColor: '#000', textAlign: 'center', fontSize: 6 },
    col4: { width: '6%', padding: 2, borderRightWidth: 1, borderRightColor: '#000', textAlign: 'center', fontSize: 6 },
    col5: { width: '8%', padding: 2, borderRightWidth: 1, borderRightColor: '#000', textAlign: 'center', fontSize: 6 },
    col6: { width: '8%', padding: 2, borderRightWidth: 1, borderRightColor: '#000', textAlign: 'center', fontSize: 6 },
    col7: { width: '8%', padding: 2, borderRightWidth: 1, borderRightColor: '#000', textAlign: 'center', fontSize: 6 },
    col8: { width: '8%', padding: 2, borderRightWidth: 1, borderRightColor: '#000', textAlign: 'center', fontSize: 6 },
    col9: { width: '10%', padding: 2, borderRightWidth: 1, borderRightColor: '#000', textAlign: 'right', fontSize: 6 },
    col10: { width: '12%', padding: 2, textAlign: 'right', fontSize: 6 },
    bold: { fontWeight: 'bold' },
    center: { textAlign: 'center' },
    underline: { textDecoration: 'underline' },
    taxSummarySection: {
      flexDirection: 'row',
      marginBottom: 5
    },
    taxLeft: {
      flex: 2,
      paddingRight: 5
    },
    taxRight: {
      flex: 1,
      paddingLeft: 5
    },
    outstandingSection: {
      flexDirection: 'row',
      borderWidth: 1,
      borderColor: '#000',
      marginBottom: 5
    },
    outstandingLeft: {
      flex: 1,
      padding: 3,
      borderRightWidth: 1,
      borderRightColor: '#000'
    },
    outstandingRight: {
      flex: 1,
      padding: 3
    },
    termsSection: {
      borderWidth: 1,
      borderColor: '#000',
      padding: 3,
      marginBottom: 5
    },
    footerSection: {
      flexDirection: 'row',
      borderWidth: 1,
      borderColor: '#000',
      padding: 3
    },
    footerLeft: {
      flex: 1
    },
    footerRight: {
      flex: 1,
      alignItems: 'flex-end'
    }
  });

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
    
    if (num === 0) return 'Zero';
    
    let result = '';
    const crores = Math.floor(num / 10000000);
    const lakhs = Math.floor((num % 10000000) / 100000);
    const thousands = Math.floor((num % 100000) / 1000);
    const hundreds = num % 1000;
    
    if (crores > 0) result += convertHundreds(crores) + 'Crore ';
    if (lakhs > 0) result += convertHundreds(lakhs) + 'Lakh ';
    if (thousands > 0) result += convertHundreds(thousands) + 'Thousand ';
    if (hundreds > 0) result += convertHundreds(hundreds);
    
    return result.trim() + ' Rupees Only';
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.topHeader}>
            <View style={styles.ackSection}>
              <Text style={styles.bold}>Ack No.: {data.ackNo}</Text>
              <Text style={styles.bold}>Ack Date: {data.ackDate}</Text>
            </View>
            <View style={styles.originalSection}>
              <Text style={styles.bold}>(ORIGINAL FOR RECIPIENT)</Text>
            </View>
          </View>
          <View style={styles.irnSection}>
            {/* Company Logo on Left */}
            <View style={{ width: 80, height: 80, borderWidth: 1, borderColor: '#000', alignItems: 'center', justifyContent: 'center', marginRight: 5 }}>
              {data.companyLogo ? (
                <Image style={{ width: 70, height: 70 }} src={data.companyLogo} />
              ) : (
                <Text style={{ fontSize: 6, textAlign: 'center', color: '#666' }}>[Company Logo]</Text>
              )}
            </View>
            <View style={styles.irnLeft}>
              <Text style={styles.bold}>IRN: {data.irn}</Text>
            </View>
            <View style={styles.qrSection}>
              {data.signedQRCode ? (
                <View style={{ alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                  <Image 
                    style={{ width: 70, height: 70 }} 
                    src={data.signedQRCode.startsWith('data:') ? data.signedQRCode : `data:image/png;base64,${data.signedQRCode}`} 
                  />
                </View>
              ) : (
                <View style={{ alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                  <Text style={{ fontSize: 4, textAlign: 'center' }}>E-Invoice QR Code</Text>
                  <View style={{ width: 60, height: 60, backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center', marginTop: 2, borderWidth: 1, borderColor: '#ccc' }}>
                    <Text style={{ fontSize: 3, textAlign: 'center' }}>
                      QR{'\n'}
                      IRN: {data.irn.substring(0, 8)}...{'\n'}
                      ₹{data.invoiceTotal.toFixed(0)}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Company Section */}
        <View style={styles.companySection}>
          <Text style={[styles.center, { fontSize: 9, marginBottom: 6, fontWeight: 'bold' }]}>TAX INVOICE</Text>
          <Text style={[styles.bold, styles.center, { fontSize: 14, marginBottom: 6 }]}>{data.companyName}</Text>
          {data.companyAddress && data.companyAddress.map((line, index) => (
            <Text key={index} style={[styles.center, { fontSize: 7, marginBottom: 1 }]}>{line}</Text>
          ))}
          <Text style={[styles.center, { fontSize: 7, marginBottom: 1 }]}>
            GSTIN/UIN: {data.gstin}, State Name: {data.stateName}, Code: {data.stateCode}
          </Text>
          <Text style={[styles.center, { fontSize: 7, marginBottom: 2 }]}>
            Mobile Number: {data.mobile}, E-Mail: {data.email}
          </Text>
          {/* All Licensing Information - Horizontal Display */}
          {(data.fertilizerLicense || data.seedLicense || data.pesticideLicense) && (
            <Text style={[styles.center, { fontSize: 7, marginTop: 2 }]}>
              {[
                data.fertilizerLicense && `Fertilizer License: ${data.fertilizerLicense}`,
                data.seedLicense && `Seed License: ${data.seedLicense}`,
                data.pesticideLicense && `Pesticide License: ${data.pesticideLicense}`
              ].filter(Boolean).join(' | ')}
            </Text>
          )}
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
            <Text style={{ fontSize: 7 }}>Time of Supply: {data.dateTimeOfSupply || new Date().toLocaleTimeString('en-IN')}</Text>
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

        {/* Items Table - SINGLE HEADER ROW */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Sr No</Text>
            <Text style={styles.col2}>Description</Text>
            <Text style={styles.col3}>HSN Code</Text>
            <Text style={styles.col4}>GST %</Text>
            <Text style={styles.col5}>Mfg Date</Text>
            <Text style={styles.col6}>Exp Date</Text>
            <Text style={styles.col7}>Qty</Text>
            <Text style={styles.col8}>Incl Rate</Text>
            <Text style={styles.col9}>Rate</Text>
            <Text style={styles.col10}>Amount</Text>
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

        {/* Amount in Words */}
        <View style={{ marginTop: 5, borderTopWidth: 1, borderTopColor: '#000', paddingTop: 3 }}>
          <Text style={[styles.bold, { fontSize: 8 }]}>Amount In Words: {numberToWords(Math.floor(data.invoiceTotal))}</Text>
        </View>

        {/* Tax Summary */}
        <View style={styles.taxSummarySection}>
          <View style={styles.taxLeft}>
            <View style={[{ borderWidth: 1, borderColor: '#000' }]}>
              <View style={[{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#000', backgroundColor: '#f0f0f0' }]}>
                <Text style={[{ width: '25%', padding: 2, borderRightWidth: 1, borderRightColor: '#000' }, styles.bold]}>HSN/SAC</Text>
                <Text style={[{ width: '25%', padding: 2, borderRightWidth: 1, borderRightColor: '#000' }, styles.bold]}>Taxable Value</Text>
                <Text style={[{ width: '15%', padding: 2, borderRightWidth: 1, borderRightColor: '#000' }, styles.bold]}>Rate</Text>
                <Text style={[{ width: '15%', padding: 2, borderRightWidth: 1, borderRightColor: '#000' }, styles.bold]}>Amount</Text>
                <Text style={[{ width: '20%', padding: 2 }, styles.bold]}>Tax Amount</Text>
              </View>
              <View style={[{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#000' }]}>
                <Text style={{ width: '25%', padding: 2, borderRightWidth: 1, borderRightColor: '#000' }}>{data.hsnSac}</Text>
                <Text style={{ width: '25%', padding: 2, borderRightWidth: 1, borderRightColor: '#000' }}>₹{data.taxableValue.toFixed(2)}</Text>
                <Text style={{ width: '15%', padding: 2, borderRightWidth: 1, borderRightColor: '#000' }}>{data.gstRate}%</Text>
                <Text style={{ width: '15%', padding: 2, borderRightWidth: 1, borderRightColor: '#000' }}>₹{data.cgstAmount.toFixed(2)}</Text>
                <Text style={{ width: '20%', padding: 2 }}>₹{data.sgstAmount.toFixed(2)}</Text>
              </View>
              <View style={[{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#000', backgroundColor: '#f0f0f0' }]}>
                <Text style={[{ width: '25%', padding: 2, borderRightWidth: 1, borderRightColor: '#000' }, styles.bold]}>Total</Text>
                <Text style={[{ width: '25%', padding: 2, borderRightWidth: 1, borderRightColor: '#000' }, styles.bold]}>₹{data.taxableValue.toFixed(2)}</Text>
                <Text style={[{ width: '15%', padding: 2, borderRightWidth: 1, borderRightColor: '#000' }, styles.bold]}></Text>
                <Text style={[{ width: '15%', padding: 2, borderRightWidth: 1, borderRightColor: '#000' }, styles.bold]}>₹{data.gstAmount.toFixed(2)}</Text>
                <Text style={[{ width: '20%', padding: 2 }, styles.bold]}>₹{data.taxAmount.toFixed(2)}</Text>
              </View>
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
      </Page>
    </Document>
  );
};

// Exact Invoice Preview Component
function ExactInvoicePreview({ sale }: { sale: Sale }) {
  const { merchant } = useAuth();
  const [invoiceData, setInvoiceData] = useState<ExactEInvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInvoiceData = async () => {
      if (!sale || !merchant) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Get fresh sale items from database
        const { data: saleItems, error: saleItemsError } = await supabase
          .from('sale_items')
          .select(`
            *,
            product:products(*)
          `)
          .eq('sale_id', sale.id);

        if (saleItemsError) {
          throw new Error(`Failed to fetch sale items: ${saleItemsError.message}`);
        }

        const customer = (sale as any).customer;
        
        // Generate QR code data
        const formatDateForQR = (date: Date | string) => {
          const d = new Date(date);
          const day = String(d.getDate()).padStart(2, '0');
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const year = d.getFullYear();
          return `${day}/${month}/${year}`;
        };
        
        const invoiceDate = formatDateForQR(sale.sale_date);
        
        // Find HSN code of highest value item
        let mainItemHSN = '31054000'; // Default HSN for fertilizers
        if (saleItems.length > 0) {
          const highestValueItem = saleItems.reduce((prev, current) => 
            (current.total_price > prev.total_price) ? current : prev
          );
          mainItemHSN = (highestValueItem.product as any).hsn_code || '31054000';
        }
        
        // Generate IRN
        const irn = `IRN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        
        const qrCodeText = [
          (merchant as any).gst_number || '',
          (customer as any)?.gst_number || '',
          sale.invoice_number,
          invoiceDate,
          sale.total_amount.toFixed(2),
          mainItemHSN,
          irn
        ].join('|');

        // Generate QR code image
        const QRCode = (await import('qrcode')).default;
        const qrCodeBase64 = await QRCode.toDataURL(qrCodeText, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#ffffff'
          }
        });

        const data: ExactEInvoiceData = {
          // E-Invoice Header
          ackNo: `ACK${Date.now()}`,
          ackDate: new Date().toLocaleDateString('en-IN'),
          irn: irn,
          signedQRCode: qrCodeBase64,
          
          // Company Details
          companyName: merchant?.name || 'Business Name',
          companyAddress: [merchant?.address || 'Business Address'],
          companyLogo: (merchant as any)?.logo_url || null,
          gstin: (merchant as any)?.gst_number || merchant?.gstin || 'GSTIN Not Available',
          stateName: merchant?.state || 'Maharashtra',
          stateCode: getGSTStateCode(merchant?.state || 'Maharashtra'),
          mobile: merchant?.phone || '',
          email: merchant?.email || '',
          
          // Fertilizer Licensing Details
          fertilizerLicense: (merchant as any)?.fertilizer_license || '',
          seedLicense: (merchant as any)?.seed_license || '',
          pesticideLicense: (merchant as any)?.pesticide_license || '',
          
          // Invoice Details
          invoiceNo: sale.invoice_number || `INV-${Date.now()}`,
          invoiceDate: new Date(sale.sale_date || new Date()).toLocaleDateString('en-IN'),
          
          // Transport Details
          despatchThrough: (merchant as any)?.dispatch_method || 'Four Wheeler/Tata Ace',
          destination: customer?.address || 'Customer Location',
          modeTermsOfPayment: sale.payment_method?.toUpperCase() || 'CASH',
          eWayBillNo: (sale as any)?.eway_bill_no || 'N/A',
          eWayBillDate: (sale as any)?.eway_bill_date || 'N/A',
          otherReferences: (sale as any)?.other_references || 'N/A',
          vehicleNo: (sale as any)?.vehicle_no || 'N/A',
          dateTimeOfSupply: new Date().toLocaleString('en-IN'),
          
          // Buyer Details
          buyerName: customer?.name || 'Walk-in Customer',
          buyerAddress: [
            customer?.address || '',
            customer?.village ? `Village: ${customer.village}` : '',
            customer?.district && customer?.state ? `${customer.district}, ${customer.state}` : '',
            customer?.pincode ? `PIN: ${customer.pincode}` : ''
          ].filter(Boolean),
          buyerGstin: customer?.gstin || customer?.gst_number || '',
          buyerStateName: customer?.state || '',
          buyerStateCode: getGSTStateCode(customer?.state || ''),
          buyerMobile: customer?.phone || '',
          buyerContactDetails: customer?.phone || '',
          
          // Items
          items: saleItems.map((item, index) => {
            const itemAmount = item.total_price || 0;
            const itemTaxAmount = (itemAmount * 18) / 118; // Extract tax from inclusive amount
            const itemGstBreakdown = calculateGSTBreakdown(
              itemTaxAmount,
              merchant?.state || 'Maharashtra',
              customer?.state || merchant?.state || 'Maharashtra'
            );
            
            return {
              sr: index + 1,
              description: item.product.name,
              hsn: (item.product as any)?.hsn_code || '31054000',
              gst: 18,
              qty: item.quantity,
              unit: item.product.unit || 'KG',
              rate: item.unit_price || 0,
              amount: itemAmount,
              cgstAmount: itemGstBreakdown.cgstAmount,
              sgstAmount: itemGstBreakdown.sgstAmount,
              igstAmount: itemGstBreakdown.igstAmount,
              lotBatch: item.product.batch_number || '',
              mfgDate: item.product.manufacturing_date || '',
              expiryDate: item.product.expiry_date || '',
              manufacturer: item.product.manufacturer || '',
              packingDetails: item.product.packing_details || ''
            };
          }),
          
          // Tax Summary with proper GST breakdown
          hsnSac: '31054000',
          taxableValue: sale.subtotal || (sale.total_amount / 1.18),
          gstRate: 18,
          gstAmount: sale.tax_amount || (sale.total_amount / 1.18) * 0.18,
          cgstAmount: sale.cgst_amount || 0,
          sgstAmount: sale.sgst_amount || 0,
          igstAmount: sale.igst_amount || 0,
          taxAmount: sale.tax_amount || (sale.total_amount / 1.18) * 0.18,
          roundOff: 0,
          invoiceTotal: sale.total_amount || 0,
          isInterstate: (sale.igst_amount || 0) > 0, // Interstate if IGST is present
          
          // Amount in Words
          amountInWords: `Rupees ${Math.floor(sale.total_amount || 0)} Only`,
          
          // Outstanding Details
          currentInvoice: sale.total_amount || 0,
          totalOutstanding: sale.payment_status === 'pending' ? (sale.total_amount || 0) : 0,
          
          // Footer
          jurisdiction: merchant?.state || 'Maharashtra'
        };

        setInvoiceData(data);
      } catch (err) {
        console.error('Error loading invoice data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load invoice data');
      } finally {
        setLoading(false);
      }
    };

    loadInvoiceData();
  }, [sale, merchant]);

  const handleDownloadPDF = async () => {
    if (!invoiceData) return;
    
    try {
      const blob = await pdf(<ExactEInvoiceDocument data={invoiceData} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${invoiceData.invoiceNo}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Invoice downloaded successfully!');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download invoice');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>Loading invoice preview...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="error" gutterBottom>Error Loading Invoice</Typography>
        <Typography variant="body2" color="text.secondary">{error}</Typography>
      </Box>
    );
  }

  if (!invoiceData) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">No invoice data available</Typography>
      </Box>
    );
  }

  // Convert number to words function (same as PDF)
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
    
    if (num === 0) return 'Zero';
    
    let result = '';
    const crores = Math.floor(num / 10000000);
    const lakhs = Math.floor((num % 10000000) / 100000);
    const thousands = Math.floor((num % 100000) / 1000);
    const hundreds = num % 1000;
    
    if (crores > 0) result += convertHundreds(crores) + 'Crore ';
    if (lakhs > 0) result += convertHundreds(lakhs) + 'Lakh ';
    if (thousands > 0) result += convertHundreds(thousands) + 'Thousand ';
    if (hundreds > 0) result += convertHundreds(hundreds);
    
    return result.trim() + ' Rupees Only';
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Exact E-Invoice Format Preview</Typography>
        <Button variant="contained" onClick={handleDownloadPDF} startIcon={<ReceiptIcon />}>
          Download PDF
        </Button>
      </Box>
      
      {/* PDF Preview using React PDF Renderer */}
      <Box sx={{ 
        width: '100%', 
        height: '800px', 
        border: '1px solid #ddd', 
        borderRadius: 1,
        overflow: 'hidden'
      }}>
        <PDFViewer 
          width="100%" 
          height="100%"
          style={{ border: 'none' }}
        >
          <PreviewEInvoiceDocument data={invoiceData} />
        </PDFViewer>
      </Box>
    </Box>
  );
}

export function SalesPage() {
  const { merchant } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [viewSale, setViewSale] = useState<Sale | null>(null);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [returnSale, setReturnSale] = useState<Sale | null>(null);
  const [einvoiceSale, setEinvoiceSale] = useState<Sale | null>(null);
  const [tabValue, setTabValue] = useState(0);

  const [qInvoice, setQInvoice] = useState('');
  const [qCustomer, setQCustomer] = useState('');
  const [qStatus, setQStatus] = useState<string>('all');
  const [qStart, setQStart] = useState<string>('');
  const [qEnd, setQEnd] = useState<string>('');

  useEffect(() => {
    if (merchant) {
      fetchSales();
    } else {
      setLoading(false);
    }
  }, [merchant]);

  const fetchSales = async () => {
    if (!merchant) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          customer:customers(id, name),
          sale_items:sale_items(*)
        `)
        .eq('merchant_id', merchant.id)
        .order('sale_date', { ascending: false });

      if (error) throw error;
      setSales(data || []);
    } catch (error) {
      toast.error('Failed to load sales');
    } finally {
      setLoading(false);
    }
  };

  const filteredSales = useMemo(() => {
    let list = [...sales];
    if (qInvoice.trim()) list = list.filter(s => (s.invoice_number || '').toLowerCase().includes(qInvoice.toLowerCase()));
    if (qCustomer.trim()) list = list.filter(s => (s as any).customer?.name?.toLowerCase().includes(qCustomer.toLowerCase()));
    if (qStatus !== 'all') list = list.filter(s => (s.payment_status || '').toLowerCase() === qStatus);
    if (qStart) list = list.filter(s => new Date(s.sale_date) >= new Date(qStart));
    if (qEnd) list = list.filter(s => new Date(s.sale_date) <= new Date(qEnd));
    return list;
  }, [sales, qInvoice, qCustomer, qStatus, qStart, qEnd]);

  const totals = useMemo(() => {
    const count = filteredSales.length;
    const subtotal = filteredSales.reduce((s, x) => s + Number((x as any).subtotal || 0), 0);
    const tax = filteredSales.reduce((s, x) => s + Number((x as any).tax_amount || 0), 0);
    const discount = filteredSales.reduce((s, x) => s + Number((x as any).discount_amount || 0), 0);
    const total = filteredSales.reduce((s, x) => s + Number((x as any).total_amount || 0), 0);
    const received = filteredSales.reduce((s, x) => s + Number((x as any).amount_received || 0), 0);
    const outstanding = total - received;
    return { count, subtotal, tax, discount, total, received, outstanding };
  }, [filteredSales]);



  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this sale? This will restore product stock and cannot be undone.')) return;

    try {
      // 1) Load sale items first so we can revert stock
      const { data: items, error: itemsErr } = await supabase
        .from('sale_items')
        .select('product_id, quantity')
        .eq('sale_id', id);
      if (itemsErr) throw itemsErr;

      // 2) Revert stock for each item
      for (const it of items || []) {
        const { data: prod, error: prodErr } = await supabase
          .from('products')
          .select('current_stock')
          .eq('id', it.product_id)
          .single();
        if (prodErr) throw prodErr;
        const newStock = Number((prod as any)?.current_stock || 0) + Number(it.quantity || 0);
        const { error: updErr2 } = await supabase
          .from('products')
          .update({ current_stock: newStock, updated_at: new Date().toISOString() })
          .eq('id', it.product_id);
        if (updErr2) throw updErr2;
      }

      // 3) Delete the sale (sale_items will cascade)
      const { error: delErr } = await supabase
        .from('sales')
        .delete()
        .eq('id', id);
      if (delErr) throw delErr;

      setSales(prev => prev.filter(s => s.id !== id));
      toast.success('Sale deleted and stock restored.');
    } catch (error: any) {
      console.error('Delete sale error:', error);
      toast.error(error.message || 'Failed to delete sale');
    }
  };

  const handleOpenForm = (sale: Sale | null) => {
    console.log('Opening form for sale:', sale);
    setEditingSale(sale);
    setShowForm(true);
  };
  
  const handleCloseForm = () => {
    setEditingSale(null);
    setShowForm(false);
  };

  const columns: GridColDef<any>[] = [
    { field: 'invoice_number', headerName: 'Invoice #', flex: 1 },
    { field: 'customerName', headerName: 'Customer', flex: 1.5, valueGetter: (params: any) => params?.row?.customer?.name ?? 'N/A' },
    { field: 'sale_date', headerName: 'Date', flex: 1, valueFormatter: (params: any) => {
      const v = params?.value as any;
      if (!v) return '-';
      const d = new Date(v);
      if (isNaN(d.getTime())) return '-';
      return format(d, 'dd MMM yyyy');
    } },
    { field: 'total_amount', headerName: 'Total', flex: 1, type: 'number', valueFormatter: (params: any) => `₹${Number((params?.value as any) ?? 0).toFixed(2)}` },
    { field: 'amount_received', headerName: 'Received', flex: 1, type: 'number', valueFormatter: (params: any) => `₹${Number((params?.value as any) ?? 0).toFixed(2)}` },
    { field: 'outstanding', headerName: 'Outstanding', flex: 1, type: 'number', valueGetter: (params: any) => {
      const total = Number((params?.row as any)?.total_amount || 0);
      const rec = Number((params?.row as any)?.amount_received || 0);
      return Math.max(0, total - rec);
    }, valueFormatter: (params: any) => `₹${Number((params?.value as any) ?? 0).toFixed(2)}` },
    { field: 'due_date', headerName: 'Due Date', flex: 1, valueFormatter: (params: any) => {
      const v = params?.value as any;
      if (!v) return '-';
      const d = new Date(v);
      if (isNaN(d.getTime())) return '-';
      return format(d, 'dd MMM yyyy');
    } },
    { field: 'payment_status', headerName: 'Payment', flex: 1, renderCell: (params: any) => (
      <Typography 
        variant="caption" 
        sx={{ 
          px: 1, py: 0.5, borderRadius: 1, textTransform: 'capitalize',
          bgcolor: params.value === 'paid' ? 'success.light' : params.value === 'partial' ? 'warning.light' : 'error.light',
          color: params.value === 'paid' ? 'success.dark' : params.value === 'partial' ? 'warning.dark' : 'error.dark',
        }}
      >
        {params.value}
      </Typography>
    )},
    { field: 'itemsCount', headerName: 'Items', flex: 0.5, type: 'number', valueGetter: (params: any) => (params?.row?.sale_items?.length ?? 0) as number },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      flex: 1.2,
      renderCell: (params) => (
        <Box>
          <IconButton onClick={() => { setViewSale(params.row); setInvoiceOpen(true); }} color="default" size="small">
            <VisibilityIcon />
          </IconButton>
          <IconButton onClick={() => setEinvoiceSale(params.row)} color="info" size="small">
            <ReceiptIcon />
          </IconButton>
          <IconButton onClick={() => setReturnSale(params.row)} color="warning" size="small">
            <UndoIcon />
          </IconButton>
          <IconButton onClick={() => handleOpenForm(params.row)} color="primary" size="small">
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => handleDelete(params.row.id)} color="error" size="small">
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Print styles for invoice dialog */}
      <style>{`
        @media print {
          @page { size: A4; margin: 8mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-container { width: 100%; }
          .copy { page-break-inside: avoid; font-size: 11px; }
          .copy + .copy { margin-top: 8mm; }
          .inv-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
          .inv-title { font-size: 14px; font-weight: 700; }
          .inv-brand { display: flex; align-items: center; gap: 8px; }
          .inv-brand img { height: 28px; width: auto; object-fit: contain; }
          .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 2px 12px; margin-top: 4px; }
          th, td { border: 1px solid #ddd; padding: 4px 6px; word-wrap: break-word; }
          th { background: #f3f4f6; }
          table { width: 100%; border-collapse: collapse; table-layout: fixed; }
          .right { text-align: right; }
          .totals .row { display: flex; justify-content: space-between; margin: 2px 0; }
          .totals .grand { font-weight: 700; font-size: 13px; }
          .MuiDialog-container, .MuiDrawer-root, nav, header, footer, .no-print { display: none !important; }
        }
      `}</style>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack>
          <Typography variant="h4" fontWeight={800}>Sales / POS</Typography>
          <Typography variant="body2" color="text.secondary">Record and manage your customer sales</Typography>
        </Stack>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenForm(null)}>Create Sale</Button>
      </Stack>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}><TextField label="Invoice #" fullWidth size="small" value={qInvoice} onChange={(e)=>setQInvoice(e.target.value)} /></Grid>
          <Grid item xs={12} md={3}><TextField label="Customer" fullWidth size="small" value={qCustomer} onChange={(e)=>setQCustomer(e.target.value)} /></Grid>
          <Grid item xs={6} md={2}><TextField label="Start Date" type="date" size="small" fullWidth InputLabelProps={{shrink:true}} value={qStart} onChange={(e)=>setQStart(e.target.value)} /></Grid>
          <Grid item xs={6} md={2}><TextField label="End Date" type="date" size="small" fullWidth InputLabelProps={{shrink:true}} value={qEnd} onChange={(e)=>setQEnd(e.target.value)} /></Grid>
          <Grid item xs={12} md={2}>
            <TextField label="Payment" select size="small" fullWidth value={qStatus} onChange={(e)=>setQStatus(e.target.value)}>
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="paid">Paid</MenuItem>
              <MenuItem value="partial">Partial</MenuItem>
              <MenuItem value="unpaid">Unpaid</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={2}><Typography variant="caption" color="text.secondary">Count</Typography><Typography variant="subtitle2">{totals.count}</Typography></Grid>
          <Grid item xs={6} sm={2}><Typography variant="caption" color="text.secondary">Subtotal</Typography><Typography variant="subtitle2">₹{totals.subtotal.toFixed(2)}</Typography></Grid>
          <Grid item xs={6} sm={2}><Typography variant="caption" color="text.secondary">GST</Typography><Typography variant="subtitle2">₹{totals.tax.toFixed(2)}</Typography></Grid>
          <Grid item xs={6} sm={2}><Typography variant="caption" color="text.secondary">Grand Total</Typography><Typography variant="subtitle2">₹{totals.total.toFixed(2)}</Typography></Grid>
          <Grid item xs={6} sm={2}><Typography variant="caption" color="text.secondary">Received</Typography><Typography variant="subtitle2">₹{(totals.received||0).toFixed(2)}</Typography></Grid>
          <Grid item xs={6} sm={2}><Typography variant="caption" color="text.secondary">Outstanding</Typography><Typography variant="subtitle2">₹{(totals.outstanding||0).toFixed(2)}</Typography></Grid>
        </Grid>
      </Paper>

      {filteredSales.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>No sales found</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Try adjusting filters or create a new sale.
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenForm(null)}>Create Sale</Button>
        </Paper>
      ) : (
        <Paper sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={filteredSales}
            columns={columns}
            loading={loading}
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
              },
            }}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 10 },
              },
            }}
            pageSizeOptions={[5, 10, 20]}
            disableRowSelectionOnClick
          />
        </Paper>
      )}

      {showForm && (
        <SaleForm
          sale={editingSale}
          onClose={handleCloseForm}
          onSave={() => {
            fetchSales();
            handleCloseForm();
          }}
        />
      )}

      {returnSale && (
        <ReturnForm
          sale={returnSale}
          onClose={() => setReturnSale(null)}
          onSave={() => {
            fetchSales();
            setReturnSale(null);
          }}
        />
      )}

      {/* E-Invoice Management Dialog */}
      {einvoiceSale && (
        <Dialog open={!!einvoiceSale} onClose={() => setEinvoiceSale(null)} maxWidth="lg" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ReceiptIcon />
              E-Invoice Management - {einvoiceSale.invoice_number}
            </Box>
          </DialogTitle>
          <DialogContent>
            <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
              <Tab label="E-Invoice" />
              <Tab label="Invoice Preview" />
            </Tabs>
            
            {tabValue === 0 && merchant && (
              <Box sx={{ mt: 2 }}>
                <EInvoiceManager
                  sale={einvoiceSale}
                  customer={(einvoiceSale as any).customer || { name: 'Walk-in Customer' }}
                  merchant={merchant}
                  saleItems={(einvoiceSale as any).sale_items || []}
                  onEInvoiceGenerated={() => {
                    fetchSales();
                  }}
                />
              </Box>
            )}
            
            {tabValue === 1 && (
              <Box sx={{ mt: 2 }}>
                {/* Exact Invoice Preview */}
                <ExactInvoicePreview sale={einvoiceSale} />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEinvoiceSale(null)}>Close</Button>
            {tabValue === 1 && (
              <Button variant="contained" onClick={() => window.print()}>Print</Button>
            )}
          </DialogActions>
        </Dialog>
      )}

      {/* Invoice view dialog */}
      <Dialog open={invoiceOpen} onClose={() => setInvoiceOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Invoice Preview</DialogTitle>
        <DialogContent dividers>
          {viewSale && (
            <ExactInvoicePreview sale={viewSale} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInvoiceOpen(false)}>Close</Button>
          <Button variant="contained" onClick={() => window.print()}>Print</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
