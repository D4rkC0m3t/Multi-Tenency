import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Close as CloseIcon } from '@mui/icons-material';
import { supabase, Customer } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface CustomerFormProps {
  customer?: Customer | null;
  onClose: () => void;
  onSave: () => void;
}

interface CustomerFormData {
  name: string;
  customer_type: string;
  phone?: string;
  email?: string;
  address?: string;
  village?: string;
  district?: string;
  state?: string;
  pincode?: string;
  credit_limit: number;
  outstanding_balance: number;
  is_active: boolean;
  notes?: string;
}

export function CustomerForm({ customer, onClose, onSave }: CustomerFormProps) {
  const { merchant } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormData>({
    defaultValues: customer ? {
      name: customer.name,
      customer_type: customer.customer_type,
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      village: customer.village || '',
      district: customer.district || '',
      state: customer.state || '',
      pincode: customer.pincode || '',
      credit_limit: customer.credit_limit,
      outstanding_balance: customer.outstanding_balance,
      is_active: customer.is_active,
      notes: customer.notes || '',
    } : {
      customer_type: 'farmer',
      credit_limit: 0,
      outstanding_balance: 0,
      is_active: true,
    }
  });

  const onSubmit = async (data: CustomerFormData) => {
    if (!merchant) return;

    try {
      setLoading(true);

      const customerData = {
        ...data,
        merchant_id: merchant.id,
        credit_limit: Number(data.credit_limit),
        outstanding_balance: Number(data.outstanding_balance),
        updated_at: new Date().toISOString(),
      };

      if (customer) {
        const { error } = await supabase
          .from('customers')
          .update(customerData)
          .eq('id', customer.id);

        if (error) throw error;
        toast.success('Customer updated successfully');
      } else {
        const { error } = await supabase
          .from('customers')
          .insert([{ ...customerData, created_at: new Date().toISOString() }]);

        if (error) throw error;
        toast.success('Customer created successfully');
      }

      onSave();
    } catch (error: any) {
      console.error('Error saving customer:', error);
      toast.error(error.message || 'Failed to save customer');
    } finally {
      setLoading(false);
    }
  };

  const customerTypes = ['farmer', 'retailer', 'wholesaler', 'distributor', 'individual'];

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-20 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-lg w-full h-full sm:w-[95vw] sm:h-[90vh] lg:w-[85vw] lg:h-[85vh] xl:max-w-4xl xl:max-h-[85vh] overflow-y-auto shadow-2xl border border-gray-200">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {customer ? 'Edit Customer' : 'Add New Customer'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
              
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Customer Name *
                </label>
                <input
                  {...register('name', { required: 'Customer name is required' })}
                  type="text"
                  className="w-full px-3 py-2 border-2 border-gray-600 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 text-gray-900"
                  placeholder="Enter customer name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Customer Type *
                </label>
                <select
                  {...register('customer_type', { required: 'Customer type is required' })}
                  className="w-full px-3 py-2 border-2 border-gray-600 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 text-gray-900"
                >
                  {customerTypes.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
                {errors.customer_type && (
                  <p className="mt-1 text-sm text-red-600">{errors.customer_type.message}</p>
                )}
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

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Village</label>
                <input
                  {...register('village')}
                  type="text"
                  className="w-full px-3 py-2 border-2 border-gray-600 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 text-gray-900"
                  placeholder="Enter village"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">District</label>
                <input
                  {...register('district')}
                  type="text"
                  className="w-full px-3 py-2 border-2 border-gray-600 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 text-gray-900"
                  placeholder="Enter district"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">State</label>
                  <input
                    {...register('state')}
                    type="text"
                    className="w-full px-3 py-2 border-2 border-gray-600 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 text-gray-900"
                    placeholder="State"
                  />
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
          </div>

          {/* Financial Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Credit Limit</label>
              <input
                {...register('credit_limit', {
                  min: { value: 0, message: 'Credit limit cannot be negative' }
                })}
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border-2 border-gray-600 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 text-gray-900"
                placeholder="0.00"
              />
              {errors.credit_limit && (
                <p className="mt-1 text-sm text-red-600">{errors.credit_limit.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Outstanding Balance</label>
              <input
                {...register('outstanding_balance')}
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border-2 border-gray-600 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 text-gray-900"
                placeholder="0.00"
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
              Active customer
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
              {loading ? 'Saving...' : customer ? 'Update Customer' : 'Create Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
