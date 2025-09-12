import React, { useEffect, useState } from 'react';
import {
  Card,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Box,
  Stack,
  CircularProgress,
  Button,
  Paper,
  Tabs,
  Tab,
  Fab,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  MarkEmailRead as MarkEmailReadIcon,
  ShoppingCart as ShoppingCartIcon,
  Receipt as ReceiptIcon,
  Add as AddIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { NotificationTypeForm, NotificationTemplate } from './NotificationTypes';
import { LoadingSpinner } from '../common/LoadingStates';

export interface Notification {
  id: string;
  user_id: string;
  merchant_id: string;
  notification_type: 'low_stock' | 'expiry_warning' | 'sale_created' | 'purchase_created' | 'payment_due' | 'sale_milestone' | 'custom';
  message: string;
  reference_id?: string;
  is_read: boolean;
  delivery_method?: 'in_app' | 'email' | 'sms' | 'whatsapp';
  created_at: string;
}

const NotificationIcon = ({ type }: { type: Notification['notification_type'] }) => {
  switch (type) {
    case 'low_stock':
      return <WarningIcon sx={{ color: 'warning.main' }} />;
    case 'expiry_warning':
      return <WarningIcon sx={{ color: 'error.main' }} />;
    case 'payment_due':
      return <ReceiptIcon sx={{ color: 'error.main' }} />;
    case 'sale_milestone':
      return <CheckCircleIcon sx={{ color: 'success.main' }} />;
    case 'custom':
      return <NotificationsIcon sx={{ color: 'info.main' }} />;
    case 'sale_created':
      return <ShoppingCartIcon sx={{ color: 'success.main' }} />;
    case 'purchase_created':
      return <ReceiptIcon sx={{ color: 'info.main' }} />;
    default:
      return <NotificationsIcon sx={{ color: 'text.secondary' }} />;
  }
};

const getNotificationColor = (type: Notification['notification_type']) => {
  switch (type) {
    case 'low_stock':
      return 'warning.main';
    case 'expiry_warning':
      return 'error.main';
    case 'sale_created':
      return 'success.main';
    case 'purchase_created':
      return 'info.main';
    default:
      return 'grey.500';
  }
};

export const NotificationsPage = () => {
  const { profile, merchant } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (profile) {
      fetchNotifications();
    } else {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    if (merchant) {
      fetchTemplates();
    }
  }, [merchant]);

  const fetchNotifications = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      toast.error('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    if (!merchant) return;
    setTemplatesLoading(true);
    try {
      const { data, error } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('merchant_id', merchant.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      toast.error('Failed to load notification templates.');
    } finally {
      setTemplatesLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
      
      if (error) throw error;
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (error) {
      toast.error('Failed to mark as read.');
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!profile) return;
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', profile.id)
        .eq('is_read', false);
      
      if (error) throw error;
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      toast.success('All notifications marked as read.');
    } catch (error) {
      toast.error('Failed to mark all as read.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setNotifications(notifications.filter(n => n.id !== id));
      toast.success('Notification deleted.');
    } catch (error) {
      toast.error('Failed to delete notification.');
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notification_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTemplates(templates.filter(t => t.id !== id));
      toast.success('Template deleted successfully.');
    } catch (error) {
      toast.error('Failed to delete template.');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading notifications..." fullHeight />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Notifications
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Stay updated with important alerts and manage notification settings
          </Typography>
        </Box>
        {tabValue === 0 && (
          <Button
            onClick={handleMarkAllAsRead}
            variant="contained"
            startIcon={<MarkEmailReadIcon />}
            disabled={notifications.every(n => n.is_read)}
          >
            Mark All as Read
          </Button>
        )}
        {tabValue === 1 && (
          <Button
            onClick={() => {
              setSelectedTemplate(null);
              setShowTemplateForm(true);
            }}
            variant="contained"
            startIcon={<AddIcon />}
          >
            Add Template
          </Button>
        )}
      </Stack>

      <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
        <Tab label="Notifications" />
        <Tab label="Templates" />
      </Tabs>

      {tabValue === 0 && (
        <Card>
          {loading ? (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <CircularProgress size={40} />
            </Box>
          ) : notifications.length === 0 ? (
            <Paper sx={{ p: 6, textAlign: 'center' }}>
              <NotificationsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.primary" gutterBottom>
                No notifications
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You're all caught up!
              </Typography>
            </Paper>
          ) : (
            <List>
              {notifications.map((notification) => (
                <React.Fragment key={notification.id}>
                  <ListItem
                    sx={{
                      bgcolor: !notification.is_read ? 'action.hover' : 'transparent',
                      borderLeft: !notification.is_read ? 4 : 0,
                      borderColor: getNotificationColor(notification.notification_type)
                    }}
                  >
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: getNotificationColor(notification.notification_type) }}>
                        <NotificationIcon type={notification.notification_type} />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography variant="body1" sx={{ flexGrow: 1 }}>
                            {notification.message}
                          </Typography>
                          {!notification.is_read && (
                            <Chip label="New" size="small" color="primary" />
                          )}
                        </Stack>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </Typography>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Stack direction="row" spacing={1}>
                        {!notification.is_read && (
                          <Tooltip title="Mark as read">
                            <IconButton
                              onClick={() => handleMarkAsRead(notification.id)}
                              color="primary"
                              size="small"
                            >
                              <CheckCircleIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Delete">
                          <IconButton
                            onClick={() => handleDelete(notification.id)}
                            color="error"
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </ListItemSecondaryAction>
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          )}
        </Card>
      )}

      {tabValue === 1 && (
        <Card>
          {templatesLoading ? (
            <LoadingSpinner text="Loading templates..." />
          ) : templates.length === 0 ? (
            <Paper sx={{ p: 6, textAlign: 'center' }}>
              <SettingsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.primary" gutterBottom>
                No notification templates
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Create templates to automate your notifications
              </Typography>
              <Button
                onClick={() => {
                  setSelectedTemplate(null);
                  setShowTemplateForm(true);
                }}
                variant="contained"
                startIcon={<AddIcon />}
              >
                Create First Template
              </Button>
            </Paper>
          ) : (
            <List>
              {templates.map((template) => (
                <React.Fragment key={template.id}>
                  <ListItem>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: template.is_active ? 'success.main' : 'grey.500' }}>
                        <NotificationIcon type={template.type as any} />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography variant="body1" sx={{ flexGrow: 1 }}>
                            {template.title}
                          </Typography>
                          <Chip
                            label={template.is_active ? 'Active' : 'Inactive'}
                            size="small"
                            color={template.is_active ? 'success' : 'default'}
                          />
                          {template.delivery_methods.map(method => (
                            <Chip
                              key={method}
                              label={method.toUpperCase()}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Stack>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {template.message_template}
                        </Typography>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Edit template">
                          <IconButton
                            onClick={() => {
                              setSelectedTemplate(template);
                              setShowTemplateForm(true);
                            }}
                            color="primary"
                            size="small"
                          >
                            <SettingsIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete template">
                          <IconButton
                            onClick={() => handleDeleteTemplate(template.id)}
                            color="error"
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </ListItemSecondaryAction>
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          )}
        </Card>
      )}

      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => {
          if (tabValue === 0) {
            setTabValue(1);
          } else {
            setSelectedTemplate(null);
            setShowTemplateForm(true);
          }
        }}
      >
        <AddIcon />
      </Fab>

      <NotificationTypeForm
        open={showTemplateForm}
        onClose={() => {
          setShowTemplateForm(false);
          setSelectedTemplate(null);
        }}
        template={selectedTemplate}
        onSaved={() => {
          fetchTemplates();
          setShowTemplateForm(false);
          setSelectedTemplate(null);
        }}
      />
    </Box>
  );
};
