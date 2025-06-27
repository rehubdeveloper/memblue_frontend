import React, { useEffect, useState } from 'react';
import { Plus, Search, AlertTriangle, Package, TrendingDown, Edit, Wrench, Trash2, X } from 'lucide-react';
import { mockBusiness } from '../../data/mockData';
import { tradeConfigs } from '../../data/tradeConfigs';
import { useAuth } from '../../context/AppContext';
import Toast from '../Toast';

// Define the inventory item type based on your API response
interface InventoryItem {
  id?: number;
  name: string;
  sku: string;
  supplier: string;
  cost_per_unit: number;
  total_value: number;
  stock_level: number;
  reorder_at: number;
  category: string;
  ideal_stock: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Form type for creating new inventory items
interface InventoryFormData {
  name: string;
  sku: string;
  supplier: string;
  cost_per_unit: string;
  stock_level: string;
  reorder_at: string;
  category: string;
  ideal_stock: string;
  is_active: boolean;
}

const InventoryList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [tradeSpecificFilter, setTradeSpecificFilter] = useState('all');

  const tradeConfig = tradeConfigs[mockBusiness.primaryTrade];

  const [form, setForm] = useState<InventoryFormData>({
    name: '',
    sku: '',
    supplier: '',
    cost_per_unit: '',
    stock_level: '',
    reorder_at: '',
    category: '',
    ideal_stock: '',
    is_active: true,
  });

