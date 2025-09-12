import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Close as CloseIcon } from '@mui/icons-material';
import { supabase, Category } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface CategoryFormProps {
  category?: Category | null;
  onClose: () => void;
  onSave: () => void;
}

interface CategoryFormData {
  name: string;
  description?: string;
  is_active: boolean;
}

export function CategoryForm({ category, onClose, onSave }: CategoryFormProps) {
  const { merchant } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryFormData>({
    defaultValues: category ? {
      name: category.name,
      description: category.description || '',
      is_active: category.is_active,
    } : {
      is_active: true,
    }
  });

  const onSubmit = async (data: CategoryFormData) => {
    if (!merchant) return;

    try {
      setLoading(true);

      const categoryData = {
        ...data,
        merchant_id: merchant.id,
        updated_at: new Date().toISOString(),
      };

      if (category) {
        const { error } = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', category.id);

        if (error) throw error;
        toast.success('Category updated successfully');
      } else {
        const { error } = await supabase
          .from('categories')
          .insert([{ ...categoryData, created_at: new Date().toISOString() }]);

        if (error) throw error;
        toast.success('Category created successfully');
      }

      onSave();
    } catch (error: any) {
      console.error('Error saving category:', error);
      toast.error(error.message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-20 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-lg w-full h-full sm:w-[90vw] sm:h-auto sm:max-w-lg lg:max-w-xl shadow-2xl border border-gray-200">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {category ? 'Edit Category' : 'Add New Category'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Category Name *
            </label>
            <input
              {...register('name', { required: 'Category name is required' })}
              type="text"
              className="w-full px-3 py-2 border-2 border-gray-600 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 text-gray-900"
              placeholder="Enter category name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Description</label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-3 py-2 border-2 border-gray-600 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 text-gray-900"
              placeholder="Enter category description..."
            />
          </div>

          <div className="flex items-center">
            <input
              {...register('is_active')}
              type="checkbox"
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Active category
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
              {loading ? 'Saving...' : category ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
