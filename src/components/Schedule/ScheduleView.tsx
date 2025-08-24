import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Filter, Calendar as CalendarIcon, X, Search, Clock, MapPin } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks, startOfDay, endOfDay, parseISO } from 'date-fns';
import { useAuth } from '../../context/AppContext';

interface ScheduleFilters {
  start_date?: string;
  end_date?: string;
  status?: string;
  assigned_to?: number;
}

const ScheduleView = () => {
  const { getSchedule, scheduleData, user, teamMembers } = useAuth();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showUpcomingJobs, setShowUpcomingJobs] = useState(false);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [assignedToFilter, setAssignedToFilter] = useState<number | ''>('');
  const [dateFilters, setDateFilters] = useState<{ start_date?: string; end_date?: string }>({});

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Monday start
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Get technician name
  const getTechnicianName = (assignedTo: string | number) => {
    if (!teamMembers) return 'Unassigned';
    const member = teamMembers.find(m => m.id === Number(assignedTo));
    return member ? `${member.first_name} ${member.last_name}` : 'Unassigned';
  };

  // Check if user is a team member (can only see their own jobs)
  const isTeamMember = user?.role === 'member';

  // Fetch schedule data
  const fetchSchedule = async (filters: ScheduleFilters = {}) => {
    setLoading(true);
    try {
      const weekEnd = addDays(weekStart, 6);
      const defaultFilters: ScheduleFilters = {
        start_date: format(startOfDay(weekStart), 'yyyy-MM-dd'),
        end_date: format(endOfDay(weekEnd), 'yyyy-MM-dd'),
        ...dateFilters
      };

      // Merge with additional filters
      const finalFilters = {
        ...defaultFilters,
        ...filters
      };

      await getSchedule(finalFilters);
    } catch (error) {
      console.error('Error fetching schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all upcoming jobs (no date restrictions)
  const fetchAllUpcomingJobs = async () => {
    try {
      const today = new Date();
      const filters: ScheduleFilters = {
        start_date: format(startOfDay(today), 'yyyy-MM-dd'),
        ...dateFilters
      };
      await getSchedule(filters);
    } catch (error) {
      console.error('Error fetching upcoming jobs:', error);
    }
  };

  // Auto-navigate to week with earliest job
  useEffect(() => {
    if (scheduleData?.work_orders && scheduleData.work_orders.length > 0) {
      const sortedJobs = [...scheduleData.work_orders].sort((a, b) => 
        new Date(a.scheduled_for).getTime() - new Date(b.scheduled_for).getTime()
      );
      
      const earliestJobDate = new Date(sortedJobs[0].scheduled_for);
      const earliestJobWeek = startOfWeek(earliestJobDate, { weekStartsOn: 1 });
      
      // Only navigate if the earliest job is not in the current week
      if (!isSameDay(weekStart, earliestJobWeek)) {
        setCurrentWeek(earliestJobWeek);
      }
    }
  }, [scheduleData]);

  // Initial load - fetch all upcoming jobs first
  useEffect(() => {
    fetchAllUpcomingJobs();
  }, []);

  // Fetch schedule when week changes
  useEffect(() => {
    const filters: ScheduleFilters = {};
    if (statusFilter) filters.status = statusFilter;
    if (assignedToFilter) filters.assigned_to = assignedToFilter as number;
    
    fetchSchedule(filters);
  }, [currentWeek]);

  // Get jobs for a specific day
  const getJobsForDay = (date: Date) => {
    if (!scheduleData?.work_orders) return [];
    return scheduleData.work_orders.filter(job => {
      const jobDate = new Date(job.scheduled_for);
      return isSameDay(jobDate, date);
    });
  };

  // Get status color
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

  // Navigation functions
  const goToPreviousWeek = () => setCurrentWeek(subWeeks(currentWeek, 1));
  const goToNextWeek = () => setCurrentWeek(addWeeks(currentWeek, 1));
  const goToToday = () => setCurrentWeek(new Date());

  // Jump to specific job date
  const jumpToJobDate = (jobDate: string) => {
    const date = new Date(jobDate);
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    setCurrentWeek(weekStart);
  };

  // Clear all filters
  const clearFilters = () => {
    setStatusFilter('');
    setAssignedToFilter('');
    setDateFilters({});
    fetchSchedule();
  };

  // Get all upcoming jobs sorted by date
  const getUpcomingJobs = () => {
    if (!scheduleData?.work_orders) return [];
    return [...scheduleData.work_orders]
      .filter(job => new Date(job.scheduled_for) >= new Date())
      .sort((a, b) => new Date(a.scheduled_for).getTime() - new Date(b.scheduled_for).getTime());
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isTeamMember ? 'My Schedule' : 'Schedule'}
        </h1>
        <p className="text-gray-600">
          {isTeamMember ? 'View your assigned jobs and schedule' : 'Manage job assignments and scheduling'}
        </p>
      </div>

      {/* Summary Cards */}
      {scheduleData?.summary && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {Object.entries(scheduleData.summary).map(([status, count]) => (
            <div key={status} className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="text-2xl font-bold text-gray-900">{count}</div>
              <div className="text-sm text-gray-600 capitalize">{status.replace('_', ' ')}</div>
            </div>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={goToPreviousWeek}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="text-lg font-semibold text-gray-900">
            {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
          </div>
          
          <button
            onClick={goToNextWeek}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          
          <button
            onClick={goToToday}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm lg:text-base"
          >
            Today
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setViewMode('week')}
            className={`px-4 py-2 rounded-lg font-medium text-sm ${
              viewMode === 'week' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setViewMode('day')}
            className={`px-4 py-2 rounded-lg font-medium text-sm ${
              viewMode === 'day' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Day
          </button>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filter</span>
          </button>
          
          <button
            onClick={() => setShowUpcomingJobs(!showUpcomingJobs)}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">
              {showUpcomingJobs ? 'Hide' : 'Show'} {isTeamMember ? 'My' : 'Upcoming'}
            </span>
          </button>
          
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">New Job</span>
          </button>
        </div>
      </div>

             {/* Upcoming Jobs Panel */}
       {showUpcomingJobs && (
         <div className="bg-white rounded-lg shadow-sm border mb-6">
           <div className="p-4 border-b border-gray-200">
             <h3 className="text-lg font-semibold text-gray-900">
               {isTeamMember ? 'My Assigned Jobs' : 'Upcoming Jobs'}
             </h3>
             <p className="text-sm text-gray-600">Click on any job to jump to its date in the calendar</p>
           </div>
          <div className="p-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading upcoming jobs...</p>
              </div>
            ) : getUpcomingJobs().length > 0 ? (
              <div className="space-y-3">
                {getUpcomingJobs().map(job => (
                  <div 
                    key={job.id}
                    onClick={() => jumpToJobDate(job.scheduled_for)}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors border border-gray-200"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(job.status)}`}>
                          {job.status.replace('_', ' ')}
                        </div>
                        <div className="font-medium text-gray-900">{job.job_type}</div>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">{job.customer_name}</div>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span>{job.address}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{format(new Date(job.scheduled_for), 'MMM d, yyyy h:mm a')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        ${parseFloat(job.amount).toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-600">
                        {getTechnicianName(job.assigned_to)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
                         ) : (
               <div className="text-center py-8">
                 <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                 <p className="text-gray-600">
                   {isTeamMember ? 'No jobs assigned to you' : 'No upcoming jobs scheduled'}
                 </p>
               </div>
             )}
          </div>
        </div>
      )}

             {/* Filters */}
       {showFilters && (
         <div className="bg-white rounded-lg shadow-sm border mb-6 p-4">
           <div className={`grid gap-4 ${isTeamMember ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3'}`}>
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
               <select
                 value={statusFilter}
                 onChange={(e) => setStatusFilter(e.target.value)}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
               >
                 <option value="">All Statuses</option>
                 <option value="pending">Pending</option>
                 <option value="confirmed">Confirmed</option>
                 <option value="en_route">En Route</option>
                 <option value="in_progress">In Progress</option>
                 <option value="completed">Completed</option>
                 <option value="cancelled">Cancelled</option>
               </select>
             </div>
             
             {!isTeamMember && (
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
                 <select
                   value={assignedToFilter}
                   onChange={(e) => setAssignedToFilter(e.target.value ? Number(e.target.value) : '')}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                 >
                   <option value="">All Technicians</option>
                   {teamMembers?.map(member => (
                     <option key={member.id} value={member.id}>
                       {member.first_name} {member.last_name}
                     </option>
                   ))}
                 </select>
               </div>
             )}
            
            <div className="flex items-end space-x-2">
              <button
                onClick={() => {
                  const filters: ScheduleFilters = {};
                  if (statusFilter) filters.status = statusFilter;
                  if (assignedToFilter) filters.assigned_to = assignedToFilter as number;
                  fetchSchedule(filters);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Apply Filters
              </button>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {/* Calendar Header */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="p-4 text-center font-medium text-gray-700">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Body */}
        <div className="grid grid-cols-7">
          {weekDays.map((day, index) => (
            <div key={index} className="min-h-[200px] border-r border-gray-200 last:border-r-0">
              <div className={`p-3 text-center border-b border-gray-200 ${
                isSameDay(day, new Date()) ? 'bg-blue-50 text-blue-600 font-semibold' : 'bg-gray-50'
              }`}>
                {format(day, 'd')}
              </div>
              <div className="p-2 space-y-2">
                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                ) : getJobsForDay(day).length > 0 ? (
                  getJobsForDay(day).map(job => (
                    <div
                      key={job.id}
                      className="p-2 bg-blue-50 border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                      onClick={() => jumpToJobDate(job.scheduled_for)}
                    >
                      <div className="text-xs font-medium text-blue-900 truncate">
                        {job.job_type}
                      </div>
                      <div className="text-xs text-blue-700 truncate">
                        {job.customer_name}
                      </div>
                      <div className="text-xs text-blue-600">
                        {format(new Date(job.scheduled_for), 'h:mm a')}
                      </div>
                    </div>
                  ))
                                 ) : (
                   <div className="text-center text-gray-400 text-sm py-8">
                     {isTeamMember ? 'No jobs assigned to you' : 'No jobs scheduled'}
                   </div>
                 )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 bg-white rounded-lg shadow-sm border p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Status Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries({
            pending: 'Pending',
            confirmed: 'Confirmed', 
            en_route: 'En Route',
            in_progress: 'In Progress',
            completed: 'Completed',
            cancelled: 'Cancelled'
          }).map(([status, label]) => (
            <div key={status} className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(status).split(' ')[0]}`}></div>
              <span className="text-sm text-gray-700">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScheduleView;