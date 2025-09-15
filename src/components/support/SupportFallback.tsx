import React, { useState } from 'react';
import { Mail, Phone, Clock, MessageCircle, Send, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';

interface SupportFallbackProps {
  onBackToMain?: () => void;
}

const SupportFallback: React.FC<SupportFallbackProps> = ({ onBackToMain }) => {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH'
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Simulate form submission delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setSubmitted(true);
    setSubmitting(false);
    
    // Reset form after showing success
    setTimeout(() => {
      setContactForm({
        name: '',
        email: '',
        subject: '',
        message: '',
        priority: 'MEDIUM'
      });
      setSubmitted(false);
    }, 3000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Message Sent Successfully!
          </h2>
          <p className="text-gray-600 mb-6">
            Thank you for contacting us. We'll get back to you within 2 hours during business hours.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• We'll review your message within the next 2 hours</li>
              <li>• You'll receive a confirmation email shortly</li>
              <li>• Our support team will contact you via email or phone</li>
              <li>• For urgent issues, please call us directly</li>
            </ul>
          </div>
          {onBackToMain && (
            <button
              onClick={onBackToMain}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back to Support Center
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Alert */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
        <div className="flex">
          <AlertTriangle className="h-6 w-6 text-amber-400 flex-shrink-0" />
          <div className="ml-3">
            <h3 className="text-lg font-medium text-amber-800">
              Ticket System Temporarily Unavailable
            </h3>
            <p className="mt-2 text-sm text-amber-700">
              Our online ticket system is currently under development. Please use the contact form below 
              or reach out to us directly for immediate assistance.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-6">
              <MessageCircle className="h-6 w-6 text-indigo-600 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">
                Send us a Message
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={contactForm.name}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Your full name"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={contactForm.email}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={contactForm.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Brief description of your issue"
                  />
                </div>
                
                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={contactForm.priority}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="LOW">Low - General inquiry</option>
                    <option value="MEDIUM">Medium - Standard issue</option>
                    <option value="HIGH">High - Urgent problem</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  value={contactForm.message}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Please describe your issue in detail. Include any relevant order numbers, error messages, or steps you've already tried."
                />
                <p className="mt-1 text-xs text-gray-500">
                  Minimum 10 characters. Be as specific as possible to help us assist you better.
                </p>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  * Required fields
                </p>
                <button
                  type="submit"
                  disabled={submitting || contactForm.message.length < 10}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-6">
          {/* Direct Contact */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Direct Contact
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <Mail className="h-5 w-5 text-indigo-600 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Email Support</p>
                  <a 
                    href="mailto:support@jj-essential.com"
                    className="text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    support@jj-essential.com
                  </a>
                  <p className="text-xs text-gray-500 mt-1">
                    We typically respond within 2 hours
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Phone className="h-5 w-5 text-indigo-600 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Phone Support</p>
                  <p className="text-sm text-gray-600">+234-XXX-XXXX-XXX</p>
                  <p className="text-xs text-gray-500 mt-1">
                    For urgent issues
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Clock className="h-5 w-5 text-indigo-600 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Business Hours</p>
                  <p className="text-sm text-gray-600">Monday - Friday</p>
                  <p className="text-sm text-gray-600">9:00 AM - 6:00 PM WAT</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Weekend emergency support available
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Help */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Help
            </h3>
            
            <div className="space-y-3">
              <a 
                href="/help/faq"
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium text-gray-900">FAQ & Help Center</span>
                <ExternalLink className="h-4 w-4 text-gray-400" />
              </a>
              
              <a 
                href="/track-order"
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium text-gray-900">Track Your Order</span>
                <ExternalLink className="h-4 w-4 text-gray-400" />
              </a>
              
              <a 
                href="/returns"
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium text-gray-900">Returns & Exchanges</span>
                <ExternalLink className="h-4 w-4 text-gray-400" />
              </a>
            </div>
          </div>

          {/* Response Times */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">
              Expected Response Times
            </h4>
            <div className="space-y-2 text-sm text-blue-800">
              <div className="flex justify-between">
                <span>High Priority:</span>
                <span className="font-medium">30 minutes</span>
              </div>
              <div className="flex justify-between">
                <span>Medium Priority:</span>
                <span className="font-medium">2 hours</span>
              </div>
              <div className="flex justify-between">
                <span>Low Priority:</span>
                <span className="font-medium">24 hours</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportFallback;