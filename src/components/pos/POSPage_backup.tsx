import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Paper
} from '@mui/material';
import { ShoppingCart as CartIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Product, Customer, Category } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface CartItem {
  product: Product;
  quantity: number;
}

const POSPage = () => {
  const { user, merchant } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch data
  useEffect(() => {
    if (merchant) {
      fetchData();
    }
  }, [merchant]);

  const fetchData = async () => {
    if (!merchant) return;
    
    try {
      const [productsRes, categoriesRes, customersRes] = await Promise.all([
        supabase
          .from('products')
          .select('*')
          .eq('merchant_id', merchant.id)
          .gt('current_stock', 0),
        supabase
          .from('categories')
          .select('*')
          .eq('merchant_id', merchant.id),
        supabase
          .from('customers')
          .select('*')
          .eq('merchant_id', merchant.id)
      ]);

      if (productsRes.error) throw productsRes.error;
      if (categoriesRes.error) throw categoriesRes.error;
      if (customersRes.error) throw customersRes.error;

      setProducts(productsRes.data || []);
      setCategories(categoriesRes.data || []);
      setCustomers(customersRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.current_stock) {
        toast.error('Insufficient stock');
        return;
      }
      setCart(cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
    toast.success(`${product.name} added to cart`);
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const total = cart.reduce((sum, item) => 
    sum + (item.quantity * Number(item.product.sale_price || 0)), 0
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Point of Sale
      </Typography>

      <Grid container spacing={3}>
        {/* Products Section */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ mb: 2 }}
            />
          </Paper>

          <Grid container spacing={2}>
            {filteredProducts.map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product.id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { boxShadow: 3 }
                  }}
                  onClick={() => addToCart(product)}
                >
                  <CardContent>
                    <Typography variant="h6" noWrap>
                      {product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Stock: {product.current_stock} {product.unit || 'units'}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      ₹{Number(product.sale_price || 0).toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Cart Section */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom>
              <CartIcon sx={{ mr: 1 }} />
              Cart ({cart.length} items)
            </Typography>

            {cart.length === 0 ? (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                Cart is empty
              </Typography>
            ) : (
              <>
                {cart.map((item) => (
                  <Box key={item.product.id} sx={{ mb: 2, p: 1, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Typography variant="subtitle2">
                      {item.product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.quantity} × ₹{Number(item.product.sale_price || 0).toFixed(2)}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                      <Typography variant="subtitle1">
                        ₹{(item.quantity * Number(item.product.sale_price || 0)).toFixed(2)}
                      </Typography>
                      <Button 
                        size="small" 
                        color="error"
                        onClick={() => removeFromCart(item.product.id)}
                      >
                        Remove
                      </Button>
                    </Box>
                  </Box>
                ))}

                <Box sx={{ mt: 3, pt: 2, borderTop: '2px solid #e0e0e0' }}>
                  <Typography variant="h6">
                    Total: ₹{total.toFixed(2)}
                  </Typography>
                  <Button 
                    variant="contained" 
                    fullWidth 
                    sx={{ mt: 2 }}
                    disabled={cart.length === 0}
                    onClick={() => {
                      toast.success('Sale completed!');
                      setCart([]);
                    }}
                  >
                    Complete Sale
                  </Button>
                </Box>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default POSPage;
          .eq('merchant_id', merchant.id)
          .eq('is_active', true)
      ]);

      if (productsRes.error) throw productsRes.error;
      if (categoriesRes.error) throw categoriesRes.error;
      if (customersRes.error) throw customersRes.error;

      setProducts(productsRes.data || []);
      setCategories(categoriesRes.data || []);
      setCustomers(customersRes.data || []);

      // Generate invoice number
      setInvoiceNumber(`INV-${Date.now()}`);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (merchant) {
      fetchData();
    }
  }, [merchant]);

  // Complete sale
  const completeSale = async () => {
    if (!merchant) return;
    try {
      const [productsRes, categoriesRes, customersRes] = await Promise.all([
        supabase
          .from('products')
          .select('*, category:categories(id, name)')
          .eq('merchant_id', merchant.id)
          .gt('current_stock', 0),
        supabase
          .from('categories')
          .select('*')
          .eq('merchant_id', merchant.id),
        supabase
          .from('customers')
          .select('*')
          .eq('merchant_id', merchant.id)
          .eq('is_active', true)
      ]);
      
      if (productsRes.error) throw productsRes.error;
      if (categoriesRes.error) throw categoriesRes.error;
      if (customersRes.error) throw customersRes.error;
      
      setProducts(productsRes.data || []);
      setCategories(categoriesRes.data || []);
      setCustomers(customersRes.data || []);
      
      // Generate invoice number
      setInvoiceNumber(`INV-${Date.now()}`);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    if (existingItem) {
      if (existingItem.quantity < product.current_stock) {
        setCart(cart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      } else {
        toast.error('Insufficient stock');
      }
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    const product = products.find(p => p.id === productId);
    if (product && quantity > product.current_stock) {
      toast.error('Insufficient stock');
      return;
    }

    setCart(cart.map(item =>
      item.product.id === productId
        ? { ...item, quantity }
        : item
    ));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  // Enhanced stock display: infer pack sizes and show primary units + total base units
  const getStockDisplay = (product: Product) => {
    const stock = Number(product.current_stock || 0);
    const baseUnit = inferBaseUnit(product) || 'pcs';

    // If no stock
    if (!stock || stock <= 0) return `0 ${formatUnit(baseUnit)}`;

    // Determine pack size in base units (e.g., 50 for 50 kg; 1 for 1 litre)
    const packInfo = inferPackInfo(product, baseUnit);
    const packSize = packInfo.size; // in base units
    const primaryUom = packInfo.primaryUom; // Bag/Bottle/Box/Packet

    // If we couldn't determine a pack size, fallback to base unit display
    if (!packSize || packSize <= 0) {
      const display = formatBaseWithLargeUnits(stock, baseUnit);
      return maybeLowStock(display, stock, product.minimum_stock);
    }

    // Compute full primary units and leftover base units
    const primaryUnits = Math.floor(stock / packSize);
    const remainder = stock % packSize;

    // Compose readable display
    const totalText = `${stock} ${formatUnit(baseUnit)}`;
    const primaryLabel = pluralize(primaryUom, primaryUnits);
    if (primaryUnits > 0 && remainder > 0) {
      return `${primaryUnits} ${primaryLabel} + ${remainder} ${formatUnit(baseUnit)}`;
    }
    if (primaryUnits > 0 && remainder === 0) {
      return `${primaryUnits} ${primaryLabel} (${totalText})`;
    }
    // Less than one pack
    return `${stock} ${formatUnit(baseUnit)} loose`;
  };

  // Infer base unit from product fields
  function inferBaseUnit(product: Product): 'kg' | 'litre' | 'pcs' | undefined {
    // 1) Trust explicit base_unit if present
    if (product.base_unit) {
      const b = product.base_unit.toLowerCase();
      if (b.includes('kg')) return 'kg';
      if (b.includes('l') || b.includes('ltr') || b.includes('lit') || b.includes('liter')) return 'litre';
      return 'pcs';
    }
    // 2) Derive from unit field
    const u = (product.unit || '').toLowerCase();
    if (u.includes('kg')) return 'kg';
    if (u.includes('l') || u.includes('ltr') || u.includes('lit') || u.includes('liter')) return 'litre';

    // 3) Heuristics from name/packing details/fertilizer type
    const text = [product.name, product.packing_details, product.sku, product.fertilizer_type]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    const looksLiquid = text.includes('liquid') || text.includes('l ') || text.includes('ml') || text.includes('bottle');
    if (looksLiquid) return 'litre';

    const looksSolid = text.includes('urea') || text.includes('dap') || text.includes('mop') ||
      text.includes('potash') || text.includes('npk') || text.includes('granule') || text.includes('powder') || text.includes('bag');
    if (looksSolid) return 'kg';

    return undefined;
  }

  // Try to infer pack size and primary UOM
  function inferPackInfo(product: Product, baseUnit: 'kg' | 'litre' | 'pcs') {
    // If explicit unit_size provided, trust it
    if (product.unit_size && product.unit_size > 0) {
      return { size: Number(product.unit_size), primaryUom: inferPrimaryUom(product, baseUnit) };
    }

    // Parse from packing_details, name, or sku
    const sources = [product.packing_details, product.name, product.sku].filter(Boolean).join(' ').toLowerCase();
    // Match patterns like "50 kg", "1kg", "1 l", "1l", "500 ml"
    const match = sources.match(/(\d+(?:\.\d+)?)\s*(kg|kgs|kilogram|kilograms|l|ltr|litre|liter|ml|milliliter|millilitre)/i);
    if (match) {
      const qty = Number(match[1]);
      const unit = match[2].toLowerCase();
      let sizeInBase = qty;
      if (baseUnit === 'kg') {
        // Already kg
        sizeInBase = qty;
      } else if (baseUnit === 'litre') {
        if (unit === 'ml' || unit.includes('mill')) sizeInBase = qty / 1000; else sizeInBase = qty;
      }
      return { size: sizeInBase, primaryUom: inferPrimaryUom(product, baseUnit) };
    }

    // Sensible defaults for fertilizers
    if (baseUnit === 'kg') {
      // Common 50 kg bag default for solid fertilizers
      return { size: 50, primaryUom: 'Bag' as const };
    }
    if (baseUnit === 'litre') {
      // Common 1 L bottle default for liquids
      return { size: 1, primaryUom: 'Bottle' as const };
    }
    return { size: 0, primaryUom: 'Unit' as const };
  }

  function inferPrimaryUom(product: Product, baseUnit: 'kg' | 'litre' | 'pcs'): 'Bag' | 'Bottle' | 'Box' | 'Packet' | 'Unit' {
    const u = (product.unit || '').toLowerCase();
    if (u.includes('bag')) return 'Bag';
    if (u.includes('bottle')) return 'Bottle';
    if (u.includes('box')) return 'Box';
    if (u.includes('packet') || u.includes('sachet') || u.includes('pouch')) return 'Packet';
    if (baseUnit === 'kg') return 'Bag';
    if (baseUnit === 'litre') return 'Bottle';
    return 'Unit';
  }

  function pluralize(label: string, qty: number) {
    if (qty === 1) return label;
    // Basic pluralization rules
    if (label.endsWith('x')) return `${label}es`;
    return `${label}s`;
  }

  function formatUnit(u: string) {
    if (u === 'litre') return 'L';
    if (u === 'kg') return 'kg';
    return u;
  }

  function formatBaseWithLargeUnits(stock: number, baseUnit: string) {
    const b = baseUnit.toLowerCase();
    if (b === 'kg' && stock >= 1000) return `${(stock / 1000).toFixed(1)} Tonnes (${stock} kg)`;
    if ((b === 'litre' || b === 'l') && stock >= 1000) return `${(stock / 1000).toFixed(1)} KL (${stock} L)`;
    return `${stock} ${formatUnit(b)}`;
  }

  function maybeLowStock(text: string, stock: number, min?: number) {
    if (typeof min === 'number' && stock <= min) return `${text} (Low Stock)`;
    return text;
  }

  // Hold bill functionality
  const holdBill = () => {
    if (cart.length === 0) return;
    
    const customer = customers.find(c => c.id === selectedCustomer);
    const newHeldBill = {
      id: `HOLD-${Date.now()}`,
      customerName: customer?.name || 'Walk-in Customer',
      items: [...cart],
      timestamp: new Date(),
      total: total
    };
    
    setHeldBills([...heldBills, newHeldBill]);
    setCart([]);
    setSelectedCustomer('');
    setDiscountValue(0);
    toast.success('Bill held successfully');
  };

  // Resume held bill
  const resumeHeldBill = (heldBill: typeof heldBills[0]) => {
    setCart(heldBill.items);
    setHeldBills(heldBills.filter(bill => bill.id !== heldBill.id));
    setShowHeldBills(false);
    toast.success('Bill resumed');
  };


  // Generate QR Code as base64 string
  const generateQRCodeBase64 = async (data: string): Promise<string> => {
    try {
      const qrCodeDataURL = await QRCode.toDataURL(data, {
        width: 200,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      // Return just the base64 part without the data URL prefix
      return qrCodeDataURL.split(',')[1];
    } catch (error) {
      console.error('QR Code generation error:', error);
      return '';
    }
  };

  // Generate invoice data using exact format
  const generateInvoiceData = async (customer: Customer | null): Promise<ExactEInvoiceData> => {
    if (!merchant) throw new Error('Merchant not available');
    
    // Determine if transaction is interstate
    const isInterstate = !!(customer?.state && merchant.state && 
      customer.state.toLowerCase() !== merchant.state.toLowerCase());
    
    const invoiceItems: ExactEInvoiceItem[] = cart.map((item, index) => {
      const itemAmount = item.quantity * Number(item.product.sale_price || 0);
      const itemTaxAmount = (itemAmount * gstRate) / 100;
      
      return {
        sr: index + 1,
        description: `${item.product.name}${item.product.manufacturer ? `\nMfg: ${item.product.manufacturer}` : ''}`,
        lotBatch: item.product.batch_number || `LOT/Batch: ${item.product.sku || 'N/A'}`,
        hsn: item.product.hsn_code || '31010000',
        gst: gstRate,
        mfgDate: item.product.manufacturing_date || '',
        expiryDate: item.product.expiry_date || '',
        qty: item.quantity,
        unit: item.product.unit || 'PCS',
        rate: Number(item.product.sale_price || 0),
        amount: itemAmount,
        manufacturer: item.product.manufacturer || 'Not Specified',
        packingDetails: item.product.packing_details || `${item.quantity} ${item.product.unit || 'PCS'}`,
        cgstAmount: isInterstate ? 0 : itemTaxAmount / 2,
        sgstAmount: isInterstate ? 0 : itemTaxAmount / 2,
        igstAmount: isInterstate ? itemTaxAmount : 0
      };
    });

    // Generate proper E-Invoice identifiers
    const timestamp = Date.now();
    const invoiceRef = invoiceNumber || `INV-${timestamp}`;
    
    return {
      ackNo: `ACK${timestamp.toString().slice(-10)}`,
      ackDate: new Date().toLocaleDateString('en-IN'),
      irn: `IRN${timestamp.toString().slice(-16)}`,
      signedQRCode: await generateQRCodeBase64(`${merchant.gstin || ''}|${customer?.gst_number || ''}|${invoiceRef}|${new Date().toLocaleDateString('en-IN')}|${total.toFixed(2)}|${timestamp.toString().slice(-16)}`),
      
      companyName: merchant.business_name || merchant.name || 'KrishiSethu Merchant',
      companyAddress: [
        merchant.address || 'Business Address',
        `${merchant.state || ''}, PIN: ${merchant.pin_code || ''}`
      ],
      gstin: merchant.gstin || 'GSTIN_NOT_SET',
      stateName: merchant.state || 'State',
      stateCode: '27',
      mobile: merchant.phone || '',
      email: merchant.email || '',
      
      // Fertilizer Licensing Details
      fertilizerLicense: merchant.fertilizer_license || '',
      seedLicense: merchant.seed_license || '',
      pesticideLicense: merchant.pesticide_license || '',
      
      invoiceNo: invoiceNumber || `INV-${Date.now()}`,
      invoiceDate: new Date().toLocaleDateString('en-IN'),
      modeTermsOfPayment: paymentMethod.toUpperCase(),
      eWayBillNo: '',
      eWayBillDate: '',
      despatchThrough: 'Four Wheeler/Tata Ace',
      destination: customer?.address || 'Customer Location',
      otherReferences: '',
      vehicleNo: '',
      dateTimeOfSupply: new Date().toLocaleString('en-IN'),
      
      buyerName: customer?.name || 'Walk-in Customer',
      buyerAddress: [
        customer?.address || 'Customer Address',
        `${customer?.state || ''}`
      ],
      buyerGstin: customer?.gst_number,
      buyerStateName: customer?.state || merchant.state || 'State',
      buyerStateCode: '27',
      buyerMobile: customer?.phone || '',
      buyerContactDetails: customer?.phone || '',
      
      items: invoiceItems,
      
      hsnSac: '31010000',
      taxableValue: taxableAmount,
      gstRate: gstRate,
      gstAmount: tax,
      cgstAmount: isInterstate ? 0 : tax / 2,
      sgstAmount: isInterstate ? 0 : tax / 2,
      igstAmount: isInterstate ? tax : 0,
      taxAmount: tax,
      roundOff: 0,
      invoiceTotal: total,
      isInterstate: isInterstate,
      
      amountInWords: convertToWords(total),
      
      previousOutstanding: 0,
      currentInvoice: total,
      totalOutstanding: paymentStatus === 'unpaid' ? total : (paymentStatus === 'partial' ? total / 2 : 0),
      
      bankName: merchant.bank_name || '',
      accountNo: merchant.account_number ? `****${merchant.account_number.slice(-4)}` : '',
      branchIfsc: merchant.ifsc_code || '',
      
      jurisdiction: merchant.state || 'State'
    };
  };

  // Convert number to words (simplified)
  const convertToWords = (amount: number): string => {
    // This is a simplified version - you might want to use a proper library
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    if (amount === 0) return 'Zero Rupees Only';
    
    let rupees = Math.floor(amount);
    const paise = Math.round((amount - rupees) * 100);
    
    let result = '';
    
    if (rupees < 1000) {
      if (rupees >= 100) {
        result += ones[Math.floor(rupees / 100)] + ' Hundred ';
        rupees %= 100;
      }
      if (rupees >= 20) {
        result += tens[Math.floor(rupees / 10)] + ' ';
        rupees %= 10;
      } else if (rupees >= 10) {
        result += teens[rupees - 10] + ' ';
        rupees = 0;
      }
      if (rupees > 0) {
        result += ones[rupees] + ' ';
      }
    } else {
      result = `${rupees} `;
    }
    
    result += 'Rupees';
    if (paise > 0) {
      result += ` and ${paise} Paise`;
    }
    result += ' Only';
    
    return result;
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    if (!merchant) {
      toast.error('Merchant information not available');
      return;
    }

    try {
      // Create sale record with enhanced data
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert({
          merchant_id: merchant.id,
          customer_id: selectedCustomer || null,
          invoice_number: invoiceNumber || `INV-${Date.now()}`,
          sale_date: new Date().toISOString(),
          subtotal: subtotal,
          discount_amount: discountAmount,
          tax_amount: tax,
          total_amount: total,
          payment_method: paymentMethod,
          payment_status: paymentStatus,
          cgst_amount: tax / 2, // Split GST for intra-state
          sgst_amount: tax / 2,
          igst_amount: 0,
          cess_amount: 0,
          round_off_amount: 0,
          previous_outstanding: 0,
          total_outstanding: paymentStatus === 'unpaid' ? total : (paymentStatus === 'partial' ? total / 2 : 0),
          einvoice_status: 'not_applicable',
          is_einvoice_eligible: false
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // Create sale items with enhanced data
      const saleItems = cart.map(item => ({
        sale_id: sale.id,
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: Number(item.product.sale_price || 0),
        total_price: item.quantity * Number(item.product.sale_price || 0),
        total_amount: item.quantity * Number(item.product.sale_price || 0),
        taxable_amount: item.quantity * Number(item.product.sale_price || 0),
        cgst_amount: (item.quantity * Number(item.product.sale_price || 0) * gstRate) / 200,
        sgst_amount: (item.quantity * Number(item.product.sale_price || 0) * gstRate) / 200,
        igst_amount: 0,
        cess_amount: 0
      }));

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems);

      if (itemsError) throw itemsError;

      // Update product stock
      for (const item of cart) {
        const { error: stockError } = await supabase
          .from('products')
          .update({ 
            current_stock: item.product.current_stock - item.quantity 
          })
          .eq('id', item.product.id);
        
        if (stockError) throw stockError;
      }

      // Generate invoice data and show dialog
      const customer = customers.find(c => c.id === selectedCustomer) || null;
      const invoice = await generateInvoiceData(customer);
      setInvoiceData(invoice);
      setShowInvoiceDialog(true);

      toast.success('Sale completed successfully!');
      setCart([]);
      setSelectedCustomer('');
      setDiscountValue(0);
      setInvoiceNumber(`INV-${Date.now()}`);
      fetchData(); // Refresh to update stock levels
    } catch (error) {
      console.error('Error completing sale:', error);
      toast.error('Failed to complete sale');
    }
  };
  // Filter products based on category and search query
  const filteredProducts = products.filter(product => {
    // Category filter
    const categoryMatch = selectedCategory === 'all' || product.category_id === selectedCategory;
    
    // Search filter
    const searchMatch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product.brand && product.brand.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return categoryMatch && searchMatch;
  });

  // Enhanced calculations with custom GST and discount
  const subtotal = cart.reduce((sum, item) => sum + (Number(item.product.sale_price || 0) * item.quantity), 0);
  const discountAmount = discountType === 'percentage' 
    ? (subtotal * discountValue) / 100 
    : discountValue;
  const taxableAmount = subtotal - discountAmount;
  const tax = (taxableAmount * gstRate) / 100;
  const total = taxableAmount + tax;
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Main Content */}
      <Box sx={{ flex: 1, p: 2, pr: 1 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" fontWeight="bold">Point of Sale</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Search Bar */}
            <TextField
              size="small"
              placeholder="Search products by name, SKU, or brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ width: 300 }}
            />
            <Badge badgeContent={totalItems} color="error">
              <CartIcon sx={{ color: '#2196f3' }} />
            </Badge>
          </Box>
        </Box>

        {/* Category Tabs */}
        <Box sx={{ mb: 2 }}>
          <Tabs 
            value={selectedCategory} 
            onChange={(_, value) => setSelectedCategory(value)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="All Items" value="all" />
            {categories.map((category) => (
              <Tab key={category.id} label={category.name} value={category.id} />
            ))}
          </Tabs>
        </Box>

        {/* Products Grid - Card Layout */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {filteredProducts.map((product, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': { 
                    transform: 'translateY(-2px)',
                    boxShadow: 3
                  },
                  border: '1px solid #e0e0e0',
                  borderRadius: 2
                }}
                onClick={() => addToCart(product)}
              >
                {/* Product Image */}
                <Box sx={{ 
                  height: 160, 
                  bgcolor: '#f8f9fa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {product.image_path ? (
                    <img
                      src={`${supabase.storage.from('product-images').getPublicUrl(product.image_path).data.publicUrl}`}
                      alt={product.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        padding: '8px'
                      }}
                    />
                  ) : (
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: 'text.secondary'
                    }}>
                      <Typography variant="h3" sx={{ mb: 1, fontWeight: 300 }}>
                        {product.name.charAt(0)}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          bgcolor: 'rgba(0,0,0,0.1)',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          fontSize: '0.7rem'
                        }}
                      >
                        No Image
                      </Typography>
                    </Box>
                  )}
                  {product.current_stock <= (product.minimum_stock || 0) && (
                    <Chip 
                      label="Low Stock" 
                      size="small" 
                      color="error" 
                      sx={{ 
                        position: 'absolute',
                        top: 6,
                        right: 6,
                        fontSize: '0.6rem',
                        height: 20
                      }}
                    />
                  )}
                </Box>

                <CardContent sx={{ flexGrow: 1, p: 1.5 }}>
                  {/* Product Name */}
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      mb: 0.25,
                      lineHeight: 1.1,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {product.name}
                  </Typography>

                  {/* SKU */}
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ 
                      display: 'block',
                      mb: 0.5,
                      fontSize: '0.65rem'
                    }}
                  >
                    SKU: {product.sku || `${product.fertilizer_type?.slice(0,3).toUpperCase() || 'PRD'}-${index + 1}`}
                  </Typography>

                  {/* Enhanced Stock Display */}
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: product.current_stock <= (product.minimum_stock || 0) ? 'error.main' : 'success.main',
                      mb: 0.5
                    }}
                  >
                    Stock: {getStockDisplay(product)}
                  </Typography>

                  {/* Brand */}
                  {product.brand && (
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ 
                        fontSize: '0.7rem',
                        mb: 0.5
                      }}
                    >
                      {product.brand}
                    </Typography>
                  )}
                </CardContent>

                {/* Price and Add Button */}
                <Box sx={{ p: 1.5, pt: 0 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product);
                    }}
                    disabled={product.current_stock <= 0}
                    sx={{ 
                      bgcolor: '#2196f3',
                      color: 'white',
                      fontWeight: 600,
                      py: 0.75,
                      fontSize: '0.8rem',
                      '&:hover': { bgcolor: '#1976d2' },
                      '&:disabled': { bgcolor: '#ccc' }
                    }}
                  >
                    ₹{Number(product.sale_price || 0).toFixed(2)}
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Fixed Cart Sidebar */}
      <Box 
        sx={{ 
          width: 420, 
          bgcolor: 'white', 
          borderLeft: '1px solid #e0e0e0',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh'
        }}
      >
        {/* Cart Header */}
        <Box sx={{ 
          p: 3, 
          borderBottom: '1px solid #e0e0e0',
          bgcolor: '#f8f9fa'
        }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600,
              color: '#1976d2',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            🛒 Cart ({totalItems} items)
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            ₹{total.toFixed(2)}
          </Typography>
        </Box>
        
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          
          {cart.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CartIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography color="text.secondary">Cart is empty</Typography>
            </Box>
          ) : (
            <Box sx={{ p: 2 }}>
              {/* Cart Items */}
              <Box sx={{ mb: 3 }}>
                {cart.map((item) => (
                  <Box 
                    key={item.product.id} 
                    sx={{ 
                      p: 2, 
                      mb: 2, 
                      border: '1px solid #e0e0e0',
                      borderRadius: 2,
                      bgcolor: '#fafafa'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      {/* Product Avatar */}
                      <Avatar
                        sx={{ 
                          width: 40, 
                          height: 40, 
                          bgcolor: '#e3f2fd',
                          color: 'primary.main',
                          fontSize: '1rem',
                          fontWeight: 'bold'
                        }}
                      >
                        {item.product.name.charAt(0)}
                      </Avatar>
                      
                      {/* Product Details */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography 
                          variant="subtitle2" 
                          sx={{ 
                            fontWeight: 600,
                            mb: 0.5,
                            lineHeight: 1.2
                          }}
                          noWrap
                        >
                          {item.product.name}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ fontSize: '0.875rem' }}
                        >
                          ₹{Number(item.product.sale_price || 0).toFixed(2)} each
                        </Typography>
                        <Typography 
                          variant="caption" 
                          color="success.main"
                          sx={{ 
                            fontSize: '0.75rem',
                            display: 'block',
                            mt: 0.5
                          }}
                        >
                          Stock: {getStockDisplay(item.product)}
                        </Typography>
                      </Box>
                      
                      {/* Remove Button */}
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => removeFromCart(item.product.id)}
                        sx={{ mt: -0.5 }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    
                    {/* Quantity Controls & Total */}
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      mt: 2,
                      pt: 1.5,
                      borderTop: '1px solid #e0e0e0'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton 
                          size="small" 
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          sx={{ 
                            bgcolor: '#f5f5f5',
                            '&:hover': { bgcolor: '#e0e0e0' }
                          }}
                        >
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            minWidth: 40,
                            textAlign: 'center',
                            fontWeight: 600,
                            bgcolor: 'white',
                            border: '1px solid #e0e0e0',
                            borderRadius: 1,
                            py: 0.5,
                            px: 1
                          }}
                        >
                          {item.quantity}
                        </Typography>
                        <IconButton 
                          size="small" 
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          sx={{ 
                            bgcolor: '#f5f5f5',
                            '&:hover': { bgcolor: '#e0e0e0' }
                          }}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 600,
                          color: '#1976d2'
                        }}
                      >
                        ₹{(item.quantity * Number(item.product.sale_price || 0)).toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              {/* Enhanced Cart Controls */}
              <Box sx={{ 
                bgcolor: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: 2,
                p: 2,
                mb: 2
              }}>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    fontWeight: 600,
                    mb: 2,
                    color: '#1976d2'
                  }}
                >
                  Sale Details
                </Typography>
                
                {/* Customer Selection */}
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel size="small">Customer</InputLabel>
                  <Select
                    size="small"
                    value={selectedCustomer}
                    onChange={(e: SelectChangeEvent) => setSelectedCustomer(e.target.value as string)}
                    startAdornment={<PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />}
                  >
                    <MenuItem value="">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon fontSize="small" />
                        Walk-in Customer
                      </Box>
                    </MenuItem>
                    {customers.map((customer) => (
                      <MenuItem key={customer.id} value={customer.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PersonIcon fontSize="small" />
                          {customer.name}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Invoice Number */}
                <TextField
                  fullWidth
                  size="small"
                  label="Invoice Number"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: <ReceiptIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />

                {/* GST Rate */}
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel size="small">GST Rate (%)</InputLabel>
                  <Select
                    size="small"
                    value={String(gstRate)}
                    onChange={(e: SelectChangeEvent) => setGstRate(Number(e.target.value))}
                  >
                    <MenuItem value="18">18% - Standard Rate</MenuItem>
                    <MenuItem value="0">0% - Exempt</MenuItem>
                    <MenuItem value="5">5% - Essential Items</MenuItem>
                    <MenuItem value="12">12% - Standard Rate</MenuItem>
                    <MenuItem value="28">28% - Luxury Items</MenuItem>
                  </Select>
                </FormControl>

                {/* Discount Controls */}
                <Box sx={{ mb: 2 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 600,
                      mb: 1,
                      color: 'text.primary'
                    }}
                  >
                    Discount
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={discountType === 'percentage'}
                          onChange={(e) => setDiscountType(e.target.checked ? 'percentage' : 'amount')}
                        />
                      }
                      label={
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {discountType === 'percentage' ? '%' : '₹'}
                        </Typography>
                      }
                      sx={{ mr: 1 }}
                    />
                    <TextField
                      size="small"
                      type="number"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(Number(e.target.value))}
                      inputProps={{ 
                        min: 0, 
                        max: discountType === 'percentage' ? 100 : subtotal,
                        style: { textAlign: 'center' }
                      }}
                      sx={{ width: 80 }}
                    />
                  </Box>
                </Box>

                {/* Payment Method & Status in Row */}
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel size="small">Payment Method</InputLabel>
                    <Select
                      size="small"
                      value={paymentMethod}
                      onChange={(e: SelectChangeEvent) => setPaymentMethod(e.target.value as 'cash' | 'card' | 'upi' | 'bank_transfer')}
                    >
                      <MenuItem value="cash">Cash</MenuItem>
                      <MenuItem value="card">Card</MenuItem>
                      <MenuItem value="upi">UPI</MenuItem>
                      <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel size="small">Payment Status</InputLabel>
                    <Select
                      size="small"
                      value={paymentStatus}
                      onChange={(e: SelectChangeEvent) => setPaymentStatus(e.target.value as 'paid' | 'unpaid' | 'partial')}
                    >
                      <MenuItem value="paid">Paid</MenuItem>
                      <MenuItem value="unpaid">Unpaid</MenuItem>
                      <MenuItem value="partial">Partial</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />
              
              {/* Bill Summary */}
              <Box sx={{ 
                bgcolor: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: 2,
                p: 2,
                mb: 2
              }}>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    fontWeight: 600,
                    mb: 2,
                    color: '#1976d2'
                  }}
                >
                  Bill Summary
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Subtotal:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>₹{subtotal.toFixed(2)}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Taxable Amount:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>₹{taxableAmount.toFixed(2)}</Typography>
                </Box>
                
                {discountAmount > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Discount:</Typography>
                    <Typography variant="body2" color="error.main" sx={{ fontWeight: 600 }}>
                      -₹{discountAmount.toFixed(2)}
                    </Typography>
                  </Box>
                )}
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">GST ({gstRate}%):</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>₹{tax.toFixed(2)}</Typography>
                </Box>
                
                <Divider sx={{ my: 1 }} />
                
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  bgcolor: '#f8f9fa',
                  p: 1.5,
                  borderRadius: 1,
                  border: '1px solid #e3f2fd'
                }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 700,
                      color: '#1976d2'
                    }}
                  >
                    Total:
                  </Typography>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 700,
                      color: '#1976d2'
                    }}
                  >
                    ₹{total.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

        {/* Cart Actions */}
        <Box sx={{ 
          p: 3, 
          borderTop: '1px solid #e0e0e0',
          bgcolor: '#f8f9fa'
        }}>
          <Button 
            variant="contained" 
            fullWidth 
            size="large"
            onClick={handleCheckout}
            disabled={cart.length === 0}
            sx={{ 
              mb: 2,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
              bgcolor: '#1976d2',
              '&:hover': { bgcolor: '#1565c0' },
              '&:disabled': { bgcolor: '#ccc' }
            }}
          >
            Complete Sale - ₹{total.toFixed(2)}
          </Button>
          
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Button 
              variant="outlined" 
              fullWidth 
              onClick={holdBill}
              disabled={cart.length === 0}
              size="medium"
              sx={{ 
                borderColor: '#1976d2',
                color: '#1976d2',
                '&:hover': { 
                  borderColor: '#1565c0',
                  bgcolor: '#e3f2fd'
                }
              }}
            >
              Hold Bill
            </Button>
            
            <Button 
              variant="outlined" 
              fullWidth 
              onClick={() => setCart([])}
              disabled={cart.length === 0}
              size="medium"
              sx={{ 
                borderColor: '#f44336',
                color: '#f44336',
                '&:hover': { 
                  borderColor: '#d32f2f',
                  bgcolor: '#ffebee'
                }
              }}
            >
              Clear Cart
            </Button>
          </Box>
          
          {heldBills.length > 0 && (
            <Button 
              variant="text" 
              fullWidth 
              onClick={() => setShowHeldBills(true)}
              size="medium"
              sx={{ 
                color: '#1976d2',
                fontWeight: 600,
                '&:hover': { bgcolor: '#e3f2fd' }
              }}
            >
              📋 View Held Bills ({heldBills.length})
            </Button>
          )}
        </Box>
      </Box>

      {/* Invoice Dialog */}
      <Dialog open={showInvoiceDialog} onClose={() => setShowInvoiceDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Invoice Generated</DialogTitle>
          <DialogContent>
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="h6" gutterBottom>
                Sale completed successfully!
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Invoice #{invoiceData?.invoiceNo} has been generated.
              </Typography>
              <Typography variant="body1" sx={{ mt: 2, mb: 3 }}>
                Total Amount: ₹{invoiceData?.invoiceTotal.toFixed(2)}
              </Typography>
              
              {invoiceData && (
                <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Button variant="contained" color="success" onClick={handleDownloadSingleInvoice}>
                    Download E-Invoice PDF
                  </Button>
                  <Button variant="contained" color="success" onClick={handleDownloadDualInvoice}>
                    Download Dual Invoice (A4 50-50)
                  </Button>
                  <Button variant="contained" color="secondary" onClick={handleViewInvoiceInNewTab}>
                    View in New Tab / Print
                  </Button>
                </Box>
              )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowInvoiceDialog(false)}
            variant="outlined"
          >
            Close
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setShowInvoiceDialog(false);
              setCart([]);
              setSelectedCustomer('');
              setDiscountValue(0);
            }}
          >
            New Sale
          </Button>
        </DialogActions>
      </Dialog>

      {/* Held Bills Dialog */}
      <Dialog open={showHeldBills} onClose={() => setShowHeldBills(false)} maxWidth="md" fullWidth>
        <DialogTitle>Held Bills ({heldBills.length})</DialogTitle>
        <DialogContent>
          <List>
            {heldBills.map((bill) => (
              <ListItem key={bill.id} divider>
                <ListItemText
                  primary={`${bill.customerName} - ₹${bill.total.toFixed(2)}`}
                  secondary={`${bill.items.length} items • ${bill.timestamp.toLocaleString()}`}
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => resumeHeldBill(bill)}
                  sx={{ mr: 1 }}
                >
                  Resume
                </Button>
                <IconButton
                  color="error"
                  onClick={() => setHeldBills(heldBills.filter(b => b.id !== bill.id))}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowHeldBills(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default POSPage;
