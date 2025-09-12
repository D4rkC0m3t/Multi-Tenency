import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Close as CloseIcon } from '@mui/icons-material';
import { supabase, Supplier } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface SupplierFormProps {
  supplier?: Supplier | null;
  onClose: () => void;
  onSave: () => void;
}

interface SupplierFormData {
  name: string;
  company_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  gst_number?: string;
  contact_person?: string;
  payment_terms?: string;
  is_active: boolean;
  notes?: string;
}

export function SupplierForm({ supplier, onClose, onSave }: SupplierFormProps) {
  const { merchant } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SupplierFormData>({
    defaultValues: supplier ? {
      ...supplier,
    } : {
      is_active: true,
    }
  });

  const onSubmit = async (data: SupplierFormData) => {
    if (!merchant) return;

    try {
      setLoading(true);

      const supplierData = {
        ...data,
        merchant_id: merchant.id,
        updated_at: new Date().toISOString(),
      };

      if (supplier) {
        const { error } = await supabase
          .from('suppliers')
          .update(supplierData)
          .eq('id', supplier.id);

        if (error) throw error;
        toast.success('Supplier updated successfully');
      } else {
        const { error } = await supabase
          .from('suppliers')
          .insert([{ ...supplierData, created_at: new Date().toISOString() }]);

        if (error) throw error;
        toast.success('Supplier created successfully');
      }

      onSave();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save supplier');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white bg-opacity-10 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-lg w-full h-full sm:w-[95vw] sm:h-[90vh] lg:w-[85vw] lg:h-[85vh] xl:max-w-4xl xl:max-h-[85vh] overflow-y-auto shadow-2xl border border-gray-200">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {supplier ? 'Edit Supplier' : 'Add New Supplier'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Supplier Information</h3>
              
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Supplier Name *
                </label>
                <input
                  {...register('name', { required: 'Supplier name is required' })}
                  type="text"
                  className="w-full px-3 py-2 border-2 border-gray-600 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 text-gray-900"
                  placeholder="Enter supplier name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Company Name</label>
                <input
                  {...register('company_name')}
                  type="text"
                  className="w-full px-3 py-2 border-2 border-gray-600 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 text-gray-900"
                  placeholder="Enter company name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Contact Person</label>
                <input
                  {...register('contact_person')}
                  type="text"
                  className="w-full px-3 py-2 border-2 border-gray-600 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 text-gray-900"
                  placeholder="Enter contact person's name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Phone</label>
                <input
                  {...register('phone')}
                  type="tel"
                  className="w-full px-3 py-2 border-2 border-gray-600 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 text-gray-900"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Email</label>
                <input
                  {...register('email', {
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  type="email"
                  className="w-full px-3 py-2 border-2 border-gray-600 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 text-gray-900"
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Address Information</h3>
              
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Address</label>
                <textarea
                  {...register('address')}
                  rows={2}
                  className="w-full px-3 py-2 border-2 border-gray-600 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 text-gray-900"
                  placeholder="Enter full address"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">City</label>
                  <input
                    {...register('city')}
                    type="text"
                    className="w-full px-3 py-2 border-2 border-gray-600 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 text-gray-900"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">State</label>
                  <input
                    {...register('state')}
                    type="text"
                    className="w-full px-3 py-2 border-2 border-gray-600 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 text-gray-900"
                    placeholder="State"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Pincode</label>
                <input
                  {...register('pincode')}
                  type="text"
                  className="w-full px-3 py-2 border-2 border-gray-600 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 text-gray-900"
                  placeholder="Pincode"
                />
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">GST Number</label>
              <input
                {...register('gst_number')}
                type="text"
                className="w-full px-3 py-2 border-2 border-gray-600 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 text-gray-900"
                placeholder="Enter GSTIN"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Payment Terms</label>
              <input
                {...register('payment_terms')}
                type="text"
                className="w-full px-3 py-2 border-2 border-gray-600 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 text-gray-900"
                placeholder="e.g., Net 30, Due on receipt"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Notes</label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full px-3 py-2 border-2 border-gray-600 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 text-gray-900"
              placeholder="Enter any additional notes..."
            />
          </div>

          <div className="flex items-center">
            <input
              {...register('is_active')}
              type="checkbox"
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Active supplier
            </label>
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
              {loading ? 'Saving...' : supplier ? 'Update Supplier' : 'Create Supplier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
