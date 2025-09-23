import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, Users, ArrowRight, Star, Menu, X, 
  Package, AlertTriangle, CheckCircle, Warehouse, PieChart, 
  TrendingUp, Globe, Phone, Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Clean body styles for modern design
    document.body.style.margin = '0';
    document.body.style.fontFamily = '"Inter", "Poppins", sans-serif';
    document.body.style.backgroundColor = '#ffffff';
    document.body.style.color = '#000000';
    document.body.style.fontSize = '16px';
    document.body.style.backgroundImage = '';
    document.body.style.backgroundSize = '';

    return () => {
      // Reset body styles
      document.body.style.margin = '';
      document.body.style.fontFamily = '';
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
      document.body.style.fontSize = '';
      document.body.style.backgroundImage = '';
      document.body.style.backgroundSize = '';
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Subtle background pattern */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #3BA935 2px, transparent 2px),
                           radial-gradient(circle at 75% 75%, #3BA935 2px, transparent 2px)`,
          backgroundSize: '60px 60px'
        }}></div>
      </div>

      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 z-50"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.02 }}
            >
              <img 
                src="/image-removebg-preview.png" 
                alt="Logo" 
                className="h-12 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg items-center justify-center shadow-sm hidden">
                <Package className="h-4 w-4 text-white" />
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {['features', 'use-cases', 'pricing', 'testimonials'].map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors relative group"
                >
                  {section === 'use-cases' ? 'Use Cases' : section.charAt(0).toUpperCase() + section.slice(1)}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-500 group-hover:w-full transition-all duration-300"></span>
                </button>
              ))}
              <motion.button
                onClick={() => navigate('/login')}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Get Started Free
              </motion.button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-600 hover:text-gray-900"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
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
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Smart Fertilizer Inventory Management for{' '}
                <span className="text-green-500">Modern Agriculture</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Track, manage, and optimize your fertilizer stock in real-time — reduce waste, boost profits, and simplify operations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  onClick={() => navigate('/login')}
                  className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors inline-flex items-center justify-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </motion.button>
                <button
                  onClick={() => scrollToSection('features')}
                  className="border border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
                >
                  See Features
                </button>
              </div>
            </motion.div>

            {/* Right Content - Dashboard Screenshot */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-gray-100 rounded-2xl p-8 shadow-2xl">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <Package className="h-8 w-8 text-green-500 mb-2" />
                        <div className="text-2xl font-bold text-gray-900">1,247</div>
                        <div className="text-sm text-gray-600">Total Products</div>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <TrendingUp className="h-8 w-8 text-blue-500 mb-2" />
                        <div className="text-2xl font-bold text-gray-900">₹2.4M</div>
                        <div className="text-sm text-gray-600">Monthly Sales</div>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <AlertTriangle className="h-8 w-8 text-orange-500 mb-2" />
                        <div className="text-2xl font-bold text-gray-900">23</div>
                        <div className="text-sm text-gray-600">Low Stock</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium">NPK 20-20-20</span>
                        </div>
                        <span className="text-sm text-gray-600">850 kg</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span className="text-sm font-medium">Urea 46%</span>
                        </div>
                        <span className="text-sm text-gray-600">1,200 kg</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-sm font-medium">DAP</span>
                        </div>
                        <span className="text-sm text-gray-600">45 kg</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 z-50"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.02 }}
            >
              <img 
                src="/image-removebg-preview.png" 
                alt="Logo" 
                className="h-12 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg items-center justify-center shadow-sm hidden">
                <Package className="h-4 w-4 text-white" />
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {['features', 'use-cases', 'pricing', 'testimonials'].map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors relative group"
                >
                  {section === 'use-cases' ? 'Use Cases' : section.charAt(0).toUpperCase() + section.slice(1)}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-500 group-hover:w-full transition-all duration-300"></span>
                </button>
              ))}
              <motion.button
                onClick={() => navigate('/login')}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Get Started Free
              </motion.button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-600 hover:text-gray-900"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
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
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Smart Fertilizer Inventory Management for{' '}
                <span className="text-green-500">Modern Agriculture</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Track, manage, and optimize your fertilizer stock in real-time — reduce waste, boost profits, and simplify operations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  onClick={() => navigate('/login')}
                  className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors inline-flex items-center justify-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </motion.button>
                <button
                  onClick={() => scrollToSection('features')}
                  className="border border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
                >
                  See Features
                </button>
              </div>
            </motion.div>

            {/* Right Content - Dashboard Screenshot */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-gray-100 rounded-2xl p-8 shadow-2xl">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <Package className="h-8 w-8 text-green-500 mb-2" />
                        <div className="text-2xl font-bold text-gray-900">1,247</div>
                        <div className="text-sm text-gray-600">Total Products</div>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <TrendingUp className="h-8 w-8 text-blue-500 mb-2" />
                        <div className="text-2xl font-bold text-gray-900">₹2.4M</div>
                        <div className="text-sm text-gray-600">Monthly Sales</div>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <AlertTriangle className="h-8 w-8 text-orange-500 mb-2" />
                        <div className="text-2xl font-bold text-gray-900">23</div>
                        <div className="text-sm text-gray-600">Low Stock</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium">NPK 20-20-20</span>
                        </div>
                        <span className="text-sm text-gray-600">850 kg</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span className="text-sm font-medium">Urea 46%</span>
                        </div>
                        <span className="text-sm text-gray-600">1,200 kg</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-sm font-medium">DAP</span>
                        </div>
                        <span className="text-sm text-gray-600">45 kg</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to manage fertilizer inventory
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Track, manage, and optimize your fertilizer stock with powerful features designed for modern agriculture
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Package className="h-8 w-8 text-green-500" />,
                title: "Real-Time Stock Tracking",
                description: "Know exactly how much fertilizer you have — anytime, anywhere."
              },
              {
                icon: <AlertTriangle className="h-8 w-8 text-orange-500" />,
                title: "Expiry & Batch Alerts",
                description: "Never miss critical stock rotations. Automated reminders reduce losses."
              },
              {
                icon: <Warehouse className="h-8 w-8 text-blue-500" />,
                title: "Multi-Warehouse Support",
                description: "Easily manage multiple storage sites with a single dashboard."
              },
              {
                icon: <PieChart className="h-8 w-8 text-purple-500" />,
                title: "Reports & Analytics",
                description: "Get sales, usage, and stock reports in one click."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Perfect for every agricultural business
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From small farms to large distributors, our solution scales with your needs
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Users className="h-12 w-12 text-green-500" />,
                title: "👨‍🌾 Farmers",
                description: "Track stock and avoid waste with smart inventory management tailored for farm operations."
              },
              {
                icon: <Warehouse className="h-12 w-12 text-blue-500" />,
                title: "🏬 Distributors",
                description: "Manage multiple warehouses and streamline distribution across different locations."
              },
              {
                icon: <BarChart3 className="h-12 w-12 text-purple-500" />,
                title: "🏢 Agri-Retailers",
                description: "Speed up sales and avoid stockouts with real-time inventory tracking and alerts."
              }
            ].map((useCase, index) => (
              <motion.div
                key={index}
                className="bg-gray-50 p-8 rounded-xl text-center hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="mb-6 flex justify-center">
                  {useCase.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{useCase.title}</h3>
                <p className="text-gray-600 leading-relaxed">{useCase.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-gray-600">
              Choose the plan that fits your business needs
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Free",
                price: "₹0",
                period: "/month",
                description: "Perfect for small farms getting started",
                features: [
                  "Up to 50 products",
                  "Basic inventory tracking",
                  "Email support",
                  "Mobile app access"
                ],
                cta: "Start Free",
                popular: false
              },
              {
                name: "Pro",
                price: "₹999",
                period: "/month",
                description: "Ideal for growing agricultural businesses",
                features: [
                  "Unlimited products",
                  "Multi-warehouse support",
                  "Advanced analytics",
                  "Batch tracking & alerts",
                  "Priority support",
                  "API access"
                ],
                cta: "Start Free Trial",
                popular: true
              },
              {
                name: "Enterprise",
                price: "Custom",
                period: "",
                description: "For large operations with custom needs",
                features: [
                  "Everything in Pro",
                  "Custom integrations",
                  "Dedicated support",
                  "On-premise deployment",
                  "Training & onboarding",
                  "SLA guarantee"
                ],
                cta: "Contact Sales",
                popular: false
              }
            ].map((plan, index) => (
              <motion.div
                key={index}
                className={`bg-white p-8 rounded-xl shadow-sm border ${
                  plan.popular ? 'border-green-500 ring-2 ring-green-500 ring-opacity-20' : 'border-gray-100'
                } hover:shadow-md transition-shadow relative`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => navigate('/login')}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                      plan.popular
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What our customers say
            </h2>
            <p className="text-lg text-gray-600">
              Real feedback from agricultural businesses using our platform
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                quote: "The real-time tracking has been a game-changer for our fertilizer distribution. We've reduced waste by 40% and improved customer satisfaction.",
                author: "Rajesh Kumar",
                title: "Owner, Kumar Agri Supplies",
                location: "Punjab"
              },
              {
                quote: "Managing multiple warehouses was a nightmare before. Now everything is centralized and we can track inventory across all locations effortlessly.",
                author: "Priya Sharma",
                title: "Operations Manager",
                location: "Maharashtra Cooperative"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                className="bg-gray-50 p-8 rounded-xl"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="flex justify-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 italic mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <div className="text-center">
                  <div className="font-semibold text-gray-900">{testimonial.author}</div>
                  <div className="text-sm text-gray-600">{testimonial.title}</div>
                  <div className="text-sm text-gray-500">{testimonial.location}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Ready to take control of your fertilizer inventory?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of agricultural businesses who have streamlined their operations with our platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                onClick={() => navigate('/login')}
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors inline-flex items-center justify-center"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </motion.button>
              <button className="border border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold transition-colors">
                Schedule Demo
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img 
                  src="/image-removebg-preview.png" 
                  alt="Logo" 
                  className="h-8 w-auto object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg items-center justify-center shadow-sm hidden">
                  <Package className="h-4 w-4 text-white" />
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Modern fertilizer inventory management for agricultural businesses of all sizes.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#use-cases" className="hover:text-white transition-colors">Use Cases</a></li>
                <li><a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
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
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2024 Fertilizer Inventory Management System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{width: '60%'}}></div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                            <span className="text-sm">Adjustments</span>
                          </div>
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div className="bg-orange-500 h-2 rounded-full" style={{width: '25%'}}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-600">This Month</div>
                        <div className="text-xl font-bold text-gray-900">₹1.2M</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-600">Growth</div>
                        <div className="text-xl font-bold text-green-600">+12%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
      {/* Use Cases Section */}
      <section id="use-cases" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          })}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Choose <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">KrishiSethu?</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transform your agricultural business with our comprehensive inventory management solution
            </p>
          </motion.div>

          <div className="text-center">
            <motion.p 
              className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Experience the future of agricultural inventory management with AI-powered insights, 
              automated workflows, and comprehensive analytics designed specifically for fertilizer businesses.
            </motion.p>
          </div>

          <div className="w-full">
              <div className="flex flex-col md:flex-row items-center justify-center gap-6 w-full max-w-4xl mx-auto py-6 px-4">
                <motion.div 
                  className="flex flex-col items-center w-full max-w-[200px]"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="w-[120px] h-[120px] flex items-center justify-center mb-3">
                    <InventoryWarehouseLottie size="md" className="w-full h-full" />
                  </div>
                  <p className="text-gray-600 text-base font-medium text-center">Smart Inventory</p>
                </motion.div>
                
                <motion.div 
                  className="flex flex-col items-center w-full max-w-[200px]"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <div className="w-[120px] h-[120px] flex items-center justify-center mb-3">
                    <FertilizerSpreadingLottie size="md" className="w-full h-full" />
                  </div>
                  <p className="text-yellow-600 text-base font-medium text-center">Precision Distribution</p>
                </motion.div>
                
                <motion.div 
                  className="flex flex-col items-center w-full max-w-[200px]"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className="w-[120px] h-[120px] flex items-center justify-center mb-3">
                    <AnalyticsChartLottie size="md" className="w-full h-full" />
                  </div>
                  <p className="text-blue-600 text-base font-medium text-center">Advanced Analytics</p>
                </motion.div>
              </div>
            </div>

            {/* Stats Card */}
            <motion.div 
              className="mt-12 relative"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <Tilt tiltMaxAngleX={15} tiltMaxAngleY={15} scale={1.05}>
                <div className="bg-white/30 backdrop-blur-xl border border-gray-200/50 p-8 rounded-3xl shadow-2xl relative overflow-hidden hover:border-green-400/40 transition-all duration-500">
                  {/* Glowing background effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5"></div>
                  
                  <div className="text-center relative z-10">
                    <div className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                      10,000+
                    </div>
                    <div className="text-gray-600 mb-6 text-lg">Farmers Trust KrishiSethu</div>
                    <div className="flex justify-center space-x-1 mb-6">
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.3, delay: 0.5 + i * 0.1 }}
                        >
                          <Star className="h-6 w-6 text-yellow-400 fill-current" />
                        </motion.div>
                      ))}
                    </div>
                    <p className="text-gray-600 italic leading-relaxed mb-4">
                      "KrishiSethu has revolutionized how we manage our fertilizer inventory. The real-time tracking and analytics have helped us reduce waste and increase profitability."
                    </p>
                    <div className="text-gray-900 font-bold">- Agricultural Cooperative</div>
                  </div>
                  
                  {/* Decorative elements */}
                  <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-green-600/10 to-emerald-600/10 rounded-full blur-xl"></div>
                  <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-emerald-600/10 to-green-600/10 rounded-full blur-xl"></div>
                </div>
              </Tilt>
            </motion.div>
          </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="section py-20 bg-white relative overflow-hidden">
        {/* Background grid pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(16,185,129,0.1) 2px, transparent 2px),
                             radial-gradient(circle at 75% 75%, rgba(16,185,129,0.1) 2px, transparent 2px)`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              See It In <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Action</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore our intuitive interface and powerful features in real agricultural environments
            </p>
          </motion.div>

          {/* Featured Lottie Animations Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} scale={1.02}>
                <div className="bg-white/20 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-8 hover:border-green-400/40 transition-all duration-500 group">
                  <InventoryWarehouseLottie size="xl" />
                  <div className="mt-6 text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Warehouse Management</h3>
                    <p className="text-gray-600 text-sm">Real-time inventory tracking and warehouse optimization</p>
                  </div>
                </div>
              </Tilt>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} scale={1.02}>
                <div className="bg-white/20 backdrop-blur-xl border border-yellow-400/30 rounded-3xl p-8 hover:border-yellow-400/50 transition-all duration-500 group">
                  <FertilizerSpreadingLottie size="xl" />
                  <div className="mt-6 text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Smart Distribution</h3>
                    <p className="text-gray-600 text-sm">Automated fertilizer distribution and field management</p>
                  </div>
                </div>
              </Tilt>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} scale={1.02}>
                <div className="bg-white/20 backdrop-blur-xl border border-blue-400/30 rounded-3xl p-8 hover:border-blue-400/50 transition-all duration-500 group">
                  <AnalyticsChartLottie size="xl" />
                  <div className="mt-6 text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Advanced Analytics</h3>
                    <p className="text-gray-600 text-sm">Data-driven insights and predictive analytics</p>
                  </div>
                </div>
              </Tilt>
            </motion.div>
          </div>

          {/* Interactive Demo Section */}
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 backdrop-blur-xl border border-green-200/50 rounded-3xl p-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5"></div>
              <div className="relative z-10">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Ready to Experience KrishiSethu?</h3>
                <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
                  See how our platform transforms agricultural inventory management with live demonstrations and interactive features.
                </p>
                <motion.button
                  onClick={() => navigate('/login')}
                  className="bg-gradient-to-r from-green-400 to-emerald-500 text-black px-8 py-4 rounded-full text-lg font-bold shadow-2xl hover:shadow-green-400/50 transition-all duration-300 relative overflow-hidden group"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="relative z-10">Start Free Demo</span>
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.6 }}
                  />
                </motion.button>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute top-4 right-4 w-24 h-24 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full blur-2xl"></div>
              <div className="absolute bottom-4 left-4 w-20 h-20 bg-gradient-to-br from-emerald-400/20 to-green-400/20 rounded-full blur-2xl"></div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="section py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of satisfied customers who trust KrishiSethu
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Rajesh Kumar",
                role: "Farm Manager",
                content: "KrishiSethu has streamlined our entire inventory process. We can now track fertilizer usage across multiple farms effortlessly.",
                rating: 5
              },
              {
                name: "Priya Sharma",
                role: "Agricultural Consultant",
                content: "The multi-tenant feature allows us to manage inventory for all our client farms from a single dashboard. Incredible efficiency!",
                rating: 5
              },
              {
                name: "Amit Patel",
                role: "Cooperative Manager",
                content: "Real-time analytics and automated reorder alerts have reduced our stockouts by 80%. Highly recommended!",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div
                key={index}
                className={`bg-white/20 backdrop-blur-xl p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-200/50 hover:border-green-400/40`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="flex space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-gray-500 text-sm">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="section py-20 bg-white relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-green-600 via-emerald-600 to-green-500 bg-clip-text text-transparent">
              Simple Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the plan that fits your agricultural business needs
            </p>
          </motion.div>

          {/* Pricing Cards - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Monthly Plan */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="bg-white/20 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-200/50 relative overflow-hidden group hover:border-blue-400/40 transition-all duration-500 h-full">
                {/* Shiny overlay effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 rounded-3xl"></div>
                
                {/* Animated border glow */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-400/20 via-cyan-400/20 to-blue-400/20 blur-sm -z-10 animate-pulse"></div>
                
                <div className="relative z-10 h-full flex flex-col">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Monthly Plan</h3>
                    <p className="text-gray-600 text-sm">Perfect for getting started</p>
                  </div>

                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center mb-2">
                      <span className="text-5xl font-bold text-blue-600">₹16,800</span>
                      <span className="text-xl text-gray-500 ml-2">/month</span>
                    </div>
                    <p className="text-gray-500 text-sm">Billed monthly</p>
                  </div>

                  <ul className="text-gray-600 mb-8 space-y-3 flex-grow">
                    {[
                      "✅ Unlimited Fertilizer Inventory",
                      "✅ Multi-Tenant Farm Access",
                      "✅ Real-time Analytics Dashboard", 
                      "✅ Automated Reorder Alerts",
                      "✅ Mobile App Access",
                      "✅ Email Support",
                      "✅ Data Export & Reporting"
                    ].map((feature, index) => (
                      <motion.li 
                        key={index}
                        className="flex items-center gap-3 text-sm"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                      >
                        <span className="text-blue-600 font-semibold">{feature.split(' ')[0]}</span>
                        <span>{feature.substring(feature.indexOf(' ') + 1)}</span>
                      </motion.li>
                    ))}
                  </ul>

                  <motion.button 
                    onClick={() => navigate('/login')}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold hover:from-blue-400 hover:to-cyan-500 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-xl hover:shadow-blue-400/50 relative overflow-hidden group"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="relative z-10">Start Monthly Plan</span>
                    <motion.div
                      className="absolute inset-0 bg-white/20"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.6 }}
                    />
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Annual Plan - Featured */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {/* Popular Badge */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-black px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                  🔥 MOST POPULAR
                </span>
              </div>
              
              <div className="bg-white/25 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border-2 border-green-400/50 relative overflow-hidden group hover:border-green-400/60 transition-all duration-500 h-full">
                {/* Shiny overlay effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-white/10 rounded-3xl"></div>
                
                {/* Animated border glow */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-green-400/30 via-emerald-400/30 to-green-400/30 blur-sm -z-10 animate-pulse"></div>
                
                <div className="relative z-10 h-full flex flex-col pt-4">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Annual Plan</h3>
                    <p className="text-gray-600 text-sm">Best value for growing businesses</p>
                  </div>

                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center mb-2">
                      <span className="text-5xl font-bold text-green-600">₹1,68,000</span>
                      <span className="text-xl text-gray-500 ml-2">/year</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-500 text-sm">Billed annually</p>
                      <div className="inline-block bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-600 px-4 py-1 rounded-full text-xs font-semibold border border-green-400/30">
                        Save ₹33,600 (17% off)
                      </div>
                    </div>
                  </div>

                  <ul className="text-gray-600 mb-8 space-y-3 flex-grow">
                    {[
                      "✅ Everything in Monthly Plan",
                      "✅ Priority 24/7 Support",
                      "✅ Advanced Analytics & Reports",
                      "✅ API Integration Support",
                      "✅ Custom Integrations",
                      "✅ Dedicated Account Manager",
                      "✅ Early Access to New Features"
                    ].map((feature, index) => (
                      <motion.li 
                        key={index}
                        className="flex items-center gap-3 text-sm"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                      >
                        <span className="text-green-600 font-semibold">{feature.split(' ')[0]}</span>
                        <span>{feature.substring(feature.indexOf(' ') + 1)}</span>
                      </motion.li>
                    ))}
                  </ul>

                  <motion.button 
                    onClick={() => navigate('/login')}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold hover:from-green-400 hover:to-emerald-500 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-2xl hover:shadow-green-400/50 relative overflow-hidden group"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="relative z-10">Start Annual Plan</span>
                    <motion.div
                      className="absolute inset-0 bg-white/20"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.6 }}
                    />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Trust Indicators */}
          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <p className="text-gray-500 text-sm">
              No setup fees • Cancel anytime • 30-day money-back guarantee • Secure payments
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="section py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5"></div>
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Ready to Transform Your Agriculture Business?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of farmers and agricultural businesses who trust KrishiSethu for their inventory management needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/login')}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-600/50"
            >
              Get Started Today
              <ArrowRight className="inline-block ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white text-gray-900 py-16 relative overflow-hidden border-t border-gray-200">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(16,185,129,0.3) 2px, transparent 2px),
                             radial-gradient(circle at 75% 75%, rgba(16,185,129,0.3) 2px, transparent 2px)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <motion.div 
              className="flex items-center justify-center space-x-3 mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gray-200/50 blur-2xl rounded-full transform scale-125"></div>
                <img 
                  src="/image-removebg-preview.png" 
                  alt="KrishiSethu Logo" 
                  className="h-16 w-auto object-contain relative z-10"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const nextElement = e.currentTarget.parentElement?.nextElementSibling as HTMLElement;
                    if (nextElement) {
                      nextElement.style.display = 'flex';
                    }
                  }}
                />
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full items-center justify-center shadow-xl hidden">
                  <span className="text-white font-bold text-xl">🌾</span>
                </div>
              </div>
            </motion.div>
            
            <motion.p 
              className="text-gray-600 mb-8 text-lg max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Empowering agriculture through intelligent inventory management
            </motion.p>
            
            <motion.div 
              className="flex justify-center space-x-6 mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {[
                { icon: '📧', label: 'Email', color: 'from-blue-400 to-blue-600' },
                { icon: '📱', label: 'Phone', color: 'from-green-400 to-green-600' },
                { icon: '🌐', label: 'Website', color: 'from-purple-400 to-purple-600' },
                { icon: '📍', label: 'Location', color: 'from-red-400 to-red-600' }
              ].map((social) => (
                <motion.div
                  key={social.label}
                  className={`w-12 h-12 bg-gradient-to-br ${social.color} rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 text-white`}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-white text-lg">{social.icon}</span>
                </motion.div>
              ))}
            </motion.div>
            
            <motion.div 
              className="border-t border-gray-200 pt-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <p className="text-gray-500 text-sm">
                2024 KrishiSethu. All rights reserved. | Revolutionizing Agricultural Inventory Management
              </p>
            </motion.div>
          </div>
        </div>
        
        <div className="absolute top-8 left-8 w-20 h-20 bg-gradient-to-br from-green-600/10 to-emerald-600/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-8 right-8 w-24 h-24 bg-gradient-to-br from-emerald-600/10 to-green-600/10 rounded-full blur-xl"></div>
      </footer>
    </div>
  );
};

export default LandingPage;
