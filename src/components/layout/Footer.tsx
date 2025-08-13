import React from 'react'
import { Link } from 'react-router-dom'
import { 
  FacebookIcon, 
  TwitterIcon, 
  InstagramIcon, 
  LinkedinIcon, 
  MailIcon,
  PhoneIcon,
  MapPinIcon
} from 'lucide-react'

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">JJ</span>
              </div>
              <span className="text-xl font-bold">
                {import.meta.env.VITE_APP_NAME}
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your trusted e-commerce platform for quality products, 
              exceptional service, and unbeatable prices. Shop with confidence 
              and discover amazing deals every day.
            </p>
            <div className="flex space-x-4">
              {import.meta.env.VITE_FACEBOOK_URL && (
                <a 
                  href={import.meta.env.VITE_FACEBOOK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-500 transition-colors"
                >
                  <FacebookIcon className="w-5 h-5" />
                </a>
              )}
              {import.meta.env.VITE_TWITTER_URL && (
                <a 
                  href={import.meta.env.VITE_TWITTER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-400 transition-colors"
                >
                  <TwitterIcon className="w-5 h-5" />
                </a>
              )}
              {import.meta.env.VITE_INSTAGRAM_URL && (
                <a 
                  href={import.meta.env.VITE_INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-pink-500 transition-colors"
                >
                  <InstagramIcon className="w-5 h-5" />
                </a>
              )}
              {import.meta.env.VITE_LINKEDIN_URL && (
                <a 
                  href={import.meta.env.VITE_LINKEDIN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <LinkedinIcon className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/products" className="text-gray-400 hover:text-white transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-gray-400 hover:text-white transition-colors">
                  Categories
                </Link>
              </li>
              {import.meta.env.VITE_ENABLE_TRADES === 'true' && (
                <li>
                  <Link to="/trades" className="text-gray-400 hover:text-white transition-colors">
                    Trade Products
                  </Link>
                </li>
              )}
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/help" className="text-gray-400 hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-gray-400 hover:text-white transition-colors">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-gray-400 hover:text-white transition-colors">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link to="/track-order" className="text-gray-400 hover:text-white transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-400 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Info</h3>
            <div className="space-y-3">
              {import.meta.env.VITE_SUPPORT_EMAIL && (
                <div className="flex items-center space-x-3">
                  <MailIcon className="w-5 h-5 text-gray-400" />
                  <a 
                    href={`mailto:${import.meta.env.VITE_SUPPORT_EMAIL}`}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {import.meta.env.VITE_SUPPORT_EMAIL}
                  </a>
                </div>
              )}
              
              {import.meta.env.VITE_CONTACT_PHONE && (
                <div className="flex items-center space-x-3">
                  <PhoneIcon className="w-5 h-5 text-gray-400" />
                  <a 
                    href={`tel:${import.meta.env.VITE_CONTACT_PHONE}`}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {import.meta.env.VITE_CONTACT_PHONE}
                  </a>
                </div>
              )}

              {import.meta.env.VITE_BUSINESS_ADDRESS && (
                <div className="flex items-start space-x-3">
                  <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                  <span className="text-gray-400">
                    {import.meta.env.VITE_BUSINESS_ADDRESS}
                  </span>
                </div>
              )}

              {import.meta.env.VITE_WHATSAPP_NUMBER && (
                <div className="mt-4">
                  <a 
                    href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER?.replace('+', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <span>💬</span>
                    <span>WhatsApp Support</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Subscription */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <h3 className="text-lg font-semibold mb-2">Stay Updated</h3>
            <p className="text-gray-400 text-sm mb-4">
              Subscribe to get special offers, free giveaways, and updates on new arrivals.
            </p>
            <form className="flex space-x-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm text-center md:text-left">
              © {currentYear} {import.meta.env.VITE_APP_NAME}. All rights reserved.
            </div>
            
            <div className="flex flex-wrap justify-center space-x-6 text-sm">
              <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link to="/cookies" className="text-gray-400 hover:text-white transition-colors">
                Cookie Policy
              </Link>
              <Link to="/refund-policy" className="text-gray-400 hover:text-white transition-colors">
                Refund Policy
              </Link>
            </div>

            {/* Payment Methods */}
            <div className="flex items-center space-x-3">
              <span className="text-gray-400 text-sm">We Accept:</span>
              <div className="flex space-x-2">
                <div className="w-8 h-6 bg-blue-600 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">V</span>
                </div>
                <div className="w-8 h-6 bg-red-600 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">M</span>
                </div>
                <div className="w-8 h-6 bg-yellow-600 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">P</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
