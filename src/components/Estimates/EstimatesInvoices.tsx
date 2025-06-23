import React, { useState } from 'react';
import { Plus, Search, DollarSign, Clock, CheckCircle, XCircle, Send } from 'lucide-react';
import { mockEstimates, mockJobs, mockCustomers, mockBusiness } from '../../data/mockData';
import { tradeConfigs } from '../../data/tradeConfigs';

interface EstimatesInvoicesProps {
  onNewEstimate?: () => void;
}

const EstimatesInvoices: React.FC<EstimatesInvoicesProps> = ({ onNewEstimate }) => {
  const [activeTab, setActiveTab] = useState<'estimates' | 'invoices'>('estimates');
  const tradeConfig = tradeConfigs[mockBusiness.primaryTrade];

  const getJobInfo = (jobId: string) => {
    const job = mockJobs.find(j => j.id === jobId);
    if (!job) return null;
    const customer = mockCustomers.find(c => c.id === job.customerId);
    return { job, customer };
  };

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
          <button 
            onClick={onNewEstimate}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            <Plus size={16} />
            <span>New {tradeConfig.name} Estimate</span>
          </button>
          <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            <Plus size={16} />
            <span>New Invoice</span>
          </button>
        </div>
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
          {tradeConfig.name} Estimates
        </button>
        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-6 py-3 font-medium text-sm border-b-2 ${
            activeTab === 'invoices'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Invoices
        </button>
      </div>

      {activeTab === 'estimates' && (
        <div className="space-y-4">
          {mockEstimates.map((estimate) => {
            const info = getJobInfo(estimate.jobId);
            if (!info) return null;
            
            return (
              <div key={estimate.id} className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-lg">{tradeConfig.icon}</span>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {tradeConfig.name} Estimate #{estimate.id.slice(-6)}
                      </h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        estimate.approved 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {estimate.approved ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-slate-600 mb-2">{info.job.jobType} - {info.customer?.name}</p>
                    <p className="text-sm text-slate-500">{info.job.location}</p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-900">${estimate.total.toLocaleString()}</p>
                    <p className="text-sm text-slate-500">
                      Expires {estimate.expiresAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Line Items with Categories */}
                <div className="mb-4">
                  <h4 className="font-medium text-slate-900 mb-2">Items</h4>
                  <div className="space-y-2">
                    {estimate.lineItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-b-0">
                        <div>
                          <p className="font-medium text-slate-900">{item.description}</p>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm text-slate-600">Qty: {item.quantity} × ${item.unitPrice}</p>
                            {item.category && (
                              <span className="inline-flex px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded">
                                {item.category}
                              </span>
                            )}
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
                    <span className="text-slate-900">${estimate.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Tax (Memphis 9.25%)</span>
                    <span className="text-slate-900">${estimate.tax.toLocaleString()}</span>
                  </div>
                  {estimate.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Discount</span>
                      <span className="text-green-600">-${estimate.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold pt-1 border-t border-slate-200">
                    <span>Total</span>
                    <span>${estimate.total.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-slate-600">
                    {estimate.sentAt && (
                      <div className="flex items-center space-x-1">
                        <Send size={14} />
                        <span>Sent {estimate.sentAt.toLocaleDateString()}</span>
                      </div>
                    )}
                    {estimate.approvedAt && (
                      <div className="flex items-center space-x-1">
                        <CheckCircle size={14} className="text-green-500" />
                        <span>Approved {estimate.approvedAt.toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      View
                    </button>
                    <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                      Convert to Invoice
                    </button>
                    <button className="text-slate-600 hover:text-slate-800 text-sm font-medium">
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'invoices' && (
        <div className="text-center py-12">
          <DollarSign className="mx-auto text-slate-400 mb-4" size={48} />
          <p className="text-slate-500 text-lg mb-4">No invoices yet</p>
          <p className="text-slate-400">Invoices will appear here once you convert estimates or create them directly</p>
        </div>
      )}
    </div>
  );
};

export default EstimatesInvoices;