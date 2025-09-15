import { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, CardMedia, Button, TextField, 
  Paper, IconButton, Divider, Dialog, DialogTitle, DialogContent, 
  DialogActions, FormControl, InputLabel, Select, MenuItem, Chip,
  Stack, CircularProgress, Alert, DialogContentText, List, ListItem, ListItemText
} from '@mui/material';
import { 
  Add as AddIcon, Remove as RemoveIcon, Delete as DeleteIcon,
  Inventory as StockIcon, Pause as PauseIcon, Print as PrintIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Product, Customer } from '../../lib/supabase';
import { ExactEInvoiceData, ExactEInvoiceDocument } from '../../lib/exactFormatEInvoicePdf';
import { pdf } from '@react-pdf/renderer';
// import EInvoiceManager from '../sales/EInvoiceManager'; // Unused import
import { InvoiceQRCode } from '../common/InvoiceQRCode';
import { BatchSelectionDialog } from './BatchSelectionDialog';
import DualCopyInvoice from './DualCopyInvoice';
// import { convertToWords } from '../../lib/numberToWords'; // Temporarily disabled
import toast from 'react-hot-toast';

interface BatchSelection {
  batch_id: string;
  quantity: number;
}

interface CustomerDetails {
  id: string;
  name: string;
  phone?: string;
  gstin?: string;
  address?: string;
  village?: string;
  district?: string;
}

interface CartItem {
  product: Product;
  quantity: number;
  paymentStatus?: 'paid' | 'unpaid' | 'partial';
  batchSelections?: BatchSelection[];
  customer?: CustomerDetails;
}

