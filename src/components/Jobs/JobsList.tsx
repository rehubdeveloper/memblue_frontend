import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, MapPin, Clock, User, Phone, Wrench } from 'lucide-react';
import { mockJobs, mockCustomers, mockUsers, mockBusiness } from '../../data/mockData';
import { tradeConfigs } from '../../data/tradeConfigs';
import { Job } from '../../types';
import { useAuth } from '../../context/AppContext';

interface JobsListProps {
  onNewJob?: () => void;
}

const statusOptions = [
  'pending',
  'confirmed',
  'en_route',
  'in_progress',
  'completed',
  'cancelled',
];

const priorityOptions = ['low', 'medium', 'high'];

interface NewJobDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: any) => Promise<any>;
}

const NewJobDialog: React.FC<NewJobDialogProps> = ({ open, onClose, onSubmit }) => {
  const { customers, teamMembers, user } = useAuth();
  const [form, setForm] = useState({
    customer_id: 0,
    job_type: '',
    description: '',
    status: 'pending',
    priority: 'low',
    tags: '',
    scheduled_for: '',
    assigned_to: '',
    progress_current: '',
    progress_total: '',
    amount: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        customer: parseInt(form.customer_id.toString()),
        job_type: form.job_type,
        description: form.description,
        status: form.status,
        priority: form.priority,
        tags: form.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        scheduled_for: form.scheduled_for,
        assigned_to: user?.role === 'solo' ? user.id : Number(form.assigned_to),
        progress_current: Number(form.progress_current),
        progress_total: Number(form.progress_total),
        amount: Number(form.amount),
        address: form.address,
        primary_trade: user?.primary_trade,
        owner: user?.id,
      };
      console.log(payload)
      await onSubmit(payload);
      setForm({
        customer_id: 0,
        job_type: '',
        description: '',
        status: 'pending',
        priority: 'low',
        tags: '',
        scheduled_for: '',
        assigned_to: '',
        progress_current: '',
        progress_total: '',
        amount: '',
        address: '',
      });
      onClose();
    } catch (err) {
      // Error handled by context
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Create Work Order</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Customer and Job Type */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                <select
                  name="customer_id"
                  value={form.customer_id}
                  onChange={(e) => {
                    setForm((prev: any) => ({
                      ...prev,
                      customer_id: parseInt(e.target.value) || 0,
                    }));
                  }}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">Select Customer</option>
                  {customers && customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                <input
                  name="job_type"
                  value={form.job_type}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="e.g., Maintenance, Repair, Installation"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={form.description}
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
                  value={form.status}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  {statusOptions.map(opt => (
                    <option key={opt} value={opt}>{opt.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  {priorityOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
              <input
                name="tags"
                value={form.tags}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="e.g., System: 1yr old, SEER: 20, R-410A"
              />
            </div>

            {/* Schedule and Assignment */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled For</label>
                <input
                  type="datetime-local"
                  name="scheduled_for"
                  value={form.scheduled_for}
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
                    value={form.assigned_to}
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
                  value={form.progress_current}
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
                  value={form.progress_total}
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
                  value={form.amount}
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
                  value={form.address}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Job location address"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 sm:flex-none px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                    Creating...
                  </div>
                ) : (
                  'Create Work Order'
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const JobsList: React.FC<JobsListProps> = ({ onNewJob }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const { workOrders, getWorkOrders, user, createWorkOrder, updateWorkOrder, deleteWorkOrder, teamMembers, getTeamMembers, customers, getCustomers } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsJob, setDetailsJob] = useState<null | any>(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<any>({});

  useEffect(() => {
    getWorkOrders();
    getTeamMembers();
    getCustomers();
  }, []);

  const tradeConfig = tradeConfigs[user?.primary_trade || 'hvac'] || tradeConfigs['hvac'];

  // Check if user can create jobs
  const canCreateJobs = user?.role === 'admin' ||
    user?.role === 'solo' ||
    (user?.role === 'member' && user?.can_create_jobs === true);

  // Check if user can edit/delete this job
  const canEditJob = (job: any) => {
    // Anyone can edit jobs
    return true;
  };

  const canDeleteJob = (job: any) => {
    // Only admin and solo can delete jobs
    return user?.role === 'admin' || user?.role === 'solo';
  };

  const filteredJobs = (workOrders || []).filter(job => {
    const matchesSearch = job.job_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.customer_name && job.customer_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || job.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const capitalize = (str: any) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'en-route': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-600';
      case 'medium': return 'bg-blue-100 text-blue-600';
      case 'high': return 'bg-orange-100 text-orange-600';
      case 'urgent': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getCustomerInfo = (customerId: string) => {
    return mockCustomers.find(c => c.id === customerId);
  };

  const getTechnicianInfo = (userId?: string) => {
    if (!userId) return null;
    return mockUsers.find(u => u.id === userId);
  };

  const getMemphisArea = (address: string) => {
    if (address.includes('Poplar')) return 'Midtown/East Memphis';
    if (address.includes('Main') || address.includes('Beale')) return 'Downtown';
    if (address.includes('Germantown')) return 'Germantown';
    return 'Memphis Metro';
  };

  const renderTradeSpecificData = (job: Job) => {
    if (!job.tradeSpecificData) return null;

    switch (mockBusiness.primaryTrade) {
      case 'hvac':
        return (
          <div className="flex flex-wrap gap-2 mb-3 text-xs">
            {job.tradeSpecificData.systemAge && (
              <span className="px-2 py-1 bg-red-50 text-red-700 rounded">
                System: {job.tradeSpecificData.systemAge}yr old
              </span>
            )}
            {job.tradeSpecificData.seerRating && (
              <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">
                SEER: {job.tradeSpecificData.seerRating}
              </span>
            )}
            {job.tradeSpecificData.refrigerantType && (
              <span className="px-2 py-1 bg-green-50 text-green-700 rounded">
                {job.tradeSpecificData.refrigerantType}
              </span>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const handleJobCreated = async (payload: any) => {
    await createWorkOrder(payload);
    await getWorkOrders();
  };

  const handleViewDetails = (job: any) => {
    setDetailsJob(job);
    setEditForm({
      status: job.status,
      progress_current: job.progress_current,
      progress_total: job.progress_total,
      amount: job.amount,
      priority: job.priority,
      description: job.description
    });
    setEditMode(false);
  };

  const handleCloseDetails = () => {
    setDetailsJob(null);
    setEditMode(false);
    setEditForm({});
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleSaveEdit = async () => {
    try {
      await updateWorkOrder(detailsJob.id, editForm);
      setEditMode(false);
      handleCloseDetails();
    } catch (error) {
      // Error handled by context
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this work order?')) {
      try {
        await deleteWorkOrder(detailsJob.id);
        handleCloseDetails();
      } catch (error) {
        // Error handled by context
      }
    }
  };

  const handleEditFormChange = (field: string, value: any) => {
    setEditForm((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 lg:mb-6 gap-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{tradeConfig.icon}</span>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-slate-900">{capitalize(user?.primary_trade)} Work Orders</h1>
            <p className="text-slate-600 text-sm lg:text-base">Manage and track all {user?.primary_trade.toLowerCase()} service jobs</p>
          </div>
        </div>

        {canCreateJobs && (
          <button
            onClick={() => setDialogOpen(true)}
            className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full sm:w-auto"
          >
            <Plus size={16} />
            <span>New {capitalize(user?.primary_trade)} Job</span>
          </button>
        )}
      </div>
      <NewJobDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSubmit={createWorkOrder} />

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 mb-4 lg:mb-6 shadow-sm border border-slate-200">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search jobs, customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="en-route">En Route</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid gap-4">
        {filteredJobs.map((job) => {
          // const customer = getCustomerInfo(job.customerId); // Remove mock
          // const technician = getTechnicianInfo(job.assignedUserId); // Remove mock
          // const memphisArea = getMemphisArea(job.location); // Remove mock

          return (
            <div key={job.id} className="bg-white rounded-lg p-4 lg:p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-4 gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-lg">{tradeConfig.icon}</span>
                    <h3 className="text-base lg:text-lg font-semibold text-slate-900">{job.job_type}</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}>
                      {job.status.replace('-', ' ')}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(job.priority)}`}>
                      {job.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-slate-600 mb-3 text-sm lg:text-base">{job.description}</p>
                  {/* Trade-specific data display: skip for now, as real jobs may not have tradeSpecificData */}
                </div>
                <div className="text-left lg:text-right flex-shrink-0">
                  <p className="text-sm text-slate-500">Job #{job.job_number}</p>
                  <p className="text-sm text-slate-500">
                    Created {new Date(job.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <User className="text-slate-400 flex-shrink-0" size={16} />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900 text-sm lg:text-base truncate">
                      {(() => {
                        const customer = customers?.find((c: any) => c.id === job.customer);
                        return customer ? customer.name : (job.customer_name && job.customer_name.trim() !== '' ? job.customer_name : 'Unknown Customer');
                      })()}
                    </p>
                    <p className="text-xs text-slate-600 truncate">Customer</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="text-slate-400 flex-shrink-0" size={16} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-900 truncate">
                      {job.address && job.address.trim() !== '' ? job.address : 'No address'}
                    </p>
                    <p className="text-xs text-slate-600 truncate">Location</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Wrench className="text-slate-400 flex-shrink-0" size={16} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-900 truncate">
                      {job.assigned_to ? (() => {
                        const member = teamMembers?.find((m: any) => m.id === job.assigned_to);
                        return member ? `${member.first_name} ${member.last_name}` : `Member ${job.assigned_to}`;
                      })() : 'Unassigned'}
                    </p>
                    <p className="text-xs text-slate-600 truncate">Assigned To</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <Clock className="text-slate-400 flex-shrink-0" size={16} />
                  <div>
                    <p className="text-sm text-slate-900">
                      {new Date(job.scheduled_for).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-slate-600">
                      {new Date(job.scheduled_for).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 rounded border border-blue-200 hover:bg-blue-50"
                    onClick={() => handleViewDetails(job)}
                  >
                    View Details
                  </button>
                  {canEditJob(job) && (
                    <button
                      className="text-slate-600 hover:text-slate-800 text-sm font-medium px-3 py-1 rounded border border-slate-200 hover:bg-slate-50"
                      onClick={() => handleViewDetails(job)}
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>
              {/* Progress Bar */}
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">Progress</span>
                  <span className="text-sm text-slate-600">
                    {job.progress_total ? `${job.progress_current} / ${job.progress_total} tasks` : '0 / 0 tasks'}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${(job.progress_total ? (job.progress_current / job.progress_total) * 100 : 0)}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <Wrench className="mx-auto text-slate-400 mb-4" size={48} />
          <p className="text-slate-500 text-lg mb-4">No {tradeConfig.name?.toLowerCase()} work orders found</p>
          <p className="text-slate-400">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Modern Job Details Modal */}
      {detailsJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4" onClick={handleCloseDetails}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto relative" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 rounded-t-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{detailsJob.job_type}</h2>
                  <p className="text-gray-600 text-sm sm:text-base">{detailsJob.job_number}</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                  {canEditJob(detailsJob) && (
                    <>
                      {editMode ? (
                        <>
                          <button
                            onClick={handleSaveEdit}
                            className="flex-1 sm:flex-none px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditMode(false)}
                            className="flex-1 sm:flex-none px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={handleEdit}
                          className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                        >
                          Edit
                        </button>
                      )}
                    </>
                  )}
                  {canDeleteJob(detailsJob) && (
                    <button
                      onClick={handleDelete}
                      className="flex-1 sm:flex-none px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
                    >
                      Delete
                    </button>
                  )}
                  <button onClick={handleCloseDetails} className="text-gray-400 hover:text-gray-600 transition-colors p-1 self-end">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Description */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                    {editMode ? (
                      <textarea
                        value={editForm.description}
                        onChange={(e) => handleEditFormChange('description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                        rows={4}
                      />
                    ) : (
                      <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{detailsJob.description}</p>
                    )}
                  </div>

                  {/* Status and Priority */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Status</h3>
                      {editMode ? (
                        <select
                          value={editForm.status}
                          onChange={(e) => handleEditFormChange('status', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        >
                          {statusOptions.map(opt => (
                            <option key={opt} value={opt}>{opt.replace('_', ' ')}</option>
                          ))}
                        </select>
                      ) : (
                        <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(detailsJob.status)}`}>
                          {detailsJob.status.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Priority</h3>
                      {editMode ? (
                        <select
                          value={editForm.priority}
                          onChange={(e) => handleEditFormChange('priority', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        >
                          {priorityOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : (
                        <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getPriorityColor(detailsJob.priority)}`}>
                          {detailsJob.priority.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Progress</h3>
                    {editMode ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Current</label>
                          <input
                            type="number"
                            value={editForm.progress_current}
                            onChange={(e) => handleEditFormChange('progress_current', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
                          <input
                            type="number"
                            value={editForm.progress_total}
                            onChange={(e) => handleEditFormChange('progress_total', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            min="1"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{detailsJob.progress_current} / {detailsJob.progress_total}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{
                              width: `${(detailsJob.progress_total ? (detailsJob.progress_current / detailsJob.progress_total) * 100 : 0)}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Amount */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Amount</h3>
                    {editMode ? (
                      <input
                        type="number"
                        value={editForm.amount}
                        onChange={(e) => handleEditFormChange('amount', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        step="0.01"
                        min="0"
                      />
                    ) : (
                      <p className="text-2xl font-bold text-green-600">${parseFloat(detailsJob.amount).toFixed(2)}</p>
                    )}
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Customer Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-medium text-gray-900">{detailsJob.customer_name}</p>
                      <p className="text-gray-600">Customer ID: {detailsJob.customer}</p>
                    </div>
                  </div>

                  {/* Schedule */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Schedule</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-900">
                        <span className="font-medium">Scheduled For:</span><br />
                        {new Date(detailsJob.scheduled_for).toLocaleDateString()} at {new Date(detailsJob.scheduled_for).toLocaleTimeString()}
                      </p>
                      <p className="text-gray-600 mt-2">
                        <span className="font-medium">Created:</span><br />
                        {new Date(detailsJob.created_at).toLocaleDateString()} at {new Date(detailsJob.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Location</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700">{detailsJob.address}</p>
                    </div>
                  </div>

                  {/* Tags */}
                  {detailsJob.tags && detailsJob.tags.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {detailsJob.tags.map((tag: string, index: number) => (
                          <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobsList;