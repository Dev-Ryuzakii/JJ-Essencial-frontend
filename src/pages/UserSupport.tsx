import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Plus, ArrowLeft, AlertTriangle } from 'lucide-react';
import SupportTicketList from '../components/support/SupportTicketList';
import CreateSupportTicket from '../components/support/CreateSupportTicket';
import SupportTicketChat from '../components/support/SupportTicketChat';
import SupportFallback from '../components/support/SupportFallback';
import userSupportApi from '../services/userSupportApi';

type ViewMode = 'list' | 'create' | 'chat' | 'fallback';

const UserSupport: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('list');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [supportAvailable, setSupportAvailable] = useState<boolean | null>(null);
  const checkingAvailability = useRef(false);

  const checkSupportAvailability = async () => {
    // Prevent multiple simultaneous checks
    if (checkingAvailability.current) return;
    
    try {
      checkingAvailability.current = true;
      const isAvailable = await userSupportApi.checkAvailability();
      setSupportAvailable(isAvailable);
      
      // If support is not available, switch to fallback view
      if (!isAvailable && currentView === 'list') {
        setCurrentView('fallback');
      } else if (isAvailable && currentView === 'fallback') {
        setCurrentView('list');
      }
    } catch (error) {
      console.error('Error checking support availability:', error);
      setSupportAvailable(false);
      if (currentView === 'list') {
        setCurrentView('fallback');
      }
    } finally {
      checkingAvailability.current = false;
    }
  };

  useEffect(() => {
    checkSupportAvailability();
  }, []);

  useEffect(() => {
    // When support availability changes, update the view accordingly
    if (supportAvailable === false && currentView === 'list') {
      setCurrentView('fallback');
    } else if (supportAvailable === true && currentView === 'fallback') {
      setCurrentView('list');
    }
  }, [supportAvailable, currentView]);

  const handleTicketSelect = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    setCurrentView('chat');
  };

  const handleCreateNew = () => {
    setCurrentView('create');
  };

  const handleTicketCreated = () => {
    setCurrentView('list');
    // Optionally refresh the ticket list here
  };

  const handleCancel = () => {
    setCurrentView('list');
    setSelectedTicketId(null);
  };

  const handleBackToMain = () => {
    setCurrentView('fallback');
    setSelectedTicketId(null);
  };

  const handleTryTicketSystem = () => {
    checkSupportAvailability();
  };

  const renderBreadcrumb = () => {
    // Don't show breadcrumb in fallback mode
    if (currentView === 'fallback') {
      return null;
    }
    
    return (
      <nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <button
              onClick={() => setCurrentView('list')}
              className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Support
            </button>
          </li>
          {currentView === 'create' && (
            <>
              <li>
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">Create Ticket</span>
                </div>
              </li>
            </>
          )}
          {currentView === 'chat' && selectedTicketId && (
            <>
              <li>
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                    Ticket #{selectedTicketId.slice(-8)}
                  </span>
                </div>
              </li>
            </>
          )}
        </ol>
      </nav>
    );
  };

  const renderContent = () => {
    switch (currentView) {
      case 'create':
        return (
          <CreateSupportTicket
            onTicketCreated={handleTicketCreated}
            onCancel={handleCancel}
          />
        );
      
      case 'chat':
        if (!selectedTicketId) {
          setCurrentView('list');
          return null;
        }
        return (
          <div className="h-[600px]">
            <SupportTicketChat
              ticketId={selectedTicketId}
              onBack={handleBackToMain}
            />
          </div>
        );
      
      case 'fallback':
        return (
          <SupportFallback
            onBackToMain={handleTryTicketSystem}
          />
        );
      
      case 'list':
      default:
        return (
          <SupportTicketList
            onTicketSelect={handleTicketSelect}
            onCreateNew={handleCreateNew}
          />
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Support Center</h1>
        <p className="mt-2 text-lg text-gray-600">
          Get help with your orders, account, and general questions
        </p>
      </div>

      {/* Breadcrumb */}
      {renderBreadcrumb()}

      {/* Quick Help Section - Only show on list view */}
      {currentView === 'list' && supportAvailable && (
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-4">
            Need Quick Help?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <h4 className="font-medium text-gray-900 mb-2">Order Issues</h4>
              <p className="text-sm text-gray-600 mb-3">
                Track orders, delivery problems, or payment issues
              </p>
              <button
                onClick={handleCreateNew}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Create ticket →
              </button>
            </div>
            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <h4 className="font-medium text-gray-900 mb-2">Account Help</h4>
              <p className="text-sm text-gray-600 mb-3">
                Login issues, profile updates, or security concerns
              </p>
              <button
                onClick={handleCreateNew}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Get help →
              </button>
            </div>
            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <h4 className="font-medium text-gray-900 mb-2">General Questions</h4>
              <p className="text-sm text-gray-600 mb-3">
                Product information, shipping, or return policies
              </p>
              <button
                onClick={handleCreateNew}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Ask question →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Support Stats - Only show on list view */}
      {currentView === 'list' && supportAvailable && (
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-2xl font-bold text-indigo-600">24/7</div>
            <div className="text-sm text-gray-600">Support Available</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-2xl font-bold text-green-600">&lt; 2 Hours</div>
            <div className="text-sm text-gray-600">Average Response Time</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">95%</div>
            <div className="text-sm text-gray-600">Customer Satisfaction</div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={currentView === 'fallback' ? '' : 'bg-white rounded-lg shadow'}>
        {renderContent()}
      </div>

      {/* Additional Help - Only show on list view */}
      {currentView === 'list' && supportAvailable && (
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Other Ways to Get Help
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div>📧 Email: support@jj-essential.com</div>
                <div>📞 Phone: +234-XXX-XXXX-XXX</div>
                <div>🕒 Hours: Monday - Friday, 9AM - 6PM WAT</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Self-Service</h4>
              <div className="space-y-2 text-sm">
                <a href="/help" className="text-blue-600 hover:text-blue-700 block">
                  📚 Help Center & FAQ
                </a>
                <a href="/track-order" className="text-blue-600 hover:text-blue-700 block">
                  📦 Track Your Order
                </a>
                <a href="/returns" className="text-blue-600 hover:text-blue-700 block">
                  🔄 Returns & Exchanges
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSupport;