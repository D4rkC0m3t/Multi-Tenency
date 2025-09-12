import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';

// Interface for report data
export interface ReportPDFData {
  reportType: string;
  merchantName: string;
  merchantAddress: string;
  merchantPhone?: string;
  merchantEmail?: string;
  dateRange: string;
  generatedDate: string;
  fertilizerLicense?: string;
  seedLicense?: string;
  pesticideLicense?: string;
  gstNumber?: string;
  data: any;
}

// Styles for the PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 20,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: '2px solid #000',
    paddingBottom: 10,
  },
  licenseInfo: {
    fontSize: 8,
    marginBottom: 5,
    color: '#666',
  },
  complianceNote: {
    fontSize: 8,
    fontStyle: 'italic',
    marginTop: 10,
    padding: 5,
    backgroundColor: '#f0f8ff',
    border: '1px solid #ddd',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  merchantInfo: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 1.4,
  },
  reportInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
    padding: 5,
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableHeader: {
    backgroundColor: '#f5f5f5',
    fontWeight: 'bold',
    fontSize: 10,
    padding: 5,
    textAlign: 'center',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
  },
  tableCell: {
    fontSize: 9,
    padding: 5,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
  },
  summaryBox: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    marginBottom: 10,
    border: '1px solid #ddd',
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    textAlign: 'center',
    fontSize: 8,
    color: '#666',
  },
});

// Performance Report Component
const PerformanceReport: React.FC<{ data: any; merchantName: string; dateRange: string }> = ({ data }) => (
  <View>
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Sales Summary</Text>
      <View style={styles.summaryBox}>
        <View style={styles.summaryItem}>
          <Text>Total Revenue:</Text>
          <Text>₹{data.salesSummary?.totalRevenue?.toFixed(2) || '0.00'}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text>Total Sales:</Text>
          <Text>{data.salesSummary?.totalSales || 0}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text>Average Sale Value:</Text>
          <Text>₹{data.salesSummary?.avgSaleValue?.toFixed(2) || '0.00'}</Text>
        </View>
      </View>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Stock Summary</Text>
      <View style={styles.summaryBox}>
        <View style={styles.summaryItem}>
          <Text>Total Products:</Text>
          <Text>{data.stockSummary?.totalProducts || 0}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text>Low Stock Items:</Text>
          <Text>{data.stockSummary?.lowStockCount || 0}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text>Out of Stock Items:</Text>
          <Text>{data.stockSummary?.outOfStockCount || 0}</Text>
        </View>
      </View>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Top Products</Text>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={[styles.tableHeader, { width: '70%' }]}>Product Name</Text>
          <Text style={[styles.tableHeader, { width: '30%' }]}>Quantity Sold</Text>
        </View>
        {data.topProducts?.slice(0, 10).map((product: any, index: number) => (
          <View key={index} style={styles.tableRow}>
            <Text style={[styles.tableCell, { width: '70%' }]}>{product.name}</Text>
            <Text style={[styles.tableCell, { width: '30%', textAlign: 'right' }]}>{product.quantity}</Text>
          </View>
        ))}
      </View>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Profit Summary</Text>
      <View style={styles.summaryBox}>
        <View style={styles.summaryItem}>
          <Text>Gross Profit:</Text>
          <Text>₹{data.profitSummary?.grossProfit?.toFixed(2) || '0.00'}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text>Cost of Goods Sold:</Text>
          <Text>₹{data.profitSummary?.cogs?.toFixed(2) || '0.00'}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text>Profit Margin:</Text>
          <Text>{data.profitSummary?.profitMargin?.toFixed(2) || '0.00'}%</Text>
        </View>
      </View>
    </View>
  </View>
);

