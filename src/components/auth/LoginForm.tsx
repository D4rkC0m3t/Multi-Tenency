import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Visibility as VisibilityIcon, 
  VisibilityOff as VisibilityOffIcon,
  Email as EmailIcon,
  Palette as PaletteIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import Lottie from 'lottie-react';
import './LoginForm.css';

// Import animations
import farmingAnimation from './animations/farmingAnimation.json';
import fertilizerAnimation from './animations/fertilizerAnimation.json';

interface LoginFormData {
  email: string;
  password: string;
}

type ColorTheme = 'emerald' | 'blue' | 'purple' | 'indigo' | 'teal';

const colorThemes = {
  emerald: {
    primary: 'emerald',
    gradient: 'from-emerald-600 to-green-600',
    accent: 'emerald-500',
    light: 'emerald-50',
    ring: 'emerald-500',
    hover: 'emerald-700',
    text: 'emerald-600',
    icon: 'emerald-600'
  },
  blue: {
    primary: 'blue',
    gradient: 'from-blue-600 to-indigo-600',
    accent: 'blue-500',
    light: 'blue-50',
    ring: 'blue-500',
    hover: 'blue-700',
    text: 'blue-600',
    icon: 'blue-600'
  },
  purple: {
    primary: 'purple',
    gradient: 'from-purple-600 to-pink-600',
    accent: 'purple-500',
    light: 'purple-50',
    ring: 'purple-500',
    hover: 'purple-700',
    text: 'purple-600',
    icon: 'purple-600'
  },
  indigo: {
    primary: 'indigo',
    gradient: 'from-indigo-600 to-blue-600',
    accent: 'indigo-500',
    light: 'indigo-50',
    ring: 'indigo-500',
    hover: 'indigo-700',
    text: 'indigo-600',
    icon: 'indigo-600'
  },
  teal: {
    primary: 'teal',
    gradient: 'from-teal-600 to-cyan-600',
    accent: 'teal-500',
    light: 'teal-50',
    ring: 'teal-500',
    hover: 'teal-700',
    text: 'teal-600',
    icon: 'teal-600'
  }
};

interface LoginFormProps {
  onToggleToSignup?: () => void;
}

export function LoginForm({ onToggleToSignup }: LoginFormProps) {
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ColorTheme>('emerald');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSignIn, setIsSignIn] = useState(true);
  const theme = colorThemes[currentTheme];

  // Background slide animation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 5);
    }, 4000);
    return () => clearInterval(interval);
  }, []);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true);
      await signIn(data.email, data.password);
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col p-4 overflow-hidden">
      {/* Agricultural Background Slides */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-emerald-800/30 to-green-900/40"></div>
        <div className="agricultural-slides">
          {[
            { icon: '🌾', title: 'Fertilizer Management', subtitle: 'Track your agricultural inventory', gradient: 'from-green-600/90 to-emerald-600/90' },
            { icon: '🚜', title: 'Smart Agriculture', subtitle: 'Modern farming solutions', gradient: 'from-amber-600/90 to-yellow-600/90' },
            { icon: '🌱', title: 'Crop Nutrition', subtitle: 'Optimize plant growth', gradient: 'from-teal-600/90 to-cyan-600/90' },
            { icon: '🏭', title: 'Inventory Control', subtitle: 'Warehouse management', gradient: 'from-orange-600/90 to-red-600/90' },
            { icon: '📊', title: 'Analytics & Reports', subtitle: 'Data-driven insights', gradient: 'from-purple-600/90 to-indigo-600/90' }
          ].map((slide, index) => (
            <div 
              key={index}
              className={`slide absolute inset-0 transition-opacity duration-1000 ${
                currentSlide === index ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient}`}></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white/20 select-none">
                  <div className="text-8xl mb-4">{slide.icon}</div>
                  <div className="text-2xl font-bold mb-2">{slide.title}</div>
                  <div className="text-lg">{slide.subtitle}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Animated particles */}
      <div className="absolute inset-0 z-0">
        <div className="particle particle-1"></div>
        <div className="particle particle-2"></div>
        <div className="particle particle-3"></div>
        <div className="particle particle-4"></div>
        <div className="particle particle-5"></div>
      </div>
      
      {/* Theme Selector */}
      <div className="absolute top-6 right-6 z-10">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-white/20">
          <div className="flex items-center gap-2">
            <PaletteIcon className="h-4 w-4 text-gray-600" />
            <div className="flex gap-2">
              {(Object.keys(colorThemes) as ColorTheme[]).map((themeKey) => (
                <button
                  key={themeKey}
                  onClick={() => setCurrentTheme(themeKey)}
                  className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                    currentTheme === themeKey 
                      ? 'border-gray-800 scale-110' 
                      : 'border-gray-300 hover:scale-105'
                  }`}
                  style={{
                    background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                  }}
                >
                  <div className={`w-full h-full rounded-full bg-gradient-to-r ${colorThemes[themeKey].gradient}`}></div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Login Form Container - Centered */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md mx-auto relative z-20">
          {/* Dark Login Card */}
          <div className="bg-slate-800/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden">
            
            {/* Logo Section - Inside card */}
            <div className="pt-8 pb-6 text-center">
              <div className="mx-auto w-20 h-20 bg-white rounded-xl flex items-center justify-center mb-4 shadow-lg p-2">
                <img 
                  src="/image-removebg-preview.png" 
                  alt="Company Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Welcome Section */}
            <div className="px-8 pb-6">
              <h1 className="text-3xl font-bold text-white text-center mb-2">Welcome Back!</h1>
              <p className="text-slate-300 text-center text-sm mb-8">Sign in to your account</p>

              {/* Access Method Toggle */}
              <div className="mb-6">
                <p className="text-white text-sm font-medium mb-3">Choose Access Method</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setIsSignIn(true)}
                    className={`py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                      isSignIn 
                        ? 'bg-emerald-600 text-white shadow-lg' 
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => onToggleToSignup?.()}
                    className={`py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                      !isSignIn 
                        ? 'bg-emerald-600 text-white shadow-lg' 
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    Signup
                  </button>
                </div>
              </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-1">
                <label htmlFor="email" className="block text-sm font-medium text-white/90">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EmailIcon className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    type="email"
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-slate-700 hover:bg-slate-700 text-white placeholder-slate-400"
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <label htmlFor="password" className="block text-sm font-medium text-white/90">
                  Password
                </label>
                <div className="relative">
                  <input
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                    })}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className="w-full px-4 py-3 pr-12 bg-slate-700/50 border border-slate-600 rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-slate-700 hover:bg-slate-700 text-white placeholder-slate-400"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <VisibilityOffIcon className="h-5 w-5" />
                    ) : (
                      <VisibilityIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-sm pt-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-emerald-600 bg-slate-700 border-slate-600 rounded focus:ring-emerald-500 focus:ring-2"
                  />
                  <span className="ml-2 text-slate-300">Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-lg font-medium shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] mt-6"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    Sign In
                  </div>
                )}
              </button>

              {/* Signup Link */}
              <div className="mt-6 text-center pb-8">
                <p className="text-slate-400 text-sm">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                    onClick={() => onToggleToSignup?.()}
                  >
                    Signup
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>

          {/* Lottie Animations */}
          <div className="absolute -top-4 -left-4 w-20 h-20 opacity-30">
            <Lottie 
              animationData={farmingAnimation} 
              loop={true}
              autoplay={true}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
          <div className="absolute -bottom-4 -right-4 w-24 h-24 opacity-25">
            <Lottie 
              animationData={fertilizerAnimation} 
              loop={true}
              autoplay={true}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
          
          {/* Floating Elements */}
          <div className={`absolute top-1/4 -left-8 w-12 h-12 bg-gradient-to-r ${theme.gradient} rounded-full opacity-10 animate-pulse`}></div>
          <div className={`absolute bottom-1/4 -right-8 w-16 h-16 bg-gradient-to-r ${theme.gradient} rounded-full opacity-10 animate-pulse delay-1000`}></div>
        </div>
      </div>
    </div>
  );
}
