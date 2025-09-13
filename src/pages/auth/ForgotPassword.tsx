import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, ArrowRight, ArrowLeft, CheckCircle, Sparkles } from 'lucide-react'
import { useAuth } from '../../hooks'
import { Button } from '../../components/ui/Button'
import LOGO from '../../assets/LOGO.png'

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

const ForgotPassword: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')
  const { resetPassword, isLoading } = useAuth()

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    const result = await resetPassword(data.email)
    if (result.success) {
      setSubmittedEmail(data.email)
      setIsSubmitted(true)
    }
  }

  if (isSubmitted) {
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
              Check Your 
              <span className="block bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                Email Inbox
              </span>
            </h2>
            <p className="text-white/90 text-lg max-w-md">
              We've sent password reset instructions to help you get back into your account.
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
                  Email Sent!
                </h2>
                <p className="text-gray-600">
                  Check your email for reset instructions
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">What happens next?</h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-blue-600 text-xs font-bold">1</span>
                    </div>
                    <span>Check your email inbox for a message from JJ Essential</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-blue-600 text-xs font-bold">2</span>
                    </div>
                    <span>Click the reset link in the email</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-blue-600 text-xs font-bold">3</span>
                    </div>
                    <span>Create a new password for your account</span>
                  </li>
                </ul>
              </div>

              <div className="text-center text-sm text-gray-600 mb-6">
                <p>Email sent to: <span className="font-medium text-gray-900">{submittedEmail}</span></p>
                <p className="mt-2">Didn't receive an email? Check your spam folder.</p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => setIsSubmitted(false)}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-3 px-6 rounded-xl font-semibold text-base transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg focus:ring-4 focus:ring-blue-500/25 group"
                  size="lg"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span>Try Different Email</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Button>

                <Link
                  to="/auth/login"
                  className="block w-full text-center py-3 px-6 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back to Login</span>
                  </div>
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
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20 z-10"></div>
        <div className="absolute inset-0 bg-black/10 z-20"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-400/30 rounded-full blur-xl animate-pulse z-5"></div>
        <div className="absolute bottom-32 right-16 w-40 h-40 bg-purple-400/30 rounded-full blur-xl animate-pulse delay-1000 z-5"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-pink-400/30 rounded-full blur-xl animate-pulse delay-500 z-5"></div>
        
        <img
          src="https://i.postimg.cc/8kvw2Xwr/stacked-tableware.jpg"
          alt="Forgot Password"
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
            Forgot Your
            <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Password?
            </span>
          </h2>
          <p className="text-white/90 text-lg max-w-md">
            No worries! Enter your email and we'll send you reset instructions.
          </p>
        </div>
      </div>

      {/* Right Side - Forgot Password Form */}
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
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Mail className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
                Forgot Password
              </h2>
              <p className="text-gray-600">
                Enter your email to reset your password
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 animate-pulse">{errors.email.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-3 px-6 rounded-xl font-semibold text-base transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg focus:ring-4 focus:ring-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Sending Instructions...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>Send Reset Instructions</span>
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
                  className="text-blue-600 hover:text-blue-500 font-semibold transition-colors hover:underline"
                >
                  Sign in here
                </Link>
              </p>
            </div>

            {/* Help Section */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-500 mb-4">Need help?</p>
              <div className="text-center">
                <Link
                  to="/contact"
                  className="text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors hover:underline"
                >
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword