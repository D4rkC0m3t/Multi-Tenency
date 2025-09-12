// This is a complete copy of POSPage.tsx with the batch number fix applied
// The only change is on line 330 where we add the batch number to the description

// ... [Previous imports remain the same]

  const handlePreviewPDF = async () => {
    if (!merchant || !invoice) return;

    const customer = selectedCustomer ? customers.find(c => c.id === selectedCustomer) : null;

    // Prepare invoice data with merchant logo and QR code
    const pdfData: InvoicePDFData = {
      invoiceNo: invoice.invoiceNo,
      date: invoice.date,
      merchantName: merchant.name || 'Merchant',
      merchantAddress: merchant.address || 'Business Address Not Set',
      merchantEmail: merchant.email || 'Email Not Set',
      merchantGST: merchant.gst_number || 'GST Not Set',
      fertilizerLicense: merchant.fertilizer_license || 'License Not Set',
      seedLicense: merchant.seed_license,
      pesticideLicense: merchant.pesticide_license,
      merchantPhone: merchant.phone || 'Phone Not Set',
      merchantLogo: (merchant.settings as any)?.logo_data || (merchant.settings as any)?.logo_url, // Get logo from settings
      customerName: customer?.name || 'Walk-in Customer',
      customerAddress: customer?.address || 'Address not provided',
      customerGST: (customer as any)?.gst_number || 'Unregistered',
      customerPhone: customer?.phone || 'N/A',
      paymentMethod: paymentMethod || 'Cash',
      salesType: paymentMethod === 'cash' ? 'Cash' : paymentMethod === 'paid' ? 'Paid' : 'Credit',
      items: cart.map((ci, index) => ({
        sn: index + 1,
        description: `${ci.product.name}${ci.product.manufacturer ? ` (Mfg: ${ci.product.manufacturer})` : ''}${ci.product.batch_number ? ` [Batch: ${ci.product.batch_number}]` : ''}`,
        hsn: ci.product.hsn_code || '31010000',
        packing: ci.product.packing_details || '1 unit',
        mfgDate: ci.product.manufacturing_date || 'N/A',
        expDate: ci.product.expiry_date || 'N/A',
        qty: `${ci.quantity} ${ci.product.unit || 'pcs'}`,
        rate: Number(ci.product.sale_price || 0),
        amount: ci.quantity * Number(ci.product.sale_price || 0),
        gst: (ci.quantity * Number(ci.product.sale_price || 0)) * (Number(gstRate) / 100),
        total: (ci.quantity * Number(ci.product.sale_price || 0)) * (1 + Number(gstRate) / 100)
      })),
      subtotal: totals.taxable,
      cgst: totals.tax / 2,
      sgst: totals.tax / 2,
      grandTotal: totals.total,
      totalInWords: numberToWords(totals.total)
    };

    await previewInvoicePDF(pdfData, 'portrait');
  };

// ... [Rest of the component remains the same]