  const handleChange = (field: keyof InventoryFormData, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const { createInventory, updateInventory, deleteInventory, inventoryList, user } = useAuth();

  // Convert inventoryList to typed array, handle null/undefined and ensure proper types
  const inventory: InventoryItem[] = inventoryList ?
    (Array.isArray(inventoryList) ? inventoryList.map(item => ({
      ...item,
      cost_per_unit: typeof item.cost_per_unit === 'string' ? parseFloat(item.cost_per_unit) : item.cost_per_unit,
      total_value: typeof item.total_value === 'string' ? parseFloat(item.total_value) : item.total_value,
      stock_level: typeof item.stock_level === 'string' ? parseInt(item.stock_level) : item.stock_level,
      reorder_at: typeof item.reorder_at === 'string' ? parseInt(item.reorder_at) : item.reorder_at,
      ideal_stock: typeof item.ideal_stock === 'string' ? parseInt(item.ideal_stock) : item.ideal_stock,
    })) : []) : [];

  const resetForm = () => {
    setForm({
      name: '',
      sku: '',
      supplier: '',
      cost_per_unit: '',
      stock_level: '',
      reorder_at: '',
      category: '',
      ideal_stock: '',
      is_active: true,
    });
    setEditingItem(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setOpenDialog(true);
  };

  const openEditDialog = (item: InventoryItem) => {
    setForm({
      name: item.name,
      sku: item.sku,
      supplier: item.supplier,
      cost_per_unit: item.cost_per_unit.toString(),
      stock_level: item.stock_level.toString(),
      reorder_at: item.reorder_at.toString(),
      category: item.category,
      ideal_stock: item.ideal_stock.toString(),
      is_active: item.is_active,
    });
    setEditingItem(item);
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    setLoading(true);

    // Convert form strings to numbers where needed
    const formData = {
      ...form,
      cost_per_unit: parseFloat(form.cost_per_unit) || 0,
      stock_level: parseInt(form.stock_level) || 0,
      reorder_at: parseInt(form.reorder_at) || 0,
      ideal_stock: parseInt(form.ideal_stock) || 0,
    };

    try {
      let res;
      if (editingItem && editingItem.id) {
        // Update existing item
        res = await updateInventory(editingItem.id, formData);
      } else {
        // Create new item
        res = await createInventory(formData);
      }

      if (res && res.name) {
        setOpenDialog(false);
        resetForm();
      } else {
        console.warn("Something went wrong or invalid response");
      }
    } catch (error) {
      console.error("Error saving inventory item:", error);
      // You might want to show an error message to the user here
    }

    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    try {
      const success = await deleteInventory(id);
      if (success) {
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error("Error deleting inventory item:", error);
      // You might want to show an error message to the user here
    }
    setLoading(false);
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;

    // Check if item is trade-specific based on category or other criteria
    const isTradeSpecific = (user?.first_name && item.category.toLowerCase().includes(user.first_name.toLowerCase())) ||
      item.category.toLowerCase().includes('pro');

    const matchesTradeSpecific = tradeSpecificFilter === 'all' ||
      (tradeSpecificFilter === 'trade-specific' && isTradeSpecific) ||
      (tradeSpecificFilter === 'general' && !isTradeSpecific);

    return matchesSearch && matchesCategory && matchesTradeSpecific;
  });

  const categories = [...new Set(inventory.map(item => item.category))];
  const lowStockItems = inventory.filter(item => item.stock_level <= item.reorder_at);

  const getStockStatus = (item: InventoryItem) => {
    const { stock_level, reorder_at, ideal_stock } = item;

    const delta = ideal_stock - reorder_at;

    if (delta === 0) return 'neutral'; // avoid divide-by-zero if edge case

    const progress = ((stock_level - reorder_at) / delta) * 100;

    if (progress <= 40) return 'low';
    if (progress <= 60) return 'warning';
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

  // Helper function to check if item is trade-specific
  const isTradeSpecific = (item: InventoryItem) => {
    return item.category.toLowerCase().includes(tradeConfig.name.toLowerCase()) ||
      item.category.toLowerCase().includes('pro');
  };



  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{tradeConfig.icon}</span>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{user?.primary_trade ? user.primary_trade.toUpperCase() : "TRADE"} Inventory</h1>
            <p className="text-slate-600">Track parts, supplies, and equipment for {user?.primary_trade.toLowerCase()} jobs</p>
          </div>
        </div>

        <button onClick={openCreateDialog} className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus size={16} />
          <span>Add Item</span>
        </button>
      </div>



      {/* Create/Edit Dialog */}
      {openDialog && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white w-full max-w-3xl rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-800">
                {editingItem ? 'Edit Inventory Item' : 'Add Inventory Item'}
              </h2>
              <button
                onClick={() => setOpenDialog(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input
                  id="name"
                  value={form.name}
                  onChange={e => handleChange('name', e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="sku" className="block text-sm font-medium text-slate-700 mb-1">SKU</label>
                <input
                  id="sku"
                  value={form.sku}
                  onChange={e => handleChange('sku', e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="supplier" className="block text-sm font-medium text-slate-700 mb-1">Supplier</label>
                <input
                  id="supplier"
                  value={form.supplier}
                  onChange={e => handleChange('supplier', e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <input
                  id="category"
                  value={form.category}
                  onChange={e => handleChange('category', e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="cost_per_unit" className="block text-sm font-medium text-slate-700 mb-1">Cost per Unit</label>
                <input
                  type="number"
                  step="0.01"
                  id="cost_per_unit"
                  value={form.cost_per_unit}
                  onChange={e => handleChange('cost_per_unit', e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="stock_level" className="block text-sm font-medium text-slate-700 mb-1">Stock Level</label>
                <input
                  type="number"
                  id="stock_level"
                  value={form.stock_level}
                  onChange={e => handleChange('stock_level', e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="ideal_stock" className="block text-sm font-medium text-slate-700 mb-1">Ideal Stock</label>
                <input
                  type="number"
                  id="ideal_stock"
                  value={form.ideal_stock}
                  onChange={e => handleChange('ideal_stock', e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="reorder_at" className="block text-sm font-medium text-slate-700 mb-1">Reorder At</label>
                <input
                  type="number"
                  id="reorder_at"
                  value={form.reorder_at}
                  onChange={e => handleChange('reorder_at', e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center mt-2">
                <input
                  id="is_active"
                  type="checkbox"
                  checked={form.is_active}
                  onChange={e => handleChange('is_active', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="is_active" className="text-sm text-slate-700 font-medium">Is Active</label>
              </div>
            </div>

            <div className="flex justify-end mt-6 space-x-3">
              <button onClick={() => setOpenDialog(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">Cancel</button>
              <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                {loading ? "Saving..." : editingItem ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="text-red-500" size={24} />
              <h2 className="text-xl font-bold text-slate-800">Confirm Delete</h2>
            </div>

            <p className="text-slate-600 mb-6">
              Are you sure you want to delete this inventory item? This action cannot be undone.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alerts */}
      {lowStockItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="text-red-500 mt-1" size={20} />
            <div>
              <h3 className="font-medium text-red-900 mb-1">Low Stock Alert</h3>
              <p className="text-red-700 text-sm mb-2">
                {lowStockItems.length} {user?.primary_trade.toLowerCase()} item(s) need reordering:
              </p>
              <div className="flex flex-wrap gap-2">
                {lowStockItems.map(item => (
                  <span key={item.id || item.sku} className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                    {item.name} ({item.stock_level} left)
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
            <option value="trade-specific">{user?.primary_trade} Specific</option>
            <option value="general">General Supplies</option>
          </select>
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="grid gap-4">
        {filteredInventory.map((item) => {
          const status = getStockStatus(item);
          const stockPercentage = Math.max(0,
            item.ideal_stock > 0
              ? Math.min((item.stock_level / item.ideal_stock) * 100, 100)
              : 0
          );


          const itemIsTradeSpecific = isTradeSpecific(item);

          return (
            <div key={item.id || item.sku} className="bg-white rounded-lg p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {itemIsTradeSpecific ? (
                      <span className="text-lg">{tradeConfig.icon}</span>
                    ) : (
                      <Package className="text-slate-400" size={20} />
                    )}
                    <h3 className="text-lg font-semibold text-slate-900">{item.name}</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
                      {status === 'low' ? 'Low Stock' : status === 'warning' ? 'Low' : 'In Stock'}
                    </span>
                    {itemIsTradeSpecific && (
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {user?.primary_trade} Item
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 mb-1">SKU: {item.sku}</p>
                  <p className="text-slate-600">Supplier: {item.supplier}</p>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-900">{item.stock_level}</p>
                  <p className="text-sm text-slate-500">units</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Cost per Unit</p>
                  <p className="font-medium text-slate-900">${(item.cost_per_unit || 0).toFixed(2)}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Value</p>
                  <p className="font-medium text-slate-900">
                    ${((item.stock_level || 0) * (item.cost_per_unit || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-600 mb-1">Reorder At</p>
                  <p className="font-medium text-slate-900">{item.reorder_at} units</p>
                </div>
              </div>

              {/* Stock Level Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-slate-600">Stock Level</span>
                  <span className="text-sm text-slate-600">
                    {item.stock_level} / {item.ideal_stock} ideal
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${status === 'low' ? 'bg-red-500' :
                      status === 'warning' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                    style={{ width: `${stockPercentage}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <div className="text-sm text-slate-500">
                  Category: {item.category}
                </div>

                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Adjust Stock
                  </button>
                  <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                    Reorder
                  </button>
                  <button
                    onClick={() => openEditDialog(item)}
                    className="flex items-center space-x-1 text-slate-600 hover:text-slate-800 text-sm font-medium"
                  >
                    <Edit size={14} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(item.id || 0)}
                    className="flex items-center space-x-1 text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
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
          <p className="text-slate-400">
            {inventory.length === 0
              ? "Add your first inventory item to get started"
              : "Try adjusting your search or filter criteria"
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default InventoryList;