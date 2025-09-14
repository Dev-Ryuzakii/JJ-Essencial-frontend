import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Headphones, ArrowLeft, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import userSupportApi, { type SupportTicketDetail, type SendMessageDto } from '../../services/userSupportApi';

interface SupportTicketChatProps {
  ticketId: string;
  onBack?: () => void;
}

const SupportTicketChat: React.FC<SupportTicketChatProps> = ({ ticketId, onBack }) => {
  const [ticket, setTicket] = useState<SupportTicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [supportUnavailable, setSupportUnavailable] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTicketDetails();
  }, [ticketId]);

  useEffect(() => {
    scrollToBottom();
  }, [ticket?.messages]);

  const fetchTicketDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      setSupportUnavailable(false);
      const ticketDetails = await userSupportApi.getTicketDetails(ticketId);
      setTicket(ticketDetails);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch ticket details';
      
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    try {
      setSendingMessage(true);
      const messageData: SendMessageDto = { message: newMessage };
      
      await userSupportApi.sendMessage(ticketId, messageData);
      setNewMessage('');
      
      // Refresh ticket details to show new message
      await fetchTicketDetails();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      
      // Check if it's a support system unavailable error
      if (errorMessage.includes('Support system is currently unavailable') || 
          errorMessage.includes('500') || errorMessage.includes('400') || errorMessage.includes('429')) {
        setSupportUnavailable(true);
      } else {
        setError(errorMessage);
      }
    } finally {
      setSendingMessage(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      'OPEN': {
        className: 'bg-yellow-100 text-yellow-800',
        icon: <AlertCircle className="h-3 w-3" />
      },
      'IN_PROGRESS': {
        className: 'bg-blue-100 text-blue-800',
        icon: <Clock className="h-3 w-3" />
      },
      'CLOSED': {
        className: 'bg-green-100 text-green-800',
        icon: <CheckCircle className="h-3 w-3" />
      }
    };
    
    const config = statusStyles[status as keyof typeof statusStyles] || statusStyles['OPEN'];
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${config.className}`}>
        {config.icon}
        <span className="ml-1">{status.replace('_', ' ')}</span>
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityStyles = {
      'LOW': 'bg-green-100 text-green-800',
      'MEDIUM': 'bg-yellow-100 text-yellow-800',
      'HIGH': 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${priorityStyles[priority as keyof typeof priorityStyles] || priorityStyles['MEDIUM']}`}>
        {priority}
      </span>
    );
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
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
                Our ticket support system is currently under development. Please contact us directly:
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
              <p className="mt-3 text-xs text-yellow-600">
                Reference Ticket ID: {ticketId.slice(-8)}
              </p>
            </div>
            <div className="mt-4 flex space-x-3">
              <button
                onClick={fetchTicketDetails}
                className="text-sm font-medium text-yellow-800 hover:text-yellow-600 underline"
              >
                Try again
              </button>
              {onBack && (
                <button
                  onClick={onBack}
                  className="text-sm font-medium text-gray-600 hover:text-gray-500"
                >
                  Back to support
                </button>
              )}
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
                onClick={fetchTicketDetails}
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

  if (!ticket) {
    return (
      <div className="text-center py-8">
        <div className="text-sm text-gray-500">Ticket not found</div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {onBack && (
              <button
                onClick={onBack}
                className="p-1 hover:bg-gray-200 rounded-md"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
            )}
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {ticket.subject}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Ticket #{ticket.id.slice(-8)} • Created {new Date(ticket.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {getStatusBadge(ticket.status)}
            {getPriorityBadge(ticket.priority)}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 px-4 py-5 sm:p-6 overflow-y-auto min-h-0" style={{ maxHeight: '400px' }}>
        <div className="space-y-4">
          {ticket.messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isAdmin ? 'justify-start' : 'justify-end'}`}
            >
              <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                message.isAdmin 
                  ? 'bg-gray-100 text-gray-900' 
                  : 'bg-indigo-600 text-white'
              }`}>
                <div className="flex items-center space-x-2 mb-2">
                  {message.isAdmin ? (
                    <Headphones className="h-4 w-4" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                  <span className="text-xs font-medium">
                    {message.isAdmin ? 'Support Team' : 'You'}
                  </span>
                  <span className={`text-xs ${message.isAdmin ? 'text-gray-500' : 'text-indigo-200'}`}>
                    {formatMessageTime(message.createdAt)}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{message.message}</p>
              </div>
            </div>
          ))}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      {ticket.status !== 'CLOSED' ? (
        <div className="px-4 py-4 border-t border-gray-200 bg-gray-50">
          <form onSubmit={handleSendMessage} className="flex space-x-3">
            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm resize-none"
                placeholder="Type your message..."
                rows={2}
                disabled={sendingMessage}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
              <p className="mt-1 text-xs text-gray-500">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
            <button
              type="submit"
              disabled={sendingMessage || !newMessage.trim()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sendingMessage ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </form>
        </div>
      ) : (
        <div className="px-4 py-4 border-t border-gray-200 bg-gray-50">
          <div className="text-center">
            <CheckCircle className="mx-auto h-8 w-8 text-green-500 mb-2" />
            <p className="text-sm text-gray-600">
              This ticket has been closed. If you need further assistance, please create a new ticket.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportTicketChat;