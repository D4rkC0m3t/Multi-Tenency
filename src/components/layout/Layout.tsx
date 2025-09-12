import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

const drawerWidth = 260;
const collapsedDrawerWidth = 64;

export function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f8fafc' }}>
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        onToggleCollapse={handleToggleSidebar}
      />
      <Box 
        sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column',
          minHeight: 0, // Prevents flex item from overflowing
          width: '100%',
        }}
      >
        <Navbar />
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            overflow: 'auto',
            bgcolor: '#f1f5f9',
            p: 3,
            minHeight: 0, // Prevents flex item from overflowing
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
