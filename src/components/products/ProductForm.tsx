import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Close as CloseIcon } from '@mui/icons-material';
import { supabase, Product, Category } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface ProductFormProps {
  product?: Product | null;
  categories: Category[];
  onClose: () => void;
  onSave: () => void;
}

interface ProductFormData {
  name: string;
  sku?: string;
  category_id?: string;
  fertilizer_type?: string;
  brand?: string;
  unit: string;
  cost_price: number;
  sale_price: number;
  current_stock: number;
  minimum_stock: number;
  maximum_stock?: number;
  batch_number?: string;
  expiry_date?: string;
  manufacturing_date?: string;
  hsn_code?: string;
  gst_rate?: number;
  cess_rate?: number;
  manufacturer?: string;
  packing_details?: string;
  importing_company?: string;
  status: 'active' | 'discontinued' | 'out_of_stock';
  description?: string;
  // Enhanced stock management fields
  min_stock_level: number;
  max_stock_level: number;
  reorder_point: number;
  reorder_quantity: number;
  requires_batch_tracking: boolean;
  shelf_life_days: number;
  cost_method: 'fifo' | 'lifo' | 'weighted_average';
}

export function ProductForm({ product, categories, onClose, onSave }: ProductFormProps) {
  const { merchant } = useAuth();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [imagePath, setImagePath] = useState<string | null>((product as any)?.image_path || null);

  // React Hook Form (must be defined before any watch() usage)
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    setError,
    clearErrors,
  } = useForm<ProductFormData>({
    defaultValues: product ? {
      name: product.name,
      sku: product.sku || '',
      category_id: (product as any).category_id || '',
      fertilizer_type: (product as any).fertilizer_type || '',
      brand: product.brand || '',
      unit: product.unit,
      cost_price: (product as any).cost_price || 0,
      sale_price: (product as any).sale_price || 0,
      current_stock: product.current_stock,
      minimum_stock: (product as any).minimum_stock || 10,
      maximum_stock: (product as any).maximum_stock || 0,
      // Enhanced stock management fields
      min_stock_level: (product as any).min_stock_level || 10,
      max_stock_level: (product as any).max_stock_level || 1000,
      reorder_point: (product as any).reorder_point || 20,
      reorder_quantity: (product as any).reorder_quantity || 100,
      requires_batch_tracking: (product as any).requires_batch_tracking ?? true,
      shelf_life_days: (product as any).shelf_life_days || 365,
      cost_method: (product as any).cost_method || 'weighted_average',
      batch_number: product.batch_number || '',
      expiry_date: product.expiry_date ? String(product.expiry_date).split('T')[0] : '',
      manufacturing_date: product.manufacturing_date ? String(product.manufacturing_date).split('T')[0] : '',
      hsn_code: product.hsn_code || '',
      gst_rate: product.gst_rate || 5,
      cess_rate: product.cess_rate || 0,
      manufacturer: product.manufacturer || '',
      packing_details: product.packing_details || '',
      importing_company: product.importing_company || '',
      status: product.status,
      description: product.description || '',
    } : {
      unit: 'kg',
      status: 'active',
      current_stock: 0,
      minimum_stock: 10,
      cost_price: 0,
      sale_price: 0,
      gst_rate: 5,
      cess_rate: 0,
      // Enhanced stock management defaults
      min_stock_level: 10,
      max_stock_level: 1000,
      reorder_point: 20,
      reorder_quantity: 100,
      requires_batch_tracking: true,
      shelf_life_days: 365,
      cost_method: 'weighted_average',
    }
  });

  // Predefined dropdown options (ready-made)
  const commonCategories = useMemo(() => [
    'Fertilizers',
    'Pesticides',
    'Herbicides',
    'Fungicides',
    'Insecticides',
    'Seeds',
    'Growth Regulators',
    'Soil Conditioners',
    'Micronutrients',
    'Organic Products',
    'Chemicals',
    'Equipment & Tools',
  ], []);

  const fertilizerTypes = useMemo(() => [
    'Nitrogen Fertilizers',
    'Phosphorus Fertilizers',
    'Potassium Fertilizers',
    'NPK Compound Fertilizers',
    'Micronutrient Fertilizers',
    'Organic Fertilizers',
    'Biofertilizers',
    'Water Soluble Fertilizers',
    'Liquid Fertilizers',
    'Slow Release / Controlled Release Fertilizers',
    'Specialty Fertilizers',
  ], []);

  // Per-Category dependent type lists
  const seedTypes = useMemo(() => [
    'Hybrid Seeds', 'OP Seeds', 'Vegetable Seeds', 'Field Crop Seeds', 'Flower Seeds', 'Bio-primed Seeds', 'Treated Seeds'
  ], []);
  const pesticideTypes = useMemo(() => [
    'Contact Pesticides', 'Systemic Pesticides', 'Broad-spectrum', 'Selective', 'Botanical', 'Biological'
  ], []);
  const herbicideTypes = useMemo(() => [
    'Pre-emergent', 'Post-emergent', 'Selective', 'Non-selective', 'Contact', 'Systemic'
  ], []);
  const fungicideTypes = useMemo(() => [
    'Contact', 'Systemic', 'Protectant', 'Eradicant', 'Broad-spectrum'
  ], []);
  const insecticideTypes = useMemo(() => [
    'Organophosphate', 'Pyrethroid', 'Neonicotinoid', 'Carbamate', 'Biological', 'Botanical'
  ], []);
  const regulatorTypes = useMemo(() => [
    'Auxins', 'Gibberellins', 'Cytokinins', 'Ethylene', 'Growth Retardants'
  ], []);
  const soilCondTypes = useMemo(() => [
    'Gypsum', 'Agricultural Lime', 'Humic Acid', 'Amino Acid', 'Biochar', 'Soil pH Correctors'
  ], []);
  const microNutrientTypes = useMemo(() => [
    'Chelated Zinc', 'Chelated Iron', 'Chelated Manganese', 'Chelated Copper', 'Boron', 'Molybdenum', 'Multi-micronutrient Mix'
  ], []);
  const organicProdTypes = useMemo(() => [
    'Compost', 'Vermicompost', 'Neem Cake', 'Bone Meal', 'Seaweed Extract', 'Panchagavya'
  ], []);
  const chemicalTypes = useMemo(() => [
    'Wetting Agent', 'Spreader', 'Sticker', 'Adjuvant', 'Surfactant'
  ], []);
  const equipmentTypes = useMemo(() => [
    'Sprayers', 'Spreaders', 'Seeders', 'Hand Tools', 'PPE'
  ], []);

  const selectedCategoryId = watch('category_id');
  const selectedFertilizerType = watch('fertilizer_type');
  const [otherTypeSelected, setOtherTypeSelected] = useState(false);
  const selectedCategoryName = useMemo(() => {
    if (!selectedCategoryId) return '';
    if (typeof selectedCategoryId === 'string' && selectedCategoryId.startsWith('static:')) {
      // Value from Common Categories, e.g., 'static:Fertilizers'
      return selectedCategoryId.slice('static:'.length);
    }
    return categories.find(c => c.id === selectedCategoryId)?.name || '';
  }, [selectedCategoryId, categories]);

  const categoryTypeMap: Record<string, string[]> = useMemo(() => ({
    'Fertilizers': fertilizerTypes,
    'Seeds': seedTypes,
    'Pesticides': pesticideTypes,
    'Herbicides': herbicideTypes,
    'Fungicides': fungicideTypes,
    'Insecticides': insecticideTypes,
    'Growth Regulators': regulatorTypes,
    'Soil Conditioners': soilCondTypes,
    'Micronutrients': microNutrientTypes,
    'Organic Products': organicProdTypes,
    'Chemicals': chemicalTypes,
    'Equipment & Tools': equipmentTypes,
  }), [
    fertilizerTypes, seedTypes, pesticideTypes, herbicideTypes, fungicideTypes, insecticideTypes,
    regulatorTypes, soilCondTypes, microNutrientTypes, organicProdTypes, chemicalTypes, equipmentTypes
  ]);

  const currentTypeOptions = useMemo(() => {
    return categoryTypeMap[selectedCategoryName] || fertilizerTypes;
  }, [categoryTypeMap, selectedCategoryName, fertilizerTypes]);
  
  // Reset fertilizer type when category changes
  useEffect(() => {
    // Determine if current value is a custom value
    const isCustom = !!selectedFertilizerType && !currentTypeOptions.includes(selectedFertilizerType);
    setOtherTypeSelected(isCustom);
    // If not custom and still invalid for this category, clear
    if (!!selectedFertilizerType && !isCustom) {
      const isValidType = currentTypeOptions.includes(selectedFertilizerType);
      if (!isValidType) setValue('fertilizer_type', '');
    }
  }, [selectedCategoryId, currentTypeOptions, selectedFertilizerType, setValue]);

  const costPrice = watch('cost_price');

  const onSubmit = async (data: ProductFormData) => {
    if (!merchant) return;

    // Validate custom type when 'Other' is selected
    if (otherTypeSelected && (!data.fertilizer_type || !String(data.fertilizer_type).trim())) {
      setError('fertilizer_type', { type: 'required', message: 'Please enter a custom type' });
      return;
    }

    try {
      setLoading(true);

      // 1) If file selected, upload to storage under merchant folder
      let uploadedPath: string | null = imagePath || null;
      if (file) {
        const ext = (file.name.split('.').pop() || 'png').toLowerCase();
        const key = `${merchant.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from('product-images')
          .upload(key, file, { upsert: false, contentType: file.type || 'image/png', cacheControl: '3600' });
        if (upErr) throw upErr;
        uploadedPath = key;
      }

      // Resolve category: if a static value (from Common Categories) is selected
      // Honor merchant setting preferences.auto_create_common_categories (default: true)
      const autoCreateCommon = Boolean(((merchant?.settings as any)?.preferences?.auto_create_common_categories) ?? true);
      let resolvedCategoryId: string | null = null;
      if (data.category_id && data.category_id.startsWith && data.category_id.startsWith('static:')) {
        const staticName = data.category_id.slice('static:'.length);
        if (autoCreateCommon) {
          try {
            // Try to find an existing category with the same name for this merchant
            const { data: existing, error: findErr } = await supabase
              .from('categories')
              .select('id')
              .eq('merchant_id', merchant.id)
              .eq('name', staticName)
              .limit(1)
              .maybeSingle();
            if (findErr) throw findErr;
            if (existing?.id) {
              resolvedCategoryId = existing.id;
            } else {
              // Create a new category
              const newCat = {
                merchant_id: merchant.id,
                name: staticName,
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              } as any;
              const { data: created, error: insertErr } = await supabase
                .from('categories')
                .insert([newCat])
                .select('id')
                .single();
              if (insertErr) throw insertErr;
              resolvedCategoryId = created.id;
            }
          } catch (e) {
            // Fallback: leave as null if category creation fails
            resolvedCategoryId = null;
          }
        } else {
          // Do not auto-create; keep as null for now
          resolvedCategoryId = null;
        }
      } else {
        resolvedCategoryId = data.category_id || null;
      }

      const productData = {
        ...data,
        merchant_id: merchant.id,
        category_id: resolvedCategoryId,
        cost_price: Number(data.cost_price),
        sale_price: Number(data.sale_price),
        current_stock: Number(data.current_stock),
        minimum_stock: Number(data.minimum_stock),
        maximum_stock: data.maximum_stock ? Number(data.maximum_stock) : null,
        expiry_date: data.expiry_date || null,
        manufacturing_date: data.manufacturing_date || null,
        image_path: uploadedPath,
        updated_at: new Date().toISOString(),
      };

      if (product) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);

        if (error) throw error;
        toast.success('Product updated successfully');
      } else {
        const { error } = await supabase
          .from('products')
          .insert([{ ...productData, created_at: new Date().toISOString() }]);

        if (error) throw error;
        toast.success('Product created successfully');
      }

      onSave();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white bg-opacity-10 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-lg w-full h-full sm:w-[95vw] sm:h-[95vh] lg:w-[90vw] lg:h-[90vh] xl:max-w-6xl xl:max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">Basic Information</h3>
              
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Product Name *
                </label>
                <input
                  {...register('name', { required: 'Product name is required' })}
                  type="text"
                  className="w-full px-3 py-2 border-2 border-gray-600 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 text-gray-900"
                  placeholder="Enter product name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">SKU</label>
                <input
                  {...register('sku')}
                  type="text"
                  className="w-full px-3 py-2 border-2 border-gray-600 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 text-gray-900"
                  placeholder="Enter SKU"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Category</label>
                <select
                  {...register('category_id')}
                  className="w-full px-3 py-2 border-2 border-gray-600 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 text-gray-900"
                >
                  <option value="">Select category</option>
                  {categories.length > 0 && (
                    <optgroup label="Your Categories">
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </optgroup>
                  )}
                  <optgroup label="Common Categories">
                    {commonCategories.map((name, idx) => (
                      <option key={`static-${idx}`} value={`static:${name}`}>{name}</option>
                    ))}
                  </optgroup>
                </select>
                <p className="text-xs text-gray-500 mt-1">Select from your existing categories or use a common category (you can create/manage actual categories in the Categories page).</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Fertilizer Type</label>
                <select
                  className="w-full px-3 py-2 border-2 border-gray-600 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 text-gray-900"
                  value={otherTypeSelected ? '__OTHER__' : (selectedFertilizerType || '')}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '__OTHER__') {
                      setOtherTypeSelected(true);
                      setValue('fertilizer_type', '');
                    } else {
                      setOtherTypeSelected(false);
                      setValue('fertilizer_type', val);
                      clearErrors('fertilizer_type');
                    }
                  }}
                >
                  <option value="">Select type</option>
                  {currentTypeOptions.map((name, idx) => (
                    <option key={`ft-${idx}`} value={name}>{name}</option>
                  ))}
                  <option value="__OTHER__">Other (type manually)</option>
                </select>
                {otherTypeSelected && (
                  <input
                    type="text"
                    className="mt-2 w-full px-3 py-2 border-2 border-gray-600 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 text-gray-900"
                    placeholder="Enter custom type"
                    value={selectedFertilizerType || ''}
                    onChange={(e) => {
                      setValue('fertilizer_type', e.target.value);
                      if (e.target.value && e.target.value.trim()) clearErrors('fertilizer_type');
                    }}
                  />
                )}
                {errors.fertilizer_type && (
                  <p className="mt-1 text-sm text-red-600">{errors.fertilizer_type.message as string}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">Showing types for: {selectedCategoryName || 'Fertilizers (default)'}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Brand</label>
                <input
                  {...register('brand')}
                  type="text"
                  className="w-full px-3 py-2 border-2 border-gray-600 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 text-gray-900"
                  placeholder="Enter brand name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">HSN/SAC Code</label>
                <input
                  {...register('hsn_code')}
                  type="text"
                  className="w-full px-3 py-2 border-2 border-gray-600 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 text-gray-900"
                  placeholder="e.g., 31051000 for NPK fertilizers"
                />
                <p className="text-xs text-gray-500 mt-1">HSN code for GST compliance (auto-filled based on fertilizer type)</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">GST Rate (%)</label>
                <input
                  {...register('gst_rate', { 
                    min: { value: 0, message: 'GST rate cannot be negative' },
                    max: { value: 28, message: 'GST rate cannot exceed 28%' }
                  })}
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border-2 border-gray-600 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 text-gray-900"
                  placeholder="5.00"
                />
                {errors.gst_rate && (
                  <p className="mt-1 text-sm text-red-600">{errors.gst_rate.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">GST rate for tax calculations (5% for most fertilizers, 0% for exempt items)</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Cess Rate (%)</label>
                <input
                  {...register('cess_rate', { 
                    min: { value: 0, message: 'Cess rate cannot be negative' }
                  })}
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border-2 border-gray-600 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 text-gray-900"
                  placeholder="0.00"
                />
                {errors.cess_rate && (
                  <p className="mt-1 text-sm text-red-600">{errors.cess_rate.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">Additional cess rate if applicable (usually 0% for fertilizers)</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Manufacturer</label>
                <input
                  {...register('manufacturer')}
                  type="text"
                  className="w-full px-3 py-2 border-2 border-gray-600 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 text-gray-900"
                  placeholder="Manufacturing company name"
                />
                <p className="text-xs text-gray-500 mt-1">Required for FCO compliance</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Packing Details</label>
                <input
                  {...register('packing_details')}
                  type="text"
                  className="w-full px-3 py-2 border-2 border-gray-600 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 text-gray-900"
                  placeholder="e.g., 1 bag of 50kg, 1 bottle of 1L"
                />
                <p className="text-xs text-gray-500 mt-1">Packing information for invoice</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Importing Company</label>
                <input
                  {...register('importing_company')}
                  type="text"
                  className="w-full px-3 py-2 border-2 border-gray-600 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 text-gray-900"
                  placeholder="Importing company (if imported product)"
                />
                <p className="text-xs text-gray-500 mt-1">Only for imported products</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Unit *</label>
                <select
                  {...register('unit', { required: 'Unit is required' })}
                  className="w-full px-3 py-2 border-2 border-gray-600 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 text-gray-900"
                >
                  <option value="kg">Kilogram (kg)</option>
                  <option value="ton">Ton</option>
                  <option value="bag">Bag</option>
                  <option value="liter">Liter</option>
                  <option value="piece">Piece</option>
                  <option value="packet">Packet</option>
                </select>
                {errors.unit && (
                  <p className="mt-1 text-sm text-red-600">{errors.unit.message}</p>
                )}
              </div>
            </div>

            {/* Pricing and Stock */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">Pricing & Stock</h3>
              
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Cost Price *
                </label>
                <input
                  {...register('cost_price', { 
                    required: 'Cost price is required',
                    min: { value: 0, message: 'Cost price must be positive' }
                  })}
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border-2 border-gray-600 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 text-gray-900"
                  placeholder="0.00"
                />
                {errors.cost_price && (
                  <p className="mt-1 text-sm text-red-600">{errors.cost_price.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Sale Price *
                </label>
                <input
                  {...register('sale_price', { 
                    required: 'Sale price is required',
                    min: { value: 0, message: 'Sale price must be positive' }
                  })}
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border-2 border-gray-600 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 text-gray-900"
                  placeholder="0.00"
                />
                {errors.sale_price && (
                  <p className="mt-1 text-sm text-red-600">{errors.sale_price.message}</p>
                )}
                {(Number(costPrice) > 0 && Number(watch('sale_price')) > 0) && (
                  <p className="mt-1 text-sm text-gray-500">
                    Margin: ₹{(Number(watch('sale_price')) - Number(costPrice)).toFixed(2)}
                    {` (`}
                    {(((Number(watch('sale_price')) - Number(costPrice)) / Number(costPrice)) * 100).toFixed(1)}%
                    {`)`}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Current Stock *
                </label>
                <input
                  {...register('current_stock', { 
                    required: 'Current stock is required',
                    min: { value: 0, message: 'Stock cannot be negative' }
                  })}
                  type="number"
                  className="w-full px-3 py-2 border-2 border-gray-600 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 text-gray-900"
                  placeholder="0"
                />
                {errors.current_stock && (
                  <p className="mt-1 text-sm text-red-600">{errors.current_stock.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Minimum Stock *
                </label>
                <input
                  {...register('minimum_stock', { 
                    required: 'Minimum stock is required',
                    min: { value: 0, message: 'Minimum stock cannot be negative' }
                  })}
                  type="number"
                  className="w-full px-3 py-2 border-2 border-gray-600 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 text-gray-900"
                  placeholder="10"
                />
                {errors.minimum_stock && (
                  <p className="mt-1 text-sm text-red-600">{errors.minimum_stock.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Maximum Stock</label>
                <input
                  {...register('maximum_stock')}
                  type="number"
                  className="w-full px-3 py-2 border-2 border-gray-600 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 text-gray-900"
                  placeholder="1000"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Status</label>
                <select
                  {...register('status')}
                  className="w-full px-3 py-2 border-2 border-gray-600 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 text-gray-900"
                >
                  <option value="active">Active</option>
                  <option value="discontinued">Discontinued</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>
            </div>
          </div>

          {/* Enhanced Stock Management */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Enhanced Stock Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Reorder Point *
                </label>
                <input
                  {...register('reorder_point', { 
                    required: 'Reorder point is required',
                    min: { value: 0, message: 'Reorder point cannot be negative' }
                  })}
                  type="number"
                  className="w-full px-3 py-2 border-2 border-gray-600 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 text-gray-900"
                  placeholder="20"
                />
                {errors.reorder_point && (
                  <p className="mt-1 text-sm text-red-600">{errors.reorder_point.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">Alert when stock falls below this level</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Reorder Quantity *
                </label>
                <input
                  {...register('reorder_quantity', { 
                    required: 'Reorder quantity is required',
                    min: { value: 1, message: 'Reorder quantity must be at least 1' }
                  })}
                  type="number"
                  className="w-full px-3 py-2 border-2 border-gray-600 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 text-gray-900"
                  placeholder="100"
                />
                {errors.reorder_quantity && (
                  <p className="mt-1 text-sm text-red-600">{errors.reorder_quantity.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">Suggested quantity to reorder</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Max Stock Level
                </label>
                <input
                  {...register('max_stock_level', {
                    min: { value: 0, message: 'Max stock level cannot be negative' }
                  })}
                  type="number"
                  className="w-full px-3 py-2 border-2 border-gray-600 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 text-gray-900"
                  placeholder="1000"
                />
                {errors.max_stock_level && (
                  <p className="mt-1 text-sm text-red-600">{errors.max_stock_level.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">Maximum stock capacity</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Cost Method
                </label>
                <select
                  {...register('cost_method')}
                  className="w-full px-3 py-2 border-2 border-gray-600 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 text-gray-900"
                >
                  <option value="weighted_average">Weighted Average</option>
                  <option value="fifo">FIFO (First In, First Out)</option>
                  <option value="lifo">LIFO (Last In, First Out)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Stock valuation method</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Shelf Life (Days)
                </label>
                <input
                  {...register('shelf_life_days', {
                    min: { value: 1, message: 'Shelf life must be at least 1 day' }
                  })}
                  type="number"
                  className="w-full px-3 py-2 border-2 border-gray-600 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 text-gray-900"
                  placeholder="365"
                />
                {errors.shelf_life_days && (
                  <p className="mt-1 text-sm text-red-600">{errors.shelf_life_days.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">Default shelf life for new batches</p>
              </div>

              <div className="flex items-center">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    {...register('requires_batch_tracking')}
                    type="checkbox"
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-sm font-semibold text-gray-800">
                    Requires Batch Tracking
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-6">Enable batch/lot tracking for this product</p>
              </div>
            </div>
          </div>

          {/* Batch and Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Image Upload */}
            <div className="md:col-span-1">
              <label className="block text-sm font-semibold text-gray-800 mb-2">Product Image</label>
              <div className="flex items-center gap-3">
                <div className="w-28 h-28 rounded border flex items-center justify-center bg-gray-50 overflow-hidden">
                  {imagePath || file ? (
                    <img
                      src={file ? URL.createObjectURL(file) : (imagePath ? supabase.storage.from('product-images').getPublicUrl(imagePath).data.publicUrl : '')}
                      alt="preview"
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-gray-400">No Image</span>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <input id="prod-image" type="file" accept="image/*" className="hidden" onChange={(e)=>{
                    const f = e.target.files?.[0] || null;
                    setFile(f);
                  }} />
                  <label htmlFor="prod-image" className="px-3 py-1 text-sm bg-green-600 text-white rounded cursor-pointer hover:bg-green-700 w-fit">Upload Image</label>
                  {imagePath && (
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          if (imagePath) {
                            await supabase.storage.from('product-images').remove([imagePath]);
                          }
                          setImagePath(null);
                          setFile(null);
                          toast.success('Image removed');
                        } catch (e: any) {
                          toast.error(e.message || 'Failed to remove image');
                        }
                      }}
                      className="px-3 py-1 text-sm bg-red-50 text-red-700 rounded hover:bg-red-100"
                    >Remove</button>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG, or WebP up to 5MB.</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Batch Number</label>
              <input
                {...register('batch_number')}
                type="text"
                className="w-full px-3 py-2 border-2 border-gray-600 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 text-gray-900"
                placeholder="Enter batch number"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Manufacturing Date</label>
              <input
                {...register('manufacturing_date')}
                type="date"
                className="w-full px-3 py-2 border-2 border-gray-600 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Expiry Date</label>
              <input
                {...register('expiry_date')}
                type="date"
                className="w-full px-3 py-2 border-2 border-gray-600 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 text-gray-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Description</label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-3 py-2 border-2 border-gray-600 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 text-gray-900"
              placeholder="Enter product description..."
            />
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
