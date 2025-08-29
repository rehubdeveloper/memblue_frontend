import React, { useState, useEffect } from 'react';
import { Plus, Search, DollarSign, Clock, CheckCircle, XCircle, Send, Eye, Edit, Trash2, FileText, X, ChevronDown, MessageSquare, Settings } from 'lucide-react';
import { useAuth } from '../../context/AppContext';
import { tradeConfigs } from '../../data/tradeConfigs';
import { format } from 'date-fns';
import TradeSpecificEstimate from './TradeSpecificEstimate';
import TradeSpecificInvoice from './TradeSpecificInvoice';
import InvoiceView from './InvoiceView';
import InterviewEstimateForm from './InterviewEstimateForm';
import InterviewInvoiceForm from './InterviewInvoiceForm';

interface EstimatesInvoicesProps {
  onNewEstimate?: () => void;
}

const EstimatesInvoices: React.FC<EstimatesInvoicesProps> = ({ onNewEstimate }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { 
    user, 
    estimates, 
    invoices, 
    getEstimates, 
    getInvoices, 
    deleteEstimate, 
    deleteInvoice, 
    convertEstimateToInvoice,
    markInvoiceAsPaid,
    notifyInvoicePaid
  } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'estimates' | 'invoices'>('estimates');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateInvoiceForm, setShowCreateInvoiceForm] = useState(false);
  const [selectedEstimate, setSelectedEstimate] = useState<any>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [showInvoiceView, setShowInvoiceView] = useState(false);
  const [showEditInvoiceModal, setShowEditInvoiceModal] = useState(false);
  const [showInvoiceOptions, setShowInvoiceOptions] = useState(false);
  const [showConvertFromEstimateModal, setShowConvertFromEstimateModal] = useState(false);
  const [showEstimateFormOptions, setShowEstimateFormOptions] = useState(false);
  const [showInvoiceFormOptions, setShowInvoiceFormOptions] = useState(false);
  const [interviewEstimateFormOpen, setInterviewEstimateFormOpen] = useState(false);
  const [interviewInvoiceFormOpen, setInterviewInvoiceFormOpen] = useState(false);
  
  // Map user's primary_trade to trade config keys
  const getTradeConfigKey = (primaryTrade: string) => {
    const mapping: Record<string, string> = {
      'hvac_pro': 'hvac',
      'electrician_pro': 'electrical',
      'plumber_pro': 'plumbing',
      'locksmith_pro': 'locksmith',
      'gc_pro': 'general-contractor'
    };
    return mapping[primaryTrade] || 'hvac';
  };

  const tradeConfig = tradeConfigs[getTradeConfigKey(user?.primary_trade || 'hvac_pro')];

  // Debug logging (only log once)
  useEffect(() => {
    console.log('EstimatesInvoices Debug:', {
      user: user ? 'User exists' : 'No user',
      estimates: estimates ? `${estimates.length} estimates` : 'No estimates',
      invoices: invoices ? `${invoices.length} invoices` : 'No invoices',
      loading,
      tradeConfig: tradeConfig?.name || 'No trade config',
      showCreateInvoiceForm
    });
  }, [user, estimates, invoices, loading, tradeConfig, showCreateInvoiceForm]);

  // Data is now loaded once in the context, no need to fetch here
  // useEffect(() => {
  //   const fetchData = async () => {
  //     setLoading(true);
  //     try {
  //       await getEstimates();
  //       await getInvoices();
  //     } catch (error) {
  //       console.error('Error fetching estimates/invoices:', error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   if (user) {
  //     fetchData();
  //   }
  // }, [user]); // Remove getEstimates and getInvoices from dependencies to prevent infinite loop

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.form-options-dropdown')) {
        setShowEstimateFormOptions(false);
        setShowInvoiceFormOptions(false);
      }
    };

    if (showEstimateFormOptions || showInvoiceFormOptions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEstimateFormOptions, showInvoiceFormOptions]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'rejected':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'overdue':
        return 'bg-orange-100 text-orange-800';
      case 'expired':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const filteredEstimates = estimates?.filter(estimate => {
    const matchesSearch = estimate.estimate_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         estimate.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || estimate.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const filteredInvoices = invoices?.filter(invoice => {
    const matchesSearch = invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const handleConvertToInvoice = async (estimateId: number) => {
    try {
      await convertEstimateToInvoice(estimateId);
      // Refresh both estimates and invoices lists
      await getEstimates(true);
      await getInvoices(true);
      // Show success message (you can add a toast notification here)
      alert('Estimate successfully converted to invoice!');
    } catch (error) {
      console.error('Error converting estimate to invoice:', error);
      alert('Error converting estimate to invoice. Please try again.');
    }
  };

  const handleDeleteEstimate = async (estimateId: number) => {
    if (window.confirm('Are you sure you want to delete this estimate?')) {
      try {
        await deleteEstimate(estimateId);
      } catch (error) {
        console.error('Error deleting estimate:', error);
      }
    }
  };

  const handleDeleteInvoice = async (invoiceId: number) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await deleteInvoice(invoiceId);
      } catch (error) {
        console.error('Error deleting invoice:', error);
      }
    }
  };

  const handleMarkAsPaid = async (invoiceId: number, total: number) => {
    try {
      const invoice = invoices?.find(inv => inv.id === invoiceId);
      const result = await markInvoiceAsPaid(invoiceId, total);
      
      // Add notification for invoice payment
      if (invoice) {
        notifyInvoicePaid(
          invoice.invoice_number || `INV-${invoice.id}`,
          total
        );
      }
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
    }
  };

  const handleViewEstimate = (estimate: any) => {
    setSelectedEstimate(estimate);
    setShowViewModal(true);
  };

  const handleEditEstimate = (estimate: any) => {
    setSelectedEstimate(estimate);
    setShowEditModal(true);
  };

  const handleCreateInvoice = () => {
    console.log('New Invoice button clicked - showing invoice options');
    setShowInvoiceOptions(true);
  };

  const handleCreateNewInvoice = () => {
    setShowInvoiceOptions(false);
    setShowCreateInvoiceForm(true);
  };

  const handleConvertFromEstimate = () => {
    setShowInvoiceOptions(false);
    setShowConvertFromEstimateModal(true);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.invoice-options-dropdown')) {
        setShowInvoiceOptions(false);
      }
    };

    if (showInvoiceOptions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showInvoiceOptions]);

  const handleViewInvoice = (invoice: any) => {
    setSelectedInvoice(invoice);
    setShowInvoiceView(true);
  };

  const handleEditInvoice = (invoice: any) => {
    setSelectedInvoice(invoice);
    setShowEditInvoiceModal(true);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Show error state if no user
  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-slate-500 text-lg mb-4">Please log in to view estimates</p>
        </div>
      </div>
    );
  }

  // Show error state if no trade config
  if (!tradeConfig) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-slate-500 text-lg mb-4">Trade configuration not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{tradeConfig.icon}</span>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{tradeConfig.name} Estimates & Invoices</h1>
            <p className="text-slate-600">Manage quotes, estimates, and billing for {tradeConfig.name.toLowerCase()} services</p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <div className="relative">
            <button 
              onClick={() => setShowEstimateFormOptions(!showEstimateFormOptions)}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              <Plus size={16} />
              <span>New {tradeConfig.name} Estimate</span>
            </button>
            
            {/* Estimate Form Options Dropdown */}
            {showEstimateFormOptions && (
              <div className="form-options-dropdown absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="p-2">
                  <button
                    onClick={() => {
                      setInterviewEstimateFormOpen(true);
                      setShowEstimateFormOptions(false);
                    }}
                    className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <MessageSquare size={16} className="text-blue-600" />
                    <div>
                      <div className="font-medium text-gray-900">Simple Form</div>
                      <div className="text-sm text-gray-600">Step-by-step guided creation</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowCreateForm(true);
                      setShowEstimateFormOptions(false);
                    }}
                    className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Settings size={16} className="text-gray-600" />
                    <div>
                      <div className="font-medium text-gray-900">Advanced Form</div>
                      <div className="text-sm text-gray-600">All fields at once</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="relative invoice-options-dropdown">
            <button 
              onClick={handleCreateInvoice}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
            <Plus size={16} />
            <span>New Invoice</span>
              <ChevronDown size={14} />
            </button>
            
            {showInvoiceOptions && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 z-50">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowInvoiceFormOptions(!showInvoiceFormOptions);
                      setShowInvoiceOptions(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center space-x-2"
                  >
                    <Plus size={14} />
                    <span>Create New Invoice</span>
                  </button>
                  <button
                    onClick={handleConvertFromEstimate}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center space-x-2"
                  >
                    <FileText size={14} />
                    <span>Convert from Estimate</span>
                  </button>
                </div>
              </div>
            )}
            
            {/* Invoice Form Options Dropdown */}
            {showInvoiceFormOptions && (
              <div className="form-options-dropdown absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="p-2">
                  <button
                    onClick={() => {
                      setInterviewInvoiceFormOpen(true);
                      setShowInvoiceFormOptions(false);
                    }}
                    className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <MessageSquare size={16} className="text-blue-600" />
                    <div>
                      <div className="font-medium text-gray-900">Simple Form</div>
                      <div className="text-sm text-gray-600">Step-by-step guided creation</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => {
                      handleCreateNewInvoice();
                      setShowInvoiceFormOptions(false);
                    }}
                    className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Settings size={16} className="text-gray-600" />
                    <div>
                      <div className="font-medium text-gray-900">Advanced Form</div>
                      <div className="text-sm text-gray-600">All fields at once</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search by number or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="expired">Expired</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Tabs */}
      <div className="flex mb-6">
        <button
          onClick={() => setActiveTab('estimates')}
          className={`px-6 py-3 font-medium text-sm border-b-2 ${
            activeTab === 'estimates'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          {tradeConfig.name} Estimates ({filteredEstimates.length})
        </button>
        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-6 py-3 font-medium text-sm border-b-2 ${
            activeTab === 'invoices'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Invoices ({filteredInvoices.length})
        </button>
      </div>

      {activeTab === 'estimates' && (
        <div className="space-y-4">
          {filteredEstimates.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto text-slate-400 mb-4" size={48} />
              <p className="text-slate-500 text-lg mb-4">No estimates found</p>
              <p className="text-slate-400">Create your first estimate to get started</p>
            </div>
          ) : (
            filteredEstimates.map((estimate) => (
              <div key={estimate.id} className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-lg">{tradeConfig.icon}</span>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {tradeConfig.name} Estimate #{estimate.estimate_number}
                      </h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(estimate.status)}`}>
                        {getStatusText(estimate.status)}
                      </span>
                    </div>
                    <p className="text-slate-600 mb-2">{estimate.customer_name}</p>
                    {estimate.notes && <p className="text-sm text-slate-500">{estimate.notes}</p>}
                  </div>
                  
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-900">${Number(estimate.total).toLocaleString()}</p>
                    <p className="text-sm text-slate-500">
                      Expires {format(new Date(estimate.expires_at), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>

                {/* Line Items */}
                <div className="mb-4">
                  <h4 className="font-medium text-slate-900 mb-2">Items</h4>
                  <div className="space-y-2">
                    {estimate.line_items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-b-0">
                        <div>
                          <p className="font-medium text-slate-900">{item.description}</p>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm text-slate-600">Qty: {item.quantity} × ${item.unit_price}</p>
                              <span className="inline-flex px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded">
                                {item.category}
                              </span>
                          </div>
                        </div>
                        <p className="font-medium text-slate-900">${item.total.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="space-y-1 mb-4 pt-2 border-t border-slate-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="text-slate-900">${Number(estimate.subtotal).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Tax ({estimate.tax_rate}%)</span>
                    <span className="text-slate-900">${Number(estimate.tax_amount).toLocaleString()}</span>
                  </div>
                  {Number(estimate.discount) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Discount</span>
                      <span className="text-green-600">-${Number(estimate.discount).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold pt-1 border-t border-slate-200">
                    <span>Total</span>
                    <span>${Number(estimate.total).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-slate-600">
                    {estimate.sent_at && (
                      <div className="flex items-center space-x-1">
                        <Send size={14} />
                        <span>Sent {format(new Date(estimate.sent_at), 'MMM dd, yyyy')}</span>
                      </div>
                    )}
                    {estimate.approved_at && (
                      <div className="flex items-center space-x-1">
                        <CheckCircle size={14} className="text-green-500" />
                        <span>Approved {format(new Date(estimate.approved_at), 'MMM dd, yyyy')}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleViewEstimate(estimate)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
                    >
                      <Eye size={14} />
                      <span>View</span>
                    </button>
                    {estimate.status === 'approved' && (
                      <button 
                        onClick={() => handleConvertToInvoice(estimate.id)}
                        className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center space-x-1"
                      >
                        <FileText size={14} />
                        <span>Convert to Invoice</span>
                      </button>
                    )}
                    <button 
                      onClick={() => handleEditEstimate(estimate)}
                      className="text-slate-600 hover:text-slate-800 text-sm font-medium flex items-center space-x-1"
                    >
                      <Edit size={14} />
                      <span>Edit</span>
                    </button>
                    <button 
                      onClick={() => handleDeleteEstimate(estimate.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center space-x-1"
                    >
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'invoices' && (
        <div className="space-y-4">
          {filteredInvoices.length === 0 ? (
        <div className="text-center py-12">
          <DollarSign className="mx-auto text-slate-400 mb-4" size={48} />
          <p className="text-slate-500 text-lg mb-4">No invoices yet</p>
          <p className="text-slate-400">Invoices will appear here once you convert estimates or create them directly</p>
        </div>
          ) : (
            filteredInvoices.map((invoice) => (
              <div key={invoice.id} className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-lg">💰</span>
                      <h3 className="text-lg font-semibold text-slate-900">
                        Invoice #{invoice.invoice_number}
                      </h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                        {getStatusText(invoice.status)}
                      </span>
                    </div>
                    <p className="text-slate-600 mb-2">{invoice.customer_name}</p>
                    {invoice.customer_address && (
                      <p className="text-sm text-slate-500">{invoice.customer_address}</p>
                    )}
                    {invoice.job_number && (
                      <p className="text-sm text-slate-500">Job: {invoice.job_number}</p>
                    )}
                    {invoice.notes && <p className="text-sm text-slate-500">{invoice.notes}</p>}
                  </div>
                  
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-900">${Number(invoice.total).toLocaleString()}</p>
                    <p className="text-sm text-slate-500">
                      Due {format(new Date(invoice.due_date), 'MMM dd, yyyy')}
                    </p>
                    <p className="text-sm text-slate-500">
                      {invoice.payment_terms || 'Net 30'}
                    </p>
                    {invoice.paid_amount > 0 && (
                      <p className="text-sm text-green-600">
                        Paid: ${Number(invoice.paid_amount).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Line Items */}
                <div className="mb-4">
                  <h4 className="font-medium text-slate-900 mb-2">Items</h4>
                  <div className="space-y-2">
                    {invoice.line_items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-b-0">
                        <div>
                          <p className="font-medium text-slate-900">{item.description}</p>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm text-slate-600">Qty: {item.quantity} × ${item.unit_price}</p>
                            <span className="inline-flex px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded">
                              {item.category}
                            </span>
                          </div>
                        </div>
                        <p className="font-medium text-slate-900">${Number(item.total).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="space-y-1 mb-4 pt-2 border-t border-slate-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="text-slate-900">${Number(invoice.subtotal).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Tax ({invoice.tax_rate}%)</span>
                    <span className="text-slate-900">${Number(invoice.tax_amount).toLocaleString()}</span>
                  </div>
                  {Number(invoice.discount) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Discount</span>
                      <span className="text-green-600">-${Number(invoice.discount).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold pt-1 border-t border-slate-200">
                    <span>Total</span>
                    <span>${Number(invoice.total).toLocaleString()}</span>
                  </div>
                  {Number(invoice.paid_amount) > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Balance Due</span>
                      <span>${Number(invoice.balance_due).toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-slate-600">
                    {invoice.sent_at && (
                      <div className="flex items-center space-x-1">
                        <Send size={14} />
                        <span>Sent {format(new Date(invoice.sent_at), 'MMM dd, yyyy')}</span>
                      </div>
                    )}
                    {invoice.paid_at && (
                      <div className="flex items-center space-x-1">
                        <CheckCircle size={14} className="text-green-500" />
                        <span>Paid {format(new Date(invoice.paid_at), 'MMM dd, yyyy')}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleViewInvoice(invoice)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
                    >
                      <Eye size={14} />
                      <span>View</span>
                    </button>
                    {invoice.status !== 'paid' && Number(invoice.balance_due) > 0 && (
                      <button 
                        onClick={() => handleMarkAsPaid(invoice.id, invoice.balance_due)}
                        className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center space-x-1"
                      >
                        <CheckCircle size={14} />
                        <span>Mark as Paid</span>
                      </button>
                    )}
                    <button 
                      onClick={() => handleEditInvoice(invoice)}
                      className="text-slate-600 hover:text-slate-800 text-sm font-medium flex items-center space-x-1"
                    >
                      <Edit size={14} />
                      <span>Edit</span>
                    </button>
                    <button 
                      onClick={() => handleDeleteInvoice(invoice.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center space-x-1"
                    >
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create Estimate Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <TradeSpecificEstimate
              onSave={(estimate) => {
                console.log('Estimate created:', estimate);
                setShowCreateForm(false);
              }}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        </div>
      )}

      {/* View Estimate Modal */}
      {showViewModal && selectedEstimate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900">
                {tradeConfig.name} Estimate #{selectedEstimate.estimate_number}
              </h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Customer</label>
                  <p className="text-slate-900">{selectedEstimate.customer_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedEstimate.status)}`}>
                    {getStatusText(selectedEstimate.status)}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Created</label>
                  <p className="text-slate-900">{format(new Date(selectedEstimate.created_at), 'MMM dd, yyyy')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Expires</label>
                  <p className="text-slate-900">{format(new Date(selectedEstimate.expires_at), 'MMM dd, yyyy')}</p>
                </div>
              </div>
              
              {selectedEstimate.notes && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                  <p className="text-slate-900">{selectedEstimate.notes}</p>
                </div>
              )}

              <div>
                <h3 className="font-medium text-slate-900 mb-2">Line Items</h3>
                <div className="space-y-2">
                  {selectedEstimate.line_items.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-b-0">
                      <div>
                        <p className="font-medium text-slate-900">{item.description}</p>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm text-slate-600">Qty: {item.quantity} × ${item.unit_price}</p>
                          <span className="inline-flex px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded">
                            {item.category}
                          </span>
                        </div>
                      </div>
                      <p className="font-medium text-slate-900">${Number(item.total).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-200">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="text-slate-900">${Number(selectedEstimate.subtotal).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Tax ({selectedEstimate.tax_rate}%)</span>
                  <span className="text-slate-900">${Number(selectedEstimate.tax_amount).toLocaleString()}</span>
                </div>
                {Number(selectedEstimate.discount) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Discount</span>
                    <span className="text-green-600">-${Number(selectedEstimate.discount).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold pt-1 border-t border-slate-200">
                  <span>Total</span>
                  <span>${Number(selectedEstimate.total).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Estimate Modal */}
      {showEditModal && selectedEstimate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <TradeSpecificEstimate
              estimate={selectedEstimate}
              onSave={(estimate) => {
                console.log('Estimate updated:', estimate);
                setShowEditModal(false);
                setSelectedEstimate(null);
              }}
              onCancel={() => {
                setShowEditModal(false);
                setSelectedEstimate(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Create Invoice Modal */}
      {showCreateInvoiceForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {console.log('Rendering TradeSpecificInvoice modal')}
            <TradeSpecificInvoice
              estimate={selectedEstimate}
              onSave={(invoice) => {
                console.log('Invoice created:', invoice);
                setShowCreateInvoiceForm(false);
                setSelectedEstimate(null);
                // Refresh the invoices list
                getInvoices();
              }}
              onCancel={() => {
                setShowCreateInvoiceForm(false);
                setSelectedEstimate(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Edit Invoice Modal */}
      {showEditInvoiceModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <TradeSpecificInvoice
              invoice={selectedInvoice}
              onSave={(invoice) => {
                console.log('Invoice updated:', invoice);
                setShowEditInvoiceModal(false);
                setSelectedInvoice(null);
                // Refresh the invoices list
                getInvoices();
              }}
              onCancel={() => {
                setShowEditInvoiceModal(false);
                setSelectedInvoice(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Convert from Estimate Modal */}
      {showConvertFromEstimateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900">
                Convert Estimate to Invoice
              </h2>
              <button
                onClick={() => setShowConvertFromEstimateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-slate-600">
                Select an approved estimate to convert to an invoice. All estimate details including customer, job, line items, and pricing will be copied over.
              </p>
              
              <div className="space-y-4">
                {estimates?.filter(estimate => estimate.status === 'approved').length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="mx-auto text-slate-400 mb-4" size={48} />
                    <p className="text-slate-500 text-lg mb-2">No approved estimates found</p>
                    <p className="text-slate-400">Only estimates with "approved" status can be converted to invoices.</p>
                  </div>
                ) : (
                  estimates?.filter(estimate => estimate.status === 'approved').map((estimate) => (
                    <div key={estimate.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 cursor-pointer"
                         onClick={() => {
                           setSelectedEstimate(estimate);
                           setShowConvertFromEstimateModal(false);
                           setShowCreateInvoiceForm(true);
                         }}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-slate-900">
                            Estimate #{estimate.estimate_number}
                          </h3>
                          <p className="text-slate-600">{estimate.customer_name}</p>
                          <p className="text-sm text-slate-500">
                            Total: ${Number(estimate.total).toLocaleString()} | 
                            Created: {format(new Date(estimate.created_at), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            Approved
                          </span>
                          <div className="mt-2">
                            <FileText size={20} className="text-blue-600" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice View Modal */}
      {showInvoiceView && selectedInvoice && (
        <InvoiceView
          invoice={selectedInvoice}
          onClose={() => {
            setShowInvoiceView(false);
            setSelectedInvoice(null);
          }}
          onSend={() => {
            // TODO: Implement send functionality
            console.log('Send invoice:', selectedInvoice);
          }}
        />
      )}

      {/* Interview Form Components */}
      <InterviewEstimateForm 
        isOpen={interviewEstimateFormOpen} 
        onClose={() => setInterviewEstimateFormOpen(false)}
      />
      
      <InterviewInvoiceForm 
        isOpen={interviewInvoiceFormOpen} 
        onClose={() => setInterviewInvoiceFormOpen(false)}
      />
    </div>
  );
};

export default EstimatesInvoices;