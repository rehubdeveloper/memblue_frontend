import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, User, FileText, DollarSign, Calendar, Tag, Plus, Trash2, CheckCircle, Package } from 'lucide-react';
import { useAuth } from '../../context/AppContext';
import { format, addDays } from 'date-fns';

interface InterviewInvoiceFormProps {
  isOpen: boolean;
  onClose: () => void;
  customerId?: number;
  customerName?: string;
  estimate?: any; // Optional estimate to convert from
}

interface InvoiceFormData {
  customer: number;
  job: number;
  description: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    category: 'Labor' | 'Materials' | 'Equipment' | 'Travel' | 'Other';
    isInventoryItem?: boolean;
    inventoryId?: number;
    inventoryName?: string;
    inventorySku?: string;
  }>;
  notes: string;
  dueDate: string;
  paymentTerms: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  taxRate: number;
  discount: number;
}

const InterviewInvoiceForm: React.FC<InterviewInvoiceFormProps> = ({ 
  isOpen, 
  onClose, 
  customerId, 
  customerName,
  estimate 
}) => {
  const { user, customers, workOrders, createInvoice, notifyInvoiceCreated, inventoryList, updateInventory } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const totalSteps = 7;

  const [formData, setFormData] = useState<InvoiceFormData>({
    customer: customerId || 0,
    job: 0,
    description: '',
    lineItems: [{ description: '', quantity: 1, unit_price: 0, category: 'Labor' }],
    notes: '',
    dueDate: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
    paymentTerms: 'Net 30',
    status: 'draft',
    taxRate: 9.25,
    discount: 0
  });

  // Reset form when modal opens/closes or when estimate changes
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      
      if (estimate) {
        // Pre-fill from estimate
        setFormData({
          customer: estimate.customer,
          job: estimate.job || 0,
          description: estimate.description,
          lineItems: estimate.line_items.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            category: item.category
          })),
          notes: estimate.notes || '',
          dueDate: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
          paymentTerms: 'Net 30',
          status: 'draft',
          taxRate: estimate.tax_rate || 9.25,
          discount: estimate.discount || 0
        });
      } else {
        // Reset to default
        setFormData({
          customer: customerId || 0,
          job: 0,
          description: '',
          lineItems: [{ description: '', quantity: 1, unit_price: 0, category: 'Labor' }],
          notes: '',
          dueDate: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
          paymentTerms: 'Net 30',
          status: 'draft',
          taxRate: 9.25,
          discount: 0
        });
      }
    }
  }, [isOpen, customerId, estimate]);

  const handleInputChange = (field: keyof InvoiceFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLineItemChange = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      lineItems: prev.lineItems.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const addLineItem = () => {
    setFormData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, { description: '', quantity: 1, unit_price: 0, category: 'Labor' }]
    }));
  };

  const addInventoryItem = (inventoryItem: any, quantity: number = 1) => {
    setFormData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, {
        description: inventoryItem.name,
        quantity: quantity,
        unit_price: inventoryItem.cost_per_unit,
        category: 'Materials',
        isInventoryItem: true,
        inventoryId: inventoryItem.id,
        inventoryName: inventoryItem.name,
        inventorySku: inventoryItem.sku
      }]
    }));
  };

  const removeLineItem = (index: number) => {
    if (formData.lineItems.length > 1) {
      setFormData(prev => ({
        ...prev,
        lineItems: prev.lineItems.filter((_, i) => i !== index)
      }));
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return 'Customer Selection';
      case 2: return 'Job Details';
      case 3: return 'Services & Items';
      case 4: return 'Inventory Items';
      case 5: return 'Payment Terms';
      case 6: return 'Additional Notes';
      case 7: return 'Review & Submit';
      default: return '';
    }
  };

  const getStepIcon = (step: number) => {
    switch (step) {
      case 1: return <User size={20} />;
      case 2: return <FileText size={20} />;
      case 3: return <DollarSign size={20} />;
      case 4: return <Package size={20} />;
      case 5: return <Calendar size={20} />;
      case 6: return <Tag size={20} />;
      case 7: return <CheckCircle size={20} />;
      default: return <FileText size={20} />;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Which customer is this invoice for?
              </label>
              <select
                value={formData.customer}
                onChange={(e) => handleInputChange('customer', Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select a customer...</option>
                {customers?.map((customer: any) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} - {customer.address}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What job is this invoice for? (Optional)
              </label>
              <select
                value={formData.job}
                onChange={(e) => handleInputChange('job', Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">No specific job</option>
                {workOrders?.filter((job: any) => job.customer === formData.customer).map((job: any) => (
                  <option key={job.id} value={job.id}>
                    {job.job_type} - {job.description}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brief description of the work
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe the work performed..."
                required
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700">
                What services or items are included?
              </label>
              <button
                type="button"
                onClick={addLineItem}
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
              >
                <Plus size={16} />
                <span>Add Item</span>
              </button>
            </div>
            
            <div className="space-y-4">
              {formData.lineItems.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Service or item description"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleLineItemChange(index, 'quantity', Number(e.target.value))}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price ($)</label>
                      <input
                        type="number"
                        value={item.unit_price}
                        onChange={(e) => handleLineItemChange(index, 'unit_price', Number(e.target.value))}
                        step="0.01"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <select
                      value={item.category}
                      onChange={(e) => handleLineItemChange(index, 'category', e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="Labor">Labor</option>
                      <option value="Materials">Materials</option>
                      <option value="Equipment">Equipment</option>
                      <option value="Travel">Travel</option>
                      <option value="Other">Other</option>
                    </select>
                    {formData.lineItems.length > 1 && (
                      <button
                        type="button"
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
        );

             case 4:
         return (
           <div className="space-y-6">
             <div className="flex justify-between items-center">
               <label className="block text-sm font-medium text-gray-700">
                 Add inventory items to this invoice?
               </label>
             </div>
             
             {/* Show current line items */}
             {formData.lineItems.length > 0 && (
               <div className="bg-gray-50 rounded-lg p-4">
                 <h4 className="font-medium text-gray-700 mb-3">Current Line Items:</h4>
                 <div className="space-y-2">
                   {formData.lineItems.map((item, index) => (
                     <div key={index} className="flex justify-between items-center text-sm">
                       <div className="flex-1">
                         <span className="text-gray-900">{item.description}</span>
                         {item.isInventoryItem && (
                           <span className="text-blue-600 text-xs ml-2">📦 Inventory</span>
                         )}
                       </div>
                       <div className="flex items-center space-x-2">
                         <span className="text-gray-600">Qty: {item.quantity}</span>
                         <span className="text-gray-600">${item.unit_price}</span>
                         <button
                           type="button"
                           onClick={() => removeLineItem(index)}
                           className="text-red-600 hover:text-red-800"
                         >
                           <Trash2 size={14} />
                         </button>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             )}
             
             <div className="space-y-4">
               <h4 className="font-medium text-gray-700">Available Inventory Items:</h4>
                               {inventoryList?.filter((item: any) => item.stock_level > 0).map((inventoryItem: any) => {
                  const isAlreadyAdded = formData.lineItems.some(lineItem => 
                    lineItem.isInventoryItem && lineItem.inventoryId === inventoryItem.id
                  );
                  
                  return (
                    <div key={inventoryItem.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{inventoryItem.name}</h4>
                          <p className="text-sm text-gray-600">SKU: {inventoryItem.sku}</p>
                          <p className="text-sm text-gray-600">
                            Stock: {inventoryItem.stock_level} | Price: ${inventoryItem.cost_per_unit}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="1"
                            max={inventoryItem.stock_level}
                            defaultValue="1"
                            data-inventory-id={inventoryItem.id}
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
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
                            className={`px-3 py-1 text-sm rounded-lg ${
                              isAlreadyAdded 
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          >
                            {isAlreadyAdded ? 'Added' : 'Add'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
               
               {(!inventoryList || inventoryList.length === 0) && (
                 <div className="text-center py-8">
                   <Package className="mx-auto text-gray-400 mb-4" size={48} />
                   <p className="text-gray-500 text-lg mb-2">No inventory items available</p>
                   <p className="text-gray-400">Add inventory items to include them in invoices.</p>
                 </div>
               )}
             </div>
           </div>
         );

       case 5:
         return (
           <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   When is payment due?
                 </label>
                 <input
                   type="date"
                   value={formData.dueDate}
                   onChange={(e) => handleInputChange('dueDate', e.target.value)}
                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                   required
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Payment Terms
                 </label>
                 <select
                   value={formData.paymentTerms}
                   onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                 >
                   <option value="Net 15">Net 15</option>
                   <option value="Net 30">Net 30</option>
                   <option value="Net 45">Net 45</option>
                   <option value="Net 60">Net 60</option>
                   <option value="Due on Receipt">Due on Receipt</option>
                 </select>
               </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Tax Rate (%)
                 </label>
                 <input
                   type="number"
                   value={formData.taxRate}
                   onChange={(e) => handleInputChange('taxRate', Number(e.target.value))}
                   step="0.01"
                   min="0"
                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Discount Amount ($)
                 </label>
                 <input
                   type="number"
                   value={formData.discount}
                   onChange={(e) => handleInputChange('discount', Number(e.target.value))}
                   step="0.01"
                   min="0"
                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                 />
               </div>
             </div>
           </div>
         );

             case 6:
         return (
           <div className="space-y-6">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 Any additional notes or payment instructions?
               </label>
               <textarea
                 value={formData.notes}
                 onChange={(e) => handleInputChange('notes', e.target.value)}
                 rows={4}
                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                 placeholder="Payment instructions, late fees, or special terms..."
               />
             </div>
           </div>
         );

       case 7:
        const subtotal = formData.lineItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
        const taxAmount = (subtotal - formData.discount) * (formData.taxRate / 100);
        const total = subtotal - formData.discount + taxAmount;
        const selectedCustomer = customers?.find((c: any) => c.id === formData.customer);
        const selectedJob = workOrders?.find((j: any) => j.id === formData.job);

        return (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Invoice Summary</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Customer Information</h4>
                  <p className="text-gray-900">{selectedCustomer?.name}</p>
                  <p className="text-gray-600 text-sm">{selectedCustomer?.address}</p>
                </div>
                
                {selectedJob && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Job Information</h4>
                    <p className="text-gray-900">{selectedJob.job_type}</p>
                    <p className="text-gray-600 text-sm">{selectedJob.description}</p>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <h4 className="font-medium text-gray-700 mb-2">Work Description</h4>
                <p className="text-gray-900">{formData.description}</p>
              </div>

                             <div className="mt-4">
                 <h4 className="font-medium text-gray-700 mb-2">Line Items</h4>
                 <div className="space-y-2">
                   {formData.lineItems.map((item, index) => (
                     <div key={index} className="flex justify-between text-sm">
                       <div className="flex-1">
                         <span className="text-gray-900">
                           {item.description} (Qty: {item.quantity})
                         </span>
                         {item.isInventoryItem && (
                           <span className="text-blue-600 text-xs ml-2">
                             📦 Inventory Item
                           </span>
                         )}
                       </div>
                       <span className="text-gray-600">
                         ${(item.quantity * item.unit_price).toFixed(2)}
                       </span>
                     </div>
                   ))}
                 </div>
               </div>

              <div className="mt-4 border-t pt-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="text-gray-900">${subtotal.toFixed(2)}</span>
                  </div>
                  {formData.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Discount:</span>
                      <span className="text-gray-900">-${formData.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax ({formData.taxRate}%):</span>
                    <span className="text-gray-900">${taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg">
                    <span className="text-gray-900">Total:</span>
                    <span className="text-gray-900">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Due Date:</span>
                  <p className="text-gray-900">{new Date(formData.dueDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Payment Terms:</span>
                  <p className="text-gray-900">{formData.paymentTerms}</p>
                </div>
              </div>

              {formData.notes && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-700 mb-2">Notes</h4>
                  <p className="text-gray-900 text-sm">{formData.notes}</p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const handleSubmit = async () => {
    // Client-side validation
    if (!formData.customer) {
      alert('Please select a customer');
      return;
    }
    if (!formData.description) {
      alert('Please provide a description');
      return;
    }
    if (formData.lineItems.some(item => !item.description || item.unit_price <= 0)) {
      alert('Please fill in all line items with valid descriptions and prices');
      return;
    }

    // Validate inventory quantities (both newly added and from estimates)
    const inventoryItems = formData.lineItems.filter(item => item.isInventoryItem);
    
    // Also check for items that might be from estimates (by matching with inventory items)
    const estimateInventoryItems = formData.lineItems.filter(item => {
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

    setLoading(true);
    try {
      const invoiceData = {
        customer: formData.customer,
        job: formData.job || null,
        description: formData.description,
        line_items: formData.lineItems,
        notes: formData.notes,
        due_date: formData.dueDate,
        payment_terms: formData.paymentTerms,
        status: formData.status,
        tax_rate: formData.taxRate,
        discount: formData.discount,
        created_by: user?.id
      };

      const success = await createInvoice(invoiceData);
      if (success) {
        // Update inventory stock for inventory items (both newly added and from estimates)
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

        notifyInvoiceCreated(formData.description);
        onClose();
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {estimate ? 'Convert Estimate to Invoice' : 'Create New Invoice'}
            </h2>
            <p className="text-sm text-gray-600">Step {currentStep} of {totalSteps}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center space-x-4">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div key={i} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  i + 1 < currentStep
                    ? 'bg-green-500 text-white'
                    : i + 1 === currentStep
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {i + 1 < currentStep ? <CheckCircle size={16} /> : i + 1}
                </div>
                {i < totalSteps - 1 && (
                  <div className={`w-12 h-1 mx-2 ${
                    i + 1 < currentStep ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="text-blue-600">
              {getStepIcon(currentStep)}
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">{getStepTitle(currentStep)}</h3>
                             <p className="text-sm text-gray-600">
                 {currentStep === 1 && 'Select the customer for this invoice'}
                 {currentStep === 2 && 'Provide job details and description'}
                 {currentStep === 3 && 'Add services and items with pricing'}
                 {currentStep === 4 && 'Add inventory items from your stock'}
                 {currentStep === 5 && 'Set payment terms and due date'}
                 {currentStep === 6 && 'Add any additional notes or instructions'}
                 {currentStep === 7 && 'Review all information before creating'}
               </p>
            </div>
          </div>

          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center p-6 border-t">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            {currentStep === totalSteps ? (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    <span>{estimate ? 'Convert to Invoice' : 'Create Invoice'}</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={nextStep}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewInvoiceForm;
