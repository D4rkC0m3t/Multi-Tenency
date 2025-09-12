import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  ListItemText,
  Chip,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  Business as BusinessIcon,
  NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 260;

// Breadcrumb mapping for different routes
const routeLabels: Record<string, string> = {
  '/': 'Dashboard',
  '/products': 'Products',
  '/categories': 'Categories',
  '/sales': 'Sales',
  '/pos': 'Point of Sale',
  '/einvoice': 'E-Invoice',
  '/purchases': 'Purchases',
  '/customers': 'Customers',
  '/suppliers': 'Suppliers',
  '/inventory': 'Inventory',
  '/reports': 'Reports',
  '/notifications': 'Notifications',
  '/settings': 'Settings',
  '/devadmin': 'DevAdmin',
};

export function Navbar() {
  const { profile, merchant, signOut } = useAuth();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    handleMenuClose();
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Generate breadcrumbs from current path
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ label: 'Dashboard', path: '/' }];

    let currentPath = '';
    pathSegments.forEach((segment) => {
      currentPath += `/${segment}`;
      const label = routeLabels[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1);
      breadcrumbs.push({ label, path: currentPath });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();
  const currentPageTitle = breadcrumbs[breadcrumbs.length - 1]?.label || 'Dashboard';

  const initials = (profile?.full_name || 'User')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        width: '100%',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.95) 100%)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
        color: '#1e293b',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
      }}
    >
      <Toolbar sx={{ minHeight: 72, px: 3 }}>
        {/* Left side - Page title and breadcrumbs */}
        <Box sx={{ flexGrow: 1 }}>
          <Typography
            variant="h5"
            component="h1"
            sx={{
              fontWeight: 700,
              color: '#0f172a',
              mb: 0.5,
              fontSize: '1.5rem',
            }}
          >
            {currentPageTitle}
          </Typography>
          
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" sx={{ color: '#64748b' }} />}
            sx={{
              '& .MuiBreadcrumbs-separator': {
                mx: 1,
              },
            }}
          >
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return isLast ? (
                <Typography
                  key={crumb.path}
                  variant="body2"
                  sx={{
                    color: '#3b82f6',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                  }}
                >
                  {crumb.label}
                </Typography>
              ) : (
                <Link
                  key={crumb.path}
                  href={crumb.path}
                  underline="hover"
                  sx={{
                    color: '#64748b',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    '&:hover': {
                      color: '#3b82f6',
                    },
                  }}
                >
                  {crumb.label}
                </Link>
              );
            })}
          </Breadcrumbs>
        </Box>

        {/* Right side - Actions and profile */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Business info chip */}
          {merchant && (
            <Chip
              icon={<BusinessIcon sx={{ fontSize: 16 }} />}
              label={merchant.name}
              variant="outlined"
              size="small"
              sx={{
                borderColor: 'rgba(59, 130, 246, 0.3)',
                color: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.05)',
                fontWeight: 500,
                '& .MuiChip-icon': {
                  color: '#3b82f6',
                },
              }}
            />
          )}

          {/* Search button */}
          <IconButton
            size="medium"
            sx={{
              color: '#64748b',
              backgroundColor: 'rgba(248, 250, 252, 0.8)',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              '&:hover': {
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                color: '#3b82f6',
                borderColor: 'rgba(59, 130, 246, 0.3)',
              },
            }}
          >
            <SearchIcon fontSize="small" />
          </IconButton>

          {/* Notifications */}
          <IconButton
            size="medium"
            sx={{
              color: '#64748b',
              backgroundColor: 'rgba(248, 250, 252, 0.8)',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              '&:hover': {
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                color: '#3b82f6',
                borderColor: 'rgba(59, 130, 246, 0.3)',
              },
            }}
          >
            <Badge badgeContent={3} color="error" variant="dot">
              <NotificationsIcon fontSize="small" />
            </Badge>
          </IconButton>

          {/* Settings */}
          <IconButton
            size="medium"
            sx={{
              color: '#64748b',
              backgroundColor: 'rgba(248, 250, 252, 0.8)',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              '&:hover': {
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                color: '#3b82f6',
                borderColor: 'rgba(59, 130, 246, 0.3)',
              },
            }}
          >
            <SettingsIcon fontSize="small" />
          </IconButton>

          {/* Profile menu */}
          <IconButton
            onClick={handleProfileMenuOpen}
            size="medium"
            sx={{
              ml: 1,
              p: 0,
            }}
          >
            <Avatar
              src="/Logo_Dashboard.png"
              alt="KrishiSethu Logo"
              sx={{
                width: 40,
                height: 40,
                background: 'white',
                border: '2px solid rgba(59, 130, 246, 0.2)',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                '& img': {
                  objectFit: 'contain',
                  padding: '2px',
                },
              }}
            >
              {initials}
            </Avatar>
          </IconButton>

          {/* Profile dropdown menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
            PaperProps={{
              elevation: 8,
              sx: {
                mt: 1.5,
                minWidth: 220,
                borderRadius: 2,
                border: '1px solid rgba(226, 232, 240, 0.8)',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
                '& .MuiMenuItem-root': {
                  px: 2,
                  py: 1.5,
                  borderRadius: 1,
                  mx: 1,
                  my: 0.5,
                  '&:hover': {
                    backgroundColor: 'rgba(59, 130, 246, 0.08)',
                  },
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            {/* Profile info */}
            <Box sx={{ px: 2, py: 1.5, mb: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                {profile?.full_name || 'User'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem' }}>
                {profile?.email}
              </Typography>
              <Chip
                label={profile?.role || 'Staff'}
                size="small"
                sx={{
                  mt: 1,
                  height: 20,
                  fontSize: '0.7rem',
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  color: '#16a34a',
                  fontWeight: 500,
                }}
              />
            </Box>

            <Divider sx={{ mx: 1 }} />

            {/* Menu items */}
            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <AccountCircleIcon fontSize="small" sx={{ color: '#64748b' }} />
              </ListItemIcon>
              <ListItemText primary="Profile" />
            </MenuItem>

            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" sx={{ color: '#64748b' }} />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </MenuItem>

            <Divider sx={{ mx: 1 }} />

            <MenuItem onClick={handleSignOut}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" sx={{ color: '#ef4444' }} />
              </ListItemIcon>
              <ListItemText primary="Sign Out" sx={{ color: '#ef4444' }} />
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
