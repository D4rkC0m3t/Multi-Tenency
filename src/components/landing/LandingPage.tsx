import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, BarChart3, Shield, Users, ArrowRight, Star, Menu, X, Zap, TrendingUp, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import { InventoryWarehouseLottie, FertilizerSpreadingLottie, AnalyticsChartLottie } from './LottieAnimations';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState<Record<string, boolean>>({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  

  useEffect(() => {
    // Set body styles to match original
    document.body.style.margin = '0';
    document.body.style.fontFamily = '"Montserrat", sans-serif';
    document.body.style.backgroundColor = '#1b1b1b';
    document.body.style.color = '#eef8ce';
    document.body.style.fontSize = '14px';
    document.body.style.backgroundImage = 'url(https://assets.codepen.io/453571/bg.avif), repeating-linear-gradient(to right, transparent 0 500px, #73814b33 500px 501px)';
    document.body.style.backgroundSize = '100%';

    // Load Three.js and initialize 3D scene
    const loadThreeJS = async () => {
      try {
        // Load Three.js modules
        const THREE = await import('three');
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
        const { gsap } = await import('gsap');

        // Initialize 3D scene
        const camera = new THREE.PerspectiveCamera(
          10,
          window.innerWidth / window.innerHeight,
          0.1,
          1000
        );
        camera.position.z = 13;

        const scene = new THREE.Scene();
        let bee: any;

        // Load the realistic bee model
        let mixer: any;
        const loader = new GLTFLoader();

        // Load the bee GLB model
        loader.load(
          "https://raw.githubusercontent.com/DennysDionigi/bee-glb/94253437c023643dd868592e11a0fd2c228cfe07/demon_bee_full_texture.glb",
          function (gltf: any) {
            bee = gltf.scene;
            bee.scale.set(0.5, 0.5, 0.5);
            bee.position.set(0, -1, 0);
            bee.rotation.set(0, 1.5, 0);

            // Setup animations if available
            if (gltf.animations && gltf.animations.length > 0) {
              mixer = new THREE.AnimationMixer(bee);
              gltf.animations.forEach((clip: any) => {
                const action = mixer.clipAction(clip);
                action.play();
              });
            }

            // Create wing animations manually if not in model
            const leftWing = bee.getObjectByName('LeftWing') || bee.children[0];
            const rightWing = bee.getObjectByName('RightWing') || bee.children[1];

            if (leftWing && rightWing) {
              // Wing flapping animation
              const wingAnimation = () => {
                const time = Date.now() * 0.01;
                leftWing.rotation.z = Math.sin(time) * 0.5;
                rightWing.rotation.z = -Math.sin(time) * 0.5;
                requestAnimationFrame(wingAnimation);
              };
              wingAnimation();
            }

            // Group wings with body for better control
            const group = new THREE.Group();
            group.add(bee);
            
            // Add individual wing objects if they exist
            if (leftWing) group.add(leftWing);
            if (rightWing) group.add(rightWing);

            bee = group;
            scene.add(bee);
            modelMove();
          }
        );

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        const container = document.getElementById('container3D');
        if (container) {
          container.appendChild(renderer.domElement);
        }

        // Lighting setup matching the original bee demo
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.3);
        scene.add(ambientLight);

        const topLight = new THREE.DirectionalLight(0xffffff, 1);
        topLight.position.set(500, 500, 500);
        scene.add(topLight);

        // Animation loop with bee wing animations
        const reRender3D = () => {
          requestAnimationFrame(reRender3D);

          // Update bee wing animations
          if (mixer) {
            mixer.update(0.02);
          }

          renderer.render(scene, camera);
        };
        reRender3D();

        // Position configurations for different sections
        const arrPositionModel = [
          {
            id: "banner",
            position: { x: 0, y: -1, z: 0 },
            rotation: { x: 0, y: 1.5, z: 0 }
          },
          {
            id: "intro",
            position: { x: 1, y: -1, z: -5 },
            rotation: { x: 0.5, y: -0.5, z: 0.5 }
          },
          {
            id: "description",
            position: { x: -1, y: -1, z: -5 },
            rotation: { x: 0, y: 0.5, z: 0.2 }
          },
          {
            id: "contact",
            position: { x: 0.45, y: -2, z: -10 },
            rotation: { x: 0.2, y: -0.5, z: -0.2 }
          }
        ];

        // Model movement based on scroll
        const modelMove = () => {
          const sections = document.querySelectorAll('.section');
          let currentSection: string | undefined;
          sections.forEach((section) => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= window.innerHeight / 3) {
              currentSection = section.id;
            }
          });

          const position_active = arrPositionModel.findIndex(
            (val) => val.id === currentSection
          );

          if (position_active >= 0 && bee) {
            const new_coordinates = arrPositionModel[position_active];
            gsap.to(bee.position, {
              x: new_coordinates.position.x,
              y: new_coordinates.position.y,
              z: new_coordinates.position.z,
              duration: 3,
              ease: "power1.out"
            });
            gsap.to(bee.rotation, {
              x: new_coordinates.rotation.x,
              y: new_coordinates.rotation.y,
              z: new_coordinates.rotation.z,
              duration: 3,
              ease: "power1.out"
            });
          }
        };

        // Scroll event listener
        const handleScroll = () => {
          if (bee) {
            modelMove();
          }
        };

        window.addEventListener('scroll', handleScroll);

        // Resize handler
        const handleResize = () => {
          renderer.setSize(window.innerWidth, window.innerHeight);
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
        };

        window.addEventListener('resize', handleResize);

        // Cleanup function
        return () => {
          window.removeEventListener('scroll', handleScroll);
          window.removeEventListener('resize', handleResize);
          if (container && renderer.domElement) {
            container.removeChild(renderer.domElement);
          }
        };

      } catch (error) {
        console.error('Error loading Three.js:', error);
      }
    };

    loadThreeJS();

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

  const heroBackgrounds = [
    '/AdobeStock_215401104.jpeg',
    '/AdobeStock_261294544.jpeg',
    '/AdobeStock_331588650.jpeg',
    '/2569.jpg',
    '/composition-compost-made-rotten-food-2048x1429.jpeg',
    '/top-view-veggies-with-salad-tool.jpg'
  ];

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(prev => ({
            ...prev,
            [entry.target.id]: entry.isIntersecting
          }));
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('[id]').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Cycle through hero backgrounds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prevIndex) =>
        (prevIndex + 1) % heroBackgrounds.length
      );
    }, 5000); // Change background every 5 seconds

    return () => clearInterval(interval);
  }, [heroBackgrounds.length]);

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-black overflow-x-hidden relative">
      {/* Animated background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-green-400 rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, -100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
      {/* 3D Container */}
      <div id="container3D" className="fixed top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}></div>

      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 w-full bg-black/20 backdrop-blur-xl border-b border-green-500/20 transition-all duration-300 shadow-2xl z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-white/50 blur-2xl rounded-full transform scale-150"></div>
                  <img 
                    src="/image-removebg-preview.png" 
                    alt="KrishiSethu Logo" 
                    className="h-24 w-auto object-contain relative z-10"
                    onError={(e) => {
                      // Fallback to gradient icon if logo fails to load
                      e.currentTarget.style.display = 'none';
                      const nextElement = e.currentTarget.parentElement?.nextElementSibling as HTMLElement;
                      if (nextElement) {
                        nextElement.style.display = 'flex';
                      }
                    }}
                  />
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full items-center justify-center shadow-lg hidden">
                  <span className="text-black font-bold text-lg">🌾</span>
                </div>
              </div>
            </motion.div>
            <div className="hidden md:flex items-center space-x-8">
              {['features', 'benefits', 'gallery', 'testimonials'].map((section) => (
                <motion.button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className="text-green-300 hover:text-green-100 transition-colors font-medium relative group"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-400 group-hover:w-full transition-all duration-300"></span>
                </motion.button>
              ))}
              <motion.button
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/login');
                }}
                className="bg-gradient-to-r from-green-400 to-emerald-500 text-black px-6 py-2.5 rounded-full font-bold shadow-lg hover:shadow-green-400/50 transition-all duration-300 relative overflow-hidden group hover:from-green-300 hover:to-emerald-400 flex items-center space-x-2"
                whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(74, 222, 128, 0.5)' }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10">Login</span>
                <div className="absolute inset-0 bg-gradient-to-r from-green-300 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </motion.button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <motion.button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-green-300 hover:text-green-100 transition-colors"
                whileTap={{ scale: 0.95 }}
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </motion.button>
            </div>
          </div>

          {/* Mobile menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden bg-black/40 backdrop-blur-xl border-t border-green-500/20"
              >
                <div className="px-4 py-2 space-y-2">
                  {['features', 'benefits', 'gallery', 'testimonials'].map((section) => (
                    <motion.button
                      key={section}
                      onClick={() => {
                        scrollToSection(section);
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left text-green-300 hover:text-green-100 py-2 transition-colors font-medium"
                      whileHover={{ x: 10 }}
                    >
                      {section.charAt(0).toUpperCase() + section.slice(1)}
                    </motion.button>
                  ))}
                  <motion.button
                    onClick={() => {
                      navigate('/login');
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left bg-gradient-to-r from-green-400 to-emerald-500 text-black px-4 py-2 rounded-full hover:shadow-green-400/50 transition-all duration-300 mt-2 font-bold"
                    whileHover={{ scale: 1.02 }}
                  >
                    Get Started
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section id="banner" className="section relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Dark gradient background with parallax effect */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-black via-green-900/50 to-black"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-900/20 via-transparent to-transparent"></div>
        </div>

        {/* Floating 3D elements */}
        <div className="absolute inset-0 z-5">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 2) * 40}%`,
              }}
              animate={{
                y: [-20, 20, -20],
                rotate: [0, 360],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            >
              {i % 3 === 0 && <BarChart3 className="h-8 w-8 text-green-400/30" />}
              {i % 3 === 1 && <Shield className="h-8 w-8 text-emerald-400/30" />}
              {i % 3 === 2 && <Users className="h-8 w-8 text-green-300/30" />}
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-10 text-center text-white px-4 max-w-5xl mx-auto"
        >
          <motion.h1 
            className="text-6xl md:text-8xl font-bold mb-6 leading-tight"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-green-300 bg-clip-text text-transparent">
              Kri
              <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent animate-pulse">
                s
              </span>
              hi
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
                S
              </span>
              ethu
            </span>
            <motion.div
              className="absolute -inset-1 bg-gradient-to-r from-green-400/20 to-emerald-400/20 blur-xl"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl mb-8 text-green-100 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Revolutionary Multi-Tenant Fertilizer Inventory Management System for Modern Agriculture
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <motion.button
              onClick={() => navigate('/login')}
              className="bg-gradient-to-r from-green-400 to-emerald-500 text-black px-8 py-4 rounded-full text-lg font-bold shadow-2xl hover:shadow-green-400/50 transition-all duration-300 relative overflow-hidden group"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10">Start Managing Inventory</span>
              <div className="absolute inset-0 bg-gradient-to-r from-green-300 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <motion.div
                className="absolute inset-0 bg-white/20"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />
            </motion.button>
            
            <motion.button
              onClick={() => scrollToSection('features')}
              className="border-2 border-green-400 text-green-400 hover:bg-green-400 hover:text-black px-8 py-4 rounded-full text-lg font-bold transition-all duration-300 backdrop-blur-sm"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Learn More
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Animated scroll indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="h-8 w-8 text-green-400" />
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="section py-20 bg-gradient-to-b from-gray-900 to-black relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_50%)]"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Powerful <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Features</span>
            </h2>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              Everything you need to manage your fertilizer inventory efficiently and effectively
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <BarChart3 className="h-12 w-12 text-green-400" />,
                title: "Real-time Analytics",
                description: "Track inventory levels, sales trends, and performance metrics in real-time with comprehensive dashboards.",
                gradient: "from-green-500/20 to-emerald-500/20"
              },
              {
                icon: <Shield className="h-12 w-12 text-emerald-400" />,
                title: "Multi-Tenant Security",
                description: "Enterprise-grade security with role-based access control and data isolation for multiple organizations.",
                gradient: "from-emerald-500/20 to-teal-500/20"
              },
              {
                icon: <Users className="h-12 w-12 text-green-300" />,
                title: "Team Collaboration",
                description: "Enable seamless collaboration between team members with shared workspaces and permission management.",
                gradient: "from-teal-500/20 to-green-500/20"
              },
              {
                icon: <Zap className="h-12 w-12 text-yellow-400" />,
                title: "Lightning Fast",
                description: "Optimized performance with instant search, real-time updates, and seamless user experience.",
                gradient: "from-yellow-500/20 to-orange-500/20"
              },
              {
                icon: <TrendingUp className="h-12 w-12 text-blue-400" />,
                title: "Growth Insights",
                description: "Advanced analytics and forecasting to help your business grow and optimize inventory management.",
                gradient: "from-blue-500/20 to-indigo-500/20"
              },
              {
                icon: <Award className="h-12 w-12 text-purple-400" />,
                title: "Award Winning",
                description: "Recognized by industry leaders for innovation in agricultural technology and inventory management.",
                gradient: "from-purple-500/20 to-pink-500/20"
              }
            ].map((feature, index) => (
              <Tilt key={index} tiltMaxAngleX={10} tiltMaxAngleY={10} scale={1.02}>
                <motion.div
                  className={`bg-black/40 backdrop-blur-xl border border-green-500/20 p-8 rounded-2xl shadow-2xl hover:shadow-green-400/20 transition-all duration-500 h-full bg-gradient-to-br ${feature.gradient}`}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <motion.div 
                    className="mb-6"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    {feature.icon}
                  </motion.div>
                  <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-green-100 leading-relaxed">{feature.description}</p>
                </motion.div>
              </Tilt>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="section py-20 bg-gradient-to-b from-black to-gray-900 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-green-400/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Why Choose <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">KrishiSethu?</span>
            </h2>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              Transform your agricultural business with our comprehensive inventory management solution
            </p>
          </motion.div>

          <div className="text-center">
            <motion.p 
              className="text-xl text-green-100 max-w-3xl mx-auto leading-relaxed"
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
                  <p className="text-green-100 text-base font-medium text-center">Smart Inventory</p>
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
                  <p className="text-yellow-100 text-base font-medium text-center">Precision Distribution</p>
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
                  <p className="text-blue-100 text-base font-medium text-center">Advanced Analytics</p>
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
                <div className="bg-black/60 backdrop-blur-xl border border-green-500/30 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                  {/* Glowing background effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10"></div>
                  
                  <div className="text-center relative z-10">
                    <motion.div 
                      className="text-5xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                    >
                      10,000+
                    </motion.div>
                    <div className="text-green-100 mb-6 text-lg">Farmers Trust KrishiSethu</div>
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
                    <p className="text-green-100 italic leading-relaxed mb-4">
                      "KrishiSethu has revolutionized how we manage our fertilizer inventory. The real-time tracking and analytics have helped us reduce waste and increase profitability."
                    </p>
                    <div className="text-white font-bold">- Agricultural Cooperative</div>
                  </div>
                  
                  {/* Decorative elements */}
                  <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full blur-xl"></div>
                  <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-emerald-400/20 to-green-400/20 rounded-full blur-xl"></div>
                </div>
              </Tilt>
            </motion.div>
          </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="section py-20 bg-gradient-to-b from-gray-900 to-black relative overflow-hidden">
        {/* Background grid pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(16,185,129,0.2) 2px, transparent 2px),
                             radial-gradient(circle at 75% 75%, rgba(16,185,129,0.2) 2px, transparent 2px)`,
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
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              See It In <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Action</span>
            </h2>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
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
                <div className="bg-black/40 backdrop-blur-xl border border-green-500/20 rounded-3xl p-8 hover:border-green-400/40 transition-all duration-500 group">
                  <InventoryWarehouseLottie size="xl" />
                  <div className="mt-6 text-center">
                    <h3 className="text-xl font-bold text-white mb-2">Warehouse Management</h3>
                    <p className="text-green-100 text-sm">Real-time inventory tracking and warehouse optimization</p>
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
                <div className="bg-black/40 backdrop-blur-xl border border-yellow-500/20 rounded-3xl p-8 hover:border-yellow-400/40 transition-all duration-500 group">
                  <FertilizerSpreadingLottie size="xl" />
                  <div className="mt-6 text-center">
                    <h3 className="text-xl font-bold text-white mb-2">Smart Distribution</h3>
                    <p className="text-green-100 text-sm">Automated fertilizer distribution and field management</p>
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
                <div className="bg-black/40 backdrop-blur-xl border border-blue-500/20 rounded-3xl p-8 hover:border-blue-400/40 transition-all duration-500 group">
                  <AnalyticsChartLottie size="xl" />
                  <div className="mt-6 text-center">
                    <h3 className="text-xl font-bold text-white mb-2">Advanced Analytics</h3>
                    <p className="text-green-100 text-sm">Data-driven insights and predictive analytics</p>
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
            <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 backdrop-blur-xl border border-green-500/30 rounded-3xl p-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5"></div>
              <div className="relative z-10">
                <h3 className="text-3xl font-bold text-white mb-4">Ready to Experience KrishiSethu?</h3>
                <p className="text-green-100 text-lg mb-8 max-w-2xl mx-auto">
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
      <section id="testimonials" className="section py-20 bg-gradient-to-br from-gray-50 to-gray-100">
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
                className={`bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ${
                  isVisible.testimonials ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="flex space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">"{testimonial.content}"</p>
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
      <section id="pricing" className="section py-20 bg-gradient-to-b from-slate-900 via-gray-900 to-black relative overflow-hidden">
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
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 bg-gradient-to-r from-green-400 via-emerald-400 to-green-300 bg-clip-text text-transparent">
              Simple Pricing
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
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
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 relative overflow-hidden group hover:border-blue-400/40 transition-all duration-500 h-full">
                {/* Shiny overlay effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 rounded-3xl"></div>
                
                {/* Animated border glow */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-400/20 via-cyan-400/20 to-blue-400/20 blur-sm -z-10 animate-pulse"></div>
                
                <div className="relative z-10 h-full flex flex-col">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-white mb-2">Monthly Plan</h3>
                    <p className="text-gray-300 text-sm">Perfect for getting started</p>
                  </div>

                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center mb-2">
                      <span className="text-5xl font-bold text-blue-400">₹16,800</span>
                      <span className="text-xl text-gray-400 ml-2">/month</span>
                    </div>
                    <p className="text-gray-400 text-sm">Billed monthly</p>
                  </div>

                  <ul className="text-gray-300 mb-8 space-y-3 flex-grow">
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
                        <span className="text-blue-400 font-semibold">{feature.split(' ')[0]}</span>
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
              
              <div className="bg-white/15 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border-2 border-green-400/40 relative overflow-hidden group hover:border-green-400/60 transition-all duration-500 h-full">
                {/* Shiny overlay effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-white/10 rounded-3xl"></div>
                
                {/* Animated border glow */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-green-400/30 via-emerald-400/30 to-green-400/30 blur-sm -z-10 animate-pulse"></div>
                
                <div className="relative z-10 h-full flex flex-col pt-4">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-white mb-2">Annual Plan</h3>
                    <p className="text-gray-300 text-sm">Best value for growing businesses</p>
                  </div>

                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center mb-2">
                      <span className="text-5xl font-bold text-green-400">₹1,68,000</span>
                      <span className="text-xl text-gray-400 ml-2">/year</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-400 text-sm">Billed annually</p>
                      <div className="inline-block bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 px-4 py-1 rounded-full text-xs font-semibold border border-green-400/30">
                        Save ₹33,600 (17% off)
                      </div>
                    </div>
                  </div>

                  <ul className="text-gray-300 mb-8 space-y-3 flex-grow">
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
                        <span className="text-green-400 font-semibold">{feature.split(' ')[0]}</span>
                        <span>{feature.substring(feature.indexOf(' ') + 1)}</span>
                      </motion.li>
                    ))}
                  </ul>

                  <motion.button 
                    onClick={() => navigate('/login')}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-black font-bold hover:from-green-400 hover:to-emerald-500 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-2xl hover:shadow-green-400/50 relative overflow-hidden group"
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
            <p className="text-gray-400 text-sm">
              No setup fees • Cancel anytime • 30-day money-back guarantee • Secure payments
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="section py-20 bg-gradient-to-r from-emerald-600 to-green-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Agriculture Business?
          </h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            Join thousands of farmers and agricultural businesses who trust KrishiSethu for their inventory management needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/login')}
              className="bg-white text-emerald-600 hover:bg-gray-100 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Get Started Today
              <ArrowRight className="inline-block ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-gray-900 to-black text-white py-16 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(16,185,129,0.3) 2px, transparent 2px),
                             radial-gradient(circle at 75% 75%, rgba(16,185,129,0.3) 2px, transparent 2px)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            {/* Enhanced Logo */}
            <motion.div 
              className="flex items-center justify-center space-x-3 mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-white/40 blur-2xl rounded-full transform scale-125"></div>
                <img 
                  src="/image-removebg-preview.png" 
                  alt="KrishiSethu Logo" 
                  className="h-16 w-auto object-contain relative z-10"
                  onError={(e) => {
                    // Fallback to gradient icon if logo fails to load
                    e.currentTarget.style.display = 'none';
                    const nextElement = e.currentTarget.parentElement?.nextElementSibling as HTMLElement;
                    if (nextElement) {
                      nextElement.style.display = 'flex';
                    }
                  }}
                />
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full items-center justify-center shadow-xl hidden">
                  <span className="text-black font-bold text-xl">🌾</span>
                </div>
              </div>
            </motion.div>
            
            <motion.p 
              className="text-green-100 mb-8 text-lg max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Empowering agriculture through intelligent inventory management
            </motion.p>
            
            {/* Social Icons */}
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
              ].map((social, index) => (
                <motion.div
                  key={social.label}
                  className={`w-12 h-12 bg-gradient-to-br ${social.color} rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300`}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-white text-lg">{social.icon}</span>
                </motion.div>
              ))}
            </motion.div>
            
            <motion.div 
              className="border-t border-green-500/20 pt-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <p className="text-green-200/60 text-sm">
                © 2024 KrishiSethu. All rights reserved. | Revolutionizing Agricultural Inventory Management
              </p>
            </motion.div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-8 left-8 w-20 h-20 bg-gradient-to-br from-green-400/10 to-emerald-400/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-8 right-8 w-24 h-24 bg-gradient-to-br from-emerald-400/10 to-green-400/10 rounded-full blur-xl"></div>
      </footer>
    </div>
  );
};

export default LandingPage;