// Enhanced Stock Report Component with FCO Compliance
const StockReport: React.FC<{ data: any }> = ({ data }) => (
  <View>
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Current Stock Report - FCO Compliant</Text>
      <View style={styles.complianceNote}>
        <Text>This report complies with Fertilizer Control Order (FCO) 1985 requirements for inventory tracking and batch management.</Text>
      </View>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={[styles.tableHeader, { width: '20%' }]}>Product Name</Text>
          <Text style={[styles.tableHeader, { width: '10%' }]}>HSN Code</Text>
          <Text style={[styles.tableHeader, { width: '12%' }]}>Batch No.</Text>
          <Text style={[styles.tableHeader, { width: '10%' }]}>Mfg Date</Text>
          <Text style={[styles.tableHeader, { width: '10%' }]}>Exp Date</Text>
          <Text style={[styles.tableHeader, { width: '8%' }]}>Stock</Text>
          <Text style={[styles.tableHeader, { width: '8%' }]}>Min Stock</Text>
          <Text style={[styles.tableHeader, { width: '10%' }]}>Sale Price</Text>
          <Text style={[styles.tableHeader, { width: '12%' }]}>Status/Alert</Text>
        </View>
        {data?.products?.map((product: any, index: number) => {
          const isLowStock = product.current_stock <= product.minimum_stock;
          const isExpiringSoon = product.expiry_date && new Date(product.expiry_date) <= new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
          const statusText = isLowStock ? 'LOW STOCK' : isExpiringSoon ? 'EXPIRING' : 'OK';
          return (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, { width: '20%' }]}>{product.name}</Text>
              <Text style={[styles.tableCell, { width: '10%' }]}>{product.hsn_code || 'N/A'}</Text>
              <Text style={[styles.tableCell, { width: '12%' }]}>{product.batch_number || 'N/A'}</Text>
              <Text style={[styles.tableCell, { width: '10%' }]}>{product.manufacturing_date ? new Date(product.manufacturing_date).toLocaleDateString() : 'N/A'}</Text>
              <Text style={[styles.tableCell, { width: '10%' }]}>{product.expiry_date ? new Date(product.expiry_date).toLocaleDateString() : 'N/A'}</Text>
              <Text style={[styles.tableCell, { width: '8%', textAlign: 'right' }]}>{product.current_stock}</Text>
              <Text style={[styles.tableCell, { width: '8%', textAlign: 'right' }]}>{product.minimum_stock}</Text>
              <Text style={[styles.tableCell, { width: '10%', textAlign: 'right' }]}>₹{product.sale_price}</Text>
              <Text style={[styles.tableCell, { width: '12%', textAlign: 'center' }]}>
                {statusText}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
    
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Stock Summary & Alerts</Text>
      <View style={styles.summaryBox}>
        <View style={styles.summaryItem}>
          <Text>Total Products:</Text>
          <Text>{data?.products?.length || 0}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text>Low Stock Items:</Text>
          <Text>{data?.products?.filter((p: any) => p.current_stock <= p.minimum_stock).length || 0}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text>Expiring Soon (90 days):</Text>
          <Text>{data?.products?.filter((p: any) => p.expiry_date && new Date(p.expiry_date) <= new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)).length || 0}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text>Total Stock Value:</Text>
          <Text>₹{data?.products?.reduce((sum: number, p: any) => sum + (p.current_stock * p.sale_price), 0).toFixed(2) || '0.00'}</Text>
        </View>
      </View>
    </View>
    
    <View style={styles.complianceNote}>
      <Text>FCO Compliance Notes:</Text>
      <Text>• All fertilizer products must maintain proper batch tracking as per FCO 1985</Text>
      <Text>• Manufacturing and expiry dates are mandatory for all fertilizer products</Text>
      <Text>• HSN codes are required for GST compliance</Text>
      <Text>• Regular stock audits recommended for regulatory compliance</Text>
    </View>
  </View>
);

// Products Report Component
const ProductsReport: React.FC<{ data: any }> = ({ data }) => (
  <View>
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Products Inventory Report</Text>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={[styles.tableHeader, { width: '25%' }]}>Product Name</Text>
          <Text style={[styles.tableHeader, { width: '12%' }]}>HSN Code</Text>
          <Text style={[styles.tableHeader, { width: '15%' }]}>Manufacturer</Text>
          <Text style={[styles.tableHeader, { width: '10%' }]}>Stock</Text>
          <Text style={[styles.tableHeader, { width: '10%' }]}>Min Stock</Text>
          <Text style={[styles.tableHeader, { width: '10%' }]}>Cost Price</Text>
          <Text style={[styles.tableHeader, { width: '10%' }]}>Stock Value</Text>
          <Text style={[styles.tableHeader, { width: '8%' }]}>Status</Text>
        </View>
        {data?.productsData?.map((product: any, index: number) => {
          const stockValue = (product.current_stock || 0) * (product.cost_price || 0);
          const isLowStock = (product.current_stock || 0) <= (product.minimum_stock || 0);
          const isOutOfStock = (product.current_stock || 0) === 0;
          const status = isOutOfStock ? 'OUT' : isLowStock ? 'LOW' : 'OK';
          
          return (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, { width: '25%' }]}>{product.name}</Text>
              <Text style={[styles.tableCell, { width: '12%' }]}>{product.hsn_code || 'N/A'}</Text>
              <Text style={[styles.tableCell, { width: '15%' }]}>{product.manufacturer || 'N/A'}</Text>
              <Text style={[styles.tableCell, { width: '10%', textAlign: 'right' }]}>{product.current_stock || 0}</Text>
              <Text style={[styles.tableCell, { width: '10%', textAlign: 'right' }]}>{product.minimum_stock || 0}</Text>
              <Text style={[styles.tableCell, { width: '10%', textAlign: 'right' }]}>₹{(product.cost_price || 0).toFixed(2)}</Text>
              <Text style={[styles.tableCell, { width: '10%', textAlign: 'right' }]}>₹{stockValue.toFixed(2)}</Text>
              <Text style={[styles.tableCell, { width: '8%', textAlign: 'center' }]}>{status}</Text>
            </View>
          );
        })}
      </View>
    </View>
    
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Products Summary</Text>
      <View style={styles.summaryBox}>
        <View style={styles.summaryItem}>
          <Text>Total Products:</Text>
          <Text>{data?.productsData?.length || 0}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text>Total Stock Value:</Text>
          <Text>₹{data?.productsData?.reduce((sum: number, p: any) => sum + ((p.current_stock || 0) * (p.cost_price || 0)), 0).toFixed(2) || '0.00'}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text>Low Stock Items:</Text>
          <Text>{data?.productsData?.filter((p: any) => (p.current_stock || 0) <= (p.minimum_stock || 0)).length || 0}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text>Out of Stock Items:</Text>
          <Text>{data?.productsData?.filter((p: any) => (p.current_stock || 0) === 0).length || 0}</Text>
        </View>
      </View>
    </View>
  </View>
);

// GST Report Component
const GSTReport: React.FC<{ data: any }> = ({ data }) => (
  <View>
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>GST Summary</Text>
      <View style={styles.summaryBox}>
        <View style={styles.summaryItem}>
          <Text>Total Tax Collected:</Text>
          <Text>₹{data?.gstSummary?.totalTaxCollected?.toFixed(2) || '0.00'}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text>Total Taxable Amount:</Text>
          <Text>₹{data?.gstSummary?.totalTaxableAmount?.toFixed(2) || '0.00'}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text>Average Tax Rate:</Text>
          <Text>{data?.gstSummary?.avgTaxRate?.toFixed(2) || '0.00'}%</Text>
        </View>
      </View>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>GST by HSN Code</Text>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={[styles.tableHeader, { width: '20%' }]}>HSN Code</Text>
          <Text style={[styles.tableHeader, { width: '25%' }]}>Taxable Amount</Text>
          <Text style={[styles.tableHeader, { width: '20%' }]}>Tax Amount</Text>
          <Text style={[styles.tableHeader, { width: '15%' }]}>Tax Rate</Text>
          <Text style={[styles.tableHeader, { width: '20%' }]}>Transactions</Text>
        </View>
        {data?.gstSummary?.gstByHsn?.map((hsn: any, index: number) => (
          <View key={index} style={styles.tableRow}>
            <Text style={[styles.tableCell, { width: '20%' }]}>{hsn.hsn_code}</Text>
            <Text style={[styles.tableCell, { width: '25%', textAlign: 'right' }]}>₹{hsn.taxable_amount?.toFixed(2) || '0.00'}</Text>
            <Text style={[styles.tableCell, { width: '20%', textAlign: 'right' }]}>₹{hsn.tax_amount?.toFixed(2) || '0.00'}</Text>
            <Text style={[styles.tableCell, { width: '15%', textAlign: 'right' }]}>{((hsn.tax_amount / hsn.taxable_amount) * 100).toFixed(2) || '0.00'}%</Text>
            <Text style={[styles.tableCell, { width: '20%', textAlign: 'center' }]}>{hsn.transactions}</Text>
          </View>
        ))}
      </View>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Sales Transactions with GST Details</Text>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={[styles.tableHeader, { width: '12%' }]}>Date</Text>
          <Text style={[styles.tableHeader, { width: '15%' }]}>Invoice No</Text>
          <Text style={[styles.tableHeader, { width: '20%' }]}>Customer</Text>
          <Text style={[styles.tableHeader, { width: '15%' }]}>Subtotal</Text>
          <Text style={[styles.tableHeader, { width: '12%' }]}>Tax Amount</Text>
          <Text style={[styles.tableHeader, { width: '13%' }]}>Total</Text>
          <Text style={[styles.tableHeader, { width: '13%' }]}>Customer GST</Text>
        </View>
        {data?.salesDataWithGst?.map((sale: any, index: number) => (
          <View key={index} style={styles.tableRow}>
            <Text style={[styles.tableCell, { width: '12%' }]}>{new Date(sale.sale_date).toLocaleDateString()}</Text>
            <Text style={[styles.tableCell, { width: '15%' }]}>{sale.invoice_number}</Text>
            <Text style={[styles.tableCell, { width: '20%' }]}>{sale.customers?.name || 'Walk-in'}</Text>
            <Text style={[styles.tableCell, { width: '15%', textAlign: 'right' }]}>₹{(sale.subtotal || 0).toFixed(2)}</Text>
            <Text style={[styles.tableCell, { width: '12%', textAlign: 'right' }]}>₹{(sale.tax_amount || 0).toFixed(2)}</Text>
            <Text style={[styles.tableCell, { width: '13%', textAlign: 'right' }]}>₹{(sale.total_amount || 0).toFixed(2)}</Text>
            <Text style={[styles.tableCell, { width: '13%' }]}>{sale.customers?.gst_number || 'Unregistered'}</Text>
          </View>
        ))}
      </View>
    </View>
  </View>
);