const POSPage = () => {
  const { merchant } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  
  // Feature flag for enhanced customer search
  const enableEnhancedSearch = import.meta.env.VITE_ENABLE_ENHANCED_CUSTOMER_SEARCH === 'true';
  
  // State for advanced customer search (only if feature is enabled)
  const [customerSearchField, setCustomerSearchField] = useState<'name' | 'phone' | 'gstin' | 'village' | 'all'>('all');
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  
  // Invoice & Checkout States
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [processingCheckout, setProcessingCheckout] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<any>(null);
  const [lastSaleData, setLastSaleData] = useState<any>(null);
  const [discount, setDiscount] = useState<number>(0);
  const [discountType, setDiscountType] = useState<'percentage' | 'amount'>('percentage');
  const [customGstRate, setCustomGstRate] = useState<number>(18);
  const [heldSales, setHeldSales] = useState<any[]>([]);
  
  // Batch Selection States
  const [showBatchDialog, setShowBatchDialog] = useState(false);
  const [selectedProductForBatch, setSelectedProductForBatch] = useState<Product | null>(null);
  const [requestedBatchQuantity, setRequestedBatchQuantity] = useState(0);

  // Fetch data
  useEffect(() => {
    if (merchant) {
      fetchData();
    }
  }, [merchant]);

  const fetchData = async () => {
    if (!merchant) return;
    
    try {
      const [productsRes, customersRes] = await Promise.all([
        supabase
          .from('products')
          .select('*, category:categories(name)')
          .eq('merchant_id', merchant.id)
          .gt('current_stock', 0),
        supabase
          .from('customers')
          .select('*')
          .eq('merchant_id', merchant.id)
          .eq('is_active', true)
      ]);

      if (productsRes.error) throw productsRes.error;
      if (customersRes.error) throw customersRes.error;
      
      const customersData = customersRes.data || [];
      setProducts(productsRes.data || []);
      setCustomers(customersData);
      setFilteredCustomers(customersData); // Initialize filteredCustomers with all customers
      
      // Generate invoice number
      setInvoiceNumber(`INV-${Date.now()}`);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    // Check if product has batch tracking enabled
    const hasBatchTracking = (product as any).batch_tracking_enabled;
    
    if (hasBatchTracking) {
      // Open batch selection dialog
      setSelectedProductForBatch(product);
      setRequestedBatchQuantity(1);
      setShowBatchDialog(true);
    } else {
      // Add directly to cart without batch selection
      const existingItem = cart.find(item => item.product.id === product.id);
      
      if (existingItem) {
        setCart(prevCart =>
          prevCart.map(item =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        );
      } else {
        setCart(prevCart => [...prevCart, { product, quantity: 1, paymentStatus: 'unpaid' }]);
      }
    }
  };

  const handleBatchSelection = (selections: BatchSelection[]) => {
    if (!selectedProductForBatch) return;
    
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === selectedProductForBatch.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === selectedProductForBatch.id
            ? { 
                ...item, 
                quantity: item.quantity + requestedBatchQuantity,
                batchSelections: [...(item.batchSelections || []), ...selections]
              }
            : item
        );
      }
      return [...prevCart, { 
        product: selectedProductForBatch, 
        quantity: requestedBatchQuantity, 
        paid: false,
        batchSelections: selections
      }];
    });
    
    // Reset batch selection state
    setSelectedProductForBatch(null);
    setRequestedBatchQuantity(0);
    setShowBatchDialog(false);
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, newQuantity: number, paid?: boolean) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.product.id === productId
          ? { 
              ...item, 
              quantity: newQuantity,
              paid: paid !== undefined ? paid : item.paid
            }
          : item
      )
    );
  };

  const updatePaymentStatus = (productId: string, status: 'paid' | 'unpaid' | 'partial') => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.product.id === productId
          ? { ...item, paymentStatus: status }
          : item
      )
    );
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (product.category?.name && product.category.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = !categoryFilter || product.category?.name === categoryFilter;
    
    const matchesStock = stockFilter === 'all' ||
                        (stockFilter === 'in_stock' && (product.current_stock || 0) > 0) ||
                        (stockFilter === 'low_stock' && (product.current_stock || 0) <= (product.minimum_stock || 0) && (product.current_stock || 0) > 0) ||
                        (stockFilter === 'out_of_stock' && (product.current_stock || 0) <= 0);
    
    return matchesSearch && matchesCategory && matchesStock;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price_low':
        return (a.sale_price || 0) - (b.sale_price || 0);
      case 'price_high':
        return (b.sale_price || 0) - (a.sale_price || 0);
      case 'stock':
        return (b.current_stock || 0) - (a.current_stock || 0);
      default:
        return a.name.localeCompare(b.name);
    }
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target && !target.closest('.customer-search-container')) {
        setShowCustomerDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter customers based on search query
  useEffect(() => {
    if (!customerSearchQuery) {
      setFilteredCustomers(customers);
      return;
    }

    const query = customerSearchQuery.toLowerCase();
    
    if (enableEnhancedSearch) {
      // Enhanced search with field filtering
      const filtered = customers.filter(customer => {
        if (customerSearchField === 'all') {
          return (
            customer.name.toLowerCase().includes(query) ||
            (customer.phone && customer.phone.toLowerCase().includes(query)) ||
            (customer.gstin && customer.gstin.toLowerCase().includes(query)) ||
            (customer.gst_number && customer.gst_number.toLowerCase().includes(query)) ||
            (customer.village && customer.village.toLowerCase().includes(query)) ||
            (customer.district && customer.district.toLowerCase().includes(query)) ||
            (customer.email && customer.email.toLowerCase().includes(query))
          );
        } else if (customerSearchField === 'name') {
          return customer.name.toLowerCase().includes(query);
        } else if (customerSearchField === 'phone') {
          return customer.phone?.toLowerCase().includes(query) || false;
        } else if (customerSearchField === 'gstin') {
          return (
            (customer.gstin && customer.gstin.toLowerCase().includes(query)) ||
            (customer.gst_number && customer.gst_number.toLowerCase().includes(query)) ||
            false
          );
        } else if (customerSearchField === 'village') {
          return customer.village?.toLowerCase().includes(query) || false;
        }
        return false;
      });
      setFilteredCustomers(filtered);
    } else {
      // Basic search (name and phone only)
      const filtered = customers.filter(customer => 
        customer.name.toLowerCase().includes(query) ||
        (customer.phone && customer.phone.toLowerCase().includes(query))
      );
      setFilteredCustomers(filtered);
    }
  }, [customerSearchQuery, customers, customerSearchField, enableEnhancedSearch]);

  // Calculate totals with discount and GST
  const subtotal = cart.reduce((sum, item) => sum + ((item.product.sale_price || 0) * item.quantity), 0);
  const discountAmount = discountType === 'percentage' ? (subtotal * discount) / 100 : discount;
  const taxableAmount = subtotal - discountAmount;
  const gstAmount = taxableAmount * (customGstRate / 100);
  const total = taxableAmount + gstAmount;

  // Helper function to get UOM display
  const getUOMDisplay = (product: Product) => {
    const packSize = (product as any).pack_size || 50;
    const unit = product.unit || 'kg';
    const stock = product.current_stock || 0;
    
    if (unit === 'kg') {
      const bags = Math.floor(stock / packSize);
      const remaining = stock % packSize;
      const primaryText = `${bags} Bags${remaining > 0 ? ` + ${remaining}kg` : ''}`;
      return {
        primary: primaryText.length > 20 ? `${bags} Bags` : primaryText,
        secondary: `(${stock} kg total)`
      };
    } else if (unit === 'litre' || unit === 'L') {
      return {
        primary: `${Math.floor(stock)} Bottles`,
        secondary: `(${stock}L total)`
      };
    }
    return {
      primary: `${stock} ${unit}`.substring(0, 15),
      secondary: ''
    };
  };

  // Helper function to get product image URL
  const getProductImageUrl = (product: Product) => {
    // Always return inline SVG for missing or invalid image paths
    if (!product.image_path || 
        product.image_path.includes('via.placeholder.com') || 
        product.image_path.includes('placeholder') ||
        product.image_path.trim() === '') {
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE0MCIgdmlld0JveD0iMCAwIDMwMCAxNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMTQwIiBmaWxsPSIjZjVmNWY1Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iNzUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Tm8gSW1hZ2U8L3RleHQ+Cjwvc3ZnPgo=';
    }
    
    // If image_path is already a full URL, use it directly (but avoid placeholder URLs)
    if (product.image_path.startsWith('http') && !product.image_path.includes('placeholder')) {
      return product.image_path;
    }
    
    // If it's a Supabase storage path, construct the full URL
    if (product.image_path.startsWith('product-images/')) {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      return `${supabaseUrl}/storage/v1/object/public/${product.image_path}`;
    }
    
    // If it's just a filename, assume it's in the product-images bucket
    return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/product-images/${product.image_path}`;
  };

  // Helper function to convert number to words
  const convertToWords = (amount: number): string => {
    // Simple implementation - you can enhance this
    return `Rupees ${Math.floor(amount)} Only`;
  };

  const handleCheckout = async () => {
    if (!merchant) {
      toast.error('No merchant data available');
      return;
    }
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    setShowCheckoutDialog(true);
  };

  const holdSale = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    
    const heldSale = {
      id: Date.now().toString(),
      cart: [...cart],
      customer: selectedCustomer,
      discount,
      discountType,
      gstRate: customGstRate,
      timestamp: new Date(),
      total
    };
    
    setHeldSales([...heldSales, heldSale]);
    setCart([]);
    setSelectedCustomer('');
    setDiscount(0);
    toast.success('Sale held successfully');
  };

  const resumeHeldSale = (heldSale: any) => {
    setCart(heldSale.cart);
    setSelectedCustomer(heldSale.customer);
    setDiscount(heldSale.discount);
    setDiscountType(heldSale.discountType);
    setCustomGstRate(heldSale.gstRate);
    setHeldSales(heldSales.filter(sale => sale.id !== heldSale.id));
    toast.success('Sale resumed');
  };

  const completeSale = async () => {
    if (!merchant || cart.length === 0) {
      toast.error('Cannot complete sale: Missing merchant or empty cart');
      return;
    }
    
    setProcessingCheckout(true);
    try {
      console.log('Starting sale completion...', { merchant: merchant.id, cartItems: cart.length, total });
      
      // Create sale record
      const saleData = {
        merchant_id: merchant.id,
        customer_id: selectedCustomer || null,
        invoice_number: invoiceNumber,
        payment_method: paymentMethod,
        total_amount: total,
        payment_status: paymentMethod === 'credit' ? 'pending' : 'paid',
        sale_date: new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD for DATE column
        subtotal: total / 1.18, // Calculate subtotal (assuming 18% GST)
        tax_amount: total - (total / 1.18), // Calculate tax amount
        discount_amount: discountType === 'percentage' ? (total * discount / 100) : discount
      };

      console.log('Inserting sale data:', saleData);
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert(saleData)
        .select()
        .single();

      if (saleError) {
        console.error('Sale insertion error:', saleError);
        throw new Error(`Failed to create sale: ${saleError.message}`);
      }

      console.log('Sale created successfully:', sale);

      // Create sale items
      const saleItems = cart.map(item => ({
        sale_id: sale.id,
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.sale_price || 0,
        total_price: item.quantity * (item.product.sale_price || 0)
      }));

      console.log('Inserting sale items:', saleItems);
      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems);

      if (itemsError) {
        console.error('Sale items insertion error:', itemsError);
        throw new Error(`Failed to create sale items: ${itemsError.message}`);
      }

      console.log('Sale items created successfully');

      // Update product stock
      for (const item of cart) {
        console.log(`Updating stock for product ${item.product.id}: ${item.product.current_stock} - ${item.quantity}`);
        const { error: stockError } = await supabase
          .from('products')
          .update({ 
            current_stock: item.product.current_stock - item.quantity 
          })
          .eq('id', item.product.id);

        if (stockError) {
          console.error('Stock update error:', stockError);
          throw new Error(`Failed to update stock for ${item.product.name}: ${stockError.message}`);
        }
      }

      console.log('Stock updated successfully');

      // Generate QR code for dual copy invoice
      const qrCodeText = [
        (merchant as any)?.gst_number || '',
        customers.find(c => c.id === selectedCustomer)?.gstin || '',
        sale.invoice_number,
        new Date(sale.sale_date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        total.toFixed(2),
        '31054000', // HSN code for fertilizers
        `IRN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      ].join('|');
      
      // Generate QR code image
      const QRCode = (await import('qrcode')).default;
      const qrCodeImage = await QRCode.toDataURL(qrCodeText, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // Store sale data for dual copy invoice before clearing cart
      const saleDataForInvoice = {
        sale,
        cartItems: [...cart],
        customerData: customers.find(c => c.id === selectedCustomer),
        totals: { subtotal, discountAmount, gstAmount, total },
        gstRate: customGstRate,
        paymentMethod,
        qrCodeImage
      };
      setLastSaleData(saleDataForInvoice);

      // Generate and download invoice
      console.log('Generating invoice...');
      await generateInvoice(sale);

      // Reset state
      setCart([]);
      setShowCheckoutDialog(false);
      setSelectedCustomer('');
      setInvoiceNumber(`INV-${Date.now()}`);
      
      toast.success('Sale completed successfully!');
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Sale completion error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to complete sale: ${errorMessage}`);
    } finally {
      setProcessingCheckout(false);
    }
  };

  const generateQRCodeData = (sale: any) => {
    return {
      number: sale.invoice_number,
      date: sale.sale_date,
      total: sale.total_amount,
      gstin: (merchant as any)?.gst_number || '',
      sellerName: merchant?.business_name || merchant?.name || '',
      upiId: (merchant as any)?.upi_id || 'krishisethu@upi' // Default UPI ID, should be configured in merchant settings
    };
  };

  const handleShowQRCode = (sale: any) => {
    setQrCodeData(generateQRCodeData(sale));
    setShowQRCode(true);
  };

  const handleRemoveItem = (item: CartItem) => {
    setCart(cart.filter(cartItem => cartItem !== item));
  };

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer.id);
    setCustomerSearchQuery(`${customer.name} - ${customer.phone || ''}`);
    setShowCustomerDropdown(false);
    
    // Update cart with customer details
    if (cart.length > 0) {
      setCart(prevCart => 
        prevCart.map(item => ({
          ...item,
          customer: {
            id: customer.id,
            name: customer.name,
            phone: customer.phone || '',
            gstin: customer.gstin || customer.gst_number || '',
            address: customer.address || '',
            village: customer.village || '',
            district: customer.district || ''
          }
        }))
      );
    }
    
    toast.success(`Selected customer: ${customer.name}`);
  };

  const generateInvoice = async (sale: any) => {
    if (!merchant) {
      console.error('No merchant data available for invoice generation');
      toast.error('Failed to generate invoice: Missing merchant data');
      return;
    }
    
    try {
      console.log('Generating invoice for sale:', sale);
      console.log('Current cart items:', cart);
      console.log('Selected customer:', selectedCustomer);
      
      // Get fresh sale items from database since cart is cleared after sale
      const { data: saleItems, error: saleItemsError } = await supabase
        .from('sale_items')
        .select(`
          *,
          product:products(*)
        `)
        .eq('sale_id', sale.id);

      if (saleItemsError) {
        console.error('Error fetching sale items:', saleItemsError);
        throw new Error(`Failed to fetch sale items: ${saleItemsError.message}`);
      }

      console.log('Fetched sale items:', saleItems);

      const customer = customers.find(c => c.id === selectedCustomer);
      
      // Generate QR code data in the exact format required by the PDF generator
      const formatDateForQR = (date: Date | string) => {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0'); // getMonth() is zero-based
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
      };
      
      // const qrData = generateQRCodeData(sale);
      const invoiceDate = formatDateForQR(sale.sale_date);
      // const ackDate = formatDateForQR(new Date());
      
      // Generate QR code data as per India's e-Invoice GST specification (GSTN/NIC schema)
      // Contains exactly 7 mandatory fields as per IRP system requirements
      
      // Find HSN code of highest value item (main item)
      let mainItemHSN = '31054000'; // Default HSN for fertilizers
      if (saleItems.length > 0) {
        const highestValueItem = saleItems.reduce((prev, current) => 
          (current.total_price > prev.total_price) ? current : prev
        );
        mainItemHSN = (highestValueItem.product as any).hsn_code || '31054000';
      }
      
      // Generate IRN (normally this would come from IRP after registration)
      const irn = `IRN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      const qrCodeText = [
        (merchant as any).gst_number || '', // 1. Supplier GSTIN
        (customer as any)?.gst_number || '', // 2. Recipient GSTIN  
        sale.invoice_number, // 3. Invoice Number (as given by supplier)
        invoiceDate, // 4. Invoice Date (DD/MM/YYYY format)
        sale.total_amount.toFixed(2), // 5. Invoice Value (total including taxes)
        mainItemHSN, // 6. HSN Code of Main Item (highest value item)
        irn // 7. IRN (Invoice Reference Number - 64-char hash from IRP)
      ].join('|');

      // Generate actual QR code image as base64
      const QRCode = (await import('qrcode')).default;
      const qrCodeBase64 = await QRCode.toDataURL(qrCodeText, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });

      const invoiceData: ExactEInvoiceData = {
        // E-Invoice Header
        ackNo: `ACK${Date.now()}`,
        ackDate: new Date().toLocaleDateString('en-IN'),
        irn: `IRN${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
        signedQRCode: qrCodeBase64,
        
        // Company Details
        companyName: merchant?.business_name || merchant?.name || 'Your Company Name',
        companyAddress: [merchant?.address || 'Your Company Address'],
        gstin: (merchant as any)?.gst_number || 'GSTIN123456789',
        stateName: merchant?.state || 'Maharashtra',
        stateCode: '27',
        mobile: merchant?.phone || '1234567890',
        email: merchant?.email || 'your.email@example.com',
        
        // Invoice Details
        invoiceNo: sale.invoice_number || `INV-${Date.now()}`,
        invoiceDate: new Date(sale.sale_date || new Date()).toLocaleDateString('en-IN'),
        
        // Buyer Details
        buyerName: customer?.name || 'Walk-in Customer',
        buyerAddress: [customer?.address || 'N/A'],
        
        // Items
        items: saleItems.map((item, index) => ({
          sr: index + 1,
          description: item.product.name,
          hsn: (item.product as any)?.hsn_code || '31054000',
          gst: 18,
          qty: item.quantity,
          unit: item.product.unit || 'KG',
          rate: item.unit_price || 0,
          amount: item.total_price || 0,
          cgstAmount: (item.total_price || 0) * 0.09,
          sgstAmount: (item.total_price || 0) * 0.09,
          igstAmount: 0,
          lotBatch: item.product.batch_number || '',
          mfgDate: item.product.manufacturing_date || '',
          expiryDate: item.product.expiry_date || '',
          manufacturer: item.product.manufacturer || '',
          packingDetails: item.product.packing_details || ''
        })),
        
        // Tax Summary
        hsnSac: '31054000',
        taxableValue: sale.subtotal || (sale.total_amount / 1.18),
        gstRate: 18,
        gstAmount: sale.tax_amount || (sale.total_amount / 1.18) * 0.18,
        cgstAmount: sale.tax_amount ? sale.tax_amount / 2 : (sale.total_amount / 1.18) * 0.09,
        sgstAmount: sale.tax_amount ? sale.tax_amount / 2 : (sale.total_amount / 1.18) * 0.09,
        igstAmount: 0,
        taxAmount: sale.tax_amount || (sale.total_amount / 1.18) * 0.18,
        roundOff: 0,
        invoiceTotal: sale.total_amount || 0,
        isInterstate: false,
        
        // Amount in Words
        amountInWords: `Rupees ${convertToWords(sale.total_amount || 0)} Only`,
        
        // Outstanding Details
        currentInvoice: sale.total_amount || 0,
        totalOutstanding: sale.payment_status === 'pending' ? (sale.total_amount || 0) : 0,
        
        // Footer
        jurisdiction: merchant?.state || 'Maharashtra'
      } as const;

      console.log('Invoice data prepared:', invoiceData);

      // Generate PDF
      const blob = await pdf(<ExactEInvoiceDocument data={invoiceData} />).toBlob();
      const url = URL.createObjectURL(blob);
      
      // Option 1: Auto-download
      const link = document.createElement('a');
      link.href = url;
      link.download = `${sale.invoice_number}.pdf`;
      link.click();
      
      // Option 2: Show QR code dialog
      setTimeout(() => {
        handleShowQRCode(sale);
      }, 500);
      
      // Cleanup
      URL.revokeObjectURL(url);
      
      console.log('Invoice generated and downloaded successfully');
      toast.success('Invoice generated successfully!');
    } catch (error) {
      console.error('Invoice generation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to generate invoice: ${errorMessage}`);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ 
          fontWeight: 700, 
          color: '#1e293b',
          mb: 1
        }}>
          Point of Sale
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your sales and inventory efficiently
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Products Section */}
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
            {/* Search and Filters */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', gap: 1, mb: 2, position: 'relative' }} className="customer-search-container">
                <Box sx={{ position: 'relative', width: '100%' }}>
                  <TextField
                    fullWidth
                    label={enableEnhancedSearch 
                      ? `Search Customer ${customerSearchField !== 'all' ? `by ${customerSearchField}` : ''}`
                      : 'Search Customer'}
                    variant="outlined"
                    size="small"
                    value={customerSearchQuery}
                    onChange={(e) => {
                      setCustomerSearchQuery(e.target.value);
                      setShowCustomerDropdown(true);
                    }}
                    onFocus={() => {
                      setShowCustomerDropdown(true);
                      if (!customerSearchQuery) {
                        setFilteredCustomers(customers); // Show all customers when no search query
                      }
                    }}
                    onClick={() => setShowCustomerDropdown(true)}
                    placeholder="Type to search customers or click to see all"
                  />
                  {showCustomerDropdown && (
                    <Paper 
                      sx={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        maxHeight: 300,
                        overflow: 'auto',
                        zIndex: 1300,
                        mt: 0.5,
                        border: '1px solid #e2e8f0',
                        borderRadius: 1,
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        backgroundColor: 'white'
                      }}
                    >
                      {filteredCustomers.length > 0 ? (
                        <List sx={{ py: 0 }}>
                          {filteredCustomers.slice(0, 10).map((customer) => (
                            <ListItem 
                              key={customer.id} 
                              button 
                              onClick={() => handleCustomerSelect(customer)}
                              sx={{ 
                                py: 1,
                                '&:hover': { 
                                  backgroundColor: '#f8fafc' 
                                }
                              }}
                            >
                              <ListItemText 
                                primary={
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {customer.name}
                                  </Typography>
                                }
                                secondary={
                                  <Typography variant="caption" color="text.secondary">
                                    {customer.phone} {customer.village ? `• ${customer.village}` : ''}
                                    {customer.gstin ? ` • GST: ${customer.gstin}` : ''}
                                  </Typography>
                                } 
                              />
                            </ListItem>
                          ))}
                          {filteredCustomers.length > 10 && (
                            <Box sx={{ p: 1, textAlign: 'center', color: 'text.secondary', fontSize: '0.75rem' }}>
                              Showing first 10 results. Type to narrow down search.
                            </Box>
                          )}
                        </List>
                      ) : customerSearchQuery ? (
                        <Box sx={{ p: 2, color: 'text.secondary', textAlign: 'center' }}>
                          <Typography variant="body2">No customers found matching "{customerSearchQuery}"</Typography>
                          <Typography variant="caption">Try searching by name, phone, or village</Typography>
                        </Box>
                      ) : (
                        <Box sx={{ p: 2, color: 'text.secondary', textAlign: 'center' }}>
                          <Typography variant="body2">Start typing to search customers</Typography>
                        </Box>
                      )}
                    </Paper>
                  )}
                </Box>
                {enableEnhancedSearch && (
                  <Button 
                    variant="outlined" 
                    onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                    size="small"
                  >
                    {showAdvancedSearch ? 'Hide Filters' : 'Filters'}
                  </Button>
                )}
              </Box>
              
              {showAdvancedSearch && (
                <Box sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>Search By:</Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip 
                      label="All Fields" 
                      onClick={() => setCustomerSearchField('all')} 
                      color={customerSearchField === 'all' ? 'primary' : 'default'}
                      size="small"
                    />
                    <Chip 
                      label="Name" 
                      onClick={() => setCustomerSearchField('name')} 
                      color={customerSearchField === 'name' ? 'primary' : 'default'}
                      size="small"
                    />
                    <Chip 
                      label="Phone" 
                      onClick={() => setCustomerSearchField('phone')} 
                      color={customerSearchField === 'phone' ? 'primary' : 'default'}
                      size="small"
                    />
                    <Chip 
                      label="GSTIN" 
                      onClick={() => setCustomerSearchField('gstin')} 
                      color={customerSearchField === 'gstin' ? 'primary' : 'default'}
                      size="small"
                    />
                    <Chip 
                      label="Village" 
                      onClick={() => setCustomerSearchField('village')} 
                      color={customerSearchField === 'village' ? 'primary' : 'default'}
                      size="small"
                    />
                  </Box>
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                    Current filter: {customerSearchField === 'all' ? 'All Fields' : customerSearchField}
                  </Typography>
                </Box>
              )}
              <TextField
                fullWidth
                placeholder="🔍 Search products by name, SKU, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ 
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: '#f8fafc',
                    fontSize: '0.95rem',
                    '&:hover': {
                      backgroundColor: '#f1f5f9'
                    },
                    '&.Mui-focused': {
                      backgroundColor: '#ffffff',
                      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
                    }
                  }
                }}
              />
              
              {/* Filter Row */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    label="Category"
                    sx={{
                      borderRadius: 2,
                      backgroundColor: '#f8fafc',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#e2e8f0'
                      }
                    }}
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {[...new Set(products.map(p => p.category?.name).filter(Boolean))].map((category) => (
                      <MenuItem key={category} value={category}>{category}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Stock</InputLabel>
                  <Select
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value)}
                    label="Stock"
                    sx={{
                      borderRadius: 2,
                      backgroundColor: '#f8fafc',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#e2e8f0'
                      }
                    }}
                  >
                    <MenuItem value="all">All Stock</MenuItem>
                    <MenuItem value="in_stock">✅ In Stock</MenuItem>
                    <MenuItem value="low_stock">⚠️ Low Stock</MenuItem>
                    <MenuItem value="out_of_stock">❌ Out of Stock</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    label="Sort By"
                    sx={{
                      borderRadius: 2,
                      backgroundColor: '#f8fafc',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#e2e8f0'
                      }
                    }}
                  >
                    <MenuItem value="name">Name A→Z</MenuItem>
                    <MenuItem value="price_low">Price Low→High</MenuItem>
                    <MenuItem value="price_high">Price High→Low</MenuItem>
                    <MenuItem value="stock">Stock High→Low</MenuItem>
                  </Select>
                </FormControl>
                
                <Typography variant="body2" sx={{ color: '#64748b', ml: 'auto' }}>
                  {filteredProducts.length} products found
                </Typography>
              </Box>
            </Box>
          
            <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
              {filteredProducts.map((product) => {
                const stockDisplay = getUOMDisplay(product);
                const isLowStock = (product.current_stock || 0) <= (product.minimum_stock || 0);
                return (
                  <Grid item xs={6} sm={4} md={3} lg={2.4} key={product.id} sx={{ display: 'flex' }}>
                    <Card sx={{ 
                      height: '320px',
                      width: '100%',
                      minWidth: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 3,
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      transition: 'all 0.2s ease-in-out',
                      position: 'relative',
                      overflow: 'hidden',
                      flex: 1,
                      backgroundColor: '#ffffff',
                      '&:hover': {
                        boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                        transform: 'translateY(-2px)',
                        borderColor: '#3b82f6'
                      }
                    }}>
                      {/* Stock Status Badge */}
                      {isLowStock && (
                        <Chip 
                          label="Low Stock" 
                          size="small" 
                          sx={{ 
                            position: 'absolute', 
                            top: 8, 
                            right: 8, 
                            zIndex: 1,
                            backgroundColor: '#fef3c7',
                            color: '#92400e',
                            fontSize: '0.7rem',
                            height: '20px'
                          }} 
                        />
                      )}
                      
                      <Box sx={{ 
                        height: '140px',
                        width: '100%',
                        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                        overflow: 'hidden',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 2
                      }}>
                        <CardMedia
                          component="img"
                          image={getProductImageUrl(product)}
                          alt={product.name}
                          sx={{ 
                            objectFit: 'contain',
                            width: '100%',
                            height: '100%',
                            maxWidth: '120px',
                            maxHeight: '120px',
                            display: 'block',
                            borderRadius: 1
                          }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDMwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjZjhmYWZjIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iNTUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk0YTNiOCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';
                          }}
                        />
                    </Box>
                      <CardContent sx={{ 
                        p: 2,
                        '&:last-child': { pb: 2 },
                        display: 'flex',
                        flexDirection: 'column',
                        height: '180px',
                        minHeight: '180px',
                        justifyContent: 'space-between',
                        flex: 1,
                        overflow: 'hidden'
                      }}>
                      <Box sx={{ flex: 1, overflow: 'hidden' }}>
                        <Typography variant="body2" fontWeight="600" sx={{ 
                          fontSize: '0.85rem',
                          lineHeight: 1.3,
                          height: '36px',
                          minHeight: '36px',
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          mb: 1,
                          color: '#1e293b'
                        }}>
                          {product.name}
                        </Typography>
                        
                        <Typography variant="caption" sx={{ 
                          fontSize: '0.7rem',
                          display: 'block',
                          mb: 1,
                          height: '18px',
                          minHeight: '18px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          color: '#64748b',
                          fontWeight: 500
                        }}>
                          SKU: {product.sku || 'N/A'}
                        </Typography>
                        
                        <Box display="flex" alignItems="center" sx={{ mb: 1, height: '22px' }}>
                          <StockIcon sx={{ fontSize: 14, mr: 0.5, color: isLowStock ? '#dc2626' : '#10b981', flexShrink: 0 }} />
                          <Typography variant="caption" sx={{ 
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            minHeight: '18px',
                            display: 'flex',
                            alignItems: 'center',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            flex: 1,
                            color: isLowStock ? '#dc2626' : '#10b981'
                          }}>
                            {stockDisplay.primary}
                          </Typography>
                        </Box>
                        
                        <Typography variant="caption" color="text.secondary" sx={{ 
                          fontSize: '0.6rem',
                          display: 'block',
                          mb: 0.5,
                          minHeight: '14px',
                          height: '14px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {stockDisplay.secondary}
                        </Typography>

                        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1, height: '28px', minHeight: '28px' }}>
                          <Typography variant="h6" sx={{ 
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            flexShrink: 0,
                            color: '#059669'
                          }}>
                            ₹{product.sale_price || 0}
                          </Typography>
                          <Chip 
                            label={product.category?.name || 'General'} 
                            size="small"
                            sx={{ 
                              fontSize: '0.65rem', 
                              height: 20,
                              minWidth: 50,
                              maxWidth: 80,
                              backgroundColor: '#dbeafe',
                              color: '#1d4ed8',
                              fontWeight: 500,
                              '& .MuiChip-label': {
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }
                            }}
                          />
                        </Box>

                        <Typography variant="caption" color="text.secondary" sx={{ 
                          fontSize: '0.6rem',
                          display: 'block',
                          minHeight: '14px',
                          height: '14px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          Batch: {product.batch_number || 'N/A'}
                        </Typography>
                      </Box>
                      
                        {/* Quantity Controls or Add Button */}
                        {cart.find(item => item.product.id === product.id) ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, height: '36px' }}>
                            <IconButton 
                              size="small" 
                              onClick={() => {
                                const cartItem = cart.find(item => item.product.id === product.id);
                                if (cartItem) updateQuantity(product.id, cartItem.quantity - 1);
                              }}
                              sx={{ 
                                backgroundColor: '#f1f5f9',
                                width: '28px',
                                height: '28px',
                                '&:hover': { backgroundColor: '#e2e8f0' }
                              }}
                            >
                              <RemoveIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                            <Typography 
                              sx={{ 
                                minWidth: '32px', 
                                textAlign: 'center',
                                fontWeight: 700,
                                backgroundColor: '#dbeafe',
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                border: '2px solid #3b82f6',
                                fontSize: '0.85rem',
                                color: '#1d4ed8'
                              }}
                            >
                              {cart.find(item => item.product.id === product.id)?.quantity || 0}
                            </Typography>
                            <IconButton 
                              size="small" 
                              onClick={() => {
                                const cartItem = cart.find(item => item.product.id === product.id);
                                if (cartItem) updateQuantity(product.id, cartItem.quantity + 1);
                              }}
                              sx={{ 
                                backgroundColor: '#f1f5f9',
                                width: '28px',
                                height: '28px',
                                '&:hover': { backgroundColor: '#e2e8f0' }
                              }}
                            >
                              <AddIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              onClick={() => removeFromCart(product.id)}
                              sx={{ 
                                ml: 0.5,
                                backgroundColor: '#fef2f2',
                                color: '#dc2626',
                                width: '28px',
                                height: '28px',
                                '&:hover': { backgroundColor: '#fee2e2' }
                              }}
                            >
                              <DeleteIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Box>
                        ) : (
                          <Button
                            variant="contained"
                            fullWidth
                            size="small"
                            sx={{ 
                              fontSize: '0.75rem', 
                              py: 1, 
                              height: '36px',
                              minHeight: '36px',
                              maxHeight: '36px',
                              borderRadius: 2,
                              textTransform: 'none',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              flexShrink: 0,
                              fontWeight: 600,
                              backgroundColor: product.current_stock <= 0 ? '#94a3b8' : '#059669',
                              '&:hover': {
                                backgroundColor: product.current_stock <= 0 ? '#94a3b8' : '#047857'
                              },
                              '&:disabled': {
                                backgroundColor: '#94a3b8',
                                color: '#ffffff'
                              }
                            }}
                            onClick={() => addToCart(product)}
                            disabled={product.current_stock <= 0}
                          >
                            {product.current_stock <= 0 ? '🚫 Out of Stock' : `₹${product.sale_price || 0}`}
                          </Button>
                        )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Paper>
      </Grid>

        {/* Cart Section */}
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', height: 'fit-content' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b', flex: 1 }}>
                🛒 Cart
              </Typography>
              <Chip 
                label={`${cart.length} items`} 
                sx={{ 
                  backgroundColor: '#dbeafe', 
                  color: '#1d4ed8',
                  fontWeight: 600
                }}
              />
            </Box>
            
            {/* Customer Selection */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: '#374151' }}>👤 Customer</Typography>
              <FormControl fullWidth>
                <Select
                  value={selectedCustomer}
                  onChange={(e) => {
                    const customerId = e.target.value;
                    setSelectedCustomer(customerId);
                    
                    if (customerId) {
                      const customer = customers.find(c => c.id === customerId);
                      if (customer) {
                        setCustomerSearchQuery(`${customer.name} - ${customer.phone || ''}`);
                        
                        // Update cart with customer details
                        if (cart.length > 0) {
                          setCart(prevCart => 
                            prevCart.map(item => ({
                              ...item,
                              customer: {
                                id: customer.id,
                                name: customer.name,
                                phone: customer.phone || '',
                                gstin: customer.gstin || customer.gst_number || '',
                                address: customer.address || '',
                                village: customer.village || '',
                                district: customer.district || ''
                              }
                            }))
                          );
                        }
                      }
                    } else {
                      setCustomerSearchQuery('');
                    }
                  }}
                  displayEmpty
                  sx={{
                    borderRadius: 2,
                    backgroundColor: '#f8fafc',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e2e8f0'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#3b82f6'
                    }
                  }}
                >
                  <MenuItem value="">🚶 Walk-in Customer</MenuItem>
                  {customers.map((customer) => (
                    <MenuItem key={customer.id} value={customer.id}>
                      {customer.name} - {customer.phone || ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {/* Display selected customer info */}
              {selectedCustomer && (
                <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#f0f9ff', borderRadius: 1, border: '1px solid #0ea5e9' }}>
                  {(() => {
                    const customer = customers.find(c => c.id === selectedCustomer);
                    return customer ? (
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#0369a1' }}>
                          {customer.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          📞 {customer.phone || 'N/A'}
                          {customer.village && ` • 📍 ${customer.village}`}
                          {(customer.gstin || customer.gst_number) && ` • 🏢 ${customer.gstin || customer.gst_number}`}
                        </Typography>
                      </Box>
                    ) : null;
                  })()}
                </Box>
              )}
            </Box>

            {/* GST Rate Selection */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: '#374151' }}>📊 GST Rate</Typography>
              <FormControl fullWidth>
                <Select
                  value={customGstRate}
                  onChange={(e) => setCustomGstRate(Number(e.target.value))}
                  sx={{
                    borderRadius: 2,
                    backgroundColor: '#f8fafc',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e2e8f0'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#3b82f6'
                    }
                  }}
                >
                  <MenuItem value={0}>0% (Exempt)</MenuItem>
                  <MenuItem value={5}>5% GST</MenuItem>
                  <MenuItem value={12}>12% GST</MenuItem>
                  <MenuItem value={18}>18% GST</MenuItem>
                  <MenuItem value={28}>28% GST</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Discount Controls */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: '#374151' }}>💰 Discount</Typography>
              <Box display="flex" gap={1} alignItems="center">
                <TextField
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  sx={{ 
                    flex: 1,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: '#f8fafc',
                      '& fieldset': {
                        borderColor: '#e2e8f0'
                      },
                      '&:hover fieldset': {
                        borderColor: '#3b82f6'
                      }
                    }
                  }}
                  inputProps={{ min: 0 }}
                  placeholder="0"
                />
                <FormControl sx={{ minWidth: 80 }}>
                  <Select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'amount')}
                    sx={{
                      borderRadius: 2,
                      backgroundColor: '#f8fafc',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#e2e8f0'
                      }
                    }}
                  >
                    <MenuItem value="percentage">%</MenuItem>
                    <MenuItem value="amount">₹</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
            
            {cart.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>🛒</Typography>
                <Typography color="text.secondary">Your cart is empty</Typography>
                <Typography variant="caption" color="text.secondary">Add products to get started</Typography>
              </Box>
            ) : (
              <>
                <Box sx={{ maxHeight: '300px', overflowY: 'auto', mb: 2 }}>
                  {cart.map((item) => (
                    <Card key={item.product.id} sx={{ 
                      mb: 2, 
                      p: 2, 
                      borderRadius: 2,
                      border: '1px solid #e2e8f0',
                      backgroundColor: item.paymentStatus === 'paid' ? '#f0fdf4' : item.paymentStatus === 'partial' ? '#fffbeb' : '#ffffff',
                      position: 'relative',
                      overflow: 'visible',
                      '&:hover': {
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                      }
                    }}>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                        <FormControl size="small" sx={{ minWidth: 100 }}>
                          <Select
                            value={item.paymentStatus || 'unpaid'}
                            onChange={(e) => updatePaymentStatus(item.product.id, e.target.value as 'paid' | 'unpaid' | 'partial')}
                            sx={{
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              backgroundColor: item.paymentStatus === 'paid' ? '#dcfce7' : item.paymentStatus === 'partial' ? '#fef3c7' : '#f8fafc',
                              border: `1px solid ${item.paymentStatus === 'paid' ? '#22c55e' : item.paymentStatus === 'partial' ? '#f59e0b' : '#e2e8f0'}`,
                              borderRadius: 1,
                              '& .MuiSelect-select': {
                                py: 0.5,
                                px: 1
                              },
                              '& .MuiOutlinedInput-notchedOutline': {
                                border: 'none'
                              }
                            }}
                          >
                            <MenuItem value="unpaid" sx={{ fontSize: '0.75rem' }}>❌ Unpaid</MenuItem>
                            <MenuItem value="partial" sx={{ fontSize: '0.75rem' }}>⚠️ Partial</MenuItem>
                            <MenuItem value="paid" sx={{ fontSize: '0.75rem' }}>✅ Paid</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box sx={{ flex: 1, mr: 2 }}>
                          <Typography variant="body2" fontWeight="600" sx={{ mb: 0.5, color: '#1e293b' }}>
                            {item.product.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 1 }}>
                            ₹{item.product.sale_price} per unit
                          </Typography>
                          <Typography variant="body2" fontWeight="600" sx={{ color: '#059669' }}>
                            ₹{((item.product.sale_price || 0) * item.quantity).toFixed(2)}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <IconButton 
                            size="small" 
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            sx={{ 
                              backgroundColor: '#f1f5f9',
                              '&:hover': { backgroundColor: '#e2e8f0' }
                            }}
                          >
                            <RemoveIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                          <Typography 
                            onClick={() => updatePaymentStatus(item.product.id, item.paymentStatus === 'paid' ? 'unpaid' : 'paid')}
                            sx={{ 
                              minWidth: '32px', 
                              textAlign: 'center',
                              fontWeight: 600,
                              backgroundColor: item.paymentStatus === 'paid' ? '#dcfce7' : item.paymentStatus === 'partial' ? '#fef3c7' : '#f8fafc',
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              border: `1px solid ${item.paymentStatus === 'paid' ? '#22c55e' : item.paymentStatus === 'partial' ? '#f59e0b' : '#e2e8f0'}`,
                              cursor: 'pointer',
                              '&:hover': {
                                backgroundColor: item.paymentStatus === 'paid' ? '#bbf7d0' : item.paymentStatus === 'partial' ? '#fde68a' : '#f1f5f9'
                              }
                            }}
                          >
                            {item.quantity}
                          </Typography>
                          <IconButton 
                            size="small" 
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            sx={{ 
                              backgroundColor: '#f1f5f9',
                              '&:hover': { backgroundColor: '#e2e8f0' }
                            }}
                          >
                            <AddIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => removeFromCart(item.product.id)}
                            sx={{ 
                              ml: 1,
                              backgroundColor: '#fef2f2',
                              color: '#dc2626',
                              '&:hover': { backgroundColor: '#fee2e2' }
                            }}
                          >
                            <DeleteIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Box>
                      </Box>
                    </Card>
                  ))}
                </Box>
                
                <Paper sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                  <Stack spacing={1}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Subtotal:</Typography>
                      <Typography variant="body2" fontWeight="600">₹{subtotal.toFixed(2)}</Typography>
                    </Box>
                    {discount > 0 && (
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">
                          Discount ({discountType === 'percentage' ? `${discount}%` : `₹${discount}`}):
                        </Typography>
                        <Typography variant="body2" fontWeight="600" color="error.main">-₹{discountAmount.toFixed(2)}</Typography>
                      </Box>
                    )}
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">GST ({customGstRate}%):</Typography>
                      <Typography variant="body2" fontWeight="600">₹{gstAmount.toFixed(2)}</Typography>
                    </Box>
                    <Divider />
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="h6" fontWeight="700" color="primary.main">Total:</Typography>
                      <Typography variant="h6" fontWeight="700" color="primary.main">₹{total.toFixed(2)}</Typography>
                    </Box>
                  </Stack>
                </Paper>
                
                <Box display="flex" gap={2} sx={{ mt: 3 }}>
                  <Button
                    variant="outlined"
                    onClick={holdSale}
                    sx={{ 
                      flex: 1,
                      borderRadius: 2,
                      py: 1.5,
                      fontWeight: 600,
                      textTransform: 'none',
                      borderColor: '#e2e8f0',
                      color: '#64748b',
                      '&:hover': {
                        borderColor: '#3b82f6',
                        backgroundColor: '#f8fafc'
                      }
                    }}
                    startIcon={<PauseIcon />}
                  >
                    Hold Sale
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleCheckout}
                    sx={{ 
                      flex: 2,
                      borderRadius: 2,
                      py: 1.5,
                      fontWeight: 700,
                      textTransform: 'none',
                      fontSize: '1rem',
                      backgroundColor: '#059669',
                      '&:hover': {
                        backgroundColor: '#047857'
                      }
                    }}
                    startIcon={<PaymentIcon />}
                  >
                    💳 Checkout
                  </Button>
                </Box>
              </>
            )}

            {/* Held Sales */}
            {heldSales.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Held Sales ({heldSales.length})
                </Typography>
                {heldSales.map((sale) => (
                  <Card key={sale.id} sx={{ mb: 1, p: 1, bgcolor: 'grey.50' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="caption">
                          {sale.cart.length} items - ₹{sale.total.toFixed(2)}
                        </Typography>
                        <Typography variant="caption" display="block" color="text.secondary">
                          {new Date(sale.timestamp).toLocaleTimeString()}
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        onClick={() => resumeHeldSale(sale)}
                      >
                        Resume
                      </Button>
                    </Box>
                  </Card>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Checkout Dialog */}
      <Dialog open={showCheckoutDialog} onClose={() => setShowCheckoutDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <PaymentIcon sx={{ mr: 1 }} />
            Complete Sale - {invoiceNumber}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {/* Customer Selection */}
            <FormControl fullWidth>
              <InputLabel>Customer</InputLabel>
              <Select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                label="Customer"
              >
                <MenuItem value="">Walk-in Customer</MenuItem>
                {customers.map((customer) => (
                  <MenuItem key={customer.id} value={customer.id}>
                    {customer.name} - {customer.phone || ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {/* Display selected customer details */}
            {selectedCustomer && (
              <Paper sx={{ p: 2, bgcolor: '#f0f9ff', border: '1px solid #0ea5e9' }}>
                {(() => {
                  const customer = customers.find(c => c.id === selectedCustomer);
                  return customer ? (
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0369a1', mb: 0.5 }}>
                        Selected Customer
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {customer.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        📞 {customer.phone || 'N/A'}
                        {customer.village && ` • 📍 ${customer.village}`}
                        {(customer.gstin || customer.gst_number) && ` • 🏢 ${customer.gstin || customer.gst_number}`}
                      </Typography>
                    </Box>
                  ) : null;
                })()}
              </Paper>
            )}

            {/* Payment Method */}
            <FormControl fullWidth>
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                label="Payment Method"
              >
                <MenuItem value="cash">Cash</MenuItem>
                <MenuItem value="upi">UPI</MenuItem>
                <MenuItem value="card">Card</MenuItem>
                <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                <MenuItem value="credit">Credit</MenuItem>
              </Select>
            </FormControl>

            {/* Order Summary */}
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="h6" gutterBottom>Order Summary</Typography>
              {cart.map((item) => (
                <Box key={item.product.id} display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography>
                    {item.product.name} x {item.quantity}
                  </Typography>
                  <Typography>
                    ₹{((item.product.sale_price ?? 0) * item.quantity).toFixed(2)}
                  </Typography>
                </Box>
              ))}
              <Divider sx={{ my: 1 }} />
              
              <Stack spacing={1}>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Subtotal:</Typography>
                  <Typography>₹{subtotal.toFixed(2)}</Typography>
                </Box>
                
                {discountAmount > 0 && (
                  <Box display="flex" justifyContent="space-between" color="success.main">
                    <Typography>Discount:</Typography>
                    <Typography>-₹{discountAmount.toFixed(2)}</Typography>
                  </Box>
                )}
                
                <Box display="flex" justifyContent="space-between">
                  <Typography>GST (18%):</Typography>
                  <Typography>₹{gstAmount.toFixed(2)}</Typography>
                </Box>
                
                <Divider />
                
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="h6" fontWeight="bold">Total:</Typography>
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    ₹{total.toFixed(2)}
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            {paymentMethod === 'credit' && (
              <Alert severity="warning">
                This sale will be marked as pending payment. Customer will need to pay later.
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCheckoutDialog(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={completeSale}
            disabled={processingCheckout}
            startIcon={processingCheckout ? <CircularProgress size={20} /> : <PrintIcon />}
          >
            {processingCheckout ? 'Processing...' : 'Complete & Print Invoice'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog 
        open={showQRCode} 
        onClose={() => setShowQRCode(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Invoice QR Code</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Scan this QR code to view invoice details or make a payment.
          </DialogContentText>
          {qrCodeData && (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <InvoiceQRCode 
                invoice={qrCodeData}
                size={200}
                includeUPI={true}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowQRCode(false)}>Close</Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => {
              // PDF download functionality to be implemented
              console.log('Download invoice:', qrCodeData?.number);
            }}
            sx={{ mr: 1 }}
          >
            Download Invoice
          </Button>
          <Button 
            variant="outlined" 
            color="primary"
            onClick={async () => {
              if (!qrCodeData) return;
              
              try {
                // Use stored sale data instead of current cart (which is empty)
                if (!lastSaleData) {
                  toast.error('No sale data available for invoice generation');
                  return;
                }
                
                const { cartItems, customerData, totals, gstRate, paymentMethod: salePaymentMethod, qrCodeImage } = lastSaleData;
                
                // Prepare invoice data
                const companyLogo = (merchant?.settings as any)?.logo_data || (merchant?.settings as any)?.logo_url || `${window.location.origin}/Logo_Dashboard.png`;
                const invoiceData = {
                  companyName: merchant?.business_name || merchant?.name || 'Business Name',
                  companyAddress: merchant?.address || 'Business Address',
                  companyGSTIN: (merchant as any)?.gst_number || merchant?.gstin || 'GSTIN Not Available',
                  companyLogo: companyLogo,
                  invoiceNumber: qrCodeData.number,
                  invoiceDate: new Date(qrCodeData.date).toLocaleDateString('en-IN'),
                  customerName: customerData?.name || 'Walk-in Customer',
                  customerAddress: customerData?.address || '',
                  customerGSTIN: customerData?.gstin,
                  items: cartItems.map((item, index) => ({
                    sno: index + 1,
                    description: item.product.name,
                    hsn: item.product.hsn_code || '31054000',
                    batch: item.product.batch_number || 'N/A',
                    expiry: item.product.expiry_date || 'N/A',
                    qty: item.quantity,
                    unit: item.product.unit || 'Kg',
                    rate: item.product.sale_price || 0,
                    amount: (item.product.sale_price || 0) * item.quantity,
                    taxable: (item.product.sale_price || 0) * item.quantity,
                    cgst: ((item.product.sale_price || 0) * item.quantity * gstRate) / 200,
                    sgst: ((item.product.sale_price || 0) * item.quantity * gstRate) / 200,
                    igst: 0,
                    total: ((item.product.sale_price || 0) * item.quantity) * (1 + gstRate / 100)
                  })),
                  totalAmount: totals.total,
                  amountInWords: convertToWords(totals.total),
                  paymentMethod: salePaymentMethod,
                  qrCodeData: qrCodeImage
                };
                
                // Generate PDF with timestamp to avoid caching
                const timestamp = Date.now();
                const blob = await pdf(<DualCopyInvoice {...invoiceData} key={timestamp} />).toBlob();
                
                // Download PDF
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `dual_copy_invoice_${qrCodeData.number}_${timestamp}.pdf`;
                link.click();
                
                toast.success('Dual copy invoice generated successfully!');
              } catch (error) {
                console.error('Error generating dual copy invoice:', error);
                toast.error('Failed to generate dual copy invoice');
              }
            }}     >
            Dual Copy Invoice
          </Button>
        </DialogActions>
      </Dialog>

      {/* Batch Selection Dialog */}
      {selectedProductForBatch && (
        <BatchSelectionDialog
          open={showBatchDialog}
          onClose={() => {
            setShowBatchDialog(false);
            setSelectedProductForBatch(null);
            setRequestedBatchQuantity(0);
          }}
          productId={selectedProductForBatch.id}
          productName={selectedProductForBatch.name}
          requestedQuantity={requestedBatchQuantity}
          onConfirm={handleBatchSelection}
        />
      )}
    </Box>
  );
};

export default POSPage;
