import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Visibility as VisibilityIcon, 
  VisibilityOff as VisibilityOffIcon,
  Lock as LockIcon,
  Home as HomeIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import Lottie from 'lottie-react';
import './LoginForm.css';

// Import animations
import farmingAnimation from './animations/farmingAnimation.json';
import fertilizerAnimation from './animations/fertilizerAnimation.json';

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const [passwordReset, setPasswordReset] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordFormData>();

  const password = watch('password');

  useEffect(() => {
    // Check if we have the required parameters for password reset
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const type = searchParams.get('type');

    if (type === 'recovery' && accessToken && refreshToken) {
      // Set the session with the tokens from the URL
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      }).then(({ error }) => {
        if (error) {
          console.error('Error setting session:', error);
          setIsValidToken(false);
          toast.error('Invalid or expired reset link');
        } else {
          setIsValidToken(true);
        }
      });
    } else {
      setIsValidToken(false);
      toast.error('Invalid reset link');
    }
  }, [searchParams]);

  const handleGoHome = () => {
    navigate('/landing');
  };

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        throw error;
      }

      setPasswordReset(true);
      toast.success('Password updated successfully!');
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  if (isValidToken === null) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-900">
        <div className="text-white text-center">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p>Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (isValidToken === false) {
    return (
      <div className="fixed inset-0 flex flex-col bg-slate-900" style={{ height: '100vh', overflow: 'auto' }}>
        {/* Home Button */}
        <button 
          onClick={handleGoHome}
          className="absolute top-4 right-4 z-50 flex items-center text-white hover:text-gray-200 transition-colors bg-slate-800/50 p-2 rounded-full"
          aria-label="Go to home"
        >
          <HomeIcon className="text-2xl" />
        </button>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md text-center">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
              <div className="mx-auto w-16 h-16 bg-red-500/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-4 shadow-lg border border-red-400/30">
                <LockIcon className="w-8 h-8 text-red-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">Invalid Reset Link</h1>
              <p className="text-white/80 mb-6">
                This password reset link is invalid or has expired. Please request a new password reset.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-gradient-to-r from-gray-500 to-slate-600 hover:from-gray-600 hover:to-slate-700 text-white py-3 px-4 rounded-xl font-medium shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] backdrop-blur-md border border-gray-400/50"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-slate-900" style={{ height: '100vh', overflow: 'auto' }}>
      {/* Home Button */}
      <button 
        onClick={handleGoHome}
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
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
        </video>
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

      {/* Reset Password Form Container */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md relative z-20">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-white/5 rounded-3xl"></div>
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-gray-400/20 via-slate-400/20 to-gray-400/20 blur-sm -z-10 animate-pulse"></div>
            
            {/* Logo Section */}
            <div className="pt-4 pb-2 text-center relative z-10">
              <div className="mx-auto w-16 h-16 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center mb-3 shadow-lg border border-white/20">
                <img 
                  src="/image-removebg-preview.png" 
                  alt="KrishiSethu Logo" 
                  className="w-12 h-12 object-contain"
                  onError={(e) => {
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

            <div className="px-6 pb-6 relative z-10">
              {!passwordReset ? (
                <>
                  <h1 className="text-2xl font-bold text-white text-center mb-1 drop-shadow-lg">Reset Password</h1>
                  <p className="text-white/80 text-center text-sm mb-6 drop-shadow-md">Enter your new password</p>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* New Password Field */}
                    <div className="space-y-1">
                      <label htmlFor="password" className="block text-sm font-medium text-white/90">
                        New Password
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
                          autoComplete="new-password"
                          className="w-full px-4 py-3 pr-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 focus:bg-white/20 hover:bg-white/15 text-white placeholder-white/60"
                          placeholder="Enter new password"
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

                    {/* Confirm Password Field */}
                    <div className="space-y-1">
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/90">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          {...register('confirmPassword', {
                            required: 'Please confirm your password',
                            validate: (value) =>
                              value === password || 'Passwords do not match',
                          })}
                          type={showConfirmPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          className="w-full px-4 py-3 pr-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 focus:bg-white/20 hover:bg-white/15 text-white placeholder-white/60"
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white transition-colors"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <VisibilityOffIcon className="h-5 w-5" />
                          ) : (
                            <VisibilityIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-xs text-red-400 flex items-center gap-1">
                          <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                          {errors.confirmPassword.message}
                        </p>
                      )}
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
                          Updating Password...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <LockIcon className="w-5 h-5" />
                          Update Password
                        </div>
                      )}
                    </button>
                  </form>
                </>
              ) : (
                <>
                  {/* Success State */}
                  <div className="text-center">
                    <div className="mx-auto w-16 h-16 bg-green-500/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-4 shadow-lg border border-green-400/30">
                      <CheckCircleIcon className="w-8 h-8 text-green-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Password Updated!</h1>
                    <p className="text-white/80 text-sm mb-6">
                      Your password has been successfully updated. You will be redirected to the login page shortly.
                    </p>
                    <button
                      onClick={() => navigate('/login')}
                      className="w-full bg-gradient-to-r from-gray-500 to-slate-600 hover:from-gray-600 hover:to-slate-700 text-white py-3 px-4 rounded-xl font-medium shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] backdrop-blur-md border border-gray-400/50"
                    >
                      Go to Login
                    </button>
                  </div>
                </>
              )}
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
    </div>
  );
}