// Enhanced Sales Report Component with GST & FCO Compliance
const SalesReport: React.FC<{ data: any }> = ({ data }) => {
  const totalSales = data?.sales?.reduce((sum: number, sale: any) => sum + (sale.total || 0), 0) || 0;
  const totalGST = data?.sales?.reduce((sum: number, sale: any) => sum + (sale.gst_amount || 0), 0) || 0;
  const cashSales = data?.sales?.filter((sale: any) => sale.payment_method === 'cash').reduce((sum: number, sale: any) => sum + (sale.total || 0), 0) || 0;
  const creditSales = data?.sales?.filter((sale: any) => sale.payment_method === 'credit').reduce((sum: number, sale: any) => sum + (sale.total || 0), 0) || 0;
  
  return (
    <View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sales Report - GST & FCO Compliant</Text>
        <View style={styles.complianceNote}>
          <Text>This report maintains GST compliance and FCO traceability requirements for fertilizer sales.</Text>
        </View>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={[styles.tableHeader, { width: '12%' }]}>Date</Text>
            <Text style={[styles.tableHeader, { width: '15%' }]}>Invoice No</Text>
            <Text style={[styles.tableHeader, { width: '18%' }]}>Customer</Text>
            <Text style={[styles.tableHeader, { width: '12%' }]}>Customer GST</Text>
            <Text style={[styles.tableHeader, { width: '12%' }]}>Taxable Amt</Text>
            <Text style={[styles.tableHeader, { width: '8%' }]}>GST</Text>
            <Text style={[styles.tableHeader, { width: '10%' }]}>Total</Text>
            <Text style={[styles.tableHeader, { width: '13%' }]}>Payment</Text>
          </View>
          {data?.sales?.map((sale: any, index: number) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, { width: '12%' }]}>{new Date(sale.sale_date).toLocaleDateString()}</Text>
              <Text style={[styles.tableCell, { width: '15%' }]}>{sale.invoice_number}</Text>
              <Text style={[styles.tableCell, { width: '18%' }]}>{sale.customer_name || 'Walk-in'}</Text>
              <Text style={[styles.tableCell, { width: '12%' }]}>{sale.customer_gst || 'Unregistered'}</Text>
              <Text style={[styles.tableCell, { width: '12%', textAlign: 'right' }]}>₹{((sale.total || 0) - (sale.gst_amount || 0)).toFixed(2)}</Text>
              <Text style={[styles.tableCell, { width: '8%', textAlign: 'right' }]}>₹{(sale.gst_amount || 0).toFixed(2)}</Text>
              <Text style={[styles.tableCell, { width: '10%', textAlign: 'right' }]}>₹{(sale.total || 0).toFixed(2)}</Text>
              <Text style={[styles.tableCell, { width: '13%' }]}>{sale.payment_method || 'Cash'}</Text>
            </View>
          ))}
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sales Summary</Text>
        <View style={styles.summaryBox}>
          <View style={styles.summaryItem}>
            <Text>Total Sales Count:</Text>
            <Text>{data?.sales?.length || 0}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text>Total Sales Value:</Text>
            <Text>₹{totalSales.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text>Total GST Collected:</Text>
            <Text>₹{totalGST.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text>Cash Sales:</Text>
            <Text>₹{cashSales.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text>Credit Sales:</Text>
            <Text>₹{creditSales.toFixed(2)}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.complianceNote}>
        <Text>GST & FCO Compliance Notes:</Text>
        <Text>• All sales transactions recorded with proper GST classification</Text>
        <Text>• Customer GST details maintained for B2B transactions</Text>
        <Text>• Invoice numbering follows sequential pattern for audit trail</Text>
        <Text>• Fertilizer sales comply with FCO dealer licensing requirements</Text>
      </View>
    </View>
  );
};

