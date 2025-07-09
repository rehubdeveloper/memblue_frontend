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
    setForm(prev => ({ ...prev, [name]: value }));
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
        assigned_to: Number(form.assigned_to),
        progress_current: Number(form.progress_current),
        progress_total: Number(form.progress_total),
        amount: Number(form.amount),
        address: form.address,
        primary_trade: user?.primary_trade,
        owner: user?.id,
      };
      await onSubmit(payload);
      console.log('job created successfully')
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Create Work Order</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                <select
                  name="customer_id"
                  value={form.customer_id}
                  onChange={(e) => {
                    setForm(prev => ({
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                <select
                  name="assigned_to"
                  value={form.assigned_to}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">Select Team Member</option>
                  {teamMembers && teamMembers.map(tm => (
                    <option key={tm.id} value={tm.id}>{tm.first_name} {tm.last_name} ({tm.username})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Progress Current</label>
                <input
                  type="number"
                  name="progress_current"
                  value={form.progress_current}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Progress Total</label>
                <input
                  type="number"
                  name="progress_total"
                  value={form.progress_total}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Full address of the job location"
              />
            </div>
          </form>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-xl">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating...' : 'Create Work Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const JobsList: React.FC<JobsListProps> = ({ onNewJob }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const { workOrders, getWorkOrders, user, createWorkOrder } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsJob, setDetailsJob] = useState<null | any>(null);

  useEffect(() => {
    getWorkOrders();
  }, []);

  const tradeConfig = tradeConfigs[user?.primary_trade || 'hvac'] || tradeConfigs['hvac'];

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

  const handleViewDetails = (job: any) => setDetailsJob(job);
  const handleCloseDetails = () => setDetailsJob(null);

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

        <button
          onClick={() => setDialogOpen(true)}
          className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full sm:w-auto"
        >
          <Plus size={16} />
          <span>New {capitalize(user?.primary_trade)} Job</span>
        </button>
      </div>
      <NewJobDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSubmit={handleJobCreated} />

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
                    <p className="font-medium text-slate-900 text-sm lg:text-base truncate">{job.customer_name || 'Unknown Customer'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="text-slate-400 flex-shrink-0" size={16} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-900">N/A</p>
                    <p className="text-xs text-slate-600 truncate">N/A</p>
                  </div>
                </div>
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
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-2">
                  {job.assigned_to ? (
                    <>
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-semibold">{typeof job.assigned_to === 'string' ? job.assigned_to.charAt(0) : ''}</span>
                      </div>
                      <span className="text-sm text-slate-700">Assigned to {job.assigned_to || 'N/A'}</span>
                    </>
                  ) : (
                    <span className="text-sm text-slate-500">Unassigned</span>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 rounded border border-blue-200 hover:bg-blue-50" onClick={() => handleViewDetails(job)}>
                    View Details
                  </button>
                  <button className="text-slate-600 hover:text-slate-800 text-sm font-medium px-3 py-1 rounded border border-slate-200 hover:bg-slate-50">
                    Edit
                  </button>
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

      {/* Job Details Modal */}
      {detailsJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={handleCloseDetails}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative" onClick={e => e.stopPropagation()}>
            <button onClick={handleCloseDetails} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors p-1">&times;</button>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-2">{detailsJob.job_type} ({detailsJob.job_number})</h2>
              <p className="mb-2 text-gray-700">{detailsJob.description}</p>
              <div className="mb-2"><span className="font-semibold">Status:</span> {detailsJob.status}</div>
              <div className="mb-2"><span className="font-semibold">Priority:</span> {detailsJob.priority}</div>
              <div className="mb-2"><span className="font-semibold">Customer:</span> {detailsJob.customer_name}</div>
              <div className="mb-2"><span className="font-semibold">Scheduled For:</span> {new Date(detailsJob.scheduled_for).toLocaleString()}</div>
              <div className="mb-2"><span className="font-semibold">Created At:</span> {new Date(detailsJob.created_at).toLocaleString()}</div>
              <div className="mb-2"><span className="font-semibold">Progress:</span> {detailsJob.progress_current} / {detailsJob.progress_total}</div>
              <div className="mb-2"><span className="font-semibold">Amount:</span> ${detailsJob.amount}</div>
              <div className="mb-2"><span className="font-semibold">Tags:</span> {detailsJob.tags && detailsJob.tags.join(', ')}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobsList;