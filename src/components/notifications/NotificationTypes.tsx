import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
  Chip,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Alert,
} from '@mui/material';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export interface NotificationTemplate {
  id: string;
  merchant_id: string;
  type: 'low_stock' | 'expiry_alert' | 'payment_due' | 'sale_milestone' | 'custom';
  title: string;
  message_template: string;
  delivery_methods: ('in_app' | 'email' | 'sms' | 'whatsapp')[];
  trigger_conditions: Record<string, any>;
  is_active: boolean;
  created_at: string;
}

interface NotificationTypeFormProps {
  open: boolean;
  onClose: () => void;
  template?: NotificationTemplate | null;
  onSaved: () => void;
}

export function NotificationTypeForm({ open, onClose, template, onSaved }: NotificationTypeFormProps) {
  const { merchant } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: template?.type || 'custom' as const,
    title: template?.title || '',
    message_template: template?.message_template || '',
    delivery_methods: template?.delivery_methods || ['in_app'] as ('in_app' | 'email' | 'sms' | 'whatsapp')[],
    trigger_conditions: template?.trigger_conditions || {},
    is_active: template?.is_active ?? true,
  });

  const notificationTypes = [
    { value: 'low_stock', label: 'Low Stock Alert', description: 'Triggered when product stock falls below minimum level' },
    { value: 'expiry_alert', label: 'Product Expiry Alert', description: 'Triggered when products are nearing expiry' },
    { value: 'payment_due', label: 'Payment Due Reminder', description: 'Triggered for overdue customer payments' },
    { value: 'sale_milestone', label: 'Sales Milestone', description: 'Triggered when sales targets are reached' },
    { value: 'custom', label: 'Custom Notification', description: 'Manual notification with custom content' },
  ];

  const deliveryMethods = [
    { value: 'in_app', label: 'In-App Notification', icon: '🔔' },
    { value: 'email', label: 'Email', icon: '📧' },
    { value: 'sms', label: 'SMS', icon: '📱' },
    { value: 'whatsapp', label: 'WhatsApp', icon: '💬' },
  ];

  const handleDeliveryMethodToggle = (method: 'in_app' | 'email' | 'sms' | 'whatsapp') => {
    setFormData(prev => ({
      ...prev,
      delivery_methods: prev.delivery_methods.includes(method)
        ? prev.delivery_methods.filter(m => m !== method)
        : [...prev.delivery_methods, method]
    }));
  };

  const getDefaultTemplate = (type: string) => {
    const templates = {
      low_stock: 'Product {{product_name}} is running low. Current stock: {{current_stock}} units (Minimum: {{minimum_stock}})',
      expiry_alert: 'Product {{product_name}} (Batch: {{batch_number}}) expires on {{expiry_date}}. Please take action.',
      payment_due: 'Payment of ₹{{amount}} from {{customer_name}} is overdue by {{days_overdue}} days.',
      sale_milestone: 'Congratulations! You have achieved ₹{{milestone_amount}} in sales for {{period}}.',
      custom: 'Custom notification message here...'
    };
    return templates[type as keyof typeof templates] || '';
  };

  const handleTypeChange = (type: string) => {
    setFormData(prev => ({
      ...prev,
      type: type as any,
      message_template: getDefaultTemplate(type),
      title: notificationTypes.find(t => t.value === type)?.label || ''
    }));
  };

  const handleSave = async () => {
    if (!merchant) return;
    
    if (!formData.title.trim() || !formData.message_template.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.delivery_methods.length === 0) {
      toast.error('Please select at least one delivery method');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        merchant_id: merchant.id,
        type: formData.type,
        title: formData.title,
        message_template: formData.message_template,
        delivery_methods: formData.delivery_methods,
        trigger_conditions: formData.trigger_conditions,
        is_active: formData.is_active,
      };

      if (template) {
        const { error } = await supabase
          .from('notification_templates')
          .update(payload)
          .eq('id', template.id);
        if (error) throw error;
        toast.success('Notification template updated successfully');
      } else {
        const { error } = await supabase
          .from('notification_templates')
          .insert([payload]);
        if (error) throw error;
        toast.success('Notification template created successfully');
      }

      onSaved();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save notification template');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {template ? 'Edit Notification Template' : 'Create Notification Template'}
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          <FormControl fullWidth>
            <InputLabel>Notification Type</InputLabel>
            <Select
              value={formData.type}
              onChange={(e) => handleTypeChange(e.target.value)}
              label="Notification Type"
            >
              {notificationTypes.map(type => (
                <MenuItem key={type.value} value={type.value}>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {type.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {type.description}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            required
          />

          <TextField
            fullWidth
            label="Message Template"
            multiline
            rows={4}
            value={formData.message_template}
            onChange={(e) => setFormData(prev => ({ ...prev, message_template: e.target.value }))}
            required
            helperText="Use {{variable_name}} for dynamic content like {{product_name}}, {{customer_name}}, etc."
          />

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Delivery Methods
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              {deliveryMethods.map(method => (
                <Chip
                  key={method.value}
                  label={`${method.icon} ${method.label}`}
                  variant={formData.delivery_methods.includes(method.value as any) ? 'filled' : 'outlined'}
                  color={formData.delivery_methods.includes(method.value as any) ? 'primary' : 'default'}
                  onClick={() => handleDeliveryMethodToggle(method.value as any)}
                  clickable
                />
              ))}
            </Stack>
          </Box>

          {formData.type === 'low_stock' && (
            <Alert severity="info">
              <Typography variant="body2">
                Low stock alerts will be triggered automatically when product stock falls below the minimum threshold.
                Available variables: product_name, current_stock, minimum_stock, sku
              </Typography>
            </Alert>
          )}

          {formData.type === 'expiry_alert' && (
            <Alert severity="info">
              <Typography variant="body2">
                Expiry alerts will be triggered for products nearing expiration (configurable days before expiry).
                Available variables: product_name, batch_number, expiry_date, days_until_expiry
              </Typography>
            </Alert>
          )}

          <FormControlLabel
            control={
              <Switch
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
              />
            }
            label="Active"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={loading}>
          {loading ? 'Saving...' : template ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
