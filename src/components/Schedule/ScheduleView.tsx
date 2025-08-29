import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Filter, Calendar as CalendarIcon, X, Search, Clock, MapPin } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks, startOfDay, endOfDay, parseISO } from 'date-fns';
import { useAuth } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import InterviewJobForm from '../Jobs/InterviewJobForm';

interface ScheduleFilters {
  start_date?: string;
  end_date?: string;
  status?: string;
  assigned_to?: number;
}

const ScheduleView = () => {
  const { getSchedule, scheduleData: contextScheduleData, user, teamMembers } = useAuth();
  const navigate = useNavigate();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [navigatingToJob, setNavigatingToJob] = useState<string | null>(null);
  const [upcomingJobsData, setUpcomingJobsData] = useState<any>(null);
  const [interviewFormOpen, setInterviewFormOpen] = useState(false);
  const [localScheduleData, setLocalScheduleData] = useState<any>(null);
  
  // Use local schedule data if available, otherwise fall back to context data
  const scheduleData = localScheduleData || contextScheduleData;
  
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

  // Get all jobs sorted by date - memoized to prevent infinite re-renders
  const allJobs = useMemo(() => {
    // Always prioritize upcomingJobsData for the complete list
    const workOrders = upcomingJobsData?.work_orders || [];
    
    // If no upcoming jobs data, try to get from scheduleData (but only if it's not week-specific)
    if (workOrders.length === 0 && scheduleData?.work_orders) {
      const hasDateRange = scheduleData.filters_applied?.start_date && scheduleData.filters_applied?.end_date;
      if (!hasDateRange) {
        return [...scheduleData.work_orders]
          .sort((a, b) => new Date(a.scheduled_for).getTime() - new Date(b.scheduled_for).getTime());
      }
    }
    
    const sortedJobs = [...workOrders]
      .sort((a, b) => new Date(a.scheduled_for).getTime() - new Date(b.scheduled_for).getTime());
    
    // Debug log to see how many jobs we're getting
    console.log('ScheduleView - allJobs calculated:', {
      upcomingJobsDataCount: upcomingJobsData?.work_orders?.length || 0,
      scheduleDataCount: scheduleData?.work_orders?.length || 0,
      sortedJobsCount: sortedJobs.length,
      jobs: sortedJobs.map(job => ({ id: job.id, status: job.status, scheduled_for: job.scheduled_for }))
    });
    
    return sortedJobs;
  }, [upcomingJobsData, scheduleData]);

  // Pagination state for upcoming jobs
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 5;

  // Get paginated upcoming jobs
  const upcomingJobs = useMemo(() => {
    const startIndex = (currentPage - 1) * jobsPerPage;
    const endIndex = startIndex + jobsPerPage;
    return allJobs.slice(startIndex, endIndex);
  }, [allJobs, currentPage]);

  // Calculate total pages
  const totalPages = Math.ceil(allJobs.length / jobsPerPage);

  // Fetch schedule data
  const fetchSchedule = async (filters: ScheduleFilters = {}) => {
    setCalendarLoading(true);
    try {
      // Use the work-orders endpoint to get all jobs
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/work-orders/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch work orders');
      }

      const data = await response.json();
      const allJobs = data.results || data;
      
      // Filter jobs for the current week
      const weekEnd = addDays(weekStart, 6);
      const weekJobs = allJobs.filter((job: any) => {
        const jobDate = new Date(job.scheduled_for);
        const jobStartOfDay = startOfDay(jobDate);
        const weekStartOfDay = startOfDay(weekStart);
        const weekEndOfDay = endOfDay(weekEnd);
        
        return jobStartOfDay >= weekStartOfDay && jobStartOfDay <= weekEndOfDay;
      });

      // Apply additional filters
      let filteredJobs = weekJobs;
      
      if (filters.status) {
        filteredJobs = filteredJobs.filter((job: any) => job.status === filters.status);
      }
      
      if (filters.assigned_to) {
        filteredJobs = filteredJobs.filter((job: any) => job.assigned_to === filters.assigned_to);
      }

      // Transform the data to match the expected format
      const transformedData = {
        work_orders: filteredJobs,
        total_count: filteredJobs.length,
        filters_applied: {
          start_date: format(startOfDay(weekStart), 'yyyy-MM-dd'),
          end_date: format(endOfDay(weekEnd), 'yyyy-MM-dd'),
          ...filters
        },
        summary: {
          pending: 0,
          confirmed: 0,
          in_progress: 0,
          completed: 0,
          cancelled: 0
        }
      };

      // Calculate summary for the filtered jobs
      transformedData.work_orders.forEach((job: any) => {
        const status = job.status;
        if (status in transformedData.summary) {
          transformedData.summary[status as keyof typeof transformedData.summary]++;
        }
      });

      // Update local schedule data with the filtered week data
      setLocalScheduleData(transformedData);
    } catch (error) {
      console.error('Error fetching schedule:', error);
    } finally {
      setCalendarLoading(false);
    }
  };

  // Fetch all upcoming jobs (no date restrictions)
  const fetchAllUpcomingJobs = async () => {
    setLoading(true);
    try {
      // Use the work-orders endpoint to get all jobs instead of the schedule endpoint
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/work-orders/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch work orders');
      }

      const data = await response.json();
      
      // Transform the data to match the expected format
      const transformedData = {
        work_orders: data.results || data,
        total_count: data.count || (data.results ? data.results.length : data.length),
        filters_applied: {},
        summary: {
          pending: 0,
          confirmed: 0,
          in_progress: 0,
          completed: 0,
          cancelled: 0
        }
      };

      // Calculate summary
      transformedData.work_orders.forEach((job: any) => {
        const status = job.status;
        if (status in transformedData.summary) {
          transformedData.summary[status as keyof typeof transformedData.summary]++;
        }
      });

      setUpcomingJobsData(transformedData);
    } catch (error) {
      console.error('Error fetching upcoming jobs:', error);
    } finally {
      setLoading(false);
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

  // Always fetch upcoming jobs when component mounts
  useEffect(() => {
    const initializeData = async () => {
      await fetchAllUpcomingJobs();
      // After fetching upcoming jobs, also fetch the current week's data
      const filters: ScheduleFilters = {};
      if (statusFilter) filters.status = statusFilter;
      if (assignedToFilter) filters.assigned_to = assignedToFilter as number;
      await fetchSchedule(filters);
    };
    
    initializeData();
  }, []);

  // Reset to first page when allJobs changes
  useEffect(() => {
    setCurrentPage(1);
  }, [allJobs.length]);

  // Store upcoming jobs data when scheduleData changes (only if it's a full data load)
  useEffect(() => {
    if (scheduleData?.work_orders) {
      // Only store as upcoming jobs if it's not a week-specific fetch
      const hasDateRange = scheduleData.filters_applied?.start_date && scheduleData.filters_applied?.end_date;
      if (!hasDateRange) {
        setUpcomingJobsData(scheduleData);
      }
    }
  }, [scheduleData]);

  // Refresh upcoming jobs when component becomes visible (user navigates back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && !loading && !calendarLoading) {
        // Only refresh when component becomes visible and not currently loading
        refreshUpcomingJobs();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [loading, calendarLoading]);

  // Fetch schedule when week changes
  useEffect(() => {
    const filters: ScheduleFilters = {};
    if (statusFilter) filters.status = statusFilter;
    if (assignedToFilter) filters.assigned_to = assignedToFilter as number;
    
    fetchSchedule(filters);
  }, [currentWeek, statusFilter, assignedToFilter]);

  // Get all jobs for the current week - memoized to prevent infinite re-renders
  const currentWeekJobs = useMemo(() => {
    const allJobs: any[] = [];
    
    // Get jobs from scheduleData (week-specific data)
    if (scheduleData?.work_orders) {
      allJobs.push(...scheduleData.work_orders);
    }
    
    // Get jobs from upcomingJobsData (complete data) that fall within the current week
    if (upcomingJobsData?.work_orders) {
      const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
      const weekEnd = addDays(weekStart, 6);
      
      const weekJobs = upcomingJobsData.work_orders.filter((job: any) => {
        const jobDate = new Date(job.scheduled_for);
        return jobDate >= weekStart && jobDate <= weekEnd;
      });
      
      // Only add jobs that aren't already in scheduleData
      weekJobs.forEach((weekJob: any) => {
        const exists = allJobs.some((job: any) => job.id === weekJob.id);
        if (!exists) {
          allJobs.push(weekJob);
        }
      });
    }
    
    return allJobs;
  }, [scheduleData, upcomingJobsData, currentWeek]);

  // Get jobs for a specific day
  const getJobsForDay = (date: Date) => {
    return currentWeekJobs.filter((job: any) => {
      const jobDate = new Date(job.scheduled_for);
      return isSameDay(jobDate, date);
    });
  };

  // Get status color
  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-orange-100 text-orange-800 border-orange-200',
      confirmed: 'bg-green-100 text-green-800 border-green-200',
    
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
  const jumpToJobDate = async (jobDate: string, jobId?: string) => {
    const date = new Date(jobDate);
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    
    // Simply change the current week - the calendar will automatically fetch data
    setCurrentWeek(weekStart);
    setNavigatingToJob(jobId || null);
    
    // Clear navigation state after a short delay
    setTimeout(() => {
      setNavigatingToJob(null);
    }, 2000);
  };

  // Clear all filters
  const clearFilters = () => {
    setStatusFilter('');
    setAssignedToFilter('');
    setDateFilters({});
    fetchSchedule({});
  };

  // Calculate consistent summary from all jobs - memoized
  const jobSummary = useMemo(() => {
    const summary = {
      pending: 0,
      confirmed: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
      total_count: 0
    };

    // Use allJobs for consistent summary
    allJobs.forEach(job => {
      const status = job.status;
      if (status in summary) {
        summary[status as keyof typeof summary]++;
      }
      summary.total_count++;
    });

    return summary;
  }, [allJobs]);

  // Handle new job button click
  const handleNewJobClick = () => {
    setInterviewFormOpen(true);
  };

  // Handle interview form close
  const handleInterviewFormClose = () => {
    setInterviewFormOpen(false);
  };

  // Refresh upcoming jobs data
  const refreshUpcomingJobs = async () => {
    try {
      await fetchAllUpcomingJobs();
      // Also refresh the current week's data
      const filters: ScheduleFilters = {};
      if (statusFilter) filters.status = statusFilter;
      if (assignedToFilter) filters.assigned_to = assignedToFilter as number;
      await fetchSchedule(filters);
    } catch (error) {
      console.error('Error refreshing upcoming jobs:', error);
    }
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="text-2xl font-bold text-gray-900">{jobSummary.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="text-2xl font-bold text-gray-900">{jobSummary.confirmed}</div>
            <div className="text-sm text-gray-600">Confirmed</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="text-2xl font-bold text-gray-900">{jobSummary.in_progress}</div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="text-2xl font-bold text-gray-900">{jobSummary.completed}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="text-2xl font-bold text-gray-900">{jobSummary.cancelled}</div>
            <div className="text-sm text-gray-600">Cancelled</div>
          </div>
        </div>

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
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filter</span>
          </button>
          
          <button 
            onClick={handleNewJobClick}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">New Job</span>
          </button>
        </div>
      </div>

      {/* Upcoming Jobs Panel - Always Visible */}
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
              <p className="text-gray-600 mt-2">Loading schedule data...</p>
            </div>
          ) : upcomingJobs.length > 0 ? (
            <div className="space-y-3">
              {upcomingJobs.map(job => (
                <div 
                  key={job.id}
                  onClick={() => jumpToJobDate(job.scheduled_for, job.id.toString())}
                  className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-colors border ${
                    navigatingToJob === job.id.toString() 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                  }`}
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
                    {navigatingToJob === job.id.toString() && (
                      <div className="flex items-center space-x-1 mt-1">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                        <span className="text-xs text-blue-600">Navigating...</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * jobsPerPage) + 1} to {Math.min(currentPage * jobsPerPage, allJobs.length)} of {allJobs.length} jobs
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        currentPage === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      Previous
                    </button>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                            currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        currentPage === totalPages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
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
                {calendarLoading ? (
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
            </div>
                ) : getJobsForDay(day).length > 0 ? (
                  getJobsForDay(day).map(job => (
                    <div
                      key={job.id}
                      className="p-2 bg-blue-50 border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                      onClick={() => jumpToJobDate(job.scheduled_for, job.id.toString())}
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

      {/* Interview Job Form */}
      <InterviewJobForm 
        isOpen={interviewFormOpen} 
        onClose={handleInterviewFormClose} 
      />

    </div>
  );
};

export default ScheduleView;