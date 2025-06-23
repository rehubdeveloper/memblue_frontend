import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Filter, Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { mockJobs, mockUsers, mockCustomers } from '../../data/mockData';
import { Job } from '../../types';

const ScheduleView = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getJobsForDay = (date: Date) => {
    return mockJobs.filter(job => isSameDay(new Date(job.scheduledTime), date));
  };

  const getStatusColor = (status: Job['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'confirmed': return 'bg-green-100 border-green-300 text-green-800';
      case 'en-route': return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'in-progress': return 'bg-purple-100 border-purple-300 text-purple-800';
      case 'completed': return 'bg-gray-100 border-gray-300 text-gray-800';
      case 'cancelled': return 'bg-red-100 border-red-300 text-red-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getTechnicianName = (userId?: string) => {
    if (!userId) return 'Unassigned';
    const tech = mockUsers.find(u => u.id === userId);
    return tech ? tech.name.split(' ')[0] : 'Unknown';
  };

  const getCustomerName = (customerId: string) => {
    const customer = mockCustomers.find(c => c.id === customerId);
    return customer ? customer.name.split(' ')[0] : 'Unknown';
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 lg:mb-6 gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-slate-900">Schedule</h1>
          <p className="text-slate-600 text-sm lg:text-base">Manage job assignments and scheduling</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="flex bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded text-sm font-medium flex-1 sm:flex-none ${
                viewMode === 'week' ? 'bg-white shadow-sm' : 'text-slate-600'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 rounded text-sm font-medium flex-1 sm:flex-none ${
                viewMode === 'day' ? 'bg-white shadow-sm' : 'text-slate-600'
              }`}
            >
              Day
            </button>
          </div>
          
          <div className="flex space-x-2">
            <button className="flex items-center justify-center space-x-2 bg-slate-100 text-slate-600 px-3 py-2 rounded-lg hover:bg-slate-200 flex-1 sm:flex-none">
              <Filter size={16} />
              <span className="hidden sm:inline">Filter</span>
            </button>
            
            <button className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 flex-1 sm:flex-none">
              <Plus size={16} />
              <span className="hidden sm:inline">New Job</span>
            </button>
          </div>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between mb-4 lg:mb-6">
        <div className="flex items-center space-x-2 lg:space-x-4">
          <button
            onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
            className="p-2 hover:bg-slate-100 rounded-lg"
          >
            <ChevronLeft size={20} />
          </button>
          
          <h2 className="text-base lg:text-lg font-semibold text-slate-900">
            {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
          </h2>
          
          <button
            onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
            className="p-2 hover:bg-slate-100 rounded-lg"
          >
            <ChevronRight size={20} />
          </button>
        </div>
        
        <button
          onClick={() => setCurrentWeek(new Date())}
          className="text-blue-600 hover:text-blue-800 font-medium text-sm lg:text-base"
        >
          Today
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-7 border-b border-slate-200">
          {weekDays.map((day, index) => (
            <div key={index} className="p-2 lg:p-4 text-center">
              <div className="text-xs lg:text-sm font-medium text-slate-600 mb-1">
                {format(day, 'EEE')}
              </div>
              <div className={`text-sm lg:text-lg font-semibold ${
                isSameDay(day, new Date()) ? 'text-blue-600' : 'text-slate-900'
              }`}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>

        {/* Time slots and jobs */}
        <div className="grid grid-cols-1 sm:grid-cols-7 gap-px bg-slate-200">
          {weekDays.map((day, dayIndex) => {
            const dayJobs = getJobsForDay(day);
            
            return (
              <div key={dayIndex} className="bg-white min-h-[300px] lg:min-h-[500px] p-1 lg:p-2">
                <div className="space-y-1 lg:space-y-2">
                  {dayJobs.map((job) => (
                    <div
                      key={job.id}
                      className={`p-2 lg:p-3 rounded-lg border-l-4 cursor-pointer hover:shadow-sm transition-shadow ${getStatusColor(job.status)}`}
                    >
                      <div className="font-medium text-xs lg:text-sm mb-1">
                        {format(new Date(job.scheduledTime), 'h:mm a')}
                      </div>
                      <div className="font-semibold text-xs lg:text-sm mb-1 truncate">{job.jobType}</div>
                      <div className="text-xs text-slate-600 mb-1 truncate">
                        {getCustomerName(job.customerId)}
                      </div>
                      <div className="text-xs font-medium truncate">
                        {getTechnicianName(job.assignedUserId)}
                      </div>
                      {job.priority === 'urgent' && (
                        <div className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 mt-1">
                          URGENT
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {dayJobs.length === 0 && (
                    <div className="text-center text-slate-400 text-xs lg:text-sm py-4 lg:py-8">
                      No jobs scheduled
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-2 lg:gap-4 text-xs lg:text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-300 rounded"></div>
          <span>Pending</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-300 rounded"></div>
          <span>Confirmed</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-300 rounded"></div>
          <span>En Route</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-purple-300 rounded"></div>
          <span>In Progress</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gray-300 rounded"></div>
          <span>Completed</span>
        </div>
      </div>
    </div>
  );
};

export default ScheduleView;