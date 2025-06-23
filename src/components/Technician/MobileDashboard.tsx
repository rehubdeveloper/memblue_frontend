import React from 'react';
import { MapPin, Clock, Phone, Camera, CheckSquare, AlertCircle, Wrench, Navigation, MessageSquare } from 'lucide-react';
import { mockJobs, mockCustomers, mockBusiness } from '../../data/mockData';
import { tradeConfigs } from '../../data/tradeConfigs';
import { Job } from '../../types';

interface MobileDashboardProps {
  currentUserId: string;
}

const MobileDashboard: React.FC<MobileDashboardProps> = ({ currentUserId }) => {
  const tradeConfig = tradeConfigs[mockBusiness.primaryTrade];
  
  const myJobs = mockJobs.filter(job => job.assignedUserId === currentUserId);
  const todayJobs = myJobs.filter(job => {
    const today = new Date();
    const jobDate = new Date(job.scheduledTime);
    return jobDate.toDateString() === today.toDateString();
  });

  const getStatusColor = (status: Job['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'confirmed': return 'bg-green-500';
      case 'en-route': return 'bg-blue-500';
      case 'in-progress': return 'bg-purple-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getCustomerInfo = (customerId: string) => {
    return mockCustomers.find(c => c.id === customerId);
  };

  const getNextAction = (job: Job) => {
    switch (job.status) {
      case 'pending':
      case 'confirmed':
        return 'Start Job';
      case 'en-route':
        return 'Arrive at Site';
      case 'in-progress':
        return 'Complete Job';
      case 'completed':
        return 'View Details';
      default:
        return 'View Job';
    }
  };

  const getMemphisArea = (address: string) => {
    if (address.includes('Poplar')) return 'Midtown/East Memphis';
    if (address.includes('Main') || address.includes('Beale')) return 'Downtown';
    if (address.includes('Germantown')) return 'Germantown';
    return 'Memphis Metro';
  };

  return (
    <div className="p-4 bg-slate-50 min-h-screen">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <span className="text-2xl">{tradeConfig.icon}</span>
          <h1 className="text-xl lg:text-2xl font-bold text-slate-900">{tradeConfig.name} Dashboard</h1>
        </div>
        <p className="text-slate-600 text-sm lg:text-base">Today's Memphis schedule and job updates</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3">
            <div className={`p-2 ${tradeConfig.color} rounded-lg`}>
              <Clock className="text-white" size={20} />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900">{todayJobs.length}</p>
              <p className="text-sm text-slate-600">Today's Jobs</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckSquare className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900">
                {myJobs.filter(job => job.status === 'completed').length}
              </p>
              <p className="text-sm text-slate-600">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Jobs */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Today's Memphis Schedule</h2>
        <div className="space-y-4">
          {todayJobs.length > 0 ? (
            todayJobs.map((job) => {
              const customer = getCustomerInfo(job.customerId);
              const completedTasks = job.checklist.filter(item => item.completed).length;
              const memphisArea = getMemphisArea(job.location);
              
              return (
                <div key={job.id} className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(job.status)}`}></div>
                        <span className="text-lg">{tradeConfig.icon}</span>
                        <h3 className="font-semibold text-slate-900 truncate">{job.jobType}</h3>
                        {job.priority === 'urgent' && (
                          <AlertCircle className="text-red-500 flex-shrink-0" size={16} />
                        )}
                      </div>
                      <p className="text-slate-600 text-sm mb-2 truncate">{customer?.name}</p>
                      <div className="flex items-center space-x-2 mb-2">
                        <MapPin className="text-slate-400 flex-shrink-0" size={14} />
                        <span className="text-sm text-slate-600 truncate">{memphisArea}</span>
                      </div>
                    </div>
                    
                    <div className="text-right flex-shrink-0">
                      <p className="font-medium text-slate-900">
                        {new Date(job.scheduledTime).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                      <p className="text-xs text-slate-500">{job.estimatedDuration} min</p>
                    </div>
                  </div>

                  {/* Trade-specific info */}
                  {job.tradeSpecificData && mockBusiness.primaryTrade === 'hvac' && (
                    <div className="mb-3 p-2 bg-slate-50 rounded text-sm">
                      {job.tradeSpecificData.systemAge && (
                        <span className="text-slate-600">System: {job.tradeSpecificData.systemAge}yr old</span>
                      )}
                      {job.tradeSpecificData.seerRating && (
                        <span className="text-slate-600">, SEER {job.tradeSpecificData.seerRating}</span>
                      )}
                    </div>
                  )}

                  {job.checklist.length > 0 && (
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-slate-600">Progress</span>
                        <span className="text-sm text-slate-600">
                          {completedTasks}/{job.checklist.length}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{
                            width: `${(completedTasks / job.checklist.length) * 100}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                      {getNextAction(job)}
                    </button>
                    <button className="flex items-center justify-center w-10 h-10 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200">
                      <Phone size={16} />
                    </button>
                    <button className="flex items-center justify-center w-10 h-10 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200">
                      <Navigation size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-lg p-8 text-center shadow-sm border border-slate-200">
              <span className="text-4xl mb-4 block">{tradeConfig.icon}</span>
              <p className="text-slate-500 mb-2">No {tradeConfig.name.toLowerCase()} jobs scheduled for today</p>
              <p className="text-slate-400 text-sm">Check back later or contact dispatch</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center space-x-2 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
            <Camera className="text-slate-600" size={20} />
            <span className="text-sm font-medium text-slate-700">Take Photo</span>
          </button>
          
          <button className="flex items-center space-x-2 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
            <Phone className="text-slate-600" size={20} />
            <span className="text-sm font-medium text-slate-700">Call Dispatch</span>
          </button>
          
          <button className="flex items-center space-x-2 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
            <Clock className="text-slate-600" size={20} />
            <span className="text-sm font-medium text-slate-700">Log Time</span>
          </button>
          
          <button className="flex items-center space-x-2 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
            <MessageSquare className="text-slate-600" size={20} />
            <span className="text-sm font-medium text-slate-700">Send Update</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileDashboard;