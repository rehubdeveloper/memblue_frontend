import React, { useState } from 'react';
import { Plus, Search, Filter, MapPin, Clock, User, Phone, Wrench } from 'lucide-react';
import { mockJobs, mockCustomers, mockUsers, mockBusiness } from '../../data/mockData';
import { tradeConfigs } from '../../data/tradeConfigs';
import { Job } from '../../types';
import { useAuth } from '../../context/AppContext'

interface JobsListProps {
  onNewJob?: () => void;
}

const JobsList: React.FC<JobsListProps> = ({ onNewJob }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const tradeConfig = tradeConfigs[mockBusiness.primaryTrade];

  const filteredJobs = mockJobs.filter(job => {
    const customer = mockCustomers.find(c => c.id === job.customerId);
    const matchesSearch = job.jobType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer?.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || job.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: Job['status']) => {
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

  const getPriorityColor = (priority: Job['priority']) => {
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

  const { user } = useAuth();

  const capitalize = (str: any) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
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

        <button
          onClick={onNewJob}
          className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full sm:w-auto"
        >
          <Plus size={16} />
          <span>New {capitalize(user?.primary_trade)} Job</span>
        </button>
      </div>

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
          const customer = getCustomerInfo(job.customerId);
          const technician = getTechnicianInfo(job.assignedUserId);
          const memphisArea = getMemphisArea(job.location);

          return (
            <div key={job.id} className="bg-white rounded-lg p-4 lg:p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-4 gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-lg">{tradeConfig.icon}</span>
                    <h3 className="text-base lg:text-lg font-semibold text-slate-900">{job.jobType}</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}>
                      {job.status.replace('-', ' ')}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(job.priority)}`}>
                      {job.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-slate-600 mb-3 text-sm lg:text-base">{job.description}</p>

                  {/* Trade-specific data display */}
                  {renderTradeSpecificData(job)}
                </div>

                <div className="text-left lg:text-right flex-shrink-0">
                  <p className="text-sm text-slate-500">Job #{job.id.slice(-6)}</p>
                  <p className="text-sm text-slate-500">
                    Created {new Date(job.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <User className="text-slate-400 flex-shrink-0" size={16} />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900 text-sm lg:text-base truncate">{customer?.name || 'Unknown Customer'}</p>
                    <p className="text-xs lg:text-sm text-slate-600">{customer?.phone}</p>
                    {customer?.propertyType && (
                      <span className="inline-flex px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded-full">
                        {customer.propertyType}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <MapPin className="text-slate-400 flex-shrink-0" size={16} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-900">{memphisArea}</p>
                    <p className="text-xs text-slate-600 truncate">{job.location}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Clock className="text-slate-400 flex-shrink-0" size={16} />
                  <div>
                    <p className="text-sm text-slate-900">
                      {new Date(job.scheduledTime).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-slate-600">
                      {new Date(job.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-2">
                  {technician ? (
                    <>
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-semibold">{technician.name.charAt(0)}</span>
                      </div>
                      <span className="text-sm text-slate-700">Assigned to {technician.name.split(' ')[0]}</span>
                    </>
                  ) : (
                    <span className="text-sm text-slate-500">Unassigned</span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 rounded border border-blue-200 hover:bg-blue-50">
                    View Details
                  </button>
                  <button className="text-slate-600 hover:text-slate-800 text-sm font-medium px-3 py-1 rounded border border-slate-200 hover:bg-slate-50">
                    Edit
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              {job.checklist.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">Progress</span>
                    <span className="text-sm text-slate-600">
                      {job.checklist.filter(item => item.completed).length} / {job.checklist.length} tasks
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${(job.checklist.filter(item => item.completed).length / job.checklist.length) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <Wrench className="mx-auto text-slate-400 mb-4" size={48} />
          <p className="text-slate-500 text-lg mb-4">No {tradeConfig.name.toLowerCase()} work orders found</p>
          <p className="text-slate-400">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default JobsList;