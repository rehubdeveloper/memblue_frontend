import React from 'react';
import { Calendar, DollarSign, Users, ClipboardList, AlertTriangle, TrendingUp, Wrench, MapPin } from 'lucide-react';
import { mockJobs, mockCustomers, mockInventory, mockBusiness } from '../../data/mockData';
import { tradeConfigs } from '../../data/tradeConfigs';

const DashboardOverview = () => {
  const tradeConfig = tradeConfigs[mockBusiness.primaryTrade];
  
  const todayJobs = mockJobs.filter(job => {
    const today = new Date();
    const jobDate = new Date(job.scheduledTime);
    return jobDate.toDateString() === today.toDateString();
  });

  const urgentJobs = mockJobs.filter(job => job.priority === 'urgent');
  const lowStockItems = mockInventory.filter(item => item.stockLevel <= item.reorderThreshold);
  const totalRevenue = mockCustomers.reduce((sum, customer) => sum + customer.totalRevenue, 0);

  const stats = [
    {
      title: "Today's Jobs",
      value: todayJobs.length,
      icon: Calendar,
      color: tradeConfig.color,
      change: '+2 from yesterday'
    },
    {
      title: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-green-500',
      change: '+12% this month'
    },
    {
      title: 'Active Customers',
      value: mockCustomers.length,
      icon: Users,
      color: 'bg-purple-500',
      change: '+3 this week'
    },
    {
      title: 'Open Jobs',
      value: mockJobs.filter(job => job.status !== 'completed').length,
      icon: ClipboardList,
      color: 'bg-orange-500',
      change: '2 overdue'
    }
  ];

  const memphisAreas = [
    { name: 'Midtown', jobs: 8, revenue: 4200 },
    { name: 'Downtown', jobs: 12, revenue: 8900 },
    { name: 'Germantown', jobs: 6, revenue: 5600 },
    { name: 'East Memphis', jobs: 4, revenue: 2800 }
  ];

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6 lg:mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <span className="text-2xl">{tradeConfig.icon}</span>
          <h1 className="text-xl lg:text-2xl font-bold text-slate-900">{tradeConfig.name} Dashboard</h1>
        </div>
        <p className="text-slate-600 text-sm lg:text-base">Welcome back! Here's what's happening with your Memphis operations today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg p-4 lg:p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-3 lg:mb-4">
                <div className={`p-2 lg:p-3 rounded-lg ${stat.color}`}>
                  <Icon className="text-white" size={16} />
                </div>
                <TrendingUp className="text-green-500" size={14} />
              </div>
              <div>
                <p className="text-lg lg:text-2xl font-bold text-slate-900 mb-1">{stat.value}</p>
                <p className="text-xs lg:text-sm text-slate-600 mb-1 lg:mb-2">{stat.title}</p>
                <p className="text-xs text-green-600">{stat.change}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
        {/* Today's Schedule */}
        <div className="bg-white rounded-lg p-4 lg:p-6 shadow-sm border border-slate-200">
          <h3 className="text-base lg:text-lg font-semibold text-slate-900 mb-4">Today's Schedule</h3>
          <div className="space-y-3">
            {todayJobs.length > 0 ? (
              todayJobs.slice(0, 4).map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <span className="text-base lg:text-lg">{tradeConfig.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900 text-sm lg:text-base truncate">{job.jobType}</p>
                      <p className="text-xs lg:text-sm text-slate-600 truncate">{job.location}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs lg:text-sm font-medium text-slate-900">
                      {new Date(job.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      job.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      job.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {job.status.replace('-', ' ')}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-center py-4 text-sm lg:text-base">No jobs scheduled for today</p>
            )}
          </div>
        </div>

        {/* Memphis Service Areas */}
        <div className="bg-white rounded-lg p-4 lg:p-6 shadow-sm border border-slate-200">
          <h3 className="text-base lg:text-lg font-semibold text-slate-900 mb-4">Memphis Service Areas</h3>
          <div className="space-y-3">
            {memphisAreas.map((area, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <MapPin className="text-blue-500 flex-shrink-0" size={16} />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900 text-sm lg:text-base">{area.name}</p>
                    <p className="text-xs lg:text-sm text-slate-600">{area.jobs} active jobs</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-semibold text-slate-900 text-sm lg:text-base">${area.revenue.toLocaleString()}</p>
                  <p className="text-xs lg:text-sm text-slate-600">this month</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts & Trade-Specific Insights */}
      <div className="bg-white rounded-lg p-4 lg:p-6 shadow-sm border border-slate-200">
        <h3 className="text-base lg:text-lg font-semibold text-slate-900 mb-4">Alerts & Trade Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {urgentJobs.length > 0 && (
            <div className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="text-red-500 mt-1 flex-shrink-0\" size={16} />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-red-900 text-sm lg:text-base">Urgent Jobs</p>
                <p className="text-xs lg:text-sm text-red-700">{urgentJobs.length} job(s) need immediate attention</p>
              </div>
            </div>
          )}
          
          {lowStockItems.length > 0 && (
            <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="text-yellow-500 mt-1 flex-shrink-0" size={16} />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-yellow-900 text-sm lg:text-base">Low Inventory</p>
                <p className="text-xs lg:text-sm text-yellow-700">{lowStockItems.length} {tradeConfig.name} item(s) need reordering</p>
              </div>
            </div>
          )}

          <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Wrench className="text-blue-500 mt-1 flex-shrink-0" size={16} />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-blue-900 text-sm lg:text-base">Seasonal Reminder</p>
              <p className="text-xs lg:text-sm text-blue-700">3 customers due for {tradeConfig.name.toLowerCase()} maintenance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;