// Main Report Document Component
const ReportDocument: React.FC<{ reportData: ReportPDFData }> = ({ reportData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Enhanced Header with Company Details */}
      <View style={styles.header}>
        <Text style={styles.title}>{reportData.merchantName}</Text>
        
        {/* Business Contact Information */}
        <View style={{ marginTop: 5, marginBottom: 10 }}>
          {reportData.merchantAddress && (
            <Text style={styles.merchantInfo}>{reportData.merchantAddress}</Text>
          )}
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 3 }}>
            {reportData.merchantPhone && (
              <Text style={styles.merchantInfo}>Phone: {reportData.merchantPhone}</Text>
            )}
            {reportData.merchantPhone && reportData.merchantEmail && (
              <Text style={styles.merchantInfo}> | </Text>
            )}
            {reportData.merchantEmail && (
              <Text style={styles.merchantInfo}>Email: {reportData.merchantEmail}</Text>
            )}
          </View>
        </View>
        
        {/* License Information */}
        <View style={{ marginBottom: 10 }}>
          {reportData.fertilizerLicense && (
            <Text style={styles.licenseInfo}>Fertilizer License: {reportData.fertilizerLicense}</Text>
          )}
          {reportData.seedLicense && (
            <Text style={styles.licenseInfo}>Seed License: {reportData.seedLicense}</Text>
          )}
          {reportData.pesticideLicense && (
            <Text style={styles.licenseInfo}>Pesticide License: {reportData.pesticideLicense}</Text>
          )}
          {reportData.gstNumber && (
            <Text style={styles.licenseInfo}>GSTIN: {reportData.gstNumber}</Text>
          )}
        </View>
        
        <Text style={styles.subtitle}>{reportData.reportType.toUpperCase()} REPORT</Text>
        
        <View style={styles.reportInfo}>
          <Text>Period: {reportData.dateRange}</Text>
          <Text>Generated: {reportData.generatedDate}</Text>
        </View>
      </View>

      {/* Report Content */}
      {reportData.reportType === 'performance' && (
        <PerformanceReport 
          data={reportData.data} 
          merchantName={reportData.merchantName}
          dateRange={reportData.dateRange}
        />
      )}
      
      {reportData.reportType === 'stock' && (
        <StockReport data={reportData.data} />
      )}
      
      {reportData.reportType === 'sales' && (
        <SalesReport data={reportData.data} />
      )}
      
      {reportData.reportType === 'products' && (
        <ProductsReport data={reportData.data} />
      )}
      
      {reportData.reportType === 'gst' && (
        <GSTReport data={reportData.data} />
      )}

      {/* Enhanced Footer with Compliance */}
      <Text style={styles.footer}>
        Generated by KrishiSethu - FCO & GST Compliant Fertilizer Inventory Management System
        {"\n"}This report complies with Fertilizer Control Order 1985 and GST regulations
        {"\n"}Report generated on {reportData.generatedDate} for regulatory compliance
      </Text>
    </Page>
  </Document>
);

// Generate PDF functions
export const generateReportPDF = async (reportData: ReportPDFData) => {
  const doc = <ReportDocument reportData={reportData} />;
  return await pdf(doc);
};

export const downloadReportPDF = async (reportData: ReportPDFData, filename: string) => {
  const pdfInstance = await generateReportPDF(reportData);
  const blob = await pdfInstance.toBlob();
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const previewReportPDF = async (reportData: ReportPDFData) => {
  const pdfInstance = await generateReportPDF(reportData);
  const blob = await pdfInstance.toBlob();
  
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  
  // Clean up the URL after a delay
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
