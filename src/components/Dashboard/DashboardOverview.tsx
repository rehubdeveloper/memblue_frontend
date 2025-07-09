import React, { useEffect, useState } from 'react';
import { Calendar, DollarSign, Users, ClipboardList, AlertTriangle, TrendingUp, Wrench, MapPin } from 'lucide-react';
// import { mockJobs, mockCustomers, mockInventory, mockBusiness } from '../../data/mockData';
import { tradeConfigs } from '../../data/tradeConfigs';
import { useAuth } from '../../context/AppContext';
import Cookies from 'js-cookie';

const getToken = () => Cookies.get('token') || localStorage.getItem('token');

const DashboardOverview = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);
      const token = getToken();
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${import.meta.env.VITE_BASE_URL}/team/admin-dashboard/`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`,
          },
        });
        if (!res.ok) {
          if (res.status === 403) {
            // For solo operators, create a fallback dashboard
            setDashboard({
              jobs_today: 0,
              jobs_today_change: 0,
              revenue_this_month: '0.00',
              revenue_change_percent: 0,
              active_customers: 0,
              customers_with_open_jobs: 0,
              new_customers_this_week: 0,
              open_jobs: 0,
              overdue_jobs: 0,
              todays_schedule: [],
              alerts: []
            });
            setLoading(false);
            return;
          }
          throw new Error('Failed to fetch dashboard metrics');
        }
        const data = await res.json();
        setDashboard(data);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  // Use a safe fallback for tradeConfig
  const tradeConfig = tradeConfigs[user?.primary_trade as keyof typeof tradeConfigs] || { color: 'bg-blue-500', icon: null, name: '' };

  // Defensive fallback for all dashboard fields
  const jobsToday = dashboard?.jobs_today ?? 0;
  const jobsTodayChange = dashboard?.jobs_today_change ?? 0;
  const revenueThisMonth = dashboard?.revenue_this_month ?? '0.00';
  const revenueChangePercent = dashboard?.revenue_change_percent ?? 0;
  const activeCustomers = dashboard?.active_customers ?? 0;
  const customersWithOpenJobs = dashboard?.customers_with_open_jobs ?? 0;
  const newCustomersThisWeek = dashboard?.new_customers_this_week ?? 0;
  const openJobs = dashboard?.open_jobs ?? 0;
  const overdueJobs = dashboard?.overdue_jobs ?? 0;
  const todaysSchedule = dashboard?.todays_schedule ?? [];
  const alerts = dashboard?.alerts ?? [];

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
      title: 'Open Jobs',
      value: openJobs,
      icon: ClipboardList,
      color: 'bg-orange-500',
      change: `${overdueJobs} overdue`
    },
    {
      title: 'Customers with Open Jobs',
      value: customersWithOpenJobs,
      icon: Users,
      color: 'bg-blue-500',
      change: ''
    },
    {
      title: 'New Customers This Week',
      value: newCustomersThisWeek,
      icon: Users,
      color: 'bg-indigo-500',
      change: ''
    }
  ];

  // Handle new alerts format (object with keys)
  let alertCards: JSX.Element[] = [];
  if (alerts && typeof alerts === 'object' && !Array.isArray(alerts)) {
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
    alertCards = alerts.map((alert: string, idx: number) => (
      <div key={idx} className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <AlertTriangle className="text-yellow-500 mt-1 flex-shrink-0" size={16} />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-yellow-900 text-sm lg:text-base">Alert</p>
          <p className="text-xs lg:text-sm text-yellow-700">{alert ?? '-'}</p>
        </div>
      </div>
    ));
  }

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
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-6 mb-6 lg:mb-8">
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
              <p className="text-xs lg:text-sm text-blue-700">{customersWithOpenJobs} customers due for maintenance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;