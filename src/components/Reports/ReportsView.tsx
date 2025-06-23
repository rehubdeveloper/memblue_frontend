import React, { useState } from 'react';
import { BarChart3, TrendingUp, DollarSign, Users, Calendar, Download } from 'lucide-react';
import { mockJobs, mockCustomers, mockInventory } from '../../data/mockData';

const ReportsView = () => {
  const [dateRange, setDateRange] = useState('30');

  // Calculate metrics
  const totalJobs = mockJobs.length;
  const completedJobs = mockJobs.filter(job => job.status === 'completed').length;
  const totalRevenue = mockCustomers.reduce((sum, customer) => sum + customer.totalRevenue, 0);
  const averageJobValue = totalRevenue / totalJobs;

  const jobsByStatus = mockJobs.reduce((acc, job) => {
    acc[job.status] = (acc[job.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const jobsByType = mockJobs.reduce((acc, job) => {
    acc[job.jobType] = (acc[job.jobType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCustomers = mockCustomers
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 5);

  const lowStockItems = mockInventory
    .filter(item => item.stockLevel <= item.reorderThreshold)
    .length;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
          <p className="text-slate-600">Business insights and performance metrics</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          
          <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            <Download size={16} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-500">
              <BarChart3 className="text-white" size={20} />
            </div>
            <TrendingUp className="text-green-500" size={16} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 mb-1">{totalJobs}</p>
            <p className="text-sm text-slate-600 mb-2">Total Jobs</p>
            <p className="text-xs text-green-600">+15% from last month</p>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-500">
              <DollarSign className="text-white" size={20} />
            </div>
            <TrendingUp className="text-green-500" size={16} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 mb-1">${totalRevenue.toLocaleString()}</p>
            <p className="text-sm text-slate-600 mb-2">Total Revenue</p>
            <p className="text-xs text-green-600">+22% from last month</p>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-purple-500">
              <Users className="text-white" size={20} />
            </div>
            <TrendingUp className="text-green-500" size={16} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 mb-1">{mockCustomers.length}</p>
            <p className="text-sm text-slate-600 mb-2">Active Customers</p>
            <p className="text-xs text-green-600">+8% from last month</p>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-orange-500">
              <Calendar className="text-white" size={20} />
            </div>
            <TrendingUp className="text-green-500" size={16} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 mb-1">${averageJobValue.toFixed(0)}</p>
            <p className="text-sm text-slate-600 mb-2">Avg Job Value</p>
            <p className="text-xs text-green-600">+5% from last month</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Job Status Distribution */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Job Status Distribution</h3>
          <div className="space-y-3">
            {Object.entries(jobsByStatus).map(([status, count]) => {
              const percentage = (count / totalJobs) * 100;
              return (
                <div key={status}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-slate-700 capitalize">
                      {status.replace('-', ' ')}
                    </span>
                    <span className="text-sm text-slate-600">{count} ({percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Job Types */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Job Types</h3>
          <div className="space-y-3">
            {Object.entries(jobsByType).map(([type, count]) => {
              const percentage = (count / totalJobs) * 100;
              return (
                <div key={type}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-slate-700">{type}</span>
                    <span className="text-sm text-slate-600">{count} ({percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Customers */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Top Customers by Revenue</h3>
          <div className="space-y-3">
            {topCustomers.map((customer, index) => (
              <div key={customer.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full text-sm font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{customer.name}</p>
                    <p className="text-sm text-slate-600">{customer.jobCount} jobs</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900">${customer.totalRevenue.toLocaleString()}</p>
                  <p className="text-sm text-slate-600">
                    ${(customer.totalRevenue / customer.jobCount).toFixed(0)} avg
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Alerts */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Inventory Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
              <div>
                <p className="font-medium text-red-900">Low Stock Items</p>
                <p className="text-sm text-red-700">{lowStockItems} items need reordering</p>
              </div>
              <div className="text-2xl font-bold text-red-600">{lowStockItems}</div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div>
                <p className="font-medium text-green-900">Total Inventory Value</p>
                <p className="text-sm text-green-700">Current stock valuation</p>
              </div>
              <div className="text-2xl font-bold text-green-600">
                ${mockInventory.reduce((sum, item) => sum + (item.stockLevel * item.costPerUnit), 0).toLocaleString()}
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div>
                <p className="font-medium text-blue-900">Total Items</p>
                <p className="text-sm text-blue-700">Unique inventory items</p>
              </div>
              <div className="text-2xl font-bold text-blue-600">{mockInventory.length}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsView;