import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Calendar, Clock, MapPin, DollarSign, Tag, FileText, User, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

interface JobFormData {
  customer: number;
  job_type: string;
  description: string;
  priority: string;
  scheduled_for: string;
  scheduled_time: string;
  estimated_duration: string;
  assigned_to: string;
  address: string;
  amount: string;
  tags: string;
  notes: string;
  progress_current: string;
  progress_total: string;
  status: string;
}

interface InterviewJobFormProps {
  isOpen: boolean;
  onClose: () => void;
  customerId?: number;
  customerName?: string;
  customerAddress?: string;
}

const InterviewJobForm: React.FC<InterviewJobFormProps> = ({ 
  isOpen, 
  onClose, 
  customerId, 
  customerName, 
  customerAddress 
}) => {
  const { user, teamMembers, customers, createWorkOrder, notifyJobCreated, getWorkOrders } = useAuth();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<JobFormData>({
    customer: customerId || 0,
    job_type: '',
    description: '',
    priority: 'medium',
    scheduled_for: '',
    scheduled_time: '',
    estimated_duration: '2',
    assigned_to: '',
    address: customerAddress || '',
    amount: '',
    tags: '',
    notes: '',
    progress_current: '0',
    progress_total: '1',
    status: 'pending'
  });

  const totalSteps = 7;

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setFormData({
        customer: customerId || 0,
        job_type: '',
        description: '',
        priority: 'medium',
        scheduled_for: '',
        scheduled_time: '',
        estimated_duration: '2',
        assigned_to: '',
        address: customerAddress || '',
        amount: '',
        tags: '',
        notes: '',
        progress_current: '0',
        progress_total: '1',
        status: 'pending'
      });
    }
  }, [isOpen, customerAddress]);

  const handleInputChange = (field: keyof JobFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.customer || formData.customer === 0) {
      alert('Please select a customer');
      return;
    }
    
    if (!formData.job_type) {
      alert('Please select a job type');
      return;
    }
    
    if (!formData.description) {
      alert('Please provide a description');
      return;
    }
    
    if (!formData.scheduled_for || !formData.scheduled_time) {
      alert('Please provide date and time');
      return;
    }
    
    if (!formData.address) {
      alert('Please provide an address');
      return;
    }

    setIsSubmitting(true);
    try {
      // Combine date and time
      const scheduledDateTime = formData.scheduled_for && formData.scheduled_time 
        ? `${formData.scheduled_for}T${formData.scheduled_time}`
        : '';

      const jobData = {
        customer: Number(formData.customer),
        job_type: formData.job_type,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        scheduled_for: scheduledDateTime,
        assigned_to: user?.role === 'solo' ? user.id : Number(formData.assigned_to),
        progress_current: Number(formData.progress_current),
        progress_total: Number(formData.progress_total),
        amount: Number(formData.amount) || 0,
        address: formData.address,
        primary_trade: user?.primary_trade,
        owner: user?.id,
      };

      const success = await createWorkOrder(jobData);
      
      if (success) {
        notifyJobCreated(formData.job_type);
        await getWorkOrders(true);
        onClose();
      }
    } catch (error) {
      console.error('Error creating job:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return 'Customer Selection';
      case 2: return 'Basic Information';
      case 3: return 'Scheduling';
      case 4: return 'Assignment & Location';
      case 5: return 'Financial Details';
      case 6: return 'Additional Details';
      case 7: return 'Review & Submit';
      default: return '';
    }
  };

  const getStepIcon = (step: number) => {
    switch (step) {
      case 1: return <User className="w-5 h-5" />;
      case 2: return <FileText className="w-5 h-5" />;
      case 3: return <Calendar className="w-5 h-5" />;
      case 4: return <MapPin className="w-5 h-5" />;
      case 5: return <DollarSign className="w-5 h-5" />;
      case 6: return <Tag className="w-5 h-5" />;
      case 7: return <CheckCircle className="w-5 h-5" />;
      default: return null;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Who is this job for?
              </label>
              <select
                value={formData.customer}
                onChange={(e) => handleInputChange('customer', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select customer...</option>
                {customers?.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        );

             case 2:
         return (
           <div className="space-y-6">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 What type of job is this?
               </label>
               <select
                 value={formData.job_type}
                 onChange={(e) => handleInputChange('job_type', e.target.value)}
                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                 required
               >
                 <option value="">Select job type...</option>
                 <option value="Maintenance">Maintenance</option>
                 <option value="Repair">Repair</option>
                 <option value="Installation">Installation</option>
                 <option value="Emergency">Emergency</option>
                 <option value="Inspection">Inspection</option>
                 <option value="Upgrade">Upgrade</option>
               </select>
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 Tell me about the work needed
               </label>
               <textarea
                 value={formData.description}
                 onChange={(e) => handleInputChange('description', e.target.value)}
                 rows={4}
                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                 placeholder="Describe the work to be performed..."
                 required
               />
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 What's the current status?
               </label>
               <select
                 value={formData.status}
                 onChange={(e) => handleInputChange('status', e.target.value)}
                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                 required
               >
                 <option value="pending">Pending - Not yet started</option>
                 <option value="confirmed">Confirmed - Ready to begin</option>
                 <option value="in_progress">In Progress - Currently being worked on</option>
                 <option value="completed">Completed - Job finished</option>
                 <option value="cancelled">Cancelled - Job cancelled</option>
               </select>
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 What's the priority level?
               </label>
               <select
                 value={formData.priority}
                 onChange={(e) => handleInputChange('priority', e.target.value)}
                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
               >
                 <option value="low">Low - Can be scheduled normally</option>
                 <option value="medium">Medium - Should be done soon</option>
                 <option value="high">High - Urgent attention needed</option>
                 <option value="urgent">Urgent - Emergency situation</option>
               </select>
             </div>
           </div>
         );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                When should this be done?
              </label>
              <input
                type="date"
                value={formData.scheduled_for}
                onChange={(e) => handleInputChange('scheduled_for', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What time should we start?
              </label>
              <input
                type="time"
                value={formData.scheduled_time}
                onChange={(e) => handleInputChange('scheduled_time', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How long do you think this will take? (hours)
              </label>
              <input
                type="number"
                value={formData.estimated_duration}
                onChange={(e) => handleInputChange('estimated_duration', e.target.value)}
                min="0.5"
                step="0.5"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="2"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            {user?.role === 'admin' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Who should handle this job?
                </label>
                <select
                  value={formData.assigned_to}
                  onChange={(e) => handleInputChange('assigned_to', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select team member...</option>
                  {teamMembers?.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.first_name} {member.last_name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Where is this located?
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Job location address"
                required
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What's the estimated cost? ($)
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                step="0.01"
                min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Any tags or labels? (comma separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., System: 1yr old, SEER: 20, R-410A"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Any additional notes?
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Any special instructions or notes..."
              />
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-4">Review Job Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Customer:</span>
                  <p className="text-gray-900">
                    {customers?.find(c => c.id === formData.customer)?.name || 'Unknown Customer'}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Job Type:</span>
                  <p className="text-gray-900">{formData.job_type}</p>
                </div>
                                 <div>
                   <span className="font-medium text-gray-700">Priority:</span>
                   <p className="text-gray-900 capitalize">{formData.priority}</p>
                 </div>
                 <div>
                   <span className="font-medium text-gray-700">Status:</span>
                   <p className="text-gray-900 capitalize">{formData.status.replace('_', ' ')}</p>
                 </div>
                 <div className="md:col-span-2">
                   <span className="font-medium text-gray-700">Description:</span>
                   <p className="text-gray-900">{formData.description}</p>
                 </div>
                <div>
                  <span className="font-medium text-gray-700">Date:</span>
                  <p className="text-gray-900">{formData.scheduled_for}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Time:</span>
                  <p className="text-gray-900">{formData.scheduled_time}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Duration:</span>
                  <p className="text-gray-900">{formData.estimated_duration} hours</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Amount:</span>
                  <p className="text-gray-900">${formData.amount || '0.00'}</p>
                </div>
                <div className="md:col-span-2">
                  <span className="font-medium text-gray-700">Address:</span>
                  <p className="text-gray-900">{formData.address}</p>
                </div>
                {formData.tags && (
                  <div className="md:col-span-2">
                    <span className="font-medium text-gray-700">Tags:</span>
                    <p className="text-gray-900">{formData.tags}</p>
                  </div>
                )}
                {formData.notes && (
                  <div className="md:col-span-2">
                    <span className="font-medium text-gray-700">Notes:</span>
                    <p className="text-gray-900">{formData.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Create New Job
            </h2>
            <p className="text-sm text-gray-600">
              {customerName ? `For ${customerName}` : 'Step-by-step job creation'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round((currentStep / totalSteps) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Title */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {getStepIcon(currentStep)}
            <h3 className="text-lg font-medium text-gray-900">
              {getStepTitle(currentStep)}
            </h3>
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              currentStep === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>

          <div className="flex space-x-2">
            {currentStep < totalSteps ? (
              <button
                onClick={nextStep}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    <span>Create Job</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewJobForm;
