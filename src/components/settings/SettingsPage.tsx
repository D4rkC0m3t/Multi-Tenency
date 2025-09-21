import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Switch,
  Divider,
  Avatar,
  Stack,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import {
  Person as PersonIcon,
  Business as BusinessIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Palette as PaletteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

// Helper function to get display name for GST registration type
const getGSTRegistrationTypeDisplayName = (type: string): string => {
  switch (type) {
    case 'regular': return 'Regular GST';
    case 'composition': return 'Composition Scheme';
    case 'exempt': return 'Exempt Supplies';
    case 'unregistered': return 'Unregistered';
    default: return 'Regular GST';
  }
};
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import { getAllIndianStates } from '../../utils/gstCalculations';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export function SettingsPage() {
  const { user, profile, merchant, updateProfile } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [editingProfile, setEditingProfile] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [pwdCurrent, setPwdCurrent] = useState('');
  const [pwdNew, setPwdNew] = useState('');
  const [pwdConfirm, setPwdConfirm] = useState('');
  const [savingPref, setSavingPref] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState(false);
  const [bizSaving, setBizSaving] = useState(false);
  const [bizForm, setBizForm] = useState({
    name: merchant?.name || '',
    business_type: merchant?.business_type || '',
    owner_name: merchant?.owner_name || '',
    gst_number: merchant?.gst_number || '',
    pan_number: merchant?.pan_number || '',
    cin_number: merchant?.cin_number || '',
    fertilizer_license: merchant?.fertilizer_license || '',
    seed_license: merchant?.seed_license || '',
    pesticide_license: merchant?.pesticide_license || '',
    dealer_registration_id: merchant?.dealer_registration_id || '',
    address: merchant?.address || '',
    state: merchant?.state || '',
    gst_registration_type: (merchant as any)?.gst_registration_type || 'regular',
    composition_dealer: (merchant as any)?.composition_dealer || false,
    exempt_supplies: (merchant as any)?.exempt_supplies || false,
    phone: merchant?.phone || '',
    email: merchant?.email || '',
    website: merchant?.website || '',
    bank_name: merchant?.bank_name || '',
    account_number: merchant?.account_number || '',
    ifsc_code: merchant?.ifsc_code || '',
    upi_id: merchant?.upi_id || '',
  });
  const [creatingBiz, setCreatingBiz] = useState(false);
  const [newBiz, setNewBiz] = useState({
    name: '',
    business_type: '',
    owner_name: '',
    gst_number: '',
    pan_number: '',
    cin_number: '',
    fertilizer_license: '',
    seed_license: '',
    pesticide_license: '',
    dealer_registration_id: '',
    address: '',
    state: '',
    gst_registration_type: 'regular',
    composition_dealer: false,
    exempt_supplies: false,
    phone: '',
    email: '',
    website: '',
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    upi_id: '',
  });

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      full_name: profile?.full_name || '',
      phone: profile?.phone || '',
      email: user?.email || '',
    },
  });

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const onCreateBusiness = async () => {
    try {
      if (!user) {
        toast.error('You must be signed in');
        return;
      }
      if (!newBiz.name.trim()) {
        toast.error('Business name is required');
        return;
      }
      setCreatingBiz(true);
      const now = new Date().toISOString();
      const payload: any = {
        name: newBiz.name.trim(),
        business_type: newBiz.business_type.trim() || 'retail',
        owner_name: newBiz.owner_name.trim() || null,
        gst_number: newBiz.gst_number.trim() || null,
        pan_number: newBiz.pan_number.trim() || null,
        cin_number: newBiz.cin_number.trim() || null,
        fertilizer_license: newBiz.fertilizer_license.trim() || null,
        seed_license: newBiz.seed_license.trim() || null,
        pesticide_license: newBiz.pesticide_license.trim() || null,
        dealer_registration_id: newBiz.dealer_registration_id.trim() || null,
        address: newBiz.address.trim() || null,
        state: newBiz.state.trim() || null,
        gst_registration_type: newBiz.gst_registration_type,
        composition_dealer: newBiz.composition_dealer,
        exempt_supplies: newBiz.exempt_supplies,
        phone: newBiz.phone.trim() || null,
        email: newBiz.email.trim() || null,
        website: newBiz.website.trim() || null,
        bank_name: newBiz.bank_name.trim() || null,
        account_number: newBiz.account_number.trim() || null,
        ifsc_code: newBiz.ifsc_code.trim() || null,
        upi_id: newBiz.upi_id.trim() || null,
        is_active: true,
        settings: {
          features: {
            logo_upload: true,
            invoice_customization: true,
            advanced_reporting: true,
            multi_location: true,
            api_access: true
          },
          preferences: {
            dark_mode: false,
            compact_view: false,
            auto_backup: true,
            email_notifications: true
          },
          limits: {
            max_products: 10000,
            max_customers: 5000,
            max_invoices_per_month: 1000,
            storage_mb: 1000
          }
        },
        created_at: now,
        updated_at: now,
        owner_id: user.id,
      };
      const { data: merchantRow, error: mErr } = await supabase
        .from('merchants')
        .insert(payload)
        .select('*')
        .single();
      if (mErr) throw mErr;

      const { error: pErr } = await supabase
        .from('profiles')
        .update({ merchant_id: merchantRow.id, updated_at: now })
        .eq('id', user.id);
      if (pErr) throw pErr;

      toast.success('Business created and linked to your profile');
      window.location.reload();
    } catch (e: any) {
      toast.error(e.message || 'Failed to create business');
    } finally {
      setCreatingBiz(false);
    }
  };

  const handleBizChange = (field: keyof typeof bizForm, value: string) => {
    setBizForm(prev => ({ ...prev, [field]: value }));
  };

  const onBusinessSave = async () => {
    if (!merchant) return;
    try {
      setBizSaving(true);
      const payload = {
        name: bizForm.name.trim(),
        business_type: bizForm.business_type.trim(),
        owner_name: bizForm.owner_name.trim() || null,
        gst_number: bizForm.gst_number.trim() || null,
        pan_number: bizForm.pan_number.trim() || null,
        cin_number: bizForm.cin_number.trim() || null,
        fertilizer_license: bizForm.fertilizer_license.trim() || null,
        seed_license: bizForm.seed_license.trim() || null,
        pesticide_license: bizForm.pesticide_license.trim() || null,
        dealer_registration_id: bizForm.dealer_registration_id.trim() || null,
        address: bizForm.address.trim() || null,
        state: bizForm.state.trim() || null,
        gst_registration_type: bizForm.gst_registration_type,
        composition_dealer: bizForm.composition_dealer,
        exempt_supplies: bizForm.exempt_supplies,
        phone: bizForm.phone.trim() || null,
        email: bizForm.email.trim() || null,
        website: bizForm.website.trim() || null,
        bank_name: bizForm.bank_name.trim() || null,
        account_number: bizForm.account_number.trim() || null,
        ifsc_code: bizForm.ifsc_code.trim() || null,
        upi_id: bizForm.upi_id.trim() || null,
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase
        .from('merchants')
        .update(payload)
        .eq('id', merchant.id);
      if (error) throw error;
      toast.success('Business information updated');
      window.location.reload();
    } catch (e: any) {
      toast.error(e.message || 'Failed to save business information');
    } finally {
      setBizSaving(false);
    }
  };

  const onProfileSubmit = async (data: any) => {
    try {
      await updateProfile({
        full_name: data.full_name,
        phone: data.phone,
      });
      setEditingProfile(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleCancelEdit = () => {
    reset();
    setEditingProfile(false);
  };

  const getSettings = () => (merchant?.settings as any) || {};

  const patchMerchantSettings = async (path: string[], value: any) => {
    if (!merchant) return;
    try {
      setSavingPref(true);
      const current = { ...getSettings() };
      // deep set
      let cursor: any = current;
      for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        cursor[key] = cursor[key] ?? {};
        cursor = cursor[key];
      }
      cursor[path[path.length - 1]] = value;
      const { error } = await supabase
        .from('merchants')
        .update({ settings: current, updated_at: new Date().toISOString() })
        .eq('id', merchant.id);
      if (error) throw error;
      toast.success('Settings saved');
      // simple approach to reflect new settings across app
      window.location.reload();
    } catch (e: any) {
      toast.error(e.message || 'Failed to save settings');
    } finally {
      setSavingPref(false);
    }
  };

  const onChangePassword = async () => {
    try {
      if (!pwdNew || pwdNew.length < 6) {
        toast.error('New password must be at least 6 characters');
        return;
      }
      if (pwdNew !== pwdConfirm) {
        toast.error('New password and confirmation do not match');
        return;
      }
      // Note: Supabase does not require current password here if session is valid
      const { error } = await supabase.auth.updateUser({ password: pwdNew });
      if (error) throw error;
      toast.success('Password updated');
      setPwdCurrent(''); setPwdNew(''); setPwdConfirm('');
    } catch (e: any) {
      toast.error(e.message || 'Failed to update password');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Settings
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage your account and application preferences
      </Typography>

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="settings tabs">
            <Tab icon={<PersonIcon />} label="Profile" />
            <Tab icon={<BusinessIcon />} label="Business" />
            <Tab icon={<NotificationsIcon />} label="Notifications" />
            <Tab icon={<SecurityIcon />} label="Security" />
            <Tab icon={<PaletteIcon />} label="Preferences" />
          </Tabs>
        </Box>

        {/* Profile Tab */}
        <TabPanel value={tabValue} index={0}>
          <CardContent>
            <Stack direction="row" spacing={3} alignItems="flex-start">
              <Avatar
                sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}
              >
                {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                  <Typography variant="h5" fontWeight="bold">
                    Personal Information
                  </Typography>
                  {!editingProfile && (
                    <IconButton
                      onClick={() => setEditingProfile(true)}
                      color="primary"
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                  )}
                </Stack>

                {editingProfile ? (
                  <form onSubmit={handleSubmit(onProfileSubmit)}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <Controller
                          name="full_name"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Full Name"
                              fullWidth
                              required
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Controller
                          name="email"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Email"
                              type="email"
                              fullWidth
                              disabled
                              helperText="Email cannot be changed"
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Controller
                          name="phone"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Phone Number"
                              fullWidth
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Role"
                          value={profile?.role || 'N/A'}
                          fullWidth
                          disabled
                          helperText="Role is managed by administrators"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Stack direction="row" spacing={2}>
                          <Button
                            type="submit"
                            variant="contained"
                            startIcon={<SaveIcon />}
                          >
                            Save Changes
                          </Button>
                          <Button
                            onClick={handleCancelEdit}
                            variant="outlined"
                            startIcon={<CancelIcon />}
                          >
                            Cancel
                          </Button>
                        </Stack>
                      </Grid>
                    </Grid>
                  </form>
                ) : (
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Full Name</Typography>
                      <Typography variant="body1">{profile?.full_name || 'Not set'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Email</Typography>
                      <Typography variant="body1">{user?.email}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Phone</Typography>
                      <Typography variant="body1">{profile?.phone || 'Not set'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Role</Typography>
                      <Chip label={profile?.role || 'N/A'} color="primary" size="small" />
                    </Grid>
                  </Grid>
                )}
              </Box>
            </Stack>
          </CardContent>
        </TabPanel>

        {/* Business Tab */}
        <TabPanel value={tabValue} index={1}>
          <CardContent>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography variant="h5" fontWeight="bold">
                Business Information
              </Typography>
              {merchant && (
                <Stack direction="row" spacing={1}>
                  {!editingBusiness ? (
                    <Button size="small" variant="outlined" startIcon={<EditIcon />} onClick={() => setEditingBusiness(true)}>Edit</Button>
                  ) : (
                    <>
                      <Button size="small" variant="contained" startIcon={<SaveIcon />} onClick={onBusinessSave} disabled={bizSaving}>Save</Button>
                      <Button size="small" variant="outlined" startIcon={<CancelIcon />} onClick={() => { setEditingBusiness(false); setBizForm({ name: merchant.name || '', business_type: merchant.business_type || '', owner_name: merchant.owner_name || '', gst_number: merchant.gst_number || '', pan_number: merchant.pan_number || '', cin_number: merchant.cin_number || '', fertilizer_license: merchant.fertilizer_license || '', seed_license: merchant.seed_license || '', pesticide_license: merchant.pesticide_license || '', dealer_registration_id: merchant.dealer_registration_id || '', address: merchant.address || '', phone: merchant.phone || '', email: merchant.email || '', website: merchant.website || '', bank_name: merchant.bank_name || '', account_number: merchant.account_number || '', ifsc_code: merchant.ifsc_code || '', upi_id: merchant.upi_id || '' }); }}>Cancel</Button>
                    </>
                  )}
                </Stack>
              )}
            </Stack>
            {import.meta.env.DEV && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Merchant ID: {merchant?.id || 'N/A'} | User ID: {user?.id || 'N/A'}
                </Typography>
              </Box>
            )}
            {merchant ? (
              <Grid container spacing={2}>
                <Grid item xs={12} sx={{ mb: 1 }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar
                      src={(merchant.settings as any)?.logo_data || (merchant.settings as any)?.logo_url || ''}
                      sx={{ width: 72, height: 72 }}
                      variant="rounded"
                    />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Business Logo</Typography>
                      <Typography variant="caption" color="text.secondary">PNG/JPG, recommended square image</Typography>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                        <Button
                          component="label"
                          variant="outlined"
                          size="small"
                          disabled={uploadingLogo}
                        >
                          {uploadingLogo ? 'Uploading…' : 'Upload Logo'}
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={async (e) => {
                              const inputEl = e.currentTarget as HTMLInputElement;
                              const file = inputEl.files?.[0];
                              if (!file || !merchant) return;
                              
                              // Validate file size (5MB max)
                              if (file.size > 5 * 1024 * 1024) {
                                toast.error('File size must be less than 5MB');
                                return;
                              }
                              
                              // Validate file type
                              if (!file.type.startsWith('image/')) {
                                toast.error('Please select an image file');
                                return;
                              }
                              
                              try {
                                setUploadingLogo(true);
                                
                                // Convert image to base64
                                const reader = new FileReader();
                                reader.onload = async (event) => {
                                  try {
                                    const base64String = event.target?.result as string;
                                    
                                    const newSettings = { 
                                      ...(merchant.settings as any), 
                                      logo_data: base64String,
                                      logo_filename: file.name,
                                      logo_type: file.type
                                    };
                                    
                                    const { error: updErr } = await supabase
                                      .from('merchants')
                                      .update({ settings: newSettings, updated_at: new Date().toISOString() })
                                      .eq('id', merchant.id);
                                    if (updErr) throw updErr;
                                    
                                    toast.success('Logo updated successfully');
                                    window.location.reload();
                                  } catch (err: any) {
                                    toast.error(err.message || 'Failed to save logo');
                                  } finally {
                                    setUploadingLogo(false);
                                    try { inputEl.value = ''; } catch {}
                                  }
                                };
                                
                                reader.onerror = () => {
                                  toast.error('Failed to read file');
                                  setUploadingLogo(false);
                                };
                                
                                reader.readAsDataURL(file);
                              } catch (err: any) {
                                toast.error(err.message || 'Failed to process logo');
                                setUploadingLogo(false);
                                try { inputEl.value = ''; } catch {}
                              }
                            }}
                          />
                        </Button>
                        {((merchant.settings as any)?.logo_data || (merchant.settings as any)?.logo_url) && (
                          <Button
                            variant="text"
                            size="small"
                            onClick={async () => {
                              if (!merchant) return;
                              try {
                                const newSettings = { ...(merchant.settings as any) };
                                delete newSettings.logo_url;
                                delete newSettings.logo_data;
                                delete newSettings.logo_filename;
                                delete newSettings.logo_type;
                                const { error: updErr } = await supabase
                                  .from('merchants')
                                  .update({ settings: newSettings, updated_at: new Date().toISOString() })
                                  .eq('id', merchant.id);
                                if (updErr) throw updErr;
                                toast.success('Logo removed');
                                window.location.reload();
                              } catch (err: any) {
                                toast.error(err.message || 'Failed to remove logo');
                              }
                            }}
                          >Remove</Button>
                        )}
                      </Stack>
                    </Box>
                  </Stack>
                </Grid>
                {!editingBusiness ? (
                  <>
                    {/* Basic Identity Section */}
                    <Grid item xs={12}>
                      <Typography variant="h6" color="primary" sx={{ mb: 1, mt: 2 }}>🔹 Basic Identity</Typography>
                      <Divider sx={{ mb: 2 }} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Business Name</Typography>
                      <Typography variant="body1">{merchant.name}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Business Type</Typography>
                      <Typography variant="body1">{merchant.business_type || 'Not set'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Owner/Contact Person</Typography>
                      <Typography variant="body1">{(merchant as any).owner_name || 'Not set'}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Business Address</Typography>
                      <Typography variant="body1">{merchant.address || 'Not set'}</Typography>
                    </Grid>

                    {/* Registration & Tax IDs Section */}
                    <Grid item xs={12}>
                      <Typography variant="h6" color="primary" sx={{ mb: 1, mt: 3 }}>🔹 Registration & Tax IDs</Typography>
                      <Divider sx={{ mb: 2 }} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">GST Number (GSTIN)</Typography>
                      <Typography variant="body1">{merchant.gst_number || 'Not set'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">GST Registration Type</Typography>
                      <Typography variant="body1">
                        {getGSTRegistrationTypeDisplayName((merchant as any)?.gst_registration_type || 'regular')}
                        {(merchant as any)?.composition_dealer && ' (Composition)'}
                        {(merchant as any)?.exempt_supplies && ' (Exempt)'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">PAN Number</Typography>
                      <Typography variant="body1">{(merchant as any).pan_number || 'Not set'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">CIN Number</Typography>
                      <Typography variant="body1">{(merchant as any).cin_number || 'Not set'}</Typography>
                    </Grid>

                    {/* Licensing Section */}
                    <Grid item xs={12}>
                      <Typography variant="h6" color="primary" sx={{ mb: 1, mt: 3 }}>🔹 Fertilizer/Seed Dealer Licensing</Typography>
                      <Divider sx={{ mb: 2 }} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Fertilizer Sale License (FCO)</Typography>
                      <Typography variant="body1">{(merchant as any).fertilizer_license || 'Not set'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Seed License Number</Typography>
                      <Typography variant="body1">{(merchant as any).seed_license || 'Not set'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Insecticide/Pesticide License</Typography>
                      <Typography variant="body1">{(merchant as any).pesticide_license || 'Not set'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">State Agricultural Dept. Registration</Typography>
                      <Typography variant="body1">{(merchant as any).dealer_registration_id || 'Not set'}</Typography>
                    </Grid>

                    {/* Address & Contact Section */}
                    <Grid item xs={12}>
                      <Typography variant="h6" color="primary" sx={{ mb: 1, mt: 3 }}>🔹 Business Address & Contact</Typography>
                      <Divider sx={{ mb: 2 }} />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Registered Office Address</Typography>
                      <Typography variant="body1">{merchant.address || 'Not set'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">State</Typography>
                      <Typography variant="body1">{merchant.state || 'Not set'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Phone Number</Typography>
                      <Typography variant="body1">{merchant.phone || 'Not set'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Email Address</Typography>
                      <Typography variant="body1">{merchant.email || 'Not set'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Website</Typography>
                      <Typography variant="body1">{(merchant as any).website || 'Not set'}</Typography>
                    </Grid>

                    {/* Banking Details Section */}
                    <Grid item xs={12}>
                      <Typography variant="h6" color="primary" sx={{ mb: 1, mt: 3 }}>🔹 Banking Details</Typography>
                      <Divider sx={{ mb: 2 }} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Bank Name</Typography>
                      <Typography variant="body1">{(merchant as any).bank_name || 'Not set'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Account Number</Typography>
                      <Typography variant="body1">{(merchant as any).account_number ? '****' + (merchant as any).account_number.slice(-4) : 'Not set'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">IFSC Code</Typography>
                      <Typography variant="body1">{(merchant as any).ifsc_code || 'Not set'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">UPI ID</Typography>
                      <Typography variant="body1">{(merchant as any).upi_id || 'Not set'}</Typography>
                    </Grid>
                  </>
                ) : (
                  <>
                    {/* Basic Identity Section */}
                    <Grid item xs={12}>
                      <Typography variant="h6" color="primary" sx={{ mb: 1, mt: 2 }}>🔹 Basic Identity</Typography>
                      <Divider sx={{ mb: 2 }} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Business Name" fullWidth value={bizForm.name} onChange={(e)=>handleBizChange('name', e.target.value)} required />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        label="Business Type" 
                        fullWidth 
                        value={bizForm.business_type} 
                        onChange={(e)=>handleBizChange('business_type', e.target.value)}
                        placeholder="merchant / distributor / retailer / manufacturer"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Owner/Contact Person Name" fullWidth value={bizForm.owner_name} onChange={(e)=>handleBizChange('owner_name', e.target.value)} />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField 
                        label="Business Address" 
                        fullWidth 
                        multiline
                        rows={2}
                        value={bizForm.address} 
                        onChange={(e)=>handleBizChange('address', e.target.value)}
                        placeholder="Complete business address with state and pincode"
                        helperText="Required for FCO compliance and invoice"
                      />
                    </Grid>

                    {/* Registration & Tax IDs Section */}
                    <Grid item xs={12}>
                      <Typography variant="h6" color="primary" sx={{ mb: 1, mt: 3 }}>🔹 Registration & Tax IDs</Typography>
                      <Divider sx={{ mb: 2 }} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        label="GST Number (GSTIN)" 
                        fullWidth 
                        value={bizForm.gst_number} 
                        onChange={(e)=>handleBizChange('gst_number', e.target.value)}
                        placeholder="22AAAAA0000A1Z5"
                        helperText="Mandatory for invoicing & compliance"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>GST Registration Type</InputLabel>
                        <Select
                          value={bizForm.gst_registration_type}
                          onChange={(e)=>handleBizChange('gst_registration_type', e.target.value)}
                          label="GST Registration Type"
                        >
                          <MenuItem value="regular">Regular GST</MenuItem>
                          <MenuItem value="composition">Composition Scheme</MenuItem>
                          <MenuItem value="exempt">Exempt Supplies</MenuItem>
                          <MenuItem value="unregistered">Unregistered</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <Box display="flex" gap={2}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={bizForm.composition_dealer}
                              onChange={(e) => handleBizChange('composition_dealer', e.target.checked)}
                            />
                          }
                          label="Composition Dealer"
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={bizForm.exempt_supplies}
                              onChange={(e) => handleBizChange('exempt_supplies', e.target.checked)}
                            />
                          }
                          label="Exempt Supplies"
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        label="PAN Number" 
                        fullWidth 
                        value={bizForm.pan_number} 
                        onChange={(e)=>handleBizChange('pan_number', e.target.value)}
                        placeholder="AAAAA0000A"
                        helperText="Linked to GST, needed for taxation"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        label="CIN Number" 
                        fullWidth 
                        value={bizForm.cin_number} 
                        onChange={(e)=>handleBizChange('cin_number', e.target.value)}
                        placeholder="U74999DL2020PTC123456"
                        helperText="Only if Pvt Ltd/LLP"
                      />
                    </Grid>

                    {/* Licensing Section */}
                    <Grid item xs={12}>
                      <Typography variant="h6" color="primary" sx={{ mb: 1, mt: 3 }}>🔹 Fertilizer/Seed Dealer Licensing</Typography>
                      <Divider sx={{ mb: 2 }} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        label="Fertilizer Sale License (FCO)" 
                        fullWidth 
                        value={bizForm.fertilizer_license} 
                        onChange={(e)=>handleBizChange('fertilizer_license', e.target.value)}
                        helperText="Issued by agriculture department"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        label="Seed License Number" 
                        fullWidth 
                        value={bizForm.seed_license} 
                        onChange={(e)=>handleBizChange('seed_license', e.target.value)}
                        helperText="If you sell seeds"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        label="Insecticide/Pesticide License" 
                        fullWidth 
                        value={bizForm.pesticide_license} 
                        onChange={(e)=>handleBizChange('pesticide_license', e.target.value)}
                        helperText="If you sell pesticides"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        label="State Agricultural Dept. Registration" 
                        fullWidth 
                        value={bizForm.dealer_registration_id} 
                        onChange={(e)=>handleBizChange('dealer_registration_id', e.target.value)}
                        helperText="Dealer registration ID"
                      />
                    </Grid>

                    {/* Address & Contact Section */}
                    <Grid item xs={12}>
                      <Typography variant="h6" color="primary" sx={{ mb: 1, mt: 3 }}>🔹 Business Address & Contact</Typography>
                      <Divider sx={{ mb: 2 }} />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField 
                        label="Registered Office Address" 
                        fullWidth 
                        multiline 
                        minRows={2} 
                        value={bizForm.address} 
                        onChange={(e)=>handleBizChange('address', e.target.value)}
                        placeholder="Street, City, District, Pin Code"
                        helperText="Complete business address (exclude state - select below)"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>State</InputLabel>
                        <Select
                          value={bizForm.state}
                          onChange={(e)=>handleBizChange('state', e.target.value)}
                          label="State"
                        >
                          <MenuItem value="">Select State</MenuItem>
                          {getAllIndianStates().map(state => (
                            <MenuItem key={state.stateCode} value={state.stateName}>
                              {state.stateName}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        label="Phone Number" 
                        fullWidth 
                        value={bizForm.phone} 
                        onChange={(e)=>handleBizChange('phone', e.target.value)}
                        placeholder="Mobile + Landline"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        label="Email Address" 
                        fullWidth 
                        type="email" 
                        value={bizForm.email} 
                        onChange={(e)=>handleBizChange('email', e.target.value)}
                        placeholder="For correspondence & invoices"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        label="Website" 
                        fullWidth 
                        value={bizForm.website} 
                        onChange={(e)=>handleBizChange('website', e.target.value)}
                        placeholder="https://yourwebsite.com"
                      />
                    </Grid>

                    {/* Banking Details Section */}
                    <Grid item xs={12}>
                      <Typography variant="h6" color="primary" sx={{ mb: 1, mt: 3 }}>🔹 Banking Details</Typography>
                      <Divider sx={{ mb: 2 }} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        label="Bank Name" 
                        fullWidth 
                        value={bizForm.bank_name} 
                        onChange={(e)=>handleBizChange('bank_name', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        label="Account Number" 
                        fullWidth 
                        value={bizForm.account_number} 
                        onChange={(e)=>handleBizChange('account_number', e.target.value)}
                        type="password"
                        helperText="Will be masked for security"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        label="IFSC Code" 
                        fullWidth 
                        value={bizForm.ifsc_code} 
                        onChange={(e)=>handleBizChange('ifsc_code', e.target.value)}
                        placeholder="SBIN0001234"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        label="UPI ID" 
                        fullWidth 
                        value={bizForm.upi_id} 
                        onChange={(e)=>handleBizChange('upi_id', e.target.value)}
                        placeholder="yourname@paytm"
                        helperText="If you accept UPI payments"
                      />
                    </Grid>
                  </>
                )}

                <Grid item xs={12}>
                  <Paper sx={{ p: 2 }} variant="outlined">
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Invoice Terms / Notes
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      minRows={3}
                      placeholder="These notes will appear at the bottom of the printed invoice."
                      defaultValue={(merchant.settings as any)?.invoice_terms || ''}
                      onBlur={async (e) => {
                        const value = e.target.value;
                        try {
                          const newSettings = { ...(merchant.settings as any), invoice_terms: value };
                          const { error: updErr } = await supabase
                            .from('merchants')
                            .update({ settings: newSettings, updated_at: new Date().toISOString() })
                            .eq('id', merchant.id);
                          if (updErr) throw updErr;
                          toast.success('Invoice terms saved');
                        } catch (err: any) {
                          toast.error(err.message || 'Failed to save invoice terms');
                        }
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      Tip: Keep it short and informative (e.g., return policy, thank-you note).
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            ) : (
              <Paper sx={{ p: 3 }}>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <BusinessIcon color="action" />
                    <Typography variant="h6">Create Your Business</Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    No business is linked to your profile. Create one to enable branding on invoices and configure preferences.
                  </Typography>
                  <Grid container spacing={2}>
                    {/* Basic Identity */}
                    <Grid item xs={12}>
                      <Typography variant="h6" color="primary" sx={{ mb: 1 }}>🔹 Basic Identity</Typography>
                      <Divider sx={{ mb: 2 }} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Business Name" fullWidth required value={newBiz.name} onChange={(e)=>setNewBiz({...newBiz, name: e.target.value})} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        label="Business Type" 
                        fullWidth 
                        value={newBiz.business_type} 
                        onChange={(e)=>setNewBiz({...newBiz, business_type: e.target.value})} 
                        placeholder="merchant / distributor / retailer / manufacturer" 
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Owner/Contact Person Name" fullWidth value={newBiz.owner_name} onChange={(e)=>setNewBiz({...newBiz, owner_name: e.target.value})} />
                    </Grid>

                    {/* Registration & Tax IDs */}
                    <Grid item xs={12}>
                      <Typography variant="h6" color="primary" sx={{ mb: 1, mt: 2 }}>🔹 Registration & Tax IDs</Typography>
                      <Divider sx={{ mb: 2 }} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        label="GST Number (GSTIN)" 
                        fullWidth 
                        value={newBiz.gst_number} 
                        onChange={(e)=>setNewBiz({...newBiz, gst_number: e.target.value})} 
                        placeholder="22AAAAA0000A1Z5"
                        helperText="Mandatory for invoicing & compliance"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        label="PAN Number" 
                        fullWidth 
                        value={newBiz.pan_number} 
                        onChange={(e)=>setNewBiz({...newBiz, pan_number: e.target.value})} 
                        placeholder="AAAAA0000A"
                      />
                    </Grid>

                    {/* Licensing */}
                    <Grid item xs={12}>
                      <Typography variant="h6" color="primary" sx={{ mb: 1, mt: 2 }}>🔹 Fertilizer/Seed Dealer Licensing</Typography>
                      <Divider sx={{ mb: 2 }} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        label="Fertilizer Sale License (FCO)" 
                        fullWidth 
                        value={newBiz.fertilizer_license} 
                        onChange={(e)=>setNewBiz({...newBiz, fertilizer_license: e.target.value})} 
                        helperText="Issued by agriculture department"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        label="Seed License Number" 
                        fullWidth 
                        value={newBiz.seed_license} 
                        onChange={(e)=>setNewBiz({...newBiz, seed_license: e.target.value})} 
                      />
                    </Grid>

                    {/* Address & Contact */}
                    <Grid item xs={12}>
                      <Typography variant="h6" color="primary" sx={{ mb: 1, mt: 2 }}>🔹 Business Address & Contact</Typography>
                      <Divider sx={{ mb: 2 }} />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField 
                        label="Registered Office Address" 
                        fullWidth 
                        multiline 
                        minRows={2} 
                        value={newBiz.address} 
                        onChange={(e)=>setNewBiz({...newBiz, address: e.target.value})} 
                        placeholder="Street, City, District, State, Pin Code"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        label="Phone Number" 
                        fullWidth 
                        value={newBiz.phone} 
                        onChange={(e)=>setNewBiz({...newBiz, phone: e.target.value})} 
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        label="Email Address" 
                        fullWidth 
                        type="email" 
                        value={newBiz.email} 
                        onChange={(e)=>setNewBiz({...newBiz, email: e.target.value})} 
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Stack direction="row" spacing={2}>
                        <Button variant="contained" onClick={onCreateBusiness} disabled={creatingBiz}>
                          {creatingBiz ? 'Creating…' : 'Create Business'}
                        </Button>
                      </Stack>
                    </Grid>
                  </Grid>
                </Stack>
              </Paper>
            )}
          </CardContent>
        </TabPanel>

        {/* Notifications Tab */}
        <TabPanel value={tabValue} index={2}>
          <CardContent>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Notification Preferences
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <NotificationsIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Low Stock Alerts"
                  secondary="Get notified when products are running low"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={Boolean(getSettings().notifications?.low_stock)}
                    onChange={(e) => patchMerchantSettings(['notifications','low_stock'], e.target.checked)}
                    disabled={!merchant || savingPref}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <NotificationsIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Expiry Warnings"
                  secondary="Receive alerts for products nearing expiry"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={Boolean(getSettings().notifications?.expiry_warnings)}
                    onChange={(e) => patchMerchantSettings(['notifications','expiry_warnings'], e.target.checked)}
                    disabled={!merchant || savingPref}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <NotificationsIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Sales Notifications"
                  secondary="Get notified about new sales transactions"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={Boolean(getSettings().notifications?.sales_notifications)}
                    onChange={(e) => patchMerchantSettings(['notifications','sales_notifications'], e.target.checked)}
                    disabled={!merchant || savingPref}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <NotificationsIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Purchase Notifications"
                  secondary="Receive alerts for new purchase orders"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={Boolean(getSettings().notifications?.purchase_notifications)}
                    onChange={(e) => patchMerchantSettings(['notifications','purchase_notifications'], e.target.checked)}
                    disabled={!merchant || savingPref}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </CardContent>
        </TabPanel>

        {/* Security Tab */}
        <TabPanel value={tabValue} index={3}>
          <CardContent>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Security Settings
            </Typography>
            <Stack spacing={3}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Change Password
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="Current Password"
                      type="password"
                      fullWidth
                      value={pwdCurrent}
                      onChange={(e) => setPwdCurrent(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="New Password"
                      type="password"
                      fullWidth
                      value={pwdNew}
                      onChange={(e) => setPwdNew(e.target.value)}
                      helperText={pwdNew && pwdNew.length < 6 ? 'Must be at least 6 characters' : ' '}
                      error={Boolean(pwdNew) && pwdNew.length < 6}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Confirm New Password"
                      type="password"
                      fullWidth
                      value={pwdConfirm}
                      onChange={(e) => setPwdConfirm(e.target.value)}
                      helperText={pwdConfirm && pwdConfirm !== pwdNew ? 'Passwords do not match' : ' '}
                      error={Boolean(pwdConfirm) && pwdConfirm !== pwdNew}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button variant="contained" color="primary" onClick={onChangePassword}>
                      Update Password
                    </Button>
                  </Grid>
                </Grid>
              </Paper>

              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Two-Factor Authentication
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Add an extra layer of security to your account
                </Typography>
                <Button variant="outlined" color="primary">
                  Enable 2FA
                </Button>
              </Paper>
            </Stack>
          </CardContent>
        </TabPanel>

        {/* Preferences Tab */}
        <TabPanel value={tabValue} index={4}>
          <CardContent>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Application Preferences
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Dark Mode"
                  secondary="Switch between light and dark themes"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={Boolean(getSettings().preferences?.dark_mode)}
                    onChange={(e) => patchMerchantSettings(['preferences','dark_mode'], e.target.checked)}
                    disabled={!merchant || savingPref}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Compact View"
                  secondary="Use a more compact layout for tables and lists"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={Boolean(getSettings().preferences?.compact_view)}
                    onChange={(e) => patchMerchantSettings(['preferences','compact_view'], e.target.checked)}
                    disabled={!merchant || savingPref}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Auto-create Common Categories"
                  secondary="When selecting a Common Category in Product form, automatically create it in your Categories if missing"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={Boolean(getSettings().preferences?.auto_create_common_categories ?? true)}
                    onChange={(e) => patchMerchantSettings(['preferences','auto_create_common_categories'], e.target.checked)}
                    disabled={!merchant || savingPref}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Auto-save"
                  secondary="Automatically save form data as you type"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={Boolean(getSettings().preferences?.auto_save ?? true)}
                    onChange={(e) => patchMerchantSettings(['preferences','auto_save'], e.target.checked)}
                    disabled={!merchant || savingPref}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </CardContent>
        </TabPanel>
      </Card>
    </Box>
  );
}
