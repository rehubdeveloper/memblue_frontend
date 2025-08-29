import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calculator, Save, X, Package } from 'lucide-react';
import { useAuth } from '../../context/AppContext';
import { tradeConfigs } from '../../data/tradeConfigs';
import { format, addDays } from 'date-fns';

interface TradeSpecificEstimateProps {
  estimate?: any; // Optional estimate for editing
  onSave: (estimate: any) => void;
  onCancel: () => void;
}

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
  category: 'Labor' | 'Materials' | 'Equipment' | 'Travel' | 'Other';
  isInventoryItem?: boolean;
  inventoryId?: number;
  inventoryName?: string;
  inventorySku?: string;
}

const TradeSpecificEstimate: React.FC<TradeSpecificEstimateProps> = ({ estimate, onSave, onCancel }) => {
  const { user, customers, workOrders, createEstimate, updateEstimate, notifyEstimateCreated, notifyEstimateStatusChanged, inventoryList } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<number | ''>('');
  const [selectedJob, setSelectedJob] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [expiresAt, setExpiresAt] = useState(format(addDays(new Date(), 30), 'yyyy-MM-dd'));
  const [status, setStatus] = useState<'draft' | 'sent' | 'approved' | 'rejected' | 'expired'>('draft');
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: '', quantity: 1, unit_price: 0, category: 'Labor' }
  ]);
  const [taxRate, setTaxRate] = useState(9.25); // Memphis tax rate
  const [discount, setDiscount] = useState(0);

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

  const config = tradeConfigs[getTradeConfigKey(user?.primary_trade || 'hvac_pro')];

  // Populate form when editing an existing estimate
  useEffect(() => {
    if (estimate) {
      setSelectedCustomer(estimate.customer);
      setSelectedJob(estimate.job || '');
      setNotes(estimate.notes || '');
      setExpiresAt(format(new Date(estimate.expires_at), 'yyyy-MM-dd'));
      setTaxRate(estimate.tax_rate);
      setDiscount(estimate.discount);
      setStatus(estimate.status || 'draft');
      setLineItems(estimate.line_items.map((item: any) => ({
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        category: item.category
      })));
    }
  }, [estimate]);

  const addLineItem = () => {
    setLineItems([...lineItems, { 
      description: '', 
      quantity: 1, 
      unit_price: 0, 
      category: 'Labor' 
    }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: any) => {
    setLineItems(lineItems.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const addQuickLineItem = (quickItem: any) => {
    setLineItems([...lineItems, {
      description: quickItem.description,
      quantity: 1,
      unit_price: quickItem.defaultPrice,
      category: quickItem.category
    }]);
  };

  const addInventoryItem = (inventoryItem: any, quantity: number = 1) => {
    setLineItems([...lineItems, {
      description: inventoryItem.name,
      quantity: quantity,
      unit_price: inventoryItem.cost_per_unit,
      category: 'Materials',
      isInventoryItem: true,
      inventoryId: inventoryItem.id,
      inventoryName: inventoryItem.name,
      inventorySku: inventoryItem.sku
    }]);
  };

  const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const taxAmount = (subtotal - discount) * (taxRate / 100);
  const total = subtotal - discount + taxAmount;

  const handleSave = async () => {
    if (!selectedCustomer) {
      alert('Please select a customer');
      return;
    }

    if (lineItems.some(item => !item.description || item.unit_price <= 0)) {
      alert('Please fill in all line items with valid descriptions and prices');
      return;
    }

    setLoading(true);
    try {
      const estimateData = {
        customer: selectedCustomer,
        job: selectedJob || null,
        line_items: lineItems.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          category: item.category
        })),
        tax_rate: taxRate,
        discount: discount,
        notes: notes,
        expires_at: expiresAt + 'T23:59:59Z',
        status: status,
        created_by: user?.id
      };

      let savedEstimate;
      if (estimate) {
        // Update existing estimate
        const oldStatus = estimate.status;
        savedEstimate = await updateEstimate(estimate.id, estimateData);
        
        // Check if status changed
        if (estimateData.status && estimateData.status !== oldStatus) {
          notifyEstimateStatusChanged(
            savedEstimate.estimate_number || `EST-${savedEstimate.id}`,
            estimateData.status
          );
        }
      } else {
        // Create new estimate
        savedEstimate = await createEstimate(estimateData);
        
        // Get customer name for notification
        const customer = customers?.find((c: any) => c.id === selectedCustomer);
        const customerName = customer ? customer.name : 'Unknown Customer';
        
        // Add notification for estimate creation
        notifyEstimateCreated(
          savedEstimate.estimate_number || `EST-${savedEstimate.id}`,
          customerName
        );
      }
      
      onSave(savedEstimate);
    } catch (error) {
      console.error('Error saving estimate:', error);
    } finally {
      setLoading(false);
    }
  };

  const customerJobs = workOrders?.filter(job => 
    selectedCustomer && job.customer === selectedCustomer
  ) || [];

  // Show error state if no config
  if (!config) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p className="text-slate-500 text-lg mb-4">Trade configuration not found</p>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{config.icon}</span>
          <h2 className="text-xl font-semibold text-slate-900">
            {estimate ? `Edit ${config.name} Estimate #${estimate.estimate_number}` : `New ${config.name} Estimate`}
          </h2>
        </div>
        <button
          onClick={onCancel}
          className="text-slate-400 hover:text-slate-600"
        >
          <X size={24} />
        </button>
      </div>

      {/* Customer and Job Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Customer *</label>
          <select
            value={selectedCustomer}
            onChange={(e) => {
              setSelectedCustomer(Number(e.target.value) || '');
              setSelectedJob(''); // Reset job selection when customer changes
            }}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select a customer</option>
            {customers?.map(customer => (
              <option key={customer.id} value={customer.id}>
                {customer.name} - {customer.customer_id}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Related Job (Optional)</label>
          <select
            value={selectedJob}
            onChange={(e) => setSelectedJob(Number(e.target.value) || '')}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a job</option>
            {customerJobs.map(job => (
              <option key={job.id} value={job.id}>
                {job.job_number} - {job.job_type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Notes, Expiry, and Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional notes for the estimate..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Expires On</label>
          <input
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Quick Add Items */}
      <div className="mb-6">
        <h3 className="font-medium text-slate-900 mb-3">Quick Add Common Items</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          {config.quickLineItems.map(item => (
            <button
              key={item.id}
              onClick={() => addQuickLineItem(item)}
              className="p-2 text-left border border-slate-200 rounded hover:bg-slate-50 text-sm"
            >
              <div className="font-medium">{item.description}</div>
              <div className="text-slate-600">${item.defaultPrice} / {item.unit}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Items */}
      {inventoryList && inventoryList.length > 0 && (
        <div className="mb-6">
          <h3 className="font-medium text-slate-900 mb-3 flex items-center">
            <Package size={20} className="mr-2" />
            Add Inventory Items
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {inventoryList.filter((item: any) => item.stock_level > 0).map((inventoryItem: any) => {
              const isAlreadyAdded = lineItems.some(lineItem => 
                lineItem.isInventoryItem && lineItem.inventoryId === inventoryItem.id
              );
              
              return (
                <div key={inventoryItem.id} className="border border-slate-200 rounded-lg p-3 hover:bg-slate-50">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900 text-sm">{inventoryItem.name}</h4>
                      <p className="text-slate-600 text-xs">SKU: {inventoryItem.sku}</p>
                      <p className="text-slate-600 text-xs">
                        Stock: {inventoryItem.stock_level} | Price: ${inventoryItem.cost_per_unit}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="1"
                      max={inventoryItem.stock_level}
                      defaultValue="1"
                      data-inventory-id={inventoryItem.id}
                      className="w-16 px-2 py-1 border border-slate-300 rounded text-xs"
                      placeholder="Qty"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const quantity = parseInt((e.target as HTMLInputElement).value) || 1;
                          if (quantity > 0 && quantity <= inventoryItem.stock_level) {
                            addInventoryItem(inventoryItem, quantity);
                            (e.target as HTMLInputElement).value = "1";
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const quantityInput = document.querySelector(`input[data-inventory-id="${inventoryItem.id}"]`) as HTMLInputElement;
                        const quantity = parseInt(quantityInput?.value) || 1;
                        if (quantity > 0 && quantity <= inventoryItem.stock_level) {
                          addInventoryItem(inventoryItem, quantity);
                          if (quantityInput) quantityInput.value = "1";
                        }
                      }}
                      disabled={isAlreadyAdded}
                      className={`px-3 py-1 text-xs rounded ${
                        isAlreadyAdded 
                          ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {isAlreadyAdded ? 'Added' : 'Add'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Line Items */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-slate-900">Line Items</h3>
          <button
            onClick={addLineItem}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
          >
            <Plus size={16} />
            <span>Add Item</span>
          </button>
        </div>

        <div className="space-y-3">
          {lineItems.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-3 items-center p-3 border border-slate-200 rounded-lg">
              <div className="col-span-4">
                <input
                  type="text"
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                  className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                  required
                />
              </div>
              <div className="col-span-2">
                <select
                  value={item.category}
                  onChange={(e) => updateLineItem(index, 'category', e.target.value)}
                  className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                >
                  <option value="Labor">Labor</option>
                  <option value="Materials">Materials</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Travel">Travel</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  placeholder="Unit Price"
                  value={item.unit_price}
                  onChange={(e) => updateLineItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="col-span-1 text-right font-medium">
                ${(item.quantity * item.unit_price).toFixed(2)}
              </div>
              <div className="col-span-1">
                {lineItems.length > 1 && (
                  <button
                    onClick={() => removeLineItem(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="border-t border-slate-200 pt-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tax Rate (%)</label>
            <input
              type="number"
              step="0.01"
              value={taxRate}
              onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Discount ($)</label>
            <input
              type="number"
              step="0.01"
              value={discount}
              onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              min="0"
            />
          </div>
        </div>

        <div className="space-y-2 text-right">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount:</span>
              <span>-${discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Tax ({taxRate}%):</span>
            <span>${taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t border-slate-200 pt-2">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !selectedCustomer}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Save size={16} />
            )}
            <span>{loading ? 'Saving...' : 'Save Estimate'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TradeSpecificEstimate;