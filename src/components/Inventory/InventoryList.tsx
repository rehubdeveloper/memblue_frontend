import React, { useState } from 'react';
import { Plus, Search, AlertTriangle, Package, TrendingDown, Edit, Wrench } from 'lucide-react';
import { mockInventory, mockBusiness } from '../../data/mockData';
import { tradeConfigs } from '../../data/tradeConfigs';

const InventoryList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [tradeSpecificFilter, setTradeSpecificFilter] = useState('all');

  const tradeConfig = tradeConfigs[mockBusiness.primaryTrade];

  const filteredInventory = mockInventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesTradeSpecific = tradeSpecificFilter === 'all' || 
                                (tradeSpecificFilter === 'trade-specific' && item.tradeSpecific) ||
                                (tradeSpecificFilter === 'general' && !item.tradeSpecific);
    
    return matchesSearch && matchesCategory && matchesTradeSpecific;
  });

  const categories = [...new Set(mockInventory.map(item => item.category))];
  const lowStockItems = mockInventory.filter(item => item.stockLevel <= item.reorderThreshold);

  const getStockStatus = (item: typeof mockInventory[0]) => {
    if (item.stockLevel <= item.reorderThreshold) return 'low';
    if (item.stockLevel <= item.reorderThreshold * 1.5) return 'warning';
    return 'good';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'low': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'good': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{tradeConfig.icon}</span>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{tradeConfig.name} Inventory</h1>
            <p className="text-slate-600">Track parts, supplies, and equipment for {tradeConfig.name.toLowerCase()} jobs</p>
          </div>
        </div>
        
        <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus size={16} />
          <span>Add Item</span>
        </button>
      </div>

      {/* Alerts */}
      {lowStockItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="text-red-500 mt-1" size={20} />
            <div>
              <h3 className="font-medium text-red-900 mb-1">Low Stock Alert</h3>
              <p className="text-red-700 text-sm mb-2">
                {lowStockItems.length} {tradeConfig.name.toLowerCase()} item(s) need reordering:
              </p>
              <div className="flex flex-wrap gap-2">
                {lowStockItems.map(item => (
                  <span key={item.id} className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                    {item.name} ({item.stockLevel} left)
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 mb-6 shadow-sm border border-slate-200">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, SKU, or supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
              />
            </div>
          </div>
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={tradeSpecificFilter}
            onChange={(e) => setTradeSpecificFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Items</option>
            <option value="trade-specific">{tradeConfig.name} Specific</option>
            <option value="general">General Supplies</option>
          </select>
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="grid gap-4">
        {filteredInventory.map((item) => {
          const status = getStockStatus(item);
          const stockPercentage = Math.min((item.stockLevel / (item.reorderThreshold * 2)) * 100, 100);
          
          return (
            <div key={item.id} className="bg-white rounded-lg p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {item.tradeSpecific ? (
                      <span className="text-lg">{tradeConfig.icon}</span>
                    ) : (
                      <Package className="text-slate-400" size={20} />
                    )}
                    <h3 className="text-lg font-semibold text-slate-900">{item.name}</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
                      {status === 'low' ? 'Low Stock' : status === 'warning' ? 'Low' : 'In Stock'}
                    </span>
                    {item.tradeSpecific && (
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {tradeConfig.name} Item
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 mb-1">SKU: {item.sku}</p>
                  <p className="text-slate-600">Supplier: {item.supplier}</p>
                </div>
                
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-900">{item.stockLevel}</p>
                  <p className="text-sm text-slate-500">units</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Cost per Unit</p>
                  <p className="font-medium text-slate-900">${item.costPerUnit.toFixed(2)}</p>
                </div>
                
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Value</p>
                  <p className="font-medium text-slate-900">
                    ${(item.stockLevel * item.costPerUnit).toLocaleString()}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-slate-600 mb-1">Reorder At</p>
                  <p className="font-medium text-slate-900">{item.reorderThreshold} units</p>
                </div>
              </div>

              {/* Stock Level Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-slate-600">Stock Level</span>
                  <span className="text-sm text-slate-600">
                    {item.stockLevel} / {item.reorderThreshold * 2} ideal
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      status === 'low' ? 'bg-red-500' :
                      status === 'warning' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${stockPercentage}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <div className="text-sm text-slate-500">
                  Last updated: {item.lastUpdated.toLocaleDateString()}
                </div>
                
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Adjust Stock
                  </button>
                  <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                    Reorder
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

      {filteredInventory.length === 0 && (
        <div className="text-center py-12">
          <Wrench className="mx-auto text-slate-400 mb-4" size={48} />
          <p className="text-slate-500 text-lg mb-4">No inventory items found</p>
          <p className="text-slate-400">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default InventoryList;