import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Lock, ArrowRight, CheckCircle, AlertCircle, Sparkles } from 'lucide-react'
import { useAuth } from '../../hooks'
import { Button } from '../../components/ui/Button'
import LOGO from '../../assets/LOGO.png'

const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

const ResetPassword: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  
  const { confirmResetPassword, isLoading } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  // Get token from URL parameters
  const token = searchParams.get('token')

  useEffect(() => {
    setIsVisible(true)
    
    // Check if token exists
    if (!token) {
      setHasError(true)
      setErrorMessage('Invalid or missing reset token. Please request a new password reset.')
    }
  }, [token])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setHasError(true)
      setErrorMessage('Invalid reset token. Please request a new password reset.')
      return
    }

    const result = await confirmResetPassword(token, data.newPassword)
    if (result.success) {
      setIsCompleted(true)
      // Auto-redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/auth/login')
      }, 3000)
    } else {
      setHasError(true)
      setErrorMessage(result.error || 'Failed to reset password. Please try again.')
    }
  }

  // Success state
  if (isCompleted) {
    return (
      <div className="min-h-screen flex overflow-hidden">
        {/* Left Side - Image with Overlay */}
        <div className="hidden lg:flex lg:w-1/2 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 via-blue-400/20 to-purple-400/20 z-10"></div>
          <div className="absolute inset-0 bg-black/10 z-20"></div>
          
          {/* Animated Background Elements */}
          <div className="absolute top-20 left-20 w-32 h-32 bg-green-400/30 rounded-full blur-xl animate-pulse z-5"></div>
          <div className="absolute bottom-32 right-16 w-40 h-40 bg-blue-400/30 rounded-full blur-xl animate-pulse delay-1000 z-5"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-purple-400/30 rounded-full blur-xl animate-pulse delay-500 z-5"></div>
          
          <img
            src="https://i.postimg.cc/8kvw2Xwr/stacked-tableware.jpg"
            alt="Password Reset Success"
            className={`w-full h-full object-cover transition-transform duration-1000 ease-out transform ${isVisible ? 'scale-100' : 'scale-110'}`}
          />
          
          {/* Floating Brand Elements */}
          <div className={`absolute top-8 left-8 z-30 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            <div className="flex items-center space-x-2">
              <img src={LOGO} alt="JJ Essential" className="w-12 h-12 rounded-full" />
              <span className="text-white font-bold text-xl">JJ Essential</span>
            </div>
          </div>
          
          {/* Success Text Overlay */}
          <div className={`absolute bottom-8 left-8 right-8 z-30 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
              Password Reset
              <span className="block bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                Successfully!
              </span>
            </h2>
            <p className="text-white/90 text-lg max-w-md">
              Your password has been updatesd. You can now sign in with your new password.
            </p>
          </div>
        </div>

        {/* Right Side - Success Message */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white">
          <div className={`max-w-md w-full transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
            {/* Mobile Brand Header */}
            <div className="lg:hidden mb-8 text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <img src={LOGO} alt="JJ Essential" className="w-12 h-12 rounded-full" />
                <span className="text-gray-900 font-bold text-2xl">JJ Essential</span>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-100">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
                  Password Reset!
                </h2>
                <p className="text-gray-600">
                  Your password has been successfully updatesd
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-green-900">Success!</h3>
                    <p className="text-sm text-green-700">
                      Your password has been reset successfully. You can now sign in with your new password.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center text-sm text-gray-600 mb-6">
                <p>You'll be redirected to the login page in a few seconds...</p>
              </div>

              <div className="space-y-3">
                <Link
                  to="/auth/login"
                  className="block w-full text-center bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white py-3 px-6 rounded-xl font-semibold text-base transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg focus:ring-4 focus:ring-green-500/25"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span>Sign In Now</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (hasError) {
    return (
      <div className="min-h-screen flex overflow-hidden">
        {/* Left Side - Image with Overlay */}
        <div className="hidden lg:flex lg:w-1/2 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-red-400/20 via-orange-400/20 to-yellow-400/20 z-10"></div>
          <div className="absolute inset-0 bg-black/10 z-20"></div>
          
          {/* Animated Background Elements */}
          <div className="absolute top-20 left-20 w-32 h-32 bg-red-400/30 rounded-full blur-xl animate-pulse z-5"></div>
          <div className="absolute bottom-32 right-16 w-40 h-40 bg-orange-400/30 rounded-full blur-xl animate-pulse delay-1000 z-5"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-yellow-400/30 rounded-full blur-xl animate-pulse delay-500 z-5"></div>
          
          <img
            src="https://i.postimg.cc/8kvw2Xwr/stacked-tableware.jpg"
            alt="Password Reset Error"
            className={`w-full h-full object-cover transition-transform duration-1000 ease-out transform ${isVisible ? 'scale-100' : 'scale-110'}`}
          />
          
          {/* Floating Brand Elements */}
          <div className={`absolute top-8 left-8 z-30 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            <div className="flex items-center space-x-2">
              <img src={LOGO} alt="JJ Essential" className="w-12 h-12 rounded-full" />
              <span className="text-white font-bold text-xl">JJ Essential</span>
            </div>
          </div>
          
          {/* Error Text Overlay */}
          <div className={`absolute bottom-8 left-8 right-8 z-30 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
              Reset Link
              <span className="block bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                Expired
              </span>
            </h2>
            <p className="text-white/90 text-lg max-w-md">
              The password reset link has expired or is invalid. Please request a new one.
            </p>
          </div>
        </div>

        {/* Right Side - Error Message */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white">
          <div className={`max-w-md w-full transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
            {/* Mobile Brand Header */}
            <div className="lg:hidden mb-8 text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <img src={LOGO} alt="JJ Essential" className="w-12 h-12 rounded-full" />
                <span className="text-gray-900 font-bold text-2xl">JJ Essential</span>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-100">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
                  Reset Failed
                </h2>
                <p className="text-gray-600">
                  Unable to reset your password
                </p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-6 h-6 text-red-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-900 mb-1">Error</h3>
                    <p className="text-sm text-red-700">
                      {errorMessage}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  to="/forgot-password"
                  className="block w-full text-center bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-3 px-6 rounded-xl font-semibold text-base transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg focus:ring-4 focus:ring-blue-500/25"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span>Request New Reset Link</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </Link>

                <Link
                  to="/auth/login"
                  className="block w-full text-center py-3 px-6 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* Left Side - Image with Overlay */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 via-blue-400/20 to-green-400/20 z-10"></div>
        <div className="absolute inset-0 bg-black/10 z-20"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-purple-400/30 rounded-full blur-xl animate-pulse z-5"></div>
        <div className="absolute bottom-32 right-16 w-40 h-40 bg-blue-400/30 rounded-full blur-xl animate-pulse delay-1000 z-5"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-green-400/30 rounded-full blur-xl animate-pulse delay-500 z-5"></div>
        
        <img
          src="https://i.postimg.cc/8kvw2Xwr/stacked-tableware.jpg"
          alt="Reset Password"
          className={`w-full h-full object-cover transition-transform duration-1000 ease-out transform ${isVisible ? 'scale-100' : 'scale-110'}`}
        />
        
        {/* Floating Brand Elements */}
        <div className={`absolute top-8 left-8 z-30 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <div className="flex items-center space-x-2">
            <img src={LOGO} alt="JJ Essential" className="w-12 h-12 rounded-full" />
            <span className="text-white font-bold text-xl">JJ Essential</span>
          </div>
        </div>
        
        {/* Welcome Text Overlay */}
        <div className={`absolute bottom-8 left-8 right-8 z-30 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            Create New
            <span className="block bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Password
            </span>
          </h2>
          <p className="text-white/90 text-lg max-w-md">
            Choose a strong, secure password to protect your account.
          </p>
        </div>
      </div>

      {/* Right Side - Reset Password Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white">
        <div className={`max-w-md w-full transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
          {/* Mobile Brand Header */}
          <div className="lg:hidden mb-8 text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <img src={LOGO} alt="JJ Essential" className="w-12 h-12 rounded-full" />
              <span className="text-gray-900 font-bold text-2xl">JJ Essential</span>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-100">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Lock className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
                Reset Password
              </h2>
              <p className="text-gray-600">
                Create your new secure password
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                    {...register('newPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-500 transition-colors p-1"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="mt-2 text-sm text-red-600 animate-pulse">{errors.newPassword.message}</p>
                )}
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                    {...register('confirmPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-500 transition-colors p-1"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600 animate-pulse">{errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Password Requirements:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• At least 6 characters long</li>
                  <li>• Use a mix of letters, numbers, and symbols</li>
                  <li>• Avoid common passwords</li>
                </ul>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white py-3 px-6 rounded-xl font-semibold text-base transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg focus:ring-4 focus:ring-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Updating Password...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>updates Password</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Remember your password?{' '}
                <Link
                  to="/auth/login"
                  className="text-purple-600 hover:text-purple-500 font-semibold transition-colors hover:underline"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword