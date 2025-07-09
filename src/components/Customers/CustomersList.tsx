import React, { useState, useEffect } from 'react';
import { Plus, Search, Phone, Mail, MapPin, Tag, Calendar, Home, Building, Users as UsersIcon, Edit, Trash2 } from 'lucide-react';
import { mockCustomers, mockBusiness } from '../../data/mockData';
import { tradeConfigs } from '../../data/tradeConfigs';
import { Customer, CustomerFormData } from '../../types';
import { useAuth } from '../../context/AppContext';

const CustomersList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [propertyFilter, setPropertyFilter] = useState<string>('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerFormData | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { customers, user, createCustomer, updateCustomer, deleteCustomer, getCustomers } = useAuth();

  useEffect(() => {
    if (!customers || customers.length === 0) {
      getCustomers && getCustomers();
    }
  }, []);

  const tradeConfig = tradeConfigs[mockBusiness.primaryTrade];

  // Add null check for customers
  const safeCustomers = customers || [];

  const filteredCustomers = safeCustomers.filter((customer: CustomerFormData) => {
    const searchableContent = [
      customer.name || '',
      customer.email || '',
      customer.address || '',
      // Handle both string and array tags safely
      typeof customer.tags === 'string'
        ? customer.tags
        : Array.isArray(customer.tags)
          ? customer.tags.join(',')
          : ''
    ].join(' ').toLowerCase();

    const matchesSearch = searchableContent.includes(searchTerm.toLowerCase());
    const matchesProperty = propertyFilter === 'all' || customer.property_type === propertyFilter;

    return matchesSearch && matchesProperty;
  });

  const getPropertyTypeIcon = (type?: string) => {
    switch (type) {
      case 'residential': return <Home className="text-green-600" size={16} />;
      case 'commercial': return <Building className="text-blue-600" size={16} />;
      case 'hoa': return <UsersIcon className="text-purple-600" size={16} />;
      case 'rental': return <Home className="text-orange-600" size={16} />;
      default: return <Home className="text-gray-600" size={16} />;
    }
  };

  const getPropertyTypeColor = (type?: string) => {
    switch (type) {
      case 'residential': return 'bg-green-100 text-green-800';
      case 'commercial': return 'bg-blue-100 text-blue-800';
      case 'hoa': return 'bg-purple-100 text-purple-800';
      case 'rental': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMemphisArea = (address: string) => {
    if (!address) return 'Memphis Metro';
    if (address.includes('Poplar')) return 'Midtown/East Memphis';
    if (address.includes('Main') || address.includes('Beale')) return 'Downtown';
    if (address.includes('Germantown')) return 'Germantown';
    if (address.includes('Union')) return 'Midtown';
    return 'Memphis Metro';
  };

  const capitalize = (str: any) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const initialCustomerState: CustomerFormData = {
    id: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    property_type: 'residential',
    tags: '',
    notes: '',
    last_contact: '',
    total_revenue: 0,
    job_count: 0,
  };

  const handleEditCustomer = (customer: CustomerFormData) => {
    const customerForEdit = {
      ...customer,
      tags: Array.isArray(customer.tags) ? customer.tags.join(', ') : customer.tags || ''
    };
    setEditingCustomer(customerForEdit);
    setOpenDialog(true);
  };

  const handleDeleteClick = (customerId: number) => {
    setShowDeleteConfirm(customerId);
  };

  const handleDeleteConfirm = async (customerId: number) => {
    try {
      const success = await deleteCustomer(customerId);
      if (success) {
        setShowDeleteConfirm(null);
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  const AddEditCustomerDialog = () => {
    const [formData, setFormData] = useState<CustomerFormData>(
      editingCustomer || initialCustomerState
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSaving(true);

      try {
        if (editingCustomer && editingCustomer.id) {
          // Update existing customer
          const tagsArray = typeof formData.tags === 'string'
            ? formData.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag)
            : Array.isArray(formData.tags)
              ? formData.tags
              : [];

          const updateData = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            property_type: formData.property_type,
            tags: tagsArray,
            notes: formData.notes,
            last_contact: formData.last_contact,
          };
          await updateCustomer(Number(editingCustomer.id), updateData);
        } else {
          // Create new customer
          await createCustomer(formData);
        }

        setFormData(initialCustomerState);
        setEditingCustomer(null);
        setOpenDialog(false);
      } catch (error) {
        console.error('Error saving customer:', error);
      } finally {
        setIsSaving(false);
      }
    };

    const handleClose = () => {
      setOpenDialog(false);
      setEditingCustomer(null);
      setFormData(initialCustomerState);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-4 sm:p-6 border-b">
            <h2 className="text-lg sm:text-xl font-semibold">
              {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            >
              &times;
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Name"
              required
              className="w-full border rounded-lg px-4 py-2 text-sm sm:text-base"
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full border rounded-lg px-4 py-2 text-sm sm:text-base"
            />
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone"
              className="w-full border rounded-lg px-4 py-2 text-sm sm:text-base"
            />
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Address"
              className="w-full border rounded-lg px-4 py-2 text-sm sm:text-base"
            />
            <select
              name="property_type"
              value={formData.property_type}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2 text-sm sm:text-base"
            >
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value='hoa'>HOA</option>
              <option value='rental'>Rental</option>
            </select>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="Tags (comma separated)"
              className="w-full border rounded-lg px-4 py-2 text-sm sm:text-base"
            />
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Notes"
              className="w-full border rounded-lg px-4 py-2 text-sm sm:text-base"
              rows={3}
            />
            <input
              type="date"
              name="last_contact"
              value={formData.last_contact}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2 text-sm sm:text-base"
            />
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm sm:text-base"
              >
                {isSaving ? 'Saving...' : (editingCustomer ? 'Update' : 'Save')}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const DeleteConfirmDialog = ({ customerId, customerName, onConfirm, onCancel }: {
    customerId: number;
    customerName: string;
    onConfirm: (id: number) => void;
    onCancel: () => void;
  }) => (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
        <div className="p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Customer</h3>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">
            Are you sure you want to delete <strong>{customerName}</strong>? This action cannot be undone.
          </p>
          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(customerId)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm sm:text-base"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <span className="text-xl sm:text-2xl">{tradeConfig.icon}</span>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{capitalize(user?.primary_trade)} Customers</h1>
            <p className="text-sm sm:text-base text-slate-600">Manage customer relationships and {user?.primary_trade.toLowerCase()} service history</p>
          </div>
        </div>

        <button
          onClick={() => setOpenDialog(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm sm:text-base w-full sm:w-auto justify-center"
        >
          <Plus size={16} />
          <span>Add Customer</span>
        </button>
      </div>

      {openDialog && <AddEditCustomerDialog />}

      {showDeleteConfirm && (
        <DeleteConfirmDialog
          customerId={showDeleteConfirm}
          customerName={safeCustomers.find((c: CustomerFormData) => c.id === showDeleteConfirm)?.name || ''}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteConfirm(null)}
        />
      )}

      {/* Search & Filters */}
      <div className="bg-white rounded-lg p-4 mb-6 shadow-sm border border-slate-200">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 min-w-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search customers by name, email, address, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full text-sm sm:text-base"
              />
            </div>
          </div>

          <select
            value={propertyFilter}
            onChange={(e) => setPropertyFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          >
            <option value="all">All Property Types</option>
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
            <option value="hoa">HOA/Community</option>
            <option value="rental">Rental Property</option>
          </select>
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid gap-4 sm:gap-6">
        {filteredCustomers.map((customer: CustomerFormData) => (
          <div key={customer.id} className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-4 space-y-4 lg:space-y-0">
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
                  <div className="flex items-center space-x-3">
                    {getPropertyTypeIcon(customer.property_type)}
                    <h3 className="text-lg sm:text-xl font-semibold text-slate-900">{customer.name}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {customer.property_type && (
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPropertyTypeColor(customer.property_type)}`}>
                        {customer.property_type}
                      </span>
                    )}
                    {typeof customer.tags === 'string'
                      ? customer.tags.split(',').map((tag: string, index: number) => (
                        <span
                          key={index}
                          className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-600"
                        >
                          {tag.trim().replace('-', ' ')}
                        </span>
                      ))
                      : Array.isArray(customer.tags) && customer.tags.map((tag: string, index: number) => (
                        <span
                          key={index}
                          className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-600"
                        >
                          {tag.replace('-', ' ')}
                        </span>
                      ))}
                  </div>
                </div>
                {customer.notes && (
                  <p className="text-slate-600 mb-3 text-sm sm:text-base">{customer.notes}</p>
                )}
              </div>

              <div className="text-left lg:text-right">
                <p className="text-lg font-bold text-green-600">${(customer.total_revenue || 0).toLocaleString()}</p>
                <p className="text-sm text-slate-500">Total Revenue</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <Phone className="text-slate-400 flex-shrink-0" size={16} />
                <span className="text-sm text-slate-900 truncate">{customer.phone}</span>
              </div>

              <div className="flex items-center space-x-2">
                <Mail className="text-slate-400 flex-shrink-0" size={16} />
                <span className="text-sm text-slate-900 truncate">{customer.email}</span>
              </div>

              <div className="flex items-center space-x-2">
                <MapPin className="text-slate-400 flex-shrink-0" size={16} />
                <div className="min-w-0">
                  <span className="text-sm text-slate-900">{getMemphisArea(customer.address)}</span>
                  <p className="text-xs text-slate-600 truncate">{customer.address}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Calendar className="text-slate-400 flex-shrink-0" size={16} />
                <span className="text-sm text-slate-900">
                  Last contact: {customer.last_contact ? new Date(customer.last_contact).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between pt-4 border-t border-slate-200 space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-6">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{customer.job_count || 0}</p>
                  <p className="text-sm text-slate-600">{tradeConfig.name} Jobs</p>
                </div>

                <div>
                  <p className="text-lg font-semibold text-slate-900">
                    ${(customer.job_count && customer.job_count > 0) ? ((customer.total_revenue || 0) / customer.job_count).toFixed(0) : '0'}
                  </p>
                  <p className="text-sm text-slate-600">Avg Job Value</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                <button className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium px-2 py-1">
                  View History
                </button>
                <button className="text-green-600 hover:text-green-800 text-xs sm:text-sm font-medium px-2 py-1">
                  Schedule {tradeConfig.name} Service
                </button>
                <button
                  onClick={() => handleEditCustomer(customer)}
                  className="flex items-center space-x-1 text-slate-600 hover:text-slate-800 text-xs sm:text-sm font-medium px-2 py-1"
                >
                  <Edit size={14} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteClick(Number(customer.id))}
                  className="flex items-center space-x-1 text-red-600 hover:text-red-800 text-xs sm:text-sm font-medium px-2 py-1"
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <UsersIcon className="mx-auto text-slate-400 mb-4" size={48} />
          <p className="text-slate-500 text-lg mb-4">No customers found</p>
          <p className="text-slate-400">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
};

export default CustomersList;