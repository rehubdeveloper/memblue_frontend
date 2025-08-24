import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, Users, Calendar, Download, AlertTriangle, Clock, MapPin, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AppContext';
import { format, subDays, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';

const ReportsView = () => {
  const { 
    getDashboardMetrics, 
    dashboardMetrics, 
    workOrders, 
    customers, 
    inventoryList, 
    user,
    getWorkOrders,
    getCustomers,
    getInventory
  } = useAuth();
  
  const [dateRange, setDateRange] = useState('30');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [hasInitialized, setHasInitialized] = useState(false);

  // Check if user is admin
  const isAdmin = user?.role === 'admin';
  const isTeamMember = user?.role === 'member';

  console.log('ReportsView Debug:', {
    user,
    isAdmin,
    isTeamMember,
    dashboardMetrics,
    workOrders: workOrders?.length,
    customers: customers?.length,
    inventoryList: inventoryList?.length,
    loading
  });

  // Fetch all data for reports
  useEffect(() => {
    const fetchReportData = async () => {
      // Only fetch data once when component initializes
      if (hasInitialized) return;
      
      setLoading(true);
      setError(null);
      try {
        console.log('Fetching report data...');
        
        // Fetch data sequentially to avoid overwhelming the API
        await getWorkOrders();
        await getCustomers();
        await getInventory();
        
        // Only fetch dashboard metrics if user is admin
        if (user?.role === 'admin') {
          await getDashboardMetrics();
        }
        
        console.log('Report data fetched successfully');
        setHasInitialized(true);
      } catch (error) {
        console.error('Error fetching report data:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch report data');
      } finally {
        setLoading(false);
      }
    };

    if (user && !hasInitialized) {
      fetchReportData();
    }
  }, [user, hasInitialized]); // Only depend on user and initialization state

  // Calculate additional metrics from work orders
  const calculateWorkOrderMetrics = () => {
    if (!workOrders || workOrders.length === 0) {
      return {
        totalJobs: 0,
        completedJobs: 0,
        totalRevenue: 0,
        averageJobValue: 0,
        jobsByStatus: {},
        jobsByType: {},
        jobsInRange: 0,
        revenueInRange: 0
      };
    }
    
    const totalJobs = workOrders.length;
    const completedJobs = workOrders.filter(job => job.status === 'completed').length;
    const totalRevenue = workOrders.reduce((sum, job) => sum + parseFloat(job.amount || '0'), 0);
    const averageJobValue = totalJobs > 0 ? totalRevenue / totalJobs : 0;

    // Jobs by status
    const jobsByStatus = workOrders.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Jobs by type
    const jobsByType = workOrders.reduce((acc, job) => {
      acc[job.job_type] = (acc[job.job_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate date range metrics
    const daysAgo = parseInt(dateRange);
    const startDate = subDays(new Date(), daysAgo);
    const endDate = new Date();
    
    const jobsInRange = workOrders.filter(job => {
      const jobDate = new Date(job.created_at);
      return isWithinInterval(jobDate, { start: startDate, end: endDate });
    });

    const revenueInRange = jobsInRange.reduce((sum, job) => 
      sum + parseFloat(job.amount || '0'), 0
    );

    return {
      totalJobs,
      completedJobs,
      totalRevenue,
      averageJobValue,
      jobsByStatus,
      jobsByType,
      jobsInRange: jobsInRange.length,
      revenueInRange
    };
  };

  // Calculate customer metrics
  const calculateCustomerMetrics = () => {
    if (!customers || customers.length === 0) {
      return {
        totalCustomers: 0,
        customersWithJobs: 0,
        topCustomers: []
      };
    }
    
    const totalCustomers = customers.length;
    const customersWithJobs = customers.filter(customer => 
      workOrders?.some(job => job.customer === customer.id)
    ).length;
    
    // Top customers by revenue
    const customerRevenue = customers.map(customer => {
      const customerJobs = workOrders?.filter(job => job.customer === customer.id) || [];
      const revenue = customerJobs.reduce((sum, job) => 
        sum + parseFloat(job.amount || '0'), 0
      );
      return {
        ...customer,
        revenue,
        jobCount: customerJobs.length
      };
    }).sort((a, b) => b.revenue - a.revenue);

    return {
      totalCustomers,
      customersWithJobs,
      topCustomers: customerRevenue.slice(0, 5)
    };
  };

  // Calculate inventory metrics
  const calculateInventoryMetrics = () => {
    if (!inventoryList || inventoryList.length === 0) {
      return {
        totalItems: 0,
        lowStockItems: 0,
        totalValue: 0,
        averageValue: 0
      };
    }
    
    const totalItems = inventoryList.length;
    const lowStockItems = inventoryList.filter(item => 
      item.stock_level <= item.reorder_at
    ).length;
    const totalValue = inventoryList.reduce((sum, item) => 
      sum + parseFloat(item.total_value || '0'), 0
    );
    const averageValue = totalItems > 0 ? totalValue / totalItems : 0;

    return {
      totalItems,
      lowStockItems,
      totalValue,
      averageValue
    };
  };

  const workOrderMetrics = calculateWorkOrderMetrics();
  const customerMetrics = calculateCustomerMetrics();
  const inventoryMetrics = calculateInventoryMetrics();

  console.log('Calculated Metrics:', {
    workOrderMetrics,
    customerMetrics,
    inventoryMetrics
  });

  // Get trend icon and color
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increase':
        return <TrendingUp className="text-green-500" size={16} />;
      case 'decrease':
        return <TrendingUp className="text-red-500 transform rotate-180" size={16} />;
      default:
        return <TrendingUp className="text-gray-400" size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-orange-100 text-orange-800 border-orange-200',
      confirmed: 'bg-green-100 text-green-800 border-green-200',
      en_route: 'bg-blue-100 text-blue-800 border-blue-200',
      in_progress: 'bg-purple-100 text-purple-800 border-purple-200',
      completed: 'bg-gray-100 text-gray-800 border-gray-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading reports...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <XCircle className="mx-auto mb-4 text-red-500" size={48} />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Reports</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Users className="mx-auto mb-4 text-gray-400" size={48} />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Please Log In</h2>
            <p className="text-gray-600">You need to be logged in to view reports.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isAdmin ? 'Business Reports & Analytics' : 'My Reports'}
          </h1>
          <p className="text-gray-600">
            {isAdmin ? 'Comprehensive business insights and performance metrics' : 'Your personal performance metrics and insights'}
          </p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          
          <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Download size={16} />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-white rounded-lg p-1 mb-6 shadow-sm">
        {['overview', 'jobs', 'customers', 'inventory'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-blue-500">
                  <BarChart3 className="text-white" size={20} />
                </div>
                {dashboardMetrics && getTrendIcon(dashboardMetrics.jobs_trend)}
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {dashboardMetrics?.jobs_today || workOrderMetrics.jobsInRange}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  {dashboardMetrics ? 'Jobs Today' : `Jobs (${dateRange} days)`}
                </p>
                {dashboardMetrics && (
                  <p className="text-xs text-green-600">
                    {dashboardMetrics.jobs_diff > 0 ? '+' : ''}{dashboardMetrics.jobs_diff} from yesterday
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-green-500">
                  <DollarSign className="text-white" size={20} />
                </div>
                {dashboardMetrics && getTrendIcon(dashboardMetrics.jobs_trend)}
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  ${(dashboardMetrics?.revenue_this_month || workOrderMetrics.revenueInRange).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  {dashboardMetrics ? 'Revenue This Month' : `Revenue (${dateRange} days)`}
                </p>
                {dashboardMetrics && (
                  <p className="text-xs text-green-600">
                    {dashboardMetrics.revenue_change_pct > 0 ? '+' : ''}{dashboardMetrics.revenue_change_pct}% from last month
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-purple-500">
                  <Users className="text-white" size={20} />
                </div>
                <TrendingUp className="text-green-500" size={16} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {dashboardMetrics?.active_customers || customerMetrics.totalCustomers}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  {dashboardMetrics ? 'Active Customers' : 'Total Customers'}
                </p>
                <p className="text-xs text-green-600">
                  {customerMetrics.customersWithJobs} with jobs
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-orange-500">
                  <Calendar className="text-white" size={20} />
                </div>
                <TrendingUp className="text-green-500" size={16} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  ${workOrderMetrics.averageJobValue.toFixed(0)}
                </p>
                <p className="text-sm text-gray-600 mb-2">Avg Job Value</p>
                <p className="text-xs text-green-600">
                  {workOrderMetrics.completedJobs} completed
                </p>
              </div>
            </div>
          </div>

          {/* Alerts Section */}
          {dashboardMetrics?.alerts && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <AlertTriangle className="text-red-500 mr-2" size={20} />
                  Alerts & Notifications
                </h3>
                <div className="space-y-4">
                  {dashboardMetrics.alerts.urgent_jobs > 0 && (
                    <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center">
                        <AlertTriangle className="text-red-500 mr-2" size={16} />
                        <span className="font-medium text-red-900">Urgent Jobs</span>
                      </div>
                      <span className="text-2xl font-bold text-red-600">
                        {dashboardMetrics.alerts.urgent_jobs}
                      </span>
                    </div>
                  )}
                  
                  {dashboardMetrics.alerts.low_inventory > 0 && (
                    <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center">
                        <AlertTriangle className="text-orange-500 mr-2" size={16} />
                        <span className="font-medium text-orange-900">Low Stock Items</span>
                      </div>
                      <span className="text-2xl font-bold text-orange-600">
                        {dashboardMetrics.alerts.low_inventory}
                      </span>
                    </div>
                  )}
                  
                  {dashboardMetrics.overdue_jobs > 0 && (
                    <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center">
                        <Clock className="text-yellow-500 mr-2" size={16} />
                        <span className="font-medium text-yellow-900">Overdue Jobs</span>
                      </div>
                      <span className="text-2xl font-bold text-yellow-600">
                        {dashboardMetrics.overdue_jobs}
                      </span>
                    </div>
                  )}
                  
                  {(!dashboardMetrics.alerts.urgent_jobs && 
                    !dashboardMetrics.alerts.low_inventory && 
                    !dashboardMetrics.overdue_jobs) && (
                    <div className="flex items-center justify-center p-6 text-gray-500">
                      <CheckCircle className="mr-2" size={20} />
                      All systems operational
                    </div>
                  )}
                </div>
              </div>

              {/* Today's Schedule */}
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Schedule</h3>
                {dashboardMetrics?.todays_schedule && dashboardMetrics.todays_schedule.length > 0 ? (
                  <div className="space-y-3">
                    {dashboardMetrics.todays_schedule.map((job, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-sm text-gray-900">{job.title}</div>
                          <div className="text-xs text-gray-600 flex items-center mt-1">
                            <MapPin className="mr-1" size={12} />
                            {job.address}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">{job.time}</div>
                          <div className={`text-xs px-2 py-1 rounded-full ${getStatusColor(job.status)}`}>
                            {job.status.replace('_', ' ')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="mx-auto mb-2" size={24} />
                    <p>No jobs scheduled for today</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* No Data State */}
          {!dashboardMetrics && workOrderMetrics.totalJobs === 0 && customerMetrics.totalCustomers === 0 && (
            <div className="text-center py-12">
              <BarChart3 className="mx-auto mb-4 text-gray-400" size={48} />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No Data Available</h2>
              <p className="text-gray-600 mb-4">
                {isAdmin 
                  ? 'Start creating jobs, customers, and inventory to see your business analytics.'
                  : 'Complete your first job to see your performance metrics.'
                }
              </p>
            </div>
          )}
        </>
      )}

      {/* Jobs Tab */}
      {activeTab === 'jobs' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Job Status Distribution */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Status Distribution</h3>
            {Object.keys(workOrderMetrics.jobsByStatus).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(workOrderMetrics.jobsByStatus).map(([status, count]) => {
                  const percentage = workOrderMetrics.totalJobs > 0 ? (count / workOrderMetrics.totalJobs) * 100 : 0;
                  return (
                    <div key={status}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {status.replace('_', ' ')}
                        </span>
                        <span className="text-sm text-gray-600">{count} ({percentage.toFixed(0)}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="mx-auto mb-2" size={24} />
                <p>No jobs found</p>
              </div>
            )}
          </div>

          {/* Job Types */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Types</h3>
            {Object.keys(workOrderMetrics.jobsByType).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(workOrderMetrics.jobsByType).map(([type, count]) => {
                  const percentage = workOrderMetrics.totalJobs > 0 ? (count / workOrderMetrics.totalJobs) * 100 : 0;
                  return (
                    <div key={type}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">{type}</span>
                        <span className="text-sm text-gray-600">{count} ({percentage.toFixed(0)}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="mx-auto mb-2" size={24} />
                <p>No job types found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Customers Tab */}
      {activeTab === 'customers' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Customers */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Customers by Revenue</h3>
            {customerMetrics.topCustomers && customerMetrics.topCustomers.length > 0 ? (
              <div className="space-y-3">
                {customerMetrics.topCustomers.map((customer, index) => (
                  <div key={customer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full text-sm font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{customer.name}</p>
                        <p className="text-sm text-gray-600">{customer.jobCount} jobs</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${customer.revenue.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">
                        ${customer.jobCount > 0 ? (customer.revenue / customer.jobCount).toFixed(0) : 0} avg
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="mx-auto mb-2" size={24} />
                <p>No customers found</p>
              </div>
            )}
          </div>

          {/* Customer Stats */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Statistics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div>
                  <p className="font-medium text-blue-900">Total Customers</p>
                  <p className="text-sm text-blue-700">All registered customers</p>
                </div>
                <div className="text-2xl font-bold text-blue-600">{customerMetrics.totalCustomers}</div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div>
                  <p className="font-medium text-green-900">Customers with Jobs</p>
                  <p className="text-sm text-green-700">Active customers</p>
                </div>
                <div className="text-2xl font-bold text-green-600">{customerMetrics.customersWithJobs}</div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div>
                  <p className="font-medium text-purple-900">Average Revenue</p>
                  <p className="text-sm text-purple-700">Per customer</p>
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  ${customerMetrics.totalCustomers > 0 ? (workOrderMetrics.totalRevenue / customerMetrics.totalCustomers).toFixed(0) : 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Tab */}
      {activeTab === 'inventory' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Inventory Status */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Status</h3>
            <div className="space-y-4">
              {inventoryMetrics.lowStockItems > 0 && (
                <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div>
                    <p className="font-medium text-red-900">Low Stock Items</p>
                    <p className="text-sm text-red-700">{inventoryMetrics.lowStockItems} items need reordering</p>
                  </div>
                  <div className="text-2xl font-bold text-red-600">{inventoryMetrics.lowStockItems}</div>
                </div>
              )}
              
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div>
                  <p className="font-medium text-green-900">Total Inventory Value</p>
                  <p className="text-sm text-green-700">Current stock valuation</p>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  ${inventoryMetrics.totalValue.toLocaleString()}
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div>
                  <p className="font-medium text-blue-900">Total Items</p>
                  <p className="text-sm text-blue-700">Unique inventory items</p>
                </div>
                <div className="text-2xl font-bold text-blue-600">{inventoryMetrics.totalItems}</div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div>
                  <p className="font-medium text-purple-900">Average Item Value</p>
                  <p className="text-sm text-purple-700">Per inventory item</p>
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  ${inventoryMetrics.averageValue.toFixed(0)}
                </div>
              </div>
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Low Stock Alerts</h3>
            {inventoryList && inventoryMetrics.lowStockItems > 0 ? (
              <div className="space-y-3">
                {inventoryList
                  .filter(item => item.stock_level <= item.reorder_at)
                  .slice(0, 5)
                  .map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div>
                        <p className="font-medium text-red-900">{item.name}</p>
                        <p className="text-sm text-red-700">SKU: {item.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-red-900">
                          {item.stock_level} / {item.ideal_stock}
                        </p>
                        <p className="text-xs text-red-600">Reorder at: {item.reorder_at}</p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="mx-auto mb-2" size={24} />
                <p>All inventory items are well stocked</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsView;