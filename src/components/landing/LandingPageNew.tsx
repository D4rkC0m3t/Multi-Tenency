import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Package, AlertTriangle, Warehouse, PieChart, Users, BarChart3,
  CheckCircle, Star, Menu, X, Shield, Clock, TrendingUp, 
  Globe, Phone, Mail, Sun, Moon, ChevronDown, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const [isAnnual, setIsAnnual] = useState(false);

  useEffect(() => {
    // Apply theme-based color system
    document.body.style.margin = '0';
    document.body.style.fontFamily = '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
    document.body.style.backgroundColor = isDarkMode ? '#0A0F19' : '#FFFFFF';
    document.body.style.color = isDarkMode ? '#E2E8F0' : '#475569';
    document.body.style.fontSize = '16px';
    (document.body.style as any).webkitFontSmoothing = 'antialiased';

    return () => {
      document.body.style.margin = '';
      document.body.style.fontFamily = '';
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
      document.body.style.fontSize = '';
      (document.body.style as any).webkitFontSmoothing = '';
    };
  }, [isDarkMode]);

  // Scroll effect for plant rotation (Dapper style)
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ 
      backgroundColor: isDarkMode ? '#0A0F19' : '#FFFFFF' 
    }}>
      {/* Glassmorphism Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 w-full z-50"
        style={{
          backgroundColor: isDarkMode ? 'rgba(10,15,25,0.8)' : 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(229,231,235,0.3)'}`
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div className="flex items-center space-x-3" whileHover={{ scale: 1.02 }}>
              <img 
                src="/Logo_Dashboard.png" 
                alt="KrishiSethu - Smart Fertilizer Inventory Management" 
                className="h-16 w-auto object-contain"
                loading="eager"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </motion.div>

            <div className="hidden md:flex items-center space-x-8">
              {/* Services Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setActiveDropdown('services')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button className="flex items-center space-x-1 font-medium transition-colors group">
                  <span style={{ color: isDarkMode ? '#CBD5E1' : '#6B7280' }}>Services</span>
                  <ChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180" />
                </button>
                
                <AnimatePresence>
                  {activeDropdown === 'services' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 mt-2 w-80 rounded-xl shadow-2xl"
                      style={{
                        backgroundColor: isDarkMode ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.95)',
                        backdropFilter: 'blur(20px)',
                        border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(229,231,235,0.3)'}`
                      }}
                    >
                      <div className="p-6 grid grid-cols-1 gap-4">
                        {[
                          { title: 'Inventory Tracking', desc: 'Real-time stock monitoring', icon: Package },
                          { title: 'Analytics & Reports', desc: 'Data-driven insights', icon: BarChart3 },
                          { title: 'Multi-Warehouse', desc: 'Centralized management', icon: Warehouse }
                        ].map((service, index) => (
                          <motion.div
                            key={index}
                            className="p-3 rounded-lg transition-all duration-200 cursor-pointer group"
                            whileHover={{ 
                              backgroundColor: isDarkMode ? 'rgba(22,163,74,0.1)' : 'rgba(22,163,74,0.05)',
                              x: 5
                            }}
                          >
                            <div className="flex items-start space-x-3">
                              <service.icon className="h-5 w-5 text-green-500 mt-0.5" />
                              <div>
                                <h4 className="font-medium text-sm" style={{ color: isDarkMode ? '#FFFFFF' : '#111827' }}>
                                  {service.title}
                                </h4>
                                <p className="text-xs" style={{ color: isDarkMode ? '#CBD5E1' : '#6B7280' }}>
                                  {service.desc}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Other nav items */}
              {['features', 'pricing', 'testimonials'].map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className="font-medium transition-colors relative group"
                  style={{
                    color: isDarkMode ? '#CBD5E1' : '#6B7280'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = isDarkMode ? '#FFFFFF' : '#111827'}
                  onMouseLeave={(e) => e.currentTarget.style.color = isDarkMode ? '#CBD5E1' : '#6B7280'}
                >
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-green-500 to-blue-500 group-hover:w-full transition-all duration-300"></span>
                </button>
              ))}
              <motion.button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-lg transition-colors mr-2"
                style={{
                  color: isDarkMode ? '#CBD5E1' : '#6B7280',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = isDarkMode ? '#FFFFFF' : '#111827';
                  e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = isDarkMode ? '#CBD5E1' : '#6B7280';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </motion.button>
              <motion.button
                onClick={() => navigate('/login')}
                className="font-medium transition-colors mr-4"
                style={{
                  color: isDarkMode ? '#CBD5E1' : '#6B7280'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = isDarkMode ? '#FFFFFF' : '#111827'}
                onMouseLeave={(e) => e.currentTarget.style.color = isDarkMode ? '#CBD5E1' : '#6B7280'}
                whileHover={{ scale: 1.02 }}
              >
                Login
              </motion.button>
              <motion.button
                onClick={() => navigate('/login')}
                className="px-6 py-2 rounded-lg font-medium text-white relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #16A34A 0%, #06B6D4 100%)',
                  boxShadow: '0 4px 15px rgba(22,163,74,0.3)'
                }}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: '0 8px 25px rgba(22,163,74,0.4)'
                }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="relative z-10">Get Started Free</span>
                <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-blue-600 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              </motion.button>
            </div>

            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-600 hover:text-gray-900"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden border-t border-gray-100 bg-white"
              >
                <div className="px-4 py-4 space-y-3">
                  {['features', 'use-cases', 'pricing', 'testimonials'].map((section) => (
                    <button
                      key={section}
                      onClick={() => {
                        scrollToSection(section);
                        setIsMobileMenuOpen(false);
                      }}
                      className="block text-gray-600 hover:text-gray-900 font-medium"
                    >
                      {section === 'use-cases' ? 'Use Cases' : section.charAt(0).toUpperCase() + section.slice(1)}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      navigate('/login');
                      setIsMobileMenuOpen(false);
                    }}
                    className="block text-gray-600 hover:text-gray-900 font-medium"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      navigate('/login');
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Get Started Free
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ 
        background: isDarkMode ? '#0A0F19' : '#FFFFFF' 
      }}>
        {/* Background glows */}
        <div 
          className="absolute pointer-events-none"
          style={{
            width: '700px',
            height: '700px',
            background: 'radial-gradient(circle at 20% 30%, rgba(22,163,74,0.08), transparent 70%)',
            top: '-200px',
            left: '-200px'
          }}
        ></div>
        <div 
          className="absolute pointer-events-none"
          style={{
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle at 80% 70%, rgba(6,182,212,0.05), transparent 80%)',
            bottom: '-150px',
            right: '-150px'
          }}
        ></div>

        {/* Dapper Flower Element - With Scroll Rotation */}
        <div className="absolute top-10 right-0 pointer-events-none opacity-10 hidden lg:block">
          <motion.div 
            className="dapper-flower"
            initial={{ opacity: 0, x: 100, rotate: -10 }}
            animate={{ opacity: 0.15, x: 0, rotate: 0 }}
            transition={{ duration: 2, delay: 0.8 }}
            style={{ 
              transform: `scale(1.5) rotate(${scrollY * 0.1}deg)`,
              transformOrigin: 'center center'
            }}
          >
            {/* Small leaf */}
            <motion.svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="200" 
              viewBox="0 0 69 61" 
              fill="none"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 1.2 }}
              style={{ 
                position: 'absolute',
                top: '50px',
                right: '100px',
                color: isDarkMode ? '#16A34A' : '#22C55E'
              }}
            >
              <path 
                d="M42.3753 0H0L19.2855 31.9042C28.7118 48.2252 49.7393 60.2887 68.5727 60.2887V15.4979L42.3753 0Z" 
                fill="currentColor"
              />
            </motion.svg>

            {/* Large leaf */}
            <motion.svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="300" 
              viewBox="0 0 92 81" 
              fill="none"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, delay: 1.0 }}
              style={{ 
                position: 'absolute',
                top: '0px',
                right: '0px',
                color: isDarkMode ? 'rgba(22,163,74,0.8)' : 'rgba(34,197,94,0.6)'
              }}
            >
              <path 
                d="M35.4236 0.615234H91.9996L66.2916 43.1067C53.7206 64.9159 25.7245 80.9999 0.582031 80.9999V21.2886L35.4236 0.615234Z" 
                fill="currentColor"
              />
            </motion.svg>
          </motion.div>
        </div>
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6" style={{ 
                color: isDarkMode ? '#FFFFFF' : '#0F172A',
                textShadow: isDarkMode ? '0 2px 4px rgba(0,0,0,0.3)' : '0 2px 4px rgba(15,23,42,0.1)'
              }}>
                Smart Fertilizer{' '}
                <span 
                  className="relative inline-block"
                  style={{
                    background: 'linear-gradient(135deg, #16A34A 0%, #06B6D4 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  <em>Inventory</em>
                  <motion.div
                    className="absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ delay: 1, duration: 0.8 }}
                  ></motion.div>
                </span>{' '}
                for Modern Agriculture
              </h1>
              <p className="text-xl mb-8 leading-relaxed" style={{ 
                color: isDarkMode ? '#E2E8F0' : '#475569' 
              }}>
                Track, manage, and optimize your fertilizer stock in real-time — reduce waste, boost profits, and simplify operations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  onClick={() => navigate('/login')}
                  className="text-white px-8 py-4 rounded-lg text-lg font-bold inline-flex items-center justify-center transition-all duration-200 relative overflow-hidden"
                  style={{ 
                    backgroundColor: '#16A34A',
                    boxShadow: '0 6px 18px rgba(22,163,74,0.15), 0 0 0 1px rgba(22,163,74,0.1)'
                  }}
                  whileHover={{ 
                    scale: 1.02,
                    y: -2,
                    backgroundColor: '#15803D',
                    boxShadow: '0 12px 26px rgba(22,163,74,0.22), 0 0 20px rgba(22,163,74,0.3)'
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </motion.button>
                <button
                  onClick={() => scrollToSection('features')}
                  className="px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid #E6EDF3',
                    color: '#0F172A'
                  }}
                >
                  See Features
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              {/* Floating Dashboard Mockup with Qoder-style glow */}
              <div className="relative">
                {/* Enhanced glow effects */}
                <div 
                  className="absolute -inset-8 rounded-full blur-3xl opacity-30"
                  style={{
                    background: 'radial-gradient(circle, rgba(22,163,74,0.15) 0%, rgba(6,182,212,0.1) 50%, transparent 70%)'
                  }}
                ></div>
                <div 
                  className="absolute -inset-4 rounded-2xl opacity-20"
                  style={{
                    background: 'linear-gradient(135deg, rgba(22,163,74,0.1) 0%, rgba(6,182,212,0.05) 100%)',
                    filter: 'blur(20px)'
                  }}
                ></div>
                <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 shadow-2xl transform rotate-1 hover:rotate-0 transition-all duration-500" style={{
                  boxShadow: '0 25px 50px rgba(0,0,0,0.1), 0 0 30px rgba(22,163,74,0.1)'
                }}>
                  <div className="rounded-lg shadow-lg overflow-hidden transform -rotate-1" style={{
                    background: 'linear-gradient(135deg, #0A0F19 0%, #1E293B 100%)'
                  }}>
                    <img 
                      src="/Life cycle.png" 
                      alt="Fertilizer Inventory Management Life Cycle" 
                      className="w-full h-auto object-contain"
                      style={{ maxHeight: '400px' }}
                      onError={(e) => {
                        console.error('Failed to load Life cycle.png');
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20" style={{ backgroundColor: '#F8FAFC' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#0F172A' }}>
              Everything you need to manage fertilizer inventory
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: '#475569' }}>
              Track, manage, and optimize your fertilizer stock with powerful features designed for modern agriculture
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: <Package className="h-8 w-8" style={{ color: '#16A34A' }} />,
                  title: "Real-Time Stock Tracking",
                  description: "Know exactly how much fertilizer you have — anytime, anywhere.",
                  gradient: "from-green-50 to-emerald-50",
                  glowColor: "rgba(22,163,74,0.15)"
                },
                {
                  icon: <AlertTriangle className="h-8 w-8" style={{ color: '#F59E0B' }} />,
                  title: "Expiry & Batch Alerts", 
                  description: "Never miss critical stock rotations. Automated reminders reduce losses.",
                  gradient: "from-orange-50 to-amber-50",
                  glowColor: "rgba(245,158,11,0.15)"
                },
                {
                  icon: <Warehouse className="h-8 w-8" style={{ color: '#06B6D4' }} />,
                  title: "Multi-Warehouse Support",
                  description: "Easily manage multiple storage sites with a single dashboard.",
                  gradient: "from-cyan-50 to-blue-50", 
                  glowColor: "rgba(6,182,212,0.15)"
                },
                {
                  icon: <PieChart className="h-8 w-8" style={{ color: '#16A34A' }} />,
                  title: "Reports & Analytics",
                  description: "Get sales, usage, and stock reports in one click.",
                  gradient: "from-violet-50 to-purple-50",
                  glowColor: "rgba(139,92,246,0.15)"
                }
              ].map((feature, index) => (
              <motion.div
                key={index}
                className={`p-8 rounded-2xl transition-all duration-500 group relative overflow-hidden bg-gradient-to-br ${feature.gradient}`}
                style={{
                  border: '1px solid rgba(255,255,255,0.5)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
                  backdropFilter: 'blur(10px)'
                }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                whileHover={{ 
                  y: -8,
                  scale: 1.02,
                  boxShadow: `0 20px 60px rgba(0,0,0,0.1), 0 0 40px ${feature.glowColor}`,
                  borderColor: 'rgba(255,255,255,0.8)'
                }}
              >
                {/* Premium glow effect */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                  style={{
                    background: `radial-gradient(circle at 50% 50%, ${feature.glowColor} 0%, transparent 70%)`
                  }}
                ></div>
                
                {/* Animated icon container */}
                <motion.div 
                  className="mb-6 relative z-10"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="w-16 h-16 rounded-xl bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    {feature.icon}
                  </div>
                </motion.div>
                
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-3 group-hover:text-gray-900 transition-colors" style={{ color: '#0F172A' }}>
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed group-hover:text-gray-700 transition-colors" style={{ color: '#64748B' }}>
                    {feature.description}
                  </p>
                </div>
                
                {/* Sparkle effect */}
                <motion.div
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100"
                  initial={{ scale: 0 }}
                  whileHover={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Sparkles className="h-5 w-5 text-yellow-400" />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section with Enhanced Design */}
      <section id="use-cases" className="py-20 relative overflow-hidden" style={{
        background: isDarkMode ? 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)' : 'linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 100%)'
      }}>
        {/* Background decorative elements */}
        <div className="absolute top-0 left-1/4 w-96 h-96 opacity-5 pointer-events-none">
          <div style={{
            background: 'radial-gradient(circle, rgba(22,163,74,0.3) 0%, transparent 70%)',
            filter: 'blur(60px)',
            width: '100%',
            height: '100%'
          }}></div>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{
              color: isDarkMode ? '#FFFFFF' : '#0F172A'
            }}>
              Perfect for <em className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-500">every</em> agricultural business
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{
              color: isDarkMode ? '#CBD5E1' : '#64748B'
            }}>
              From small farms to large distributors, our solution scales with your needs
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mb-2"><Users className="h-8 w-8 text-green-600" /></div>,
                title: "👨‍🌾 Farmers",
                description: "Track stock and avoid waste with smart inventory management tailored for farm operations.",
                gradient: "from-green-50 to-emerald-50"
              },
              {
                icon: <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mb-2"><Warehouse className="h-8 w-8 text-blue-600" /></div>,
                title: "🏬 Distributors", 
                description: "Manage multiple warehouses and streamline distribution across different locations.",
                gradient: "from-blue-50 to-sky-50"
              },
              {
                icon: <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mb-2"><BarChart3 className="h-8 w-8 text-purple-600" /></div>,
                title: "🏢 Agri-Retailers",
                description: "Speed up sales and avoid stockouts with real-time inventory tracking and alerts.",
                gradient: "from-purple-50 to-violet-50"
              }
            ].map((useCase, index) => (
              <motion.div
                key={index}
                className={`relative p-8 rounded-2xl text-center group cursor-pointer overflow-hidden`}
                style={{
                  background: isDarkMode 
                    ? 'rgba(255,255,255,0.05)' 
                    : `linear-gradient(135deg, ${useCase.gradient.includes('green') ? '#F0FDF4, #ECFDF5' : useCase.gradient.includes('blue') ? '#F0F9FF, #E0F2FE' : '#FAF5FF, #F3E8FF'})`,
                  border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)'}`,
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.04)'
                }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ 
                  y: -10,
                  scale: 1.03,
                  boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
                  borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.8)'
                }}
              >
                <div className="mb-6 flex justify-center">
                  {useCase.icon}
                </div>
                {/* Glow effect on hover */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                  style={{
                    background: 'radial-gradient(circle at 50% 50%, rgba(22,163,74,0.08) 0%, transparent 70%)'
                  }}
                ></div>
                
                <div className="relative z-10">
                  <h3 className="text-xl font-semibold mb-4 group-hover:scale-105 transition-transform duration-300" style={{
                    color: isDarkMode ? '#FFFFFF' : '#0F172A'
                  }}>
                    {useCase.title}
                  </h3>
                  <p className="leading-relaxed" style={{
                    color: isDarkMode ? '#CBD5E1' : '#64748B'
                  }}>
                    {useCase.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20" style={{ backgroundColor: '#F8FAFC' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#0F172A' }}>
              Simple, transparent pricing
            </h2>
            <p className="text-lg mb-6" style={{ color: '#475569' }}>
              Choose the plan that fits your business needs
            </p>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center mb-8">
              <span className={`mr-3 text-sm font-medium ${!isAnnual ? 'text-green-600' : 'text-gray-500'}`}>
                Monthly
              </span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isAnnual ? 'bg-green-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isAnnual ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`ml-3 text-sm font-medium ${isAnnual ? 'text-green-600' : 'text-gray-500'}`}>
                Annual
              </span>
              {isAnnual && (
                <span className="ml-2 px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                  Save 16%
                </span>
              )}
            </div>
            
            <p className="text-sm" style={{ color: '#6B7280' }}>
              No credit card required for free trial
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Free",
                price: "₹0",
                period: "/month",
                description: "Perfect for small farms getting started",
                features: ["Up to 50 products", "Basic inventory tracking", "Email support"],
                cta: "Start Free",
                popular: false
              },
              {
                name: "Pro",
                price: "$79",
                period: "/month",
                annualPrice: "$796",
                annualPeriod: "/year",
                savings: "Save 16%",
                description: "Ideal for growing agricultural businesses",
                features: ["Unlimited products", "Multi-warehouse support", "Advanced analytics", "Priority support"],
                cta: "Start Free Trial",
                popular: true
              },
              {
                name: "Enterprise",
                price: "Custom",
                period: "",
                description: "For large operations with custom needs",
                features: ["Everything in Pro", "Custom integrations", "Dedicated support", "Training & onboarding"],
                cta: "Contact Sales",
                popular: false
              }
            ].map((plan, index) => (
              <motion.div
                key={index}
                className="p-8 rounded-xl transition-all duration-300 relative group"
                style={{
                  backgroundColor: '#FFFFFF',
                  border: plan.popular ? '2px solid #16A34A' : '1px solid #E6EDF3',
                  boxShadow: plan.popular 
                    ? '0 18px 40px rgba(22,163,74,0.08)' 
                    : '0 6px 20px rgba(11,18,32,0.03)',
                  transform: plan.popular ? 'translateY(-6px)' : 'translateY(0)'
                }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ 
                  y: plan.popular ? -12 : -8,
                  boxShadow: plan.popular 
                    ? '0 25px 50px rgba(22,163,74,0.12)' 
                    : '0 12px 40px rgba(11,18,32,0.08)'
                }}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="px-4 py-1 rounded-full text-sm font-medium text-white" style={{ backgroundColor: '#16A34A' }}>
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2" style={{ color: '#0F172A' }}>{plan.name}</h3>
                  <div className="mb-4">
                    {plan.name === 'Pro' ? (
                      <>
                        <span className="text-4xl font-extrabold" style={{ color: '#0F172A' }}>
                          {isAnnual ? plan.annualPrice : plan.price}
                        </span>
                        <span style={{ color: '#6B7280' }}>
                          {isAnnual ? plan.annualPeriod : plan.period}
                        </span>
                        {isAnnual && (
                          <div className="mt-2">
                            <span className="text-sm text-green-600 font-medium">
                              {plan.savings} • Was ${79 * 12}/year
                            </span>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <span className="text-4xl font-extrabold" style={{ color: '#0F172A' }}>{plan.price}</span>
                        <span style={{ color: '#6B7280' }}>{plan.period}</span>
                      </>
                    )}
                  </div>
                  <p className="mb-6" style={{ color: '#475569' }}>{plan.description}</p>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 flex-shrink-0" style={{ color: '#16A34A' }} />
                        <span style={{ color: '#6B7280' }}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full py-3 px-6 rounded-lg font-bold transition-all duration-200"
                    style={{
                      backgroundColor: plan.popular ? '#16A34A' : '#F8FAFC',
                      color: plan.popular ? '#FFFFFF' : '#0F172A',
                      border: plan.popular ? 'none' : '1px solid #E6EDF3',
                      boxShadow: plan.popular ? '0 4px 12px rgba(22,163,74,0.12)' : 'none'
                    }}
                  >
                    {plan.cta}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section - Dark theme like Qoder */}
      <section id="testimonials" className="py-20 relative overflow-hidden" style={{ 
        background: 'linear-gradient(135deg, #0A0F19 0%, #0D131D 100%)'
      }}>
        {/* Qoder-style background effects */}
        <div 
          className="absolute top-0 left-1/4 w-96 h-96 opacity-10 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(22,163,74,0.3) 0%, transparent 70%)',
            filter: 'blur(40px)'
          }}
        ></div>
        <div 
          className="absolute bottom-0 right-1/4 w-80 h-80 opacity-10 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(6,182,212,0.3) 0%, transparent 70%)',
            filter: 'blur(40px)'
          }}
        ></div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ 
              color: '#FFFFFF',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              What our customers say
            </h2>
            <p className="text-lg" style={{ color: '#CBD5E1' }}>
              Real feedback from agricultural businesses using our platform
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                quote: "The real-time tracking has been a game-changer for our fertilizer distribution. We've reduced waste by 40% and improved customer satisfaction.",
                author: "Rajesh Kumar",
                title: "Owner, Kumar Agri Supplies",
                location: "Punjab",
                avatar: "RK",
                avatarBg: "bg-green-500"
              },
              {
                quote: "Managing multiple warehouses was a nightmare before. Now everything is centralized and we can track inventory across all locations effortlessly.",
                author: "Priya Sharma",
                title: "Operations Manager", 
                location: "Maharashtra Cooperative",
                avatar: "PS",
                avatarBg: "bg-blue-500"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                className="p-8 rounded-xl relative group transition-all duration-300"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)'
                }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{
                  y: -5,
                  borderColor: 'rgba(22,163,74,0.3)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.3), 0 0 30px rgba(22,163,74,0.1)'
                }}
              >
                {/* Qoder-style glow effect on hover */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl"
                  style={{
                    background: 'radial-gradient(circle at 50% 50%, rgba(22,163,74,0.05) 0%, transparent 70%)'
                  }}
                ></div>
                
                <div className="flex justify-center space-x-1 mb-4 relative z-10">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-current" style={{ color: '#F59E0B' }} />
                  ))}
                </div>
                <p className="italic mb-6 leading-relaxed relative z-10" style={{ color: '#E2E8F0' }}>
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center space-x-4 relative z-10">
                  <div className={`w-12 h-12 ${testimonial.avatarBg} rounded-full flex items-center justify-center text-white font-semibold shadow-lg`}>
                    {testimonial.avatar}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold" style={{ color: '#FFFFFF' }}>{testimonial.author}</div>
                    <div className="text-sm" style={{ color: '#CBD5E1' }}>{testimonial.title}</div>
                    <div className="text-sm" style={{ color: '#94A3B8' }}>{testimonial.location}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-green-600 via-emerald-600 to-blue-600 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to take control of your fertilizer inventory?
            </h2>
            <p className="text-lg text-green-100 mb-8 max-w-2xl mx-auto">
              Join thousands of agricultural businesses who have streamlined their operations with our platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                onClick={() => navigate('/login')}
                className="bg-white text-green-600 hover:bg-green-50 px-8 py-4 rounded-lg text-lg font-semibold transition-colors inline-flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </motion.button>
              <button className="border-2 border-white/30 hover:border-white/50 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors backdrop-blur-sm">
                Schedule Demo
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16" style={{ 
        background: 'linear-gradient(180deg, #07101a 0%, #0B1220 100%)',
        color: '#CBD5E1'
      }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img 
                  src="/Logo_Dashboard.png" 
                  alt="KrishiSethu - Smart Fertilizer Inventory Management" 
                  className="h-12 w-auto object-contain"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <p className="text-sm leading-relaxed" style={{ color: '#CBD5E1', opacity: 0.8 }}>
                Modern fertilizer inventory management for agricultural businesses of all sizes.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4" style={{ color: '#CBD5E1' }}>Product</h3>
              <ul className="space-y-2 text-sm" style={{ color: '#CBD5E1', opacity: 0.8 }}>
                <li><a href="#features" className="transition-colors" style={{ color: '#CBD5E1', opacity: 0.8 }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}>Features</a></li>
                <li><a href="#pricing" className="transition-colors" style={{ color: '#CBD5E1', opacity: 0.8 }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}>Pricing</a></li>
                <li><a href="#use-cases" className="transition-colors" style={{ color: '#CBD5E1', opacity: 0.8 }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}>Use Cases</a></li>
                <li><a href="#testimonials" className="transition-colors" style={{ color: '#CBD5E1', opacity: 0.8 }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}>Testimonials</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4" style={{ color: '#CBD5E1' }}>Support</h3>
              <ul className="space-y-2 text-sm" style={{ color: '#CBD5E1', opacity: 0.8 }}>
                <li><a href="#" className="transition-colors" style={{ color: '#CBD5E1', opacity: 0.8 }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}>Documentation</a></li>
                <li><a href="#" className="transition-colors" style={{ color: '#CBD5E1', opacity: 0.8 }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}>Help Center</a></li>
                <li><a href="#" className="transition-colors" style={{ color: '#CBD5E1', opacity: 0.8 }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}>Contact Us</a></li>
                <li><a href="#" className="transition-colors" style={{ color: '#CBD5E1', opacity: 0.8 }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}>API Reference</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>support@example.com</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>+91 98765 43210</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Globe className="h-4 w-4" />
                  <span>www.example.com</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm mb-4 md:mb-0">
                © 2024 Fertilizer Inventory Management System. All rights reserved.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Globe className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Mail className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Phone className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
