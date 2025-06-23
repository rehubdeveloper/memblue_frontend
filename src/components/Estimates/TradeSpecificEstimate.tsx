import React, { useState } from 'react';
import { Plus, Trash2, Calculator } from 'lucide-react';
import { TradeType } from '../../types';
import { tradeConfigs } from '../../data/tradeConfigs';

interface TradeSpecificEstimateProps {
  trade: TradeType;
  onSave: (estimate: any) => void;
}

const TradeSpecificEstimate: React.FC<TradeSpecificEstimateProps> = ({ trade, onSave }) => {
  const config = tradeConfigs[trade];
  const [lineItems, setLineItems] = useState([
    { id: '1', description: '', quantity: 1, unitPrice: 0, category: 'Labor' }
  ]);
  const [taxRate, setTaxRate] = useState(9.25); // Memphis tax rate
  const [discount, setDiscount] = useState(0);

  const addLineItem = () => {
    const newId = (lineItems.length + 1).toString();
    setLineItems([...lineItems, { 
      id: newId, 
      description: '', 
      quantity: 1, 
      unitPrice: 0, 
      category: 'Labor' 
    }]);
  };

  const removeLineItem = (id: string) => {
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const updateLineItem = (id: string, field: string, value: any) => {
    setLineItems(lineItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const addQuickLineItem = (quickItem: any) => {
    const newId = (lineItems.length + 1).toString();
    setLineItems([...lineItems, {
      id: newId,
      description: quickItem.description,
      quantity: 1,
      unitPrice: quickItem.defaultPrice,
      category: quickItem.category
    }]);
  };

  const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const taxAmount = (subtotal - discount) * (taxRate / 100);
  const total = subtotal - discount + taxAmount;

  const handleSave = () => {
    const estimate = {
      lineItems: lineItems.map(item => ({
        ...item,
        total: item.quantity * item.unitPrice
      })),
      subtotal,
      tax: taxAmount,
      discount,
      total,
      trade
    };
    onSave(estimate);
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
      <div className="flex items-center space-x-3 mb-6">
        <span className="text-2xl">{config.icon}</span>
        <h2 className="text-xl font-semibold text-slate-900">{config.name} Estimate</h2>
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
            <div key={item.id} className="grid grid-cols-12 gap-3 items-center p-3 border border-slate-200 rounded-lg">
              <div className="col-span-4">
                <input
                  type="text"
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                  className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                />
              </div>
              <div className="col-span-2">
                <select
                  value={item.category}
                  onChange={(e) => updateLineItem(item.id, 'category', e.target.value)}
                  className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                >
                  <option value="Labor">Labor</option>
                  <option value="Parts">Parts</option>
                  <option value="Materials">Materials</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  placeholder="Unit Price"
                  value={item.unitPrice}
                  onChange={(e) => updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                />
              </div>
              <div className="col-span-1 text-right font-medium">
                ${(item.quantity * item.unitPrice).toFixed(2)}
              </div>
              <div className="col-span-1">
                {lineItems.length > 1 && (
                  <button
                    onClick={() => removeLineItem(item.id)}
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

        <div className="flex justify-end mt-6">
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            <Calculator size={16} />
            <span>Save Estimate</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TradeSpecificEstimate;