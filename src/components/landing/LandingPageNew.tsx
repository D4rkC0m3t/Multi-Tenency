import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Package, AlertTriangle, Warehouse, PieChart, Users, BarChart3,
  CheckCircle, Star, Menu, X, Shield, TrendingUp, 
  Globe, Phone, Mail, Sun, Moon, ChevronDown, Sparkles, Zap,
  Target, PlayCircle, ChevronRight, Plus, Minus, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './LandingPage.css';
import './HorizontalParallax.css';
import './AdvancedAnimations.css';
import { useScrollAnimations, useScrollProgress } from './useScrollAnimations';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isAnnual, setIsAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{name: string, price: string} | null>(null);
  
  // Advanced scroll animations
  const { scrollY } = useScrollAnimations();
  const scrollProgress = useScrollProgress();

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


  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen overflow-x-hidden relative" style={{ 
      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
      position: 'relative'
    }}>
      {/* Scroll Progress Bar */}
      <div 
        className="scroll-progress"
        style={{ transform: `scaleX(${scrollProgress / 100})` }}
      />
      
      {/* Elegant gradient mesh background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(at 0% 0%, rgba(16, 185, 129, 0.2) 0px, transparent 50%),
            radial-gradient(at 100% 0%, rgba(59, 130, 246, 0.15) 0px, transparent 50%),
            radial-gradient(at 100% 100%, rgba(139, 92, 246, 0.1) 0px, transparent 50%),
            radial-gradient(at 0% 100%, rgba(16, 185, 129, 0.15) 0px, transparent 50%)
          `
        }}></div>
      </div>

      {/* Subtle animated gradient */}
      <motion.div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.03), transparent 70%)'
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      {/* Elegant Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 w-full z-50"
        style={{
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(16px) saturate(180%)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
        }}
      >
        <div className="max-w-7xl mx-auto pl-4 pr-6 lg:pl-6 lg:pr-8">
          <div className="flex justify-between items-center" style={{ minHeight: '110px', padding: '8px 0' }}>
            {/* Logo */}
            <motion.div 
              className="flex items-center gap-2" 
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div 
                className="relative flex items-center justify-center"
                style={{ width: '104px', height: '104px' }}
              >
                {/* White circular background fitted to logo */}
                <div 
                  className="absolute"
                  style={{ 
                    width: '96px',
                    height: '96px',
                    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.7) 100%)',
                    borderRadius: '50%',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                  }}
                />
                <img 
                  src="/image-removebg-preview.png" 
                  alt="KRISHISETHU Logo" 
                  className="relative z-10"
                  style={{ 
                    height: '88px',
                    width: 'auto',
                    objectFit: 'contain',
                    maxWidth: '280px'
                  }}
                  loading="eager"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <div className="flex flex-col">
                <span 
                  className="text-xl font-bold tracking-tight"
                  style={{ 
                    color: '#FFFFFF',
                    fontFamily: "'Nippo', sans-serif",
                    fontWeight: '700',
                    letterSpacing: '-0.02em'
                  }}
                >
                  KRISHISETHU
                </span>
                <span 
                  className="text-xs"
                  style={{ 
                    color: '#94A3B8',
                    fontWeight: '500'
                  }}
                >
                  Smart Inventory
                </span>
              </div>
            </motion.div>

            {/* Navigation Menu */}
            <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {/* Services Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setActiveDropdown('services')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button className="flex items-center space-x-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 group hover:bg-white/5">
                  <span style={{ 
                    color: '#E2E8F0',
                    fontSize: '15px',
                    fontWeight: '500'
                  }}>Services</span>
                  <ChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180" style={{ color: '#E2E8F0' }} />
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

              {/* Navigation Items */}
              {['features', 'pricing', 'testimonials', 'faq'].map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className="px-4 py-2 rounded-lg font-medium transition-all duration-200 relative group hover:bg-white/5"
                  style={{
                    color: '#E2E8F0',
                    fontSize: '15px',
                    fontWeight: '500',
                    letterSpacing: '0.3px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#10B981';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#E2E8F0';
                  }}
                >
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                  <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-gradient-to-r from-green-500 to-blue-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                </button>
              ))}
              <div className="flex items-center space-x-3 ml-4">
                <motion.button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="p-2 rounded-lg transition-all duration-200"
                  style={{
                    color: '#E2E8F0',
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </motion.button>
                
                <button
                  onClick={() => navigate('/login')}
                  className="px-5 py-2.5 rounded-lg font-medium transition-all duration-200 hover:bg-white/10"
                  style={{
                    backgroundColor: 'transparent',
                    border: '1.5px solid rgba(255,255,255,0.2)',
                    color: '#FFFFFF',
                    fontSize: '15px'
                  }}
                >
                  Login
                </button>
                
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-2.5 rounded-lg font-semibold transition-all duration-200"
                  style={{
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    color: '#FFFFFF',
                    fontSize: '15px',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                  }}
                >
                  Get Started Free
                </button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2.5 rounded-lg transition-all duration-200 hover:bg-white/10"
              style={{
                color: '#E2E8F0'
              }}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
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
                  {['features', 'use-cases', 'pricing', 'testimonials', 'faq'].map((section) => (
                    <button
                      key={section}
                      onClick={() => {
                        scrollToSection(section);
                        setIsMobileMenuOpen(false);
                      }}
                      className="block text-gray-600 hover:text-gray-900 font-medium"
                    >
                      {section === 'use-cases' ? 'Use Cases' : section === 'faq' ? 'FAQ' : section.charAt(0).toUpperCase() + section.slice(1)}
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

      {/* Hero Section - Horizontal Parallax */}
      <section className="min-h-screen flex items-center relative overflow-hidden" style={{ 
        background: 'transparent'
      }}>
        {/* Enhanced Background glows */}
        <motion.div 
          className="absolute pointer-events-none"
          style={{
            width: '800px',
            height: '800px',
            background: 'radial-gradient(circle at 20% 30%, rgba(16, 185, 129, 0.2), transparent 60%)',
            top: '-200px',
            left: '-200px',
            filter: 'blur(80px)'
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        ></motion.div>
        <motion.div 
          className="absolute pointer-events-none"
          style={{
            width: '700px',
            height: '700px',
            background: 'radial-gradient(circle at 80% 70%, rgba(59, 130, 246, 0.15), transparent 70%)',
            bottom: '-150px',
            right: '-150px',
            filter: 'blur(80px)'
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        ></motion.div>

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
        <div className="w-full">
          <div className="flex flex-col lg:flex-row items-center justify-between px-4 sm:px-6 lg:px-16 gap-16">
            <motion.div
              className="flex-1 max-w-2xl"
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <motion.h1 
                className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6 slide-from-right" 
                style={{ 
                  color: '#FFFFFF',
                  fontWeight: '700',
                  letterSpacing: '-0.02em'
                }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <span className="slide-from-right-delay-1">Smart</span>{' '}
                <span className="slide-from-right-delay-2">Fertilizer</span>{' '}
                <span 
                  className="relative inline-block gradient-text-animated shimmer"
                >
                  <em className="slide-from-right-delay-3">Inventory</em>
                  <motion.div
                    className="absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ delay: 1, duration: 0.8 }}
                  ></motion.div>
                </span>{' '}
                <span className="slide-from-right-delay-4">for Modern Agriculture</span>
              </motion.h1>
              <motion.p 
                className="text-xl mb-10 leading-relaxed" 
                style={{ 
                  color: '#CBD5E1',
                  fontSize: '1.25rem',
                  lineHeight: '1.8',
                  maxWidth: '600px'
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Transform your fertilizer business with intelligent inventory management. Real-time tracking, automated alerts, and powerful analytics — all in one elegant platform.
              </motion.p>
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  onClick={() => navigate('/login')}
                  className="text-white px-8 py-4 rounded-xl text-lg font-semibold inline-flex items-center justify-center transition-all duration-300 relative overflow-hidden"
                  style={{ 
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    boxShadow: '0 4px 20px rgba(16, 185, 129, 0.25)'
                  }}
                  whileHover={{ 
                    scale: 1.02,
                    y: -2,
                    boxShadow: '0 8px 30px rgba(16, 185, 129, 0.4)'
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
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#FFFFFF',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  See Features
                </button>
              </div>
            </motion.div>

            <motion.div
              className="flex-1 relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            >
              {/* Parallax Image Container */}
              <motion.div
                className="relative"
                style={{
                  transform: `translateX(${scrollY * 0.1}px)`
                }}
              >
                <div className="relative rounded-3xl overflow-hidden" style={{
                  boxShadow: '0 30px 60px rgba(0,0,0,0.3), 0 0 100px rgba(16, 185, 129, 0.2)'
                }}>
                  {/* Video Background */}
                  <video 
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                    className="w-full h-auto object-cover"
                    style={{ 
                      minHeight: '500px',
                      filter: 'brightness(0.9) contrast(1.1)'
                    }}
                  >
                    <source src="https://cdn.pixabay.com/video/2025/09/16/304444_large.mp4" type="video/mp4" />
                    {/* Fallback image if video fails */}
                    <img 
                      src="/Life cycle.png" 
                      alt="Fertilizer Inventory Management Dashboard" 
                      className="w-full h-auto object-cover"
                      style={{ minHeight: '500px' }}
                    />
                  </video>
                  
                  {/* Dark overlay for better text readability */}
                  <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-transparent to-black/30 z-10"></div>
                  
                  {/* Floating Stats Cards */}
                  <motion.div
                    className="absolute top-8 right-8 bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <div className="text-3xl font-bold text-white">99.9%</div>
                    <div className="text-sm text-white/80">Uptime</div>
                  </motion.div>
                  
                  <motion.div
                    className="absolute bottom-8 left-8 bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <div className="text-3xl font-bold text-white">10K+</div>
                    <div className="text-sm text-white/80">Active Users</div>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Animated Line Divider */}
      <div className="line-divider fade-in-scroll" style={{ margin: '0 auto', maxWidth: '1200px' }}></div>
      
      {/* Stats/Social Proof Section */}
      <section className="py-16 relative overflow-hidden fade-in-scroll" style={{
        background: 'transparent'
      }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {[
              { number: '10,000+', label: 'Active Users', icon: Users, color: '#16A34A' },
              { number: '₹50Cr+', label: 'Inventory Managed', icon: Package, color: '#06B6D4' },
              { number: '99.9%', label: 'Uptime', icon: Shield, color: '#F59E0B' },
              { number: '40%', label: 'Waste Reduction', icon: TrendingUp, color: '#8B5CF6' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="text-center group cursor-pointer"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="mb-3 flex justify-center">
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                    style={{
                      background: `linear-gradient(135deg, ${stat.color}15, ${stat.color}05)`,
                      border: `1px solid ${stat.color}30`
                    }}
                  >
                    <stat.icon className="h-6 w-6" style={{ color: stat.color }} />
                  </div>
                </div>
                <div 
                  className="text-4xl font-bold mb-2 transition-colors"
                  style={{ 
                    color: '#FFFFFF',
                    fontWeight: '700'
                  }}
                >
                  {stat.number}
                </div>
                <div 
                  className="text-sm font-medium"
                  style={{ color: '#CBD5E1', letterSpacing: '0.5px' }}
                >
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Animated Line Divider */}
      <div className="line-expand-center fade-in-scroll" style={{ margin: '0 auto', maxWidth: '1200px' }}></div>
      
      {/* Horizontal Parallax Features Section */}
      <section id="features" className="py-32 relative overflow-hidden scale-in-scroll" style={{ 
        background: 'transparent'
      }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 gradient-shine" style={{ 
              fontWeight: '700',
              letterSpacing: '-0.02em'
            }}>
              Everything you need to manage fertilizer inventory
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ 
              color: '#CBD5E1',
              lineHeight: '1.8'
            }}>
              Track, manage, and optimize your fertilizer stock with powerful features designed for modern agriculture
            </p>
          </motion.div>

          {/* Horizontal Scroll Container */}
          <div className="relative">
            <div className="flex overflow-x-auto gap-8 pb-8 snap-x snap-mandatory scrollbar-hide" style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}>
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
                className="flex-shrink-0 w-80 snap-center"
                initial={{ opacity: 0, x: 100 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                <motion.div
                  className="h-full p-8 rounded-3xl transition-all duration-500 group relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                    backdropFilter: 'blur(20px)',
                    minHeight: '400px'
                  }}
                  whileHover={{ 
                    y: -12,
                    scale: 1.03,
                    boxShadow: `0 25px 70px rgba(0,0,0,0.3), 0 0 50px ${feature.glowColor}`,
                    borderColor: 'rgba(255,255,255,0.2)'
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
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300" style={{
                    background: `linear-gradient(135deg, ${feature.glowColor}40, ${feature.glowColor}20)`,
                    border: `1px solid ${feature.glowColor}30`
                  }}>
                    {feature.icon}
                  </div>
                </motion.div>
                
                <div className="relative z-10">
                  <h3 className="text-xl font-semibold mb-3 transition-colors" style={{ 
                    color: '#FFFFFF',
                    fontWeight: '600'
                  }}>
                    {feature.title}
                  </h3>
                  <p className="text-base leading-relaxed transition-colors" style={{ 
                    color: '#CBD5E1',
                    lineHeight: '1.7'
                  }}>
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
              </motion.div>
            ))}
            </div>
            
            {/* Scroll Indicator */}
            <div className="flex justify-center mt-8 gap-2">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: i === 0 ? '#10B981' : 'rgba(255,255,255,0.3)'
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Animated Line Divider */}
      <div className="line-divider fade-in-scroll line-pulse" style={{ margin: '0 auto', maxWidth: '1200px' }}></div>
      
      {/* How It Works Section */}
      <section className="py-20 relative overflow-hidden blur-to-focus" style={{
        background: 'transparent'
      }}>
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
              Get Started in <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-500">3 Simple Steps</span>
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{
              color: isDarkMode ? '#CBD5E1' : '#64748B'
            }}>
              From signup to full operation in minutes, not days
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection lines */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 opacity-20 transform -translate-y-1/2"></div>
            
            {[
              {
                step: '01',
                title: 'Sign Up & Setup',
                description: 'Create your account and configure your business details in under 5 minutes',
                icon: Target,
                color: '#16A34A'
              },
              {
                step: '02',
                title: 'Import Your Data',
                description: 'Upload existing inventory or start fresh with our intuitive product catalog',
                icon: FileText,
                color: '#06B6D4'
              },
              {
                step: '03',
                title: 'Start Managing',
                description: 'Track stock, process sales, and generate reports from day one',
                icon: Zap,
                color: '#8B5CF6'
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                className="relative z-10"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <div 
                  className="p-10 rounded-3xl text-center group cursor-pointer transition-all duration-300 relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                    backdropFilter: 'blur(20px)'
                  }}
                >
                  {/* Step number badge */}
                  <div 
                    className="absolute top-6 right-6 w-14 h-14 rounded-full flex items-center justify-center font-semibold text-lg"
                    style={{
                      background: `linear-gradient(135deg, ${step.color}20, ${step.color}10)`,
                      color: step.color,
                      border: `1px solid ${step.color}30`,
                      fontWeight: '600'
                    }}
                  >
                    {step.step}
                  </div>
                  
                  {/* Icon */}
                  <motion.div
                    className="mb-6 flex justify-center"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div 
                      className="w-20 h-20 rounded-2xl flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${step.color}20, ${step.color}10)`,
                        border: `2px solid ${step.color}30`
                      }}
                    >
                      <step.icon className="h-10 w-10" style={{ color: step.color }} />
                    </div>
                  </motion.div>
                  
                  <h3 className="text-2xl font-semibold mb-4" style={{
                    color: '#FFFFFF',
                    fontWeight: '600'
                  }}>
                    {step.title}
                  </h3>
                  <p className="leading-relaxed" style={{
                    color: isDarkMode ? '#CBD5E1' : '#64748B'
                  }}>
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA Button */}
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <motion.button
              onClick={() => navigate('/login')}
              className="text-white px-8 py-4 rounded-lg text-lg font-bold inline-flex items-center justify-center transition-all duration-200"
              style={{ 
                background: 'linear-gradient(135deg, #16A34A 0%, #06B6D4 100%)',
                boxShadow: '0 6px 18px rgba(22,163,74,0.15)'
              }}
              whileHover={{ 
                scale: 1.02,
                y: -2,
                boxShadow: '0 12px 26px rgba(22,163,74,0.22)'
              }}
              whileTap={{ scale: 0.98 }}
            >
              Start Your Free Trial
              <ChevronRight className="ml-2 h-5 w-5" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Animated Line Divider */}
      <div className="line-expand-center fade-in-scroll" style={{ margin: '0 auto', maxWidth: '1200px' }}></div>
      
      {/* Use Cases Section with Enhanced Design */}
      <section id="use-cases" className="py-20 relative overflow-hidden rotate-in-scroll" style={{
        background: 'transparent'
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
                className="relative p-10 rounded-3xl text-center group cursor-pointer overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
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
                  <h3 className="text-2xl font-semibold mb-4 group-hover:scale-105 transition-transform duration-300" style={{
                    color: '#FFFFFF',
                    fontWeight: '600'
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
      <section id="pricing" className="py-20 relative" style={{ 
        background: 'transparent',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
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
            <p className="text-lg mb-6" style={{ color: '#94A3B8' }}>
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
            
            <p className="text-sm" style={{ color: '#64748B' }}>
              No credit card required for free trial
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Free Trial",
                price: "15 Days",
                period: "Free",
                description: "Perfect for small farms getting started",
                features: ["Up to 50 products", "Basic inventory tracking", "Email support", "No credit card required"],
                cta: "Start Free Trial",
                popular: false
              },
              {
                name: "Pro",
                price: "₹3,999",
                period: "/month",
                annualPrice: "₹45,000",
                annualPeriod: "/year",
                savings: "Save 6%",
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
                              {plan.savings} • Was ₹{(3999 * 12).toLocaleString('en-IN')}/year
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
                  {plan.name === 'Pro' ? (
                    <button
                      onClick={() => {
                        setSelectedPlan({
                          name: plan.name,
                          price: isAnnual ? plan.annualPrice! : plan.price
                        });
                        setShowPaymentModal(true);
                      }}
                      className="w-full py-3 px-6 rounded-lg font-bold transition-all duration-200"
                      style={{
                        backgroundColor: '#16A34A',
                        color: '#FFFFFF',
                        boxShadow: '0 4px 12px rgba(22,163,74,0.12)'
                      }}
                    >
                      Buy Now
                    </button>
                  ) : (
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
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Video/Demo Section */}
      <section className="py-20 relative overflow-hidden" style={{
        background: isDarkMode 
          ? 'linear-gradient(135deg, #0A0F19 0%, #0F172A 100%)'
          : 'linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 100%)'
      }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-6" style={{
                color: isDarkMode ? '#FFFFFF' : '#0F172A'
              }}>
                See It In <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-500">Action</span>
              </h2>
              <p className="text-lg mb-6 leading-relaxed" style={{
                color: isDarkMode ? '#CBD5E1' : '#64748B'
              }}>
                Watch how businesses like yours are transforming their fertilizer inventory management with our platform.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  'Real-time inventory tracking across multiple locations',
                  'Automated expiry alerts and batch management',
                  'One-click reports and analytics dashboard',
                  'Seamless GST-compliant invoicing'
                ].map((feature, index) => (
                  <motion.li
                    key={index}
                    className="flex items-start space-x-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <CheckCircle className="h-6 w-6 flex-shrink-0 mt-0.5" style={{ color: '#16A34A' }} />
                    <span style={{ color: isDarkMode ? '#E2E8F0' : '#475569' }}>
                      {feature}
                    </span>
                  </motion.li>
                ))}
              </ul>
              <motion.button
                onClick={() => navigate('/login')}
                className="text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center"
                style={{ backgroundColor: '#16A34A' }}
                whileHover={{ scale: 1.02, backgroundColor: '#15803D' }}
                whileTap={{ scale: 0.98 }}
              >
                Try It Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </motion.button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div 
                className="relative rounded-2xl overflow-hidden group cursor-pointer"
                style={{
                  backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
                  border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(229,231,235,0.5)'}`,
                  boxShadow: '0 25px 50px rgba(0,0,0,0.1)'
                }}
                onClick={() => setIsVideoPlaying(!isVideoPlaying)}
              >
                {/* Video placeholder */}
                <div className="aspect-video bg-gradient-to-br from-green-900 to-blue-900 flex items-center justify-center relative">
                  <img 
                    src="/Life cycle.png" 
                    alt="Product Demo" 
                    className="w-full h-full object-cover opacity-60"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    whileHover={{ scale: 1.1 }}
                  >
                    <div 
                      className="w-20 h-20 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-2xl"
                      style={{ paddingLeft: '4px' }}
                    >
                      <PlayCircle className="h-12 w-12 text-green-600" />
                    </div>
                  </motion.div>
                </div>
                
                {/* Overlay text */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-white font-semibold text-lg">Watch 2-minute demo</p>
                  <p className="text-white/80 text-sm">See how easy inventory management can be</p>
                </div>
              </div>
            </motion.div>
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

      {/* FAQ Section */}
      <section id="faq" className="py-20" style={{ backgroundColor: '#F8FAFC' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#0F172A' }}>
              Frequently Asked Questions
            </h2>
            <p className="text-lg" style={{ color: '#64748B' }}>
              Everything you need to know about our platform
            </p>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                question: 'How long does it take to set up?',
                answer: 'You can be up and running in under 10 minutes. Simply sign up, add your business details, and start adding products. Our intuitive interface requires no training.'
              },
              {
                question: 'Can I import my existing inventory data?',
                answer: 'Yes! We support bulk import via CSV/Excel files. You can also manually add products or use our API for custom integrations with your existing systems.'
              },
              {
                question: 'Is my data secure?',
                answer: 'Absolutely. We use bank-level encryption (256-bit SSL), regular backups, and comply with industry security standards. Your data is stored on secure servers with 99.9% uptime guarantee.'
              },
              {
                question: 'Do you offer training and support?',
                answer: 'Yes! We provide comprehensive documentation, video tutorials, and email support for all plans. Pro and Enterprise plans include priority support and dedicated onboarding assistance.'
              },
              {
                question: 'Can I manage multiple warehouses?',
                answer: 'Yes, our Pro and Enterprise plans support multi-warehouse management. Track inventory across different locations from a single dashboard with real-time synchronization.'
              },
              {
                question: 'What happens if I exceed my plan limits?',
                answer: "You'll receive notifications as you approach your limits. You can easily upgrade to a higher plan at any time, and we'll prorate the charges. No data loss or service interruption."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                className="rounded-xl overflow-hidden transition-all duration-300"
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E6EDF3',
                  boxShadow: openFaq === index ? '0 8px 24px rgba(0,0,0,0.08)' : '0 2px 8px rgba(0,0,0,0.04)'
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left transition-colors"
                  style={{
                    backgroundColor: openFaq === index ? '#F8FAFC' : 'transparent'
                  }}
                >
                  <span className="font-semibold text-lg pr-4" style={{ color: '#0F172A' }}>
                    {faq.question}
                  </span>
                  <div className="flex-shrink-0">
                    {openFaq === index ? (
                      <Minus className="h-5 w-5" style={{ color: '#16A34A' }} />
                    ) : (
                      <Plus className="h-5 w-5" style={{ color: '#64748B' }} />
                    )}
                  </div>
                </button>
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 pt-2">
                        <p className="leading-relaxed" style={{ color: '#64748B' }}>
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <p className="text-lg mb-4" style={{ color: '#64748B' }}>
              Still have questions?
            </p>
            <button
              className="text-green-600 hover:text-green-700 font-semibold inline-flex items-center transition-colors"
              onClick={() => scrollToSection('footer')}
            >
              Contact our support team
              <ChevronRight className="ml-1 h-5 w-5" />
            </button>
          </motion.div>
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
      <footer id="footer" className="py-16" style={{ 
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
              <h3 className="font-semibold mb-4" style={{ color: '#CBD5E1' }}>Contact</h3>
              <ul className="space-y-2 text-sm" style={{ color: '#CBD5E1', opacity: 0.8 }}>
                <li className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>support@krishisethu.in</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>+91 9963600975</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Globe className="h-4 w-4" />
                  <a href="https://www.krishisethu.in" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    www.krishisethu.in
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm mb-4 md:mb-0">
                © 2024 KrishiSethu. All rights reserved.
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
      {/* PhonePe Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setShowPaymentModal(false)}
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
                {/* Close Button */}
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="h-5 w-5" />
                </button>

                {/* Content */}
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Complete Payment
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {selectedPlan?.name} Plan - {selectedPlan?.price}
                  </p>

                  {/* PhonePe QR Code Image */}
                  <div className="bg-black rounded-xl p-4 mb-4">
                    <img 
                      src="/phonepe-qr.png"
                      alt="PhonePe Payment QR Code - C MALLIKARJUNA"
                      className="w-full h-auto"
                      style={{ 
                        maxWidth: '400px',
                        margin: '0 auto',
                        display: 'block'
                      }}
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="300"%3E%3Crect fill="%23000" width="300" height="300"/%3E%3Ctext x="50%25" y="50%25" fill="%23fff" text-anchor="middle" dy=".3em"%3EPhonePe QR Code%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  </div>

                  {/* Instructions */}
                  <div className="text-left bg-gray-50 rounded-lg p-4 mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Payment Instructions:</h3>
                    <ol className="text-sm text-gray-600 space-y-2">
                      <li>1. Open PhonePe app on your phone</li>
                      <li>2. Scan the QR code above</li>
                      <li>3. Complete the payment</li>
                      <li>4. Screenshot the payment confirmation</li>
                      <li>5. Send it to: support@krishisethu.in</li>
                    </ol>
                  </div>

                  {/* Contact Info */}
                  <div className="text-sm text-gray-600 mb-4">
                    <p className="font-semibold mb-1">Need help?</p>
                    <p>Contact: +91 9963600975</p>
                    <p>Email: support@krishisethu.in</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowPaymentModal(false)}
                      className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        window.location.href = 'mailto:support@krishisethu.in?subject=Payment Confirmation - ' + selectedPlan?.name + ' Plan';
                      }}
                      className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
                    >
                      Send Confirmation
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;
