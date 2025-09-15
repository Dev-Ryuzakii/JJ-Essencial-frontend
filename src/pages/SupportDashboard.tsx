import React, { useState, useEffect } from 'react';
import { MessageCircle, Clock, CheckCircle, AlertCircle, Plus, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import userSupportApi, { type UserSupportTicket } from '../services/userSupportApi';

const SupportDashboard: React.FC = () => {
  const [tickets, setTickets] = useState<UserSupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    if (shouldRedirect) {
      window.location.href = '/support';
    }
  }, [shouldRedirect]);

  const fetchTickets = async () => {
    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (loading) {
        setLoadingTimeout(true);
        setError('Request timeout. Please try again.');
      }
    }, 15000); // 15 second timeout
    
    try {
      setLoading(true);
      setLoadingTimeout(false);
      setError(null);
      const fetchedTickets = await userSupportApi.getMyTickets();
      setTickets(fetchedTickets);
      clearTimeout(timeoutId);
    } catch (err) {
      clearTimeout(timeoutId);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tickets';
      
      // Check if it's a support system unavailable error
      if (errorMessage.includes('Support system is currently unavailable') || 
          errorMessage.includes('500') || errorMessage.includes('400') || errorMessage.includes('429')) {
        // Set redirect flag instead of redirecting immediately
        setShouldRedirect(true);
      } else {
        setError(errorMessage);
      }
    } finally {
      // Always set loading to false unless we're redirecting
      if (!shouldRedirect) {
        setLoading(false);
      }
    }
  };

  const getTicketStats = () => {
    const total = tickets.length;
    const open = tickets.filter(t => t.status === 'OPEN').length;
    const inProgress = tickets.filter(t => t.status === 'IN_PROGRESS').length;
    const closed = tickets.filter(t => t.status === 'CLOSED').length;

    return { total, open, inProgress, closed };
  };

  const getRecentTickets = () => {
    return tickets
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 3);
  };

  const getLastMessage = (ticket: UserSupportTicket) => {
    if (!ticket.messages || ticket.messages.length === 0) return null;
    
    // Get the most recent message
    const sortedMessages = [...ticket.messages].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return sortedMessages[0];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'IN_PROGRESS':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'CLOSED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <MessageCircle className="h-4 w-4 text-gray-500" />;
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const stats = getTicketStats();
  const recentTickets = getRecentTickets();

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Loading your support tickets...</p>
          {loadingTimeout && (
            <p className="text-gray-500 text-sm mt-2">This is taking longer than expected</p>
          )}
          <button
            onClick={fetchTickets}
            className="mt-4 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Support Dashboard</h1>
          <p className="mt-2 text-lg text-gray-600">
            Manage your support tickets and get help
          </p>
        </div>
        <Link
          to="/support"
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Ticket
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-8 bg-red-50 border border-red-200 rounded-md p-4">
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
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <MessageCircle className="h-8 w-8 text-gray-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Tickets</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.total}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertCircle className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Open</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.open}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">In Progress</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.inProgress}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Resolved</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.closed}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Tickets */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Recent Tickets
              </h3>
              <Link
                to="/support"
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                View all
              </Link>
            </div>

            {recentTickets.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No tickets yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Create your first support ticket to get help.
                </p>
                <div className="mt-4">
                  <Link
                    to="/support"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Ticket
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {recentTickets.map((ticket) => {
                  const lastMessage = getLastMessage(ticket);
                  return (
                    <div
                      key={ticket.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(ticket.status)}
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">
                              {ticket.subject}
                            </h4>
                            <p className="text-xs text-gray-500">
                              #{ticket.id.slice(-8)} • {ticket._count.messages} messages
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${getStatusColor(ticket.status)}`}>
                            {ticket.status.replace('_', ' ')}
                          </span>
                          <Link
                            to={`/support/ticket/${ticket.id}`}
                            className="text-indigo-600 hover:text-indigo-700"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                      {ticket.messages && ticket.messages.length > 0 && (
                        <div className="mt-3 space-y-2 max-h-32 overflow-y-auto bg-gray-50 p-3 rounded">
                          {ticket.messages.slice(-2).map((message) => (
                            <div key={message.id} className="flex items-start">
                              <div className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center mr-2 mt-0.5 ${
                                message.isAdmin ? 'bg-gray-200' : 'bg-indigo-200'
                              }`}>
                                {message.isAdmin ? (
                                  <span className="text-xs text-gray-700">S</span>
                                ) : (
                                  <span className="text-xs text-indigo-700">Y</span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between">
                                  <span className={`text-xs font-medium ${
                                    message.isAdmin ? 'text-gray-700' : 'text-indigo-700'
                                  }`}>
                                    {message.isAdmin ? 'Support' : 'You'}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {formatDate(message.createdAt)}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-600 mt-1 truncate">
                                  {message.message}
                                </p>
                              </div>
                            </div>
                          ))}
                          {ticket.messages.length > 2 && (
                            <div className="text-xs text-gray-500 text-center pt-1 border-t border-gray-200">
                              {ticket.messages.length - 2} earlier messages
                            </div>
                          )}
                        </div>
                      )}
                      <div className="mt-2 text-xs text-gray-500">
                        Updated {formatDate(ticket.updatedAt)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-4">
              <Link
                to="/support"
                className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <Plus className="h-6 w-6 text-indigo-600 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Create New Ticket</h4>
                    <p className="text-xs text-gray-500">Get help with any issue</p>
                  </div>
                </div>
              </Link>

              <a
                href="/help"
                className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <MessageCircle className="h-6 w-6 text-blue-600 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Help Center</h4>
                    <p className="text-xs text-gray-500">Browse FAQs and guides</p>
                  </div>
                </div>
              </a>

              <a
                href="/track-order"
                className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <Clock className="h-6 w-6 text-green-600 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Track Order</h4>
                    <p className="text-xs text-gray-500">Check your order status</p>
                  </div>
                </div>
              </a>

              <a
                href="/returns"
                className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-purple-600 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Returns & Exchanges</h4>
                    <p className="text-xs text-gray-500">Return or exchange items</p>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-4">
          Need Immediate Help?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-blue-900 mb-2">Contact Support</h4>
            <div className="space-y-1 text-sm text-blue-700">
              <div>📧 jandjessentials04@gmail.com</div>
              <div>📞 +234-905-0579-9928</div>
              <div>🕒 Mon-Sat, 9AM-6PM WAT</div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-blue-900 mb-2">Response Times</h4>
            <div className="space-y-1 text-sm text-blue-700">
              <div>🔴 High Priority: &lt; 1 hour</div>
              <div>🟡 Medium Priority: &lt; 4 hours</div>
              <div>🟢 Low Priority: &lt; 24 hours</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportDashboard;