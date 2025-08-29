import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calculator, Save, X, Package } from 'lucide-react';
import { useAuth } from '../../context/AppContext';
import { tradeConfigs } from '../../data/tradeConfigs';
import { format, addDays } from 'date-fns';

interface TradeSpecificInvoiceProps {
  estimate?: any; // Optional estimate to convert from
  invoice?: any; // Optional invoice to edit
  onSave: (invoice: any) => void;
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

const TradeSpecificInvoice: React.FC<TradeSpecificInvoiceProps> = ({ estimate, invoice, onSave, onCancel }) => {
  const { user, customers, workOrders, createInvoice, updateInvoice, notifyInvoiceCreated, inventoryList, updateInventory } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<number | ''>('');
  const [selectedJob, setSelectedJob] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState(format(addDays(new Date(), 30), 'yyyy-MM-dd'));
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [status, setStatus] = useState<'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'>('draft');
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

  // Populate form when converting from estimate or editing invoice
  useEffect(() => {
    if (estimate) {
      setSelectedCustomer(estimate.customer);
      setSelectedJob(estimate.job || '');
      setNotes(estimate.notes || '');
      setTaxRate(estimate.tax_rate);
      setDiscount(estimate.discount);
      setStatus('draft'); // Always start as draft when converting from estimate
      setLineItems(estimate.line_items.map((item: any) => ({
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        category: item.category
      })));
    } else if (invoice) {
      setSelectedCustomer(invoice.customer);
      setSelectedJob(invoice.job || '');
      setNotes(invoice.notes || '');
      setTaxRate(invoice.tax_rate);
      setDiscount(invoice.discount);
      setStatus(invoice.status || 'draft');
      setDueDate(format(new Date(invoice.due_date), 'yyyy-MM-dd'));
      setPaymentTerms(invoice.payment_terms || 'Net 30');
      setLineItems(invoice.line_items.map((item: any) => ({
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        category: item.category
      })));
    }
  }, [estimate, invoice]);

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

    // Validate inventory quantities for new invoices and estimate conversions
    if (!invoice) {
      // Check for inventory items (both newly added and from estimates)
      const inventoryItems = lineItems.filter(item => item.isInventoryItem);
      
      // Also check for items that might be from estimates (by matching with inventory items)
      const estimateInventoryItems = lineItems.filter(item => {
        if (item.isInventoryItem) return false; // Already counted above
        // Check if this item matches an inventory item by name and price
        const matchingInventory = inventoryList?.find((inv: any) => 
          inv.name === item.description && inv.cost_per_unit === item.unit_price
        );
        return matchingInventory;
      });
      
      const allInventoryItems = [...inventoryItems, ...estimateInventoryItems];
      
      for (const item of allInventoryItems) {
        let inventoryItem;
        if (item.isInventoryItem) {
          inventoryItem = inventoryList?.find((inv: any) => inv.id === item.inventoryId);
        } else {
          // For estimate items, find by name and price
          inventoryItem = inventoryList?.find((inv: any) => 
            inv.name === item.description && inv.cost_per_unit === item.unit_price
          );
        }
        
        if (inventoryItem && item.quantity > inventoryItem.stock_level) {
          alert(`Insufficient stock for ${item.description}. Available: ${inventoryItem.stock_level}, Requested: ${item.quantity}`);
          return;
        }
      }
    }

    setLoading(true);
    try {
      // Backend will automatically populate customer details (address, phone, email)
      // and job number from the customer and job relationships
             const invoiceData = {
         customer: selectedCustomer,
         job: selectedJob || null,
         estimate: estimate?.id || null,
         line_items: lineItems.map(item => ({
           description: item.description,
           quantity: item.quantity,
           unit_price: item.unit_price,
           category: item.category
         })),
         tax_rate: taxRate,
         discount: discount,
         notes: notes,
         due_date: dueDate + 'T23:59:59Z',
         payment_terms: paymentTerms,
         status: status,
         created_by: user?.id
       };

      let savedInvoice;
      if (invoice) {
        // Update existing invoice
        savedInvoice = await updateInvoice(invoice.id, invoiceData);
      } else {
        // Create new invoice
        savedInvoice = await createInvoice(invoiceData);
        
        // Update inventory stock for inventory items (only for new invoices)
        // Handle both newly added inventory items and items from estimates
        const inventoryItems = lineItems.filter(item => item.isInventoryItem);
        const estimateInventoryItems = lineItems.filter(item => {
          if (item.isInventoryItem) return false; // Already counted above
          // Check if this item matches an inventory item by name and price
          const matchingInventory = inventoryList?.find((inv: any) => 
            inv.name === item.description && inv.cost_per_unit === item.unit_price
          );
          return matchingInventory;
        });
        
        const allInventoryItems = [...inventoryItems, ...estimateInventoryItems];
        
        for (const item of allInventoryItems) {
          let inventoryItem;
          let inventoryId;
          
          if (item.isInventoryItem) {
            inventoryItem = inventoryList?.find((inv: any) => inv.id === item.inventoryId);
            inventoryId = item.inventoryId;
          } else {
            // For estimate items, find by name and price
            inventoryItem = inventoryList?.find((inv: any) => 
              inv.name === item.description && inv.cost_per_unit === item.unit_price
            );
            inventoryId = inventoryItem?.id;
          }
          
          if (inventoryItem && inventoryId) {
            const newStockLevel = inventoryItem.stock_level - item.quantity;
            await updateInventory(inventoryId, {
              stock_level: newStockLevel
            });
          }
        }
        
        // Get customer name for notification
        const customer = customers?.find((c: any) => c.id === selectedCustomer);
        const customerName = customer ? customer.name : 'Unknown Customer';
        
        // Add notification for invoice creation
        notifyInvoiceCreated(
          savedInvoice.invoice_number || `INV-${savedInvoice.id}`,
          customerName
        );
      }
      
      onSave(savedInvoice);
    } catch (error) {
      console.error('Error creating invoice:', error);
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
          <span className="text-2xl">💰</span>
          <h2 className="text-xl font-semibold text-slate-900">
            {invoice ? `Edit ${config.name} Invoice #${invoice.invoice_number}` : 
             estimate ? `Convert Estimate to ${config.name} Invoice` : 
             `New ${config.name} Invoice`}
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

      {/* Notes, Due Date, Payment Terms, and Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional notes for the invoice..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Due Date *</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Payment Terms</label>
          <select
            value={paymentTerms}
            onChange={(e) => setPaymentTerms(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Net 15">Net 15</option>
            <option value="Net 30">Net 30</option>
            <option value="Net 45">Net 45</option>
            <option value="Net 60">Net 60</option>
            <option value="Due on Receipt">Due on Receipt</option>
          </select>
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
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
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
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-slate-900">Line Items</h3>
          <button
            onClick={addLineItem}
            className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
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
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="col-span-2">
                <input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => updateLineItem(index, 'quantity', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div className="col-span-2">
                <input
                  type="number"
                  placeholder="Price"
                  value={item.unit_price}
                  onChange={(e) => updateLineItem(index, 'unit_price', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div className="col-span-2">
                <select
                  value={item.category}
                  onChange={(e) => updateLineItem(index, 'category', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Labor">Labor</option>
                  <option value="Materials">Materials</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Travel">Travel</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="col-span-1 text-right font-medium">
                ${(item.quantity * item.unit_price).toFixed(2)}
              </div>
              
              <div className="col-span-1">
                <button
                  onClick={() => removeLineItem(index)}
                  className="text-red-600 hover:text-red-800"
                  disabled={lineItems.length === 1}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tax and Discount */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tax Rate (%)</label>
          <input
            type="number"
            value={taxRate}
            onChange={(e) => setTaxRate(Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="0"
            max="100"
            step="0.01"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Discount ($)</label>
          <input
            type="number"
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="0"
            step="0.01"
          />
        </div>
      </div>

      {/* Totals */}
      <div className="bg-slate-50 p-4 rounded-lg mb-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Subtotal</span>
            <span className="text-slate-900">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Tax ({taxRate}%)</span>
            <span className="text-slate-900">${taxAmount.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Discount</span>
              <span className="text-green-600">-${discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold pt-2 border-t border-slate-200">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save size={16} />
              <span>Save Invoice</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default TradeSpecificInvoice;
