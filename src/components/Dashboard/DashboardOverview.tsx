import React, { useEffect, useState } from 'react';
import { Calendar, DollarSign, Users, ClipboardList, AlertTriangle, TrendingUp, Wrench, MapPin } from 'lucide-react';
// import { mockJobs, mockCustomers, mockInventory, mockBusiness } from '../../data/mockData';
import { tradeConfigs } from '../../data/tradeConfigs';
import { useAuth } from '../../context/AppContext';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

const getToken = () => Cookies.get('token') || localStorage.getItem('token');

const DashboardOverview = () => {
  const { user, workOrders, getWorkOrders, inventoryList, getInventory } = useAuth();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

     // Function to calculate alerts based on current data
   const calculateAlerts = (workOrdersData: any[], inventoryData: any[]) => {
     const alerts = [];
     
     // Check for overdue jobs
     const today = new Date();
     today.setHours(0, 0, 0, 0);
     const overdueJobs = workOrdersData ? workOrdersData.filter((job: any) => {
       const scheduledDate = new Date(job.scheduled_for);
       return scheduledDate < today && ['pending', 'confirmed', 'in_progress'].includes(job.status);
     }).length : 0;

     if (overdueJobs > 0) {
       alerts.push(`${overdueJobs} job(s) are overdue!`);
     }

           // Check for low inventory items
      console.log('=== CALCULATE ALERTS - INVENTORY DEBUG ===');
      console.log('inventoryData:', inventoryData);
      console.log('inventoryData length:', inventoryData ? inventoryData.length : 'null/undefined');
      
      // Debug: Log first item structure to see field names
      if (inventoryData && inventoryData.length > 0) {
        console.log('First inventory item structure:', inventoryData[0]);
        console.log('Available fields:', Object.keys(inventoryData[0]));
      }
      
             const lowInventoryItems = inventoryData ? inventoryData.filter((item: any) => {
         const quantity = parseInt(item.stock_level) || 0; // Use stock_level instead of quantity
         const idealStock = parseInt(item.ideal_stock) || 0;
         console.log('Checking item:', item.name || item.item_name, 'stock_level:', quantity, 'ideal_stock:', idealStock);
         return quantity < idealStock && quantity > 0; // Low stock when below ideal stock level
       }).length : 0;

     console.log('lowInventoryItems count:', lowInventoryItems);

     if (lowInventoryItems > 0) {
                        // Get the actual low inventory items for more specific alert
         const lowInventoryItemDetails = inventoryData ? inventoryData.filter((item: any) => {
           const quantity = parseInt(item.stock_level) || 0; // Use stock_level instead of quantity
           const idealStock = parseInt(item.ideal_stock) || 0;
           return quantity < idealStock && quantity > 0;
         }).map((item: any) => ({
           name: item.name || item.item_name || 'Unknown Item',
           quantity: parseInt(item.stock_level) || 0 // Use stock_level instead of quantity
         })) : [];
       
       alerts.push({
         type: 'low_inventory',
         count: lowInventoryItems,
         items: lowInventoryItemDetails,
         message: `${lowInventoryItems} item(s) need reordering`
       });
       console.log('Added low inventory alert to alerts array:', alerts[alerts.length - 1]);
     }

           console.log('Final alerts array:', alerts);
      return alerts;
   };

    // Fetch job status counts from the new API endpoint
  useEffect(() => {
    const fetchStatusCounts = async () => {
      if (!user) return;
      
      const token = getToken();
      if (!token) return;

      try {
        console.log('Fetching job status counts from API...');
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/work-orders/status-count/`, {
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Token ${token}`,
                },
              });

        if (!response.ok) {
          throw new Error(`Failed to fetch status counts: ${response.status}`);
        }

        const data = await response.json();
        console.log('Status counts API response:', data);

        // Calculate dashboard metrics from work orders (for other data)
                const today = new Date();
                today.setHours(0, 0, 0, 0);

        const jobsToday = workOrders ? workOrders.filter((job: any) => {
                  const jobDate = new Date(job.scheduled_for);
                  jobDate.setHours(0, 0, 0, 0);
                  return jobDate.getTime() === today.getTime();
        }).length : 0;

        const overdueJobs = workOrders ? workOrders.filter((job: any) => {
                  const scheduledDate = new Date(job.scheduled_for);
          return scheduledDate < today && ['pending', 'confirmed', 'in_progress'].includes(job.status);
        }).length : 0;

                // Calculate revenue from completed jobs
        const revenueThisMonth = workOrders ? workOrders
                  .filter((job: any) => {
                    const jobDate = new Date(job.created_at);
                    return jobDate.getMonth() === today.getMonth() &&
                      jobDate.getFullYear() === today.getFullYear() &&
                      job.status === 'completed';
                  })
                  .reduce((sum: number, job: any) => sum + parseFloat(job.amount || '0'), 0)
          .toFixed(2) : '0.00';

                // Get unique customers
        const uniqueCustomers = workOrders ? [...new Set(workOrders.map((job: any) => job.customer))].length : 0;

        // Get customers with different job statuses
        const customersWithConfirmedJobs = workOrders ? [...new Set(
          workOrders
            .filter((job: any) => job.status === 'confirmed')
            .map((job: any) => job.customer)
        )].length : 0;
        
        const customersWithInProgressJobs = workOrders ? [...new Set(
          workOrders
            .filter((job: any) => ['in_progress', 'in-progress'].includes(job.status))
            .map((job: any) => job.customer)
        )].length : 0;
        
        const customersWithCompletedJobs = workOrders ? [...new Set(
                  workOrders
            .filter((job: any) => job.status === 'completed')
                    .map((job: any) => job.customer)
        )].length : 0;
        
        // Total customers with open jobs
        const customersWithOpenJobs = customersWithConfirmedJobs + customersWithInProgressJobs + customersWithCompletedJobs;

                // Today's schedule
        const todaysSchedule = workOrders ? workOrders
                  .filter((job: any) => {
                    const jobDate = new Date(job.scheduled_for);
                    jobDate.setHours(0, 0, 0, 0);
                    return jobDate.getTime() === today.getTime();
                  })
                  .map((job: any) => ({
                    job_number: job.job_number,
                    title: job.job_type,
                    address: job.address,
                    scheduled_for: job.scheduled_for,
                    status: job.status
          })) : [];

                                  // Calculate alerts using the dedicated function
          const alerts = calculateAlerts(workOrders || [], inventoryList || []);

        // Use the API data for job counts
        const statusCounts = data.status_counts || {};
        const confirmedJobs = statusCounts.confirmed || 0;
        const inProgressJobs = statusCounts.in_progress || 0;
        const completedJobs = statusCounts.completed || 0;
        const pendingJobs = statusCounts.pending || 0;
        const cancelledJobs = statusCounts.cancelled || 0;
        
        // Total open jobs (confirmed + in_progress + completed)
        const openJobs = confirmedJobs + inProgressJobs + completedJobs;

        const dashboardData = {
                  jobs_today: jobsToday,
                  jobs_today_change: 0, // Can't calculate without historical data
                  revenue_this_month: revenueThisMonth,
                  revenue_change_percent: 0, // Can't calculate without historical data
                  active_customers: uniqueCustomers,
                  customers_with_open_jobs: customersWithOpenJobs,
                  new_customers_this_week: 0, // Can't calculate without historical data
                  open_jobs: openJobs,
          confirmed_jobs: confirmedJobs,
          in_progress_jobs: inProgressJobs,
          completed_jobs: completedJobs,
          pending_jobs: pendingJobs,
          cancelled_jobs: cancelledJobs,
          customers_with_confirmed_jobs: customersWithConfirmedJobs,
          customers_with_in_progress_jobs: customersWithInProgressJobs,
          customers_with_completed_jobs: customersWithCompletedJobs,
                  overdue_jobs: overdueJobs,
                  todays_schedule: todaysSchedule,
          alerts: alerts,
          total_count: data.total_count || 0,
          user_role: data.user_role || 'unknown',
          business_type: data.business_type || 'unknown'
        };
        
        console.log('Setting dashboard data with API counts:', dashboardData);
        setDashboard(dashboardData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching status counts:', error);
        // Fallback to work orders calculation if API fails
        if (workOrders && workOrders.length > 0) {
          console.log('Falling back to work orders calculation...');
          // ... existing fallback logic
            }
            setLoading(false);
      }
    };

         fetchStatusCounts();
   }, [user, workOrders, inventoryList]);

       // Remove the old dashboard fetch since we're using the new status counts API

  // Fallback: If no work orders are loaded after 3 seconds, force fetch them
  useEffect(() => {
    const timer = setTimeout(() => {
      if (user && (!workOrders || workOrders.length === 0)) {
        console.log('Fallback: Force fetching work orders for dashboard...');
        getWorkOrders(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [user, workOrders]);

     // Fallback: If no inventory is loaded after 3 seconds, force fetch it
   useEffect(() => {
     const timer = setTimeout(() => {
       if (user && (!inventoryList || inventoryList.length === 0)) {
         console.log('Fallback: Force fetching inventory for dashboard...');
         getInventory(true);
       }
     }, 3000);

     return () => clearTimeout(timer);
   }, [user, inventoryList, getInventory]);

   // Force dashboard recalculation when inventory data becomes available
   useEffect(() => {
     if (user && inventoryList && inventoryList.length > 0 && dashboard) {
       console.log('Inventory data available, recalculating dashboard alerts...');
       // Recalculate alerts and update dashboard
       const updatedAlerts = calculateAlerts(workOrders || [], inventoryList || []);
       setDashboard((prev: any) => ({ 
         ...prev, 
         alerts: updatedAlerts 
       }));
     }
   }, [user, inventoryList, dashboard, workOrders]);

  // Use a safe fallback for tradeConfig
  const tradeConfig = tradeConfigs[user?.primary_trade as keyof typeof tradeConfigs] || { color: 'bg-blue-500', icon: null, name: '' };

     // Debug: Log dashboard state
   console.log('=== DASHBOARD DISPLAY DEBUG ===');
   console.log('dashboard state:', dashboard);
   console.log('dashboard?.open_jobs:', dashboard?.open_jobs);
   console.log('inventoryList from context:', inventoryList);
   console.log('inventoryList type:', typeof inventoryList);
   console.log('inventoryList length:', inventoryList ? inventoryList.length : 'null/undefined');

  // Defensive fallback for all dashboard fields
  const jobsToday = dashboard?.jobs_today ?? 0;
  const jobsTodayChange = dashboard?.jobs_today_change ?? 0;
  const revenueThisMonth = dashboard?.revenue_this_month ?? '0.00';
  const revenueChangePercent = dashboard?.revenue_change_percent ?? 0;
  const activeCustomers = dashboard?.active_customers ?? 0;
  const customersWithOpenJobs = dashboard?.customers_with_open_jobs ?? 0;
  const newCustomersThisWeek = dashboard?.new_customers_this_week ?? 0;
  const openJobs = dashboard?.open_jobs ?? 0;
   const confirmedJobs = dashboard?.confirmed_jobs ?? 0;
   const inProgressJobs = dashboard?.in_progress_jobs ?? 0;
   const completedJobs = dashboard?.completed_jobs ?? 0;
   const customersWithConfirmedJobs = dashboard?.customers_with_confirmed_jobs ?? 0;
   const customersWithInProgressJobs = dashboard?.customers_with_in_progress_jobs ?? 0;
   const customersWithCompletedJobs = dashboard?.customers_with_completed_jobs ?? 0;
  const overdueJobs = dashboard?.overdue_jobs ?? 0;
  const todaysSchedule = dashboard?.todays_schedule ?? [];
  const alerts = dashboard?.alerts ?? [];
  
  console.log('Final openJobs value for display:', openJobs);
  console.log('=== END DASHBOARD DISPLAY DEBUG ===');
  
  // Fallback: If dashboard doesn't have open_jobs but we have work orders, calculate it directly
  let finalOpenJobs = openJobs;
  if (openJobs === 0 && workOrders && workOrders.length > 0) {
    const calculatedOpenJobs = workOrders.filter((job: any) =>
      ['confirmed', 'in_progress', 'in-progress'].includes(job.status)
    ).length;
    console.log('Using fallback calculation - openJobs:', calculatedOpenJobs);
    finalOpenJobs = calculatedOpenJobs;
  }

  // Navigation handlers
  const handleOpenJobsClick = () => {
    navigate('/jobs');
  };

     const handleCustomersWithOpenJobsClick = () => {
     navigate('/customers');
   };

   const handleInventoryClick = () => {
     navigate('/inventory');
   };

  if (loading) return (
    <div className="p-4 lg:p-6 animate-pulse">
      <div className="mb-6 lg:mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="h-8 w-8 bg-slate-200 rounded-full" />
          <div className="h-6 w-40 bg-slate-200 rounded" />
        </div>
        <div className="h-4 w-64 bg-slate-200 rounded mb-2" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-4 lg:p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-3 lg:mb-4">
              <div className="h-8 w-8 bg-slate-200 rounded-lg" />
              <div className="h-4 w-8 bg-slate-200 rounded" />
            </div>
            <div>
              <div className="h-6 w-16 bg-slate-200 rounded mb-1" />
              <div className="h-4 w-20 bg-slate-200 rounded mb-2" />
              <div className="h-3 w-12 bg-slate-200 rounded" />
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-4 lg:p-6 shadow-sm border border-slate-200">
            <div className="h-5 w-32 bg-slate-200 rounded mb-4" />
            <div className="space-y-3">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="h-6 w-6 bg-slate-200 rounded-full" />
                    <div className="min-w-0 flex-1">
                      <div className="h-4 w-24 bg-slate-200 rounded mb-1" />
                      <div className="h-3 w-20 bg-slate-200 rounded" />
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="h-4 w-10 bg-slate-200 rounded mb-1" />
                    <div className="h-3 w-12 bg-slate-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-lg p-4 lg:p-6 shadow-sm border border-slate-200">
        <div className="h-5 w-40 bg-slate-200 rounded mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start space-x-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="h-6 w-6 bg-slate-200 rounded-full mt-1 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="h-4 w-24 bg-slate-200 rounded mb-1" />
                <div className="h-3 w-32 bg-slate-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;
  if (!dashboard) return <div className="p-6">No dashboard data available.</div>;

  const stats = [
    {
      title: "Today's Jobs",
      value: jobsToday,
      icon: Calendar,
      color: tradeConfig.color,
      change: jobsTodayChange > 0 ? `+${jobsTodayChange} from yesterday` : `${jobsTodayChange} from yesterday`
    },
    {
      title: 'Total Revenue',
      value: `$${Number(revenueThisMonth).toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-green-500',
      change: `${revenueChangePercent > 0 ? '+' : ''}${revenueChangePercent}% this month`
    },
    {
      title: 'Active Customers',
      value: activeCustomers,
      icon: Users,
      color: 'bg-purple-500',
      change: `+${newCustomersThisWeek} this week`
    },
    {
       title: 'Confirmed Jobs',
       value: confirmedJobs,
      icon: ClipboardList,
       color: 'bg-yellow-500',
       change: `${customersWithConfirmedJobs} customers`,
       clickable: true,
       onClick: handleOpenJobsClick
     },
     {
       title: 'In Progress Jobs',
       value: inProgressJobs,
       icon: ClipboardList,
      color: 'bg-blue-500',
       change: `${customersWithInProgressJobs} customers`,
       clickable: true,
       onClick: handleOpenJobsClick
     },
     {
       title: 'Completed Jobs',
       value: completedJobs,
       icon: ClipboardList,
       color: 'bg-green-500',
       change: `${customersWithCompletedJobs} customers`,
       clickable: true,
       onClick: handleOpenJobsClick
    }
  ];

  // Handle new alerts format (object with keys)
  let alertCards: JSX.Element[] = [];
  
  console.log('=== ALERT DISPLAY DEBUG ===');
  console.log('alerts:', alerts);
  console.log('alerts type:', typeof alerts);
  console.log('alerts isArray:', Array.isArray(alerts));
  
  if (alerts && typeof alerts === 'object' && !Array.isArray(alerts)) {
    console.log('Processing alerts as object');
    if (alerts.low_inventory > 0) {
      alertCards.push(
        <div key="low-inventory" className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertTriangle className="text-yellow-500 mt-1 flex-shrink-0" size={16} />
          <div className="min-w-0 flex-1">
            <p className="font-medium text-yellow-900 text-sm lg:text-base">Low Inventory</p>
            <p className="text-xs lg:text-sm text-yellow-700">{alerts.low_inventory} item(s) are low in inventory</p>
          </div>
        </div>
      );
    }
    if (alerts.urgent_jobs > 0) {
      alertCards.push(
        <div key="urgent-jobs" className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="text-red-500 mt-1 flex-shrink-0" size={16} />
          <div className="min-w-0 flex-1">
            <p className="font-medium text-red-900 text-sm lg:text-base">Urgent Jobs</p>
            <p className="text-xs lg:text-sm text-red-700">{alerts.urgent_jobs} urgent job(s) need attention</p>
          </div>
        </div>
      );
    }
  } else if (Array.isArray(alerts)) {
    console.log('Processing alerts as array with', alerts.length, 'items');
    alertCards = alerts.map((alert: any, idx: number) => {
             // Handle new object format for low inventory alerts
       if (typeof alert === 'object' && alert.type === 'low_inventory') {
         return (
           <div 
             key={idx} 
             className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg cursor-pointer hover:bg-red-100 transition-colors"
             onClick={handleInventoryClick}
           >
             <AlertTriangle className="text-red-500 mt-1 flex-shrink-0" size={16} />
             <div className="min-w-0 flex-1">
               <p className="font-medium text-red-900 text-sm lg:text-base">Low Stock Alert</p>
               <p className="text-xs lg:text-sm text-red-700">{alert.message}:</p>
               {alert.items && alert.items.length > 0 && (
                 <div className="mt-1">
                   {alert.items.map((item: any, itemIdx: number) => (
                     <span key={itemIdx} className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full mr-1 mb-1">
                       {item.name} ({item.quantity} left)
                     </span>
                   ))}
                 </div>
               )}
             </div>
           </div>
         );
       }
      
      // Handle string format alerts
      return (
      <div key={idx} className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <AlertTriangle className="text-yellow-500 mt-1 flex-shrink-0" size={16} />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-yellow-900 text-sm lg:text-base">Alert</p>
          <p className="text-xs lg:text-sm text-yellow-700">{alert ?? '-'}</p>
        </div>
      </div>
      );
    });
  }
  
     console.log('alertCards generated:', alertCards.length);
   console.log('=== END ALERT DISPLAY DEBUG ===');

   // Remove test alert - now using real inventory data

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6 lg:mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <span className="text-2xl">{tradeConfig.icon}</span>
          <h1 className="text-xl lg:text-2xl font-bold text-slate-900">{user?.primary_trade ? user.primary_trade.toUpperCase() : 'TRADE'} Dashboard</h1>
        </div>
        <p className="text-slate-600 text-sm lg:text-base">Welcome back! Here's what's happening with your Memphis operations today.</p>
      </div>

      {/* Stats Grid */}
       <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 lg:gap-6 mb-6 lg:mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index} 
              className={`bg-white rounded-lg p-4 lg:p-6 shadow-sm border border-slate-200 ${stat.clickable ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
              onClick={stat.onClick}
            >
              <div className="flex items-center justify-between mb-3 lg:mb-4">
                <div className={`p-2 lg:p-3 rounded-lg ${stat.color}`}>
                  <Icon className="text-white" size={16} />
                </div>
                <TrendingUp className="text-green-500" size={14} />
              </div>
              <div>
                <p className="text-lg lg:text-2xl font-bold text-slate-900 mb-1">{stat.value ?? '-'}</p>
                <p className="text-xs lg:text-sm text-slate-600 mb-1 lg:mb-2">{stat.title}</p>
                {stat.change && <p className="text-xs text-green-600">{stat.change}</p>}
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
            {todaysSchedule.length > 0 ? (
              todaysSchedule.slice(0, 4).map((job: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <span className="text-base lg:text-lg">{tradeConfig.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900 text-sm lg:text-base truncate">{job.title ?? '-'}</p>
                      <p className="text-xs lg:text-sm text-slate-600 truncate">{job.address ?? '-'}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs lg:text-sm font-medium text-slate-900">
                      {job.scheduled_for ? new Date(job.scheduled_for).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </p>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${job.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : job.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                      {job.status ? job.status.replace('_', ' ') : '-'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-center py-4 text-sm lg:text-base">No jobs scheduled for today</p>
            )}
          </div>
        </div>

        {/* Memphis Service Areas - Placeholder, since not in backend response */}
        <div className="bg-white rounded-lg p-4 lg:p-6 shadow-sm border border-slate-200">
          <h3 className="text-base lg:text-lg font-semibold text-slate-900 mb-4">Memphis Service Areas</h3>
          <div className="space-y-3">
            <div className="text-slate-500 text-center py-4 text-sm lg:text-base">Service area data not available</div>
          </div>
        </div>
      </div>

      {/* Alerts & Trade-Specific Insights */}
      <div className="bg-white rounded-lg p-4 lg:p-6 shadow-sm border border-slate-200">
        <h3 className="text-base lg:text-lg font-semibold text-slate-900 mb-4">Alerts & Trade Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {alertCards.length > 0 ? (
            alertCards
          ) : (
            <div className="text-slate-500 text-center py-4 text-sm lg:text-base">No alerts</div>
          )}
          {/* Example of a static trade insight */}
          <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Wrench className="text-blue-500 mt-1 flex-shrink-0" size={16} />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-blue-900 text-sm lg:text-base">Seasonal Reminder</p>
               <p className="text-xs lg:text-sm text-blue-700">{customersWithConfirmedJobs + customersWithInProgressJobs} customers with active jobs</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;