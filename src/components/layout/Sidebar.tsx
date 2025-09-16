import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  People as PeopleIcon,
  LocalShipping as LocalShippingIcon,
  ShoppingCart as ShoppingCartIcon,
  ShoppingBag as ShoppingBagIcon,
  BarChart as BarChartIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Logout as LogoutIcon,
  FolderOpen as FolderOpenIcon,
  PointOfSale as PointOfSaleIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Receipt as ReceiptIcon,
  AdminPanelSettings as AdminIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Warning as WarningIcon,
  Science as ScienceIcon,
} from '@mui/icons-material';
import {
  Badge,
  Box,
  Drawer,
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const drawerWidth = 260;
const collapsedDrawerWidth = 64;

type NavItem = { name: string; href: string; icon: JSX.Element };
type NavGroup = { name: string; icon: JSX.Element; items: NavItem[] };

const groups: NavGroup[] = [
  {
    name: 'Sales',
    icon: <ShoppingCartIcon fontSize="small" />,
    items: [
      { name: 'Sales', href: '/sales', icon: <ShoppingCartIcon fontSize="small" /> },
      { name: 'POS', href: '/pos', icon: <PointOfSaleIcon fontSize="small" /> },
      { name: 'E-Invoice', href: '/einvoice', icon: <ReceiptIcon fontSize="small" /> },
    ],
  },
  {
    name: 'Purchases',
    icon: <ShoppingBagIcon fontSize="small" />,
    items: [
      { name: 'Purchases', href: '/purchases', icon: <ShoppingBagIcon fontSize="small" /> },
      { name: 'Purchase Orders', href: '/purchases/orders', icon: <ShoppingBagIcon fontSize="small" /> },
    ],
  },
  {
    name: 'Inventory',
    icon: <InventoryIcon fontSize="small" />,
    items: [
      { name: 'Products', href: '/products', icon: <InventoryIcon fontSize="small" /> },
      { name: 'Categories', href: '/categories', icon: <FolderOpenIcon fontSize="small" /> },
      { name: 'Batch Management', href: '/inventory/batches', icon: <ScienceIcon fontSize="small" /> },
      { name: 'Stock Movements', href: '/inventory/movements', icon: <InventoryIcon fontSize="small" /> },
      { name: 'Stock Take', href: '/inventory/stock-take', icon: <InventoryIcon fontSize="small" /> },
      { name: 'Reorder Alerts', href: '/inventory/reorder-alerts', icon: <WarningIcon fontSize="small" /> },
    ],
  },
  {
    name: 'Suppliers',
    icon: <LocalShippingIcon fontSize="small" />,
    items: [
      { name: 'Suppliers', href: '/suppliers', icon: <LocalShippingIcon fontSize="small" /> },
      { name: 'Supplier Payments', href: '/suppliers/payments', icon: <LocalShippingIcon fontSize="small" /> },
    ],
  },
  {
    name: 'Customers',
    icon: <PeopleIcon fontSize="small" />,
    items: [
      { name: 'Customers', href: '/customers', icon: <PeopleIcon fontSize="small" /> },
    ],
  },

];

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const { signOut, profile } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!profile) return;

    const fetchUnreadCount = async () => {
      const { count, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', profile.id)
        .eq('is_read', false);

      if (!error && count !== null) setUnreadCount(count);
    };

    fetchUnreadCount();

    const channel = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${profile.id}` },
        () => fetchUnreadCount()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile]);

  // Auto-expand group based on current path
  useEffect(() => {
    const path = location.pathname;
    const next: Record<string, boolean> = {};
    for (const g of groups) {
      next[g.name] = g.items.some(it => path.startsWith(it.href));
    }
    setOpenGroups(prev => ({ ...prev, ...next }));
  }, [location.pathname]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };


  return (
    <Drawer
      variant="permanent"
      sx={{
        width: isCollapsed ? collapsedDrawerWidth : drawerWidth,
        flexShrink: 0,
        transition: 'width 0.3s ease',
        '& .MuiDrawer-paper': {
          width: isCollapsed ? collapsedDrawerWidth : drawerWidth,
          boxSizing: 'border-box',
          borderRight: '1px solid rgba(240, 240, 240, 0.3)',
          background: 'rgba(240, 240, 240, 0.15)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
          color: '#333',
          transition: 'width 0.3s ease',
          overflowX: 'hidden',
          position: 'relative',
          zIndex: 1200,
        },
      }}
    >
      <Toolbar sx={{ minHeight: 72, borderBottom: '1px solid rgba(240, 240, 240, 0.3)', px: 2, display: 'flex', justifyContent: isCollapsed ? 'center' : 'space-between', alignItems: 'center', position: 'relative' }}>
        {!isCollapsed && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              component="img"
              src="https://img.icons8.com/arcade/64/field.png"
              alt="KrishiSethu Icon"
              sx={{
                width: 40,
                height: 40,
                objectFit: 'contain',
              }}
            />
            <Box
              component="img"
              src="/Logo_Dashboard.png"
              alt="KrishiSethu Logo"
              sx={{
                height: 50,
                objectFit: 'contain',
                objectPosition: 'left center',
              }}
            />
          </Box>
        )}
        {isCollapsed && (
          <Box
            component="img"
            src="https://img.icons8.com/arcade/64/field.png"
            alt="KrishiSethu Icon"
            sx={{
              width: 40,
              height: 40,
              objectFit: 'contain',
            }}
          />
        )}
        <IconButton
          onClick={onToggleCollapse}
          size="small"
          sx={{
            position: 'absolute',
            right: isCollapsed ? 8 : 16,
            color: '#666',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            border: '1px solid rgba(240, 240, 240, 0.5)',
            '&:hover': {
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              color: '#3b82f6',
            },
          }}
        >
          {isCollapsed ? <MenuIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
        </IconButton>
      </Toolbar>
      <List sx={{ px: 1 }}>
        {/* Dashboard */}
        <NavLink to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          {({ isActive }) => (
            <Tooltip title={isCollapsed ? "Dashboard" : ""} placement="right">
              <ListItemButton 
                selected={isActive} 
                sx={{ 
                  borderRadius: '12px',
                  mb: 0.5,
                  mx: 1,
                  color: '#555',
                  fontWeight: 500,
                  transition: 'all 0.3s ease',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  ...(isActive ? {
                    background: 'rgba(240, 240, 240, 0.8)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    color: '#333'
                  } : {}),
                  '&:hover': {
                    background: 'rgba(240, 240, 240, 0.4)',
                    boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.5), inset 0 -1px 3px rgba(0,0,0,0.1)',
                    color: '#2196f3'
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: isCollapsed ? 'auto' : 36, color: '#666', justifyContent: 'center' }}>
                  <DashboardIcon fontSize="small" />
                </ListItemIcon>
                {!isCollapsed && <ListItemText primary="Dashboard" />}
              </ListItemButton>
            </Tooltip>
          )}
        </NavLink>

        {/* Grouped sections */}
        {groups.map((g) => {
          const open = !isCollapsed && (openGroups[g.name] || false);
          const active = g.items.some(it => location.pathname.startsWith(it.href));
          return (
            <Box key={g.name} sx={{ mb: 0.5 }}>
              <Tooltip title={isCollapsed ? g.name : ""} placement="right">
                <ListItemButton 
                  onClick={() => !isCollapsed && setOpenGroups(prev => ({ ...prev, [g.name]: !open }))} 
                  selected={active} 
                  sx={{ 
                    borderRadius: '12px',
                    mx: 1,
                    color: '#555',
                    fontWeight: 500,
                    transition: 'all 0.3s ease',
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    ...(active ? {
                      background: 'rgba(240, 240, 240, 0.8)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      color: '#333'
                    } : {}),
                    '&:hover': {
                      background: 'rgba(240, 240, 240, 0.4)',
                      boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.5), inset 0 -1px 3px rgba(0,0,0,0.1)',
                      color: '#2196f3'
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: isCollapsed ? 'auto' : 36, color: '#666', justifyContent: 'center' }}>{g.icon}</ListItemIcon>
                  {!isCollapsed && <ListItemText primary={g.name} />}
                  {!isCollapsed && (open ? <ExpandLessIcon fontSize="small" sx={{ color: '#666' }} /> : <ExpandMoreIcon fontSize="small" sx={{ color: '#666' }} />)}
                </ListItemButton>
              </Tooltip>
              {!isCollapsed && (
                <Collapse in={open} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {g.items.map(it => (
                      <NavLink key={it.name} to={it.href} style={{ textDecoration: 'none', color: 'inherit' }}>
                        {({ isActive }) => (
                          <ListItemButton 
                            selected={isActive} 
                            sx={{ 
                              ml: 2, 
                              my: 0.25, 
                              borderRadius: '12px',
                              mx: 2,
                              color: '#555',
                              fontWeight: 500,
                              transition: 'all 0.3s ease',
                              ...(isActive ? {
                                background: 'rgba(240, 240, 240, 0.8)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                color: '#333'
                              } : {}),
                              '&:hover': {
                                background: 'rgba(240, 240, 240, 0.4)',
                                boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.5), inset 0 -1px 3px rgba(0,0,0,0.1)',
                                color: '#2196f3'
                              }
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 30, color: '#666' }}>{it.icon}</ListItemIcon>
                            <ListItemText primary={it.name} />
                          </ListItemButton>
                        )}
                      </NavLink>
                    ))}
                  </List>
                </Collapse>
              )}
            </Box>
          );
        })}

        {/* Reports */}
        <NavLink to="/reports" style={{ textDecoration: 'none', color: 'inherit' }}>
          {({ isActive }) => (
            <Tooltip title={isCollapsed ? "Reports" : ""} placement="right">
              <ListItemButton 
                selected={isActive} 
                sx={{ 
                  borderRadius: '12px',
                  mb: 0.5,
                  mx: 1,
                  color: '#555',
                  fontWeight: 500,
                  transition: 'all 0.3s ease',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  ...(isActive ? {
                    background: 'rgba(240, 240, 240, 0.8)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    color: '#333'
                  } : {}),
                  '&:hover': {
                    background: 'rgba(240, 240, 240, 0.4)',
                    boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.5), inset 0 -1px 3px rgba(0,0,0,0.1)',
                    color: '#2196f3'
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: isCollapsed ? 'auto' : 36, color: '#666', justifyContent: 'center' }}><BarChartIcon fontSize="small" /></ListItemIcon>
                {!isCollapsed && <ListItemText primary="Reports" />}
              </ListItemButton>
            </Tooltip>
          )}
        </NavLink>

        {/* Notifications */}
        <NavLink to="/notifications" style={{ textDecoration: 'none', color: 'inherit' }}>
          {({ isActive }) => (
            <Tooltip title={isCollapsed ? "Notifications" : ""} placement="right">
              <ListItemButton 
                selected={isActive} 
                sx={{ 
                  borderRadius: '12px',
                  mb: 0.5,
                  mx: 1,
                  color: '#555',
                  fontWeight: 500,
                  transition: 'all 0.3s ease',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  ...(isActive ? {
                    background: 'rgba(240, 240, 240, 0.8)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    color: '#333'
                  } : {}),
                  '&:hover': {
                    background: 'rgba(240, 240, 240, 0.4)',
                    boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.5), inset 0 -1px 3px rgba(0,0,0,0.1)',
                    color: '#2196f3'
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: isCollapsed ? 'auto' : 36, color: '#666', justifyContent: 'center' }}>
                  {unreadCount > 0 ? (
                    <Badge color="error" badgeContent={unreadCount} overlap="circular">
                      <NotificationsIcon fontSize="small" />
                    </Badge>
                  ) : (
                    <NotificationsIcon fontSize="small" />
                  )}
                </ListItemIcon>
                {!isCollapsed && <ListItemText primary="Notifications" />}
              </ListItemButton>
            </Tooltip>
          )}
        </NavLink>

        {/* DevAdmin Dashboard - Only show for super admin users */}
        {(profile?.role === 'super_admin' || profile?.is_platform_admin) && (
          <NavLink to="/devadmin" style={{ textDecoration: 'none', color: 'inherit' }}>
            {({ isActive }) => (
              <Tooltip title={isCollapsed ? "DevAdmin" : ""} placement="right">
                <ListItemButton 
                  selected={isActive} 
                  sx={{ 
                    borderRadius: '12px',
                    mb: 0.5,
                    mx: 1,
                    color: '#d32f2f',
                    fontWeight: 600,
                    transition: 'all 0.3s ease',
                    border: '1px solid rgba(211, 47, 47, 0.3)',
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    ...(isActive ? {
                      background: 'rgba(211, 47, 47, 0.1)',
                      boxShadow: '0 4px 12px rgba(211, 47, 47, 0.2)',
                      color: '#d32f2f'
                    } : {}),
                    '&:hover': {
                      background: 'rgba(211, 47, 47, 0.05)',
                      boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.5), inset 0 -1px 3px rgba(211, 47, 47, 0.1)',
                      color: '#d32f2f'
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: isCollapsed ? 'auto' : 36, color: '#d32f2f', justifyContent: 'center' }}><AdminIcon fontSize="small" /></ListItemIcon>
                  {!isCollapsed && <ListItemText primary="DevAdmin" />}
                </ListItemButton>
              </Tooltip>
            )}
          </NavLink>
        )}

        {/* Settings */}
        <NavLink to="/settings" style={{ textDecoration: 'none', color: 'inherit' }}>
          {({ isActive }) => (
            <Tooltip title={isCollapsed ? "Settings" : ""} placement="right">
              <ListItemButton 
                selected={isActive} 
                sx={{ 
                  borderRadius: '12px',
                  mb: 0.5,
                  mx: 1,
                  color: '#555',
                  fontWeight: 500,
                  transition: 'all 0.3s ease',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  ...(isActive ? {
                    background: 'rgba(240, 240, 240, 0.8)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    color: '#333'
                  } : {}),
                  '&:hover': {
                    background: 'rgba(240, 240, 240, 0.4)',
                    boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.5), inset 0 -1px 3px rgba(0,0,0,0.1)',
                    color: '#2196f3'
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: isCollapsed ? 'auto' : 36, color: '#666', justifyContent: 'center' }}><SettingsIcon fontSize="small" /></ListItemIcon>
                {!isCollapsed && <ListItemText primary="Settings" />}
              </ListItemButton>
            </Tooltip>
          )}
        </NavLink>
      </List>

      <Box sx={{ flexGrow: 1 }} />
      <Box sx={{ p: 1.5, borderTop: '1px solid rgba(240, 240, 240, 0.3)' }}>
        <Tooltip title={isCollapsed ? "Sign Out" : ""} placement="right">
          <ListItemButton 
            onClick={handleSignOut} 
            sx={{ 
              borderRadius: '12px',
              mx: 1,
              color: '#555',
              fontWeight: 500,
              transition: 'all 0.3s ease',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              '&:hover': {
                background: 'rgba(240, 240, 240, 0.4)',
                boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.5), inset 0 -1px 3px rgba(0,0,0,0.1)',
                color: '#2196f3'
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: isCollapsed ? 'auto' : 36, color: '#666', justifyContent: 'center' }}>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            {!isCollapsed && <ListItemText primary="Sign Out" />}
          </ListItemButton>
        </Tooltip>
      </Box>
    </Drawer>
  );
}
