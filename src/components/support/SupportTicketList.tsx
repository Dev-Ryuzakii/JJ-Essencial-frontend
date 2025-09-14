import React, { useState, useEffect } from 'react';
import { MessageCircle, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import userSupportApi, { type UserSupportTicket } from '../../services/userSupportApi';

interface SupportTicketListProps {
  onTicketSelect?: (ticketId: string) => void;
  onCreateNew?: () => void;
}

const SupportTicketList: React.FC<SupportTicketListProps> = ({ 
  onTicketSelect, 
  onCreateNew 
}) => {
  const [tickets, setTickets] = useState<UserSupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [supportUnavailable, setSupportUnavailable] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      setSupportUnavailable(false);
      
      // First check if support system is available
      const isAvailable = await userSupportApi.checkAvailability();
      if (!isAvailable) {
        setSupportUnavailable(true);
        setTickets([]);
        return;
      }
      
      const fetchedTickets = await userSupportApi.getMyTickets();
      setTickets(fetchedTickets);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tickets';
      
      // Check if it's a support system unavailable error
      if (errorMessage.includes('Support system is currently unavailable') || 
          errorMessage.includes('500')) {
        setSupportUnavailable(true);
        setTickets([]);
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'IN_PROGRESS':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'CLOSED':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <MessageCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'CLOSED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (supportUnavailable) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-6">
        <div className="flex">
          <AlertCircle className="h-6 w-6 text-yellow-400" />
          <div className="ml-3">
            <h3 className="text-lg font-medium text-yellow-800">Support System Temporarily Unavailable</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p className="mb-3">
                Our ticket support system is currently under development. In the meantime, you can contact us directly:
              </p>
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="font-medium">📧 Email:</span>
                  <a href="mailto:support@jj-essential.com" className="ml-2 text-yellow-800 underline hover:text-yellow-600">
                    support@jj-essential.com
                  </a>
                </div>
                <div className="flex items-center">
                  <span className="font-medium">📞 Phone:</span>
                  <span className="ml-2">+234-XXX-XXXX-XXX</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium">🕒 Hours:</span>
                  <span className="ml-2">Monday - Friday, 9AM - 6PM WAT</span>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={fetchTickets}
                className="text-sm font-medium text-yellow-800 hover:text-yellow-600 underline"
              >
                Check again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
            <div className="mt-3">
              <button
                onClick={fetchTickets}
                className="text-sm font-medium text-red-800 hover:text-red-600"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            My Support Tickets
          </h3>
          {onCreateNew && (
            <button
              onClick={onCreateNew}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              New Ticket
            </button>
          )}
        </div>
        
        {tickets.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No support tickets</h3>
            <p className="mt-1 text-sm text-gray-500">
              You haven't created any support tickets yet.
            </p>
            {onCreateNew && (
              <div className="mt-4">
                <button
                  onClick={onCreateNew}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Create your first ticket
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onTicketSelect?.(ticket.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(ticket.status)}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {ticket.subject}
                      </h4>
                      <p className="text-xs text-gray-500">
                        Ticket #{ticket.id.slice(-8)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${getStatusColor(ticket.status)}`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-4">
                    <span>{ticket._count.messages} messages</span>
                    <span>•</span>
                    <span>Created {formatDate(ticket.createdAt)}</span>
                  </div>
                  {ticket.assignedTo && (
                    <span className="text-xs text-gray-500">
                      Assigned to support
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportTicketList;