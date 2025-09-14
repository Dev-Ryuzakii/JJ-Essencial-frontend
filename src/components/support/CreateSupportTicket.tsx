import React, { useState } from 'react';
import { Send, X, AlertTriangle } from 'lucide-react';
import userSupportApi, { type CreateSupportTicketDto } from '../../services/userSupportApi';

interface CreateSupportTicketProps {
  onTicketCreated: () => void;
  onCancel: () => void;
}

const CreateSupportTicket: React.FC<CreateSupportTicketProps> = ({ 
  onTicketCreated, 
  onCancel 
}) => {
  const [formData, setFormData] = useState<CreateSupportTicketDto>({
    subject: '',
    priority: 'MEDIUM',
    initialMessage: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supportUnavailable, setSupportUnavailable] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.initialMessage.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSupportUnavailable(false);
      
      await userSupportApi.createTicket(formData);
      onTicketCreated();
    } catch (err) {
      console.log('Caught error in CreateSupportTicket:', err);
      console.log('Error type:', typeof err);
      console.log('Error keys:', Object.keys(err));
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to create ticket';
      console.log('Error message:', errorMessage);
      
      // Check if it's a support system unavailable error
      if (errorMessage.includes('Support system is currently unavailable') || 
          errorMessage.includes('500') || errorMessage.includes('400') || errorMessage.includes('429')) {
        setSupportUnavailable(true);
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Create Support Ticket
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {supportUnavailable && (
          <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <h4 className="text-lg font-medium text-yellow-800 mb-3">Support System Temporarily Unavailable</h4>
            <p className="text-sm text-yellow-700 mb-4">
              Our ticket support system is currently under development. Please contact us directly using the information below:
            </p>
            <div className="space-y-3 text-sm">
              <div className="flex items-center">
                <span className="font-medium text-yellow-800">📧 Email:</span>
                <a 
                  href={`mailto:support@jj-essential.com?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(`Priority: ${formData.priority}\n\nMessage:\n${formData.initialMessage}`)}`}
                  className="ml-2 text-yellow-800 underline hover:text-yellow-600"
                >
                  support@jj-essential.com
                </a>
                {formData.subject && (
                  <span className="ml-2 text-xs text-yellow-600">
                    (Click to send pre-filled email)
                  </span>
                )}
              </div>
              <div className="flex items-center">
                <span className="font-medium text-yellow-800">📞 Phone:</span>
                <span className="ml-2 text-yellow-700">+234-XXX-XXXX-XXX</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium text-yellow-800">🕒 Hours:</span>
                <span className="ml-2 text-yellow-700">Monday - Friday, 9AM - 6PM WAT</span>
              </div>
            </div>
            <div className="mt-4 flex space-x-3">
              <button
                onClick={() => setSupportUnavailable(false)}
                className="text-sm font-medium text-yellow-800 hover:text-yellow-600 underline"
              >
                Try ticket system again
              </button>
              <button
                onClick={onCancel}
                className="text-sm font-medium text-gray-600 hover:text-gray-500"
              >
                Back to support
              </button>
            </div>
          </div>
        )}
        
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
              Subject *
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Brief description of your issue"
              required
              maxLength={200}
            />
            <p className="mt-1 text-xs text-gray-500">
              {formData.subject.length}/200 characters
            </p>
          </div>
          
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="LOW">Low - General inquiry</option>
              <option value="MEDIUM">Medium - Standard issue</option>
              <option value="HIGH">High - Urgent issue</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Select the urgency level of your issue
            </p>
          </div>
          
          <div>
            <label htmlFor="initialMessage" className="block text-sm font-medium text-gray-700">
              Message *
            </label>
            <textarea
              id="initialMessage"
              name="initialMessage"
              rows={6}
              value={formData.initialMessage}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Please describe your issue in detail. Include any relevant information such as order numbers, error messages, or steps you've already tried."
              required
              maxLength={2000}
            />
            <p className="mt-1 text-xs text-gray-500">
              {formData.initialMessage.length}/2000 characters
            </p>
          </div>
          
          <div className="bg-blue-50 rounded-md p-4">
            <div className="text-sm text-blue-700">
              <h4 className="font-medium mb-2">Tips for better support:</h4>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Include your order number if the issue is order-related</li>
                <li>Describe what you were trying to do when the issue occurred</li>
                <li>Mention your browser and device if it's a technical issue</li>
                <li>Attach screenshots if they would help explain the problem</li>
              </ul>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.subject.trim() || !formData.initialMessage.trim()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Create Ticket
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSupportTicket;