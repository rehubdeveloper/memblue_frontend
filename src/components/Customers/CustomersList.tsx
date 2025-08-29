import React, { useState, useEffect } from 'react';
import { Plus, Search, Phone, Mail, MapPin, Tag, Calendar, Home, Building, Users as UsersIcon, Edit, Trash2, X, Clock, DollarSign, MessageSquare, Settings } from 'lucide-react';
import { mockCustomers, mockBusiness } from '../../data/mockData';
import { tradeConfigs } from '../../data/tradeConfigs';
import { Customer, CustomerFormData } from '../../types';
import { useAuth } from '../../context/AppContext';
import InterviewJobForm from '../Jobs/InterviewJobForm';

const CustomersList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [propertyFilter, setPropertyFilter] = useState<string>('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerFormData | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showJobHistoryModal, setShowJobHistoryModal] = useState(false);
  const [showCreateJobModal, setShowCreateJobModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerFormData | null>(null);
  const [showFormOptions, setShowFormOptions] = useState(false);
  const [interviewFormOpen, setInterviewFormOpen] = useState(false);

  const { customers, user, createCustomer, updateCustomer, deleteCustomer, getCustomers, getWorkOrders, createWorkOrder, notifyCustomerCreated, notifyCustomerUpdated, notifyCustomerDeleted, notifyJobCreated } = useAuth();

  // Data is now loaded once in the context, no need to fetch here
  // useEffect(() => {
  //   if (!customers || customers.length === 0) {
  //     getCustomers && getCustomers();
  //   }
  // }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.form-options-dropdown')) {
        setShowFormOptions(false);
      }
    };

    if (showFormOptions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFormOptions]);

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
      const customer = customers?.find(c => c.id === customerId);
      const customerName = customer?.name || 'Unknown Customer';
      
      const success = await deleteCustomer(customerId);
      if (success) {
        notifyCustomerDeleted(customerName);
        setShowDeleteConfirm(null);
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  const handleViewJobHistory = (customer: CustomerFormData) => {
    setSelectedCustomer(customer);
    setShowJobHistoryModal(true);
  };

  const handleCreateJob = (customer: CustomerFormData) => {
    setSelectedCustomer(customer);
    setShowFormOptions(!showFormOptions);
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
          notifyCustomerUpdated(formData.name);
        } else {
          // Create new customer
          const result = await createCustomer(formData);
          notifyCustomerCreated(formData.name);
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

  const JobHistoryModal = () => {
    if (!selectedCustomer) return null;

    const [jobHistory, setJobHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch job history for the selected customer
    useEffect(() => {
      const fetchJobHistory = async () => {
        if (!selectedCustomer?.id) return;
        
        setLoading(true);
        setError(null);
        
        try {
          const response = await fetch(`${import.meta.env.VITE_BASE_URL}/customers/${selectedCustomer.id}/jobs/`, {
            method: 'GET',
            headers: {
              'Authorization': `Token ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            setJobHistory(data);
          } else {
            setError('Failed to fetch job history');
          }
        } catch (error) {
          console.error('Error fetching job history:', error);
          setError('Error loading job history');
        } finally {
          setLoading(false);
        }
      };

      fetchJobHistory();
    }, [selectedCustomer?.id]);

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'completed': return 'bg-green-100 text-green-800';
        case 'in_progress': return 'bg-blue-100 text-blue-800';
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        case 'cancelled': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-4 sm:p-6 border-b">
            <h2 className="text-lg sm:text-xl font-semibold">
              Job History - {selectedCustomer.name}
            </h2>
            <button
              onClick={() => setShowJobHistoryModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="p-4 sm:p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading job history...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="text-red-500 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg mb-2">Error loading job history</p>
                <p className="text-gray-400 text-sm">{error}</p>
              </div>
            ) : jobHistory.length > 0 ? (
              <div className="space-y-4">
                {jobHistory.map((job) => (
                  <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{job.job_type}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                            {job.status.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-gray-500 font-mono">#{job.job_number}</span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{job.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock size={14} />
                            <span>{new Date(job.scheduled_for).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSign size={14} />
                            <span>${job.amount}</span>
                          </div>
                          {job.progress_total > 0 && (
                            <div className="flex items-center space-x-1">
                              <span className="text-xs">Progress: {job.progress_current}/{job.progress_total}</span>
                            </div>
                          )}
                        </div>
                        {job.tags && job.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {job.tags.map((tag: string, index: number) => (
                              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500 text-lg mb-2">No job history found</p>
                <p className="text-gray-400 text-sm">This customer hasn't had any jobs yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const CreateJobModal = () => {
    if (!selectedCustomer) return null;

    const { teamMembers, user } = useAuth();

    const [formData, setFormData] = useState({
      job_type: '',
      description: '',
      status: 'pending',
      priority: 'low',
      tags: '',
      scheduled_for: '',
      assigned_to: '',
      progress_current: '0',
      progress_total: '1',
      amount: '',
      address: selectedCustomer.address || '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      try {
        // Create job data
        const jobData = {
          customer: selectedCustomer.id,
          job_type: formData.job_type,
          description: formData.description,
          status: formData.status,
          priority: formData.priority,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          scheduled_for: formData.scheduled_for,
          assigned_to: user?.role === 'solo' ? user.id : Number(formData.assigned_to),
          progress_current: Number(formData.progress_current),
          progress_total: Number(formData.progress_total),
          amount: Number(formData.amount),
          address: formData.address,
          primary_trade: user?.primary_trade,
          owner: user?.id,
        };

        // Call the actual API to create the job
        const success = await createWorkOrder(jobData);
        
        if (success) {
          // Show success notification
          notifyJobCreated(formData.job_type);
          
          // Refresh customers data to update job counts
          await getCustomers(true);
          // Also refresh work orders to ensure everything is updated
          await getWorkOrders(true);
          
          // Close the modal and reset form
          setShowCreateJobModal(false);
          setSelectedCustomer(null);
          setFormData({
            job_type: '',
            description: '',
            status: 'pending',
            priority: 'low',
            tags: '',
            scheduled_for: '',
            assigned_to: '',
            progress_current: '0',
            progress_total: '1',
            amount: '',
            address: selectedCustomer.address || '',
          });
        }
        
      } catch (error) {
        console.error('Error creating job:', error);
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleClose = () => {
      setShowCreateJobModal(false);
      setSelectedCustomer(null);
      setFormData({
        job_type: '',
        description: '',
        status: 'pending',
        priority: 'low',
        tags: '',
        scheduled_for: '',
        assigned_to: '',
        progress_current: '0',
        progress_total: '1',
        amount: '',
        address: selectedCustomer.address || '',
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-4 sm:p-6 border-b">
            <h2 className="text-lg sm:text-xl font-semibold">
              Create New Job - {selectedCustomer.name}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
            {/* Job Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Job Details</h3>
              
              {/* Customer and Job Type */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                  <input
                    type="text"
                    value={selectedCustomer.name}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Type *</label>
                  <input
                    name="job_type"
                    value={formData.job_type}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="e.g., Maintenance, Repair, Installation"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  placeholder="Describe the work to be performed..."
                />
              </div>

              {/* Status and Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="pending">pending</option>
                    <option value="confirmed">confirmed</option>
                    <option value="in_progress">in_progress</option>
                    <option value="completed">completed</option>
                    <option value="cancelled">cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="low">low</option>
                    <option value="medium">medium</option>
                    <option value="high">high</option>
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                <input
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="e.g., System: 1yr old, SEER: 20, R-410A"
                />
              </div>

              {/* Schedule and Assignment */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled For *</label>
                  <input
                    type="datetime-local"
                    name="scheduled_for"
                    value={formData.scheduled_for}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                {user?.role === 'admin' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                    <select
                      name="assigned_to"
                      value={formData.assigned_to}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="">Unassigned</option>
                      {teamMembers && teamMembers.map(member => (
                        <option key={member.id} value={member.id}>{member.first_name} {member.last_name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Progress */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Progress Current</label>
                  <input
                    type="number"
                    name="progress_current"
                    value={formData.progress_current}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Progress Total</label>
                  <input
                    type="number"
                    name="progress_total"
                    value={formData.progress_total}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="1"
                  />
                </div>
              </div>

              {/* Amount and Address */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Job location address"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm sm:text-base"
              >
                {isSubmitting ? 'Creating...' : 'Create Job'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

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

      {showJobHistoryModal && <JobHistoryModal />}
      {showCreateJobModal && <CreateJobModal />}
      <InterviewJobForm 
        isOpen={interviewFormOpen} 
        onClose={() => setInterviewFormOpen(false)}
        customerId={selectedCustomer?.id ? Number(selectedCustomer.id) : undefined}
        customerName={selectedCustomer?.name}
        customerAddress={selectedCustomer?.address}
      />

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
                  <p className="text-lg font-semibold text-slate-900">{customer.jobs_count || customer.job_count || 0}</p>
                  <p className="text-sm text-slate-600">Total Jobs</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                <button 
                  onClick={() => handleViewJobHistory(customer)}
                  className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium px-2 py-1"
                >
                  View History
                </button>
                <div className="relative">
                  <button 
                    onClick={() => handleCreateJob(customer)}
                    className="text-green-600 hover:text-green-800 text-xs sm:text-sm font-medium px-2 py-1"
                  >
                    Create Job
                  </button>
                  
                  {/* Form Options Dropdown */}
                  {showFormOptions && selectedCustomer?.id === customer.id && (
                    <div className="form-options-dropdown absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                      <div className="p-2">
                        <button
                          onClick={() => {
                            setInterviewFormOpen(true);
                            setShowFormOptions(false);
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
                            setShowCreateJobModal(true);
                            setShowFormOptions(false);
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