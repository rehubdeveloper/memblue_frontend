import React, { useState } from 'react';
import { Plus, Search, Phone, Mail, MapPin, Tag, Calendar, Home, Building, Users as UsersIcon } from 'lucide-react';
import { mockCustomers, mockBusiness } from '../../data/mockData';
import { tradeConfigs } from '../../data/tradeConfigs';
import { Customer, CustomerFormData } from '../../types';
import { useAuth } from '../../context/AppContext';

const CustomersList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [propertyFilter, setPropertyFilter] = useState<string>('all');

  const tradeConfig = tradeConfigs[mockBusiness.primaryTrade];

  const filteredCustomers = mockCustomers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesProperty = propertyFilter === 'all' || customer.propertyType === propertyFilter;

    return matchesSearch && matchesProperty;
  });

  const getPropertyTypeIcon = (type?: string) => {
    switch (type) {
      case 'residential': return <Home className="text-green-600\" size={16} />;
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
    name: '',
    email: '',
    phone: '',
    address: '',
    property_type: 'residential',
    tags: '',
    notes: '',
    last_contact: '',
  };

  const [formData, setFormData] = useState<CustomerFormData>(initialCustomerState);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const [openDialog, setOpenDialog] = useState(false)

  const { createCustomer } = useAuth()

  const [isSaving, setISaving] = useState(false)

  const AddCustomerDialog = () => {
    const [formData, setFormData] = useState<CustomerFormData>(initialCustomerState);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setISaving(true)
      await createCustomer(formData)
      setFormData(initialCustomerState);
      setISaving(false)
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-semibold">Add New Customer</h2>
            <button onClick={() => setOpenDialog(false)} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">&times;</button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Name" required className="w-full border rounded-lg px-4 py-2" />
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" className="w-full border rounded-lg px-4 py-2" />
            <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" className="w-full border rounded-lg px-4 py-2" />
            <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Address" className="w-full border rounded-lg px-4 py-2" />
            <select name="property_type" value={formData.property_type} onChange={handleChange} className="w-full border rounded-lg px-4 py-2">
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
            </select>
            <input type="text" name="tags" value={formData.tags} onChange={handleChange} placeholder="Tags (comma separated)" className="w-full border rounded-lg px-4 py-2" />
            <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Notes" className="w-full border rounded-lg px-4 py-2" rows={3}></textarea>
            <input type="date" name="last_contact" value={formData.last_contact} onChange={handleChange} className="w-full border rounded-lg px-4 py-2" />
            <div className="flex justify-end">
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">{isSaving ? 'Saving...' : 'Save'}</button>
            </div>
          </form>
        </div>
      </div>
    );
  };


  const { user } = useAuth();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{tradeConfig.icon}</span>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{capitalize(user?.primary_trade)} Customers</h1>
            <p className="text-slate-600">Manage customer relationships and {user?.primary_trade.toLowerCase()} service history</p>
          </div>
        </div>

        <button onClick={() => (setOpenDialog(true))} className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus size={16} />
          <span>Add Customer</span>
        </button>
      </div>

      {openDialog && (
        <AddCustomerDialog />
      )}

      {/* Search & Filters */}
      <div className="bg-white rounded-lg p-4 mb-6 shadow-sm border border-slate-200">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search customers by name, email, address, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
              />
            </div>
          </div>

          <select
            value={propertyFilter}
            onChange={(e) => setPropertyFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
      <div className="grid gap-6">
        {filteredCustomers.map((customer) => (
          <div key={customer.id} className="bg-white rounded-lg p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  {getPropertyTypeIcon(customer.propertyType)}
                  <h3 className="text-xl font-semibold text-slate-900">{customer.name}</h3>
                  <div className="flex space-x-2">
                    {customer.propertyType && (
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPropertyTypeColor(customer.propertyType)}`}>
                        {customer.propertyType}
                      </span>
                    )}
                    {customer.tags.slice(1).map((tag, index) => (
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
                  <p className="text-slate-600 mb-3">{customer.notes}</p>
                )}
              </div>

              <div className="text-right">
                <p className="text-lg font-bold text-green-600">${customer.totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-slate-500">Total Revenue</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <Phone className="text-slate-400" size={16} />
                <span className="text-sm text-slate-900">{customer.phone}</span>
              </div>

              <div className="flex items-center space-x-2">
                <Mail className="text-slate-400" size={16} />
                <span className="text-sm text-slate-900">{customer.email}</span>
              </div>

              <div className="flex items-center space-x-2">
                <MapPin className="text-slate-400" size={16} />
                <div>
                  <span className="text-sm text-slate-900">{getMemphisArea(customer.address)}</span>
                  <p className="text-xs text-slate-600">{customer.address}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Calendar className="text-slate-400" size={16} />
                <span className="text-sm text-slate-900">
                  Last contact: {customer.lastContact.toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <div className="flex items-center space-x-6">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{customer.jobCount}</p>
                  <p className="text-sm text-slate-600">{tradeConfig.name} Jobs</p>
                </div>

                <div>
                  <p className="text-lg font-semibold text-slate-900">
                    ${(customer.totalRevenue / customer.jobCount).toFixed(0)}
                  </p>
                  <p className="text-sm text-slate-600">Avg Job Value</p>
                </div>
              </div>

              <div className="flex space-x-2">
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View History
                </button>
                <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                  Schedule {tradeConfig.name} Service
                </button>
                <button className="text-slate-600 hover:text-slate-800 text-sm font-medium">
                  Edit
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