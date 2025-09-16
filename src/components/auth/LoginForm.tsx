import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Visibility as VisibilityIcon, 
  VisibilityOff as VisibilityOffIcon,
  Email as EmailIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import Lottie from 'lottie-react';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import './LoginForm.css';

// Import animations
import farmingAnimation from './animations/farmingAnimation.json';
import fertilizerAnimation from './animations/fertilizerAnimation.json';

interface LoginFormData {
  email: string;
  password: string;
}


interface LoginFormProps {
  onToggleToSignup?: () => void;
}

export function LoginForm({ onToggleToSignup }: LoginFormProps) {
  const navigate = useNavigate();
  
  const handleGoHome = () => {
    navigate('/landing');
  };
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSignIn, setIsSignIn] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  
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
    <div className="fixed inset-0 flex flex-col bg-slate-900" style={{ height: '100vh', overflow: 'auto' }}>
      {/* Home Button */}
      <button 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleGoHome();
        }}
        className="absolute top-4 right-4 z-50 flex items-center text-white hover:text-gray-200 transition-colors bg-slate-800/50 p-2 rounded-full"
        aria-label="Go to home"
      >
        <HomeIcon className="text-2xl" />
      </button>
      {/* Video Background */}
      <div className="fixed inset-0 z-0" style={{ height: '100vh', width: '100vw' }}>
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/Login_background.mp4" type="video/mp4" />
          {/* Fallback gradient background if video fails to load */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
        </video>
        
        {/* Video overlay for better text readability */}
        <div className="absolute inset-0 bg-black/30" style={{ height: '100%' }}></div>
      </div>

      {/* Animated particles */}
      <div className="fixed inset-0 z-10" style={{ height: '100vh', width: '100vw' }}>
        <div className="particle particle-1"></div>
        <div className="particle particle-2"></div>
        <div className="particle particle-3"></div>
        <div className="particle particle-4"></div>
        <div className="particle particle-5"></div>
      </div>
      

      {/* Login Form Container - Centered */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md relative z-20">
          {/* Glassmorphism Login Card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            {/* Shiny overlay effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-white/5 rounded-3xl"></div>
            
            {/* Animated border glow */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-gray-400/20 via-slate-400/20 to-gray-400/20 blur-sm -z-10 animate-pulse"></div>
            
            {/* Logo Section - Inside card */}
            <div className="pt-4 pb-2 text-center relative z-10">
              <div className="mx-auto w-16 h-16 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center mb-3 shadow-lg border border-white/20">
                <img 
                  src="/image-removebg-preview.png" 
                  alt="KrishiSethu Logo" 
                  className="w-12 h-12 object-contain"
                  onError={(e) => {
                    // Fallback to gradient icon if logo fails to load
                    e.currentTarget.style.display = 'none';
                    const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                    if (nextElement) {
                      nextElement.style.display = 'flex';
                    }
                  }}
                />
                <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-slate-500 rounded-full items-center justify-center shadow-xl hidden">
                  <span className="text-white font-bold text-lg">🌾</span>
                </div>
              </div>
              <div className="text-center">
                <span className="text-xl font-bold text-white drop-shadow-lg">
                  KrishiSethu
                </span>
              </div>
            </div>

            {/* Welcome Section */}
            <div className="px-6 pb-6 relative z-10">
              <h1 className="text-2xl font-bold text-white text-center mb-1 drop-shadow-lg">Welcome Back!</h1>
              <p className="text-white/80 text-center text-sm mb-6 drop-shadow-md">Sign in to your account</p>

              {/* Access Method Toggle */}
              <div className="mb-4">
                <p className="text-white/90 text-sm font-medium mb-3 drop-shadow-md">Choose Access Method</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setIsSignIn(true)}
                    className={`py-3 px-4 rounded-xl font-medium transition-all duration-200 backdrop-blur-md border ${
                      isSignIn 
                        ? 'bg-gradient-to-r from-gray-400 to-slate-500 text-white shadow-lg border-gray-300/50' 
                        : 'bg-white/10 text-white/80 hover:bg-white/20 border-white/20'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => onToggleToSignup?.()}
                    className={`py-3 px-4 rounded-xl font-medium transition-all duration-200 backdrop-blur-md border ${
                      !isSignIn 
                        ? 'bg-gradient-to-r from-gray-400 to-slate-500 text-white shadow-lg border-gray-300/50' 
                        : 'bg-white/10 text-white/80 hover:bg-white/20 border-white/20'
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
                    className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 focus:bg-white/20 hover:bg-white/15 text-white placeholder-white/60"
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
                    className="w-full px-4 py-3 pr-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 focus:bg-white/20 hover:bg-white/15 text-white placeholder-white/60"
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
                    className="w-4 h-4 text-gray-400 bg-white/10 border-white/20 rounded focus:ring-gray-400 focus:ring-2"
                  />
                  <span className="ml-2 text-white/80">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-gray-400 hover:text-gray-300 font-medium transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-gray-500 to-slate-600 hover:from-gray-600 hover:to-slate-700 text-white py-3 px-4 rounded-xl font-bold shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] mt-6 backdrop-blur-md border border-gray-400/50"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    Sign In
                  </div>
                )}
              </button>

              {/* Signup Link */}
              <div className="mt-4 text-center pb-6">
                <p className="text-white/70 text-sm drop-shadow-md">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-300 font-medium transition-colors"
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
          
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal 
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </div>
  );
}
