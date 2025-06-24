import React, { useState } from 'react';
import { Check, ArrowRight, User, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react';

// Types
interface TradeConfig {
  name: string;
  icon: string;
  jobTypes: string[];
}

interface Errors {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  username?: string;
  email?: string;
  password?: string;
  password2?: string;
  primary_trade?: string;
  submit?: string;
}

interface FormData {
  username: string;
  email: string;
  password: string;
  password2: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  primary_trade: string;
  secondary_trades: string[];
  business_type: string;
}

interface TradeSelectionProps {
  onComplete: (formData: FormData) => void;
  login: () => void;
}

// Trade configs with mapping to backend names
const tradeConfigs: Record<string, TradeConfig> = {
  hvac: {
    name: 'HVAC Pro',
    icon: '🔥',
    jobTypes: ['Maintenance', 'Repair', 'Installation', 'Filter Change']
  },
  electrical: {
    name: 'Electrician Pro',
    icon: '⚡',
    jobTypes: ['Outlet Installation', 'Panel Upgrade', 'Wiring Repair']
  },
  plumbing: {
    name: 'Plumber Pro',
    icon: '💧',
    jobTypes: ['Leak Repair', 'Drain Cleaning', 'Fixture Installation']
  },
  locksmith: {
    name: 'Locksmith Pro',
    icon: '🔑',
    jobTypes: ['Lockout Service', 'Lock Installation', 'Key Duplication']
  },
  'general-contractor': {
    name: 'GC Pro',
    icon: '🧱',
    jobTypes: ['Renovation', 'New Construction', 'Repair']
  }
};

// Mapping from frontend trade keys to backend trade names
const tradeNameMapping: Record<string, string> = {
  hvac: 'hvac_pro',
  electrical: 'electrician_pro',
  plumbing: 'plumber_pro',
  locksmith: 'locksmith_pro',
  'general-contractor': 'general_contractor_pro'
};

const TradeSelection: React.FC<TradeSelectionProps> = ({ onComplete, login }) => {
  const [step, setStep] = useState<number>(1);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<Errors>({});

  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    primary_trade: '',
    secondary_trades: [],
    business_type: 'solo_business'
  });

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Errors = {};

    if (currentStep === 1) {
      if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
      if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
      if (!formData.phone_number.trim()) newErrors.phone_number = 'Phone number is required';
      if (formData.phone_number && !/^\d{3}-\d{3}-\d{4}$/.test(formData.phone_number)) {
        newErrors.phone_number = 'Phone number must be in format: 123-456-7890';
      }
    }

    if (currentStep === 2) {
      if (!formData.username.trim()) newErrors.username = 'Username is required';
      if (formData.username.length < 3) newErrors.username = 'Username must be at least 3 characters';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
      if (!formData.password) newErrors.password = 'Password is required';
      if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
      if (!formData.password2) newErrors.password2 = 'Confirm password is required';
      if (formData.password !== formData.password2) newErrors.password2 = 'Passwords do not match';
    }

    if (currentStep === 3) {
      if (!formData.primary_trade) newErrors.primary_trade = 'Primary trade is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = <K extends keyof FormData>(field: K, value: FormData[K]): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof Errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePhoneChange = (value: string): void => {
    const cleaned = value.replace(/\D/g, '');
    let formatted = cleaned;
    if (cleaned.length >= 6) {
      formatted = `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    } else if (cleaned.length >= 3) {
      formatted = `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    }
    handleInputChange('phone_number', formatted);
  };

  const handleSecondaryTradeToggle = (trade: string): void => {
    // Prevent selecting the same trade as primary
    if (trade === formData.primary_trade) return;

    const newSecondaryTrades = formData.secondary_trades.includes(trade)
      ? formData.secondary_trades.filter(t => t !== trade)
      : [...formData.secondary_trades, trade];

    handleInputChange('secondary_trades', newSecondaryTrades);
  };

  const submitToBackend = async (userData: FormData): Promise<any> => {
    // Format data for backend with proper trade names
    const payload = {
      ...userData,
      primary_trade: tradeNameMapping[userData.primary_trade] || userData.primary_trade,
      secondary_trades: userData.secondary_trades.map(trade => tradeNameMapping[trade] || trade)
    };

    console.log('Sending payload:', payload);

    try {
      const response = await fetch('https://memblue-backend.onrender.com/api/users/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const result = await response.json();

      return result;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const handleComplete = async (): Promise<void> => {
    setIsSubmitting(true);
    try {
      await submitToBackend(formData);
      onComplete(formData);
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : 'Registration failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = (): void => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const prevStep = (): void => {
    setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-4 sm:p-6 lg:p-8 max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Welcome to MemBlue</h1>
          <p className="text-slate-600 text-sm sm:text-base">Memphis's premier trade operations platform</p>

        </div>

        {/* Progress Bar */}
        <div className="flex items-center justify-center mb-6 sm:mb-8">
          <div className="flex items-center space-x-2 sm:space-x-4">
            {[1, 2, 3, 4, 5].map((stepNum, index) => (
              <React.Fragment key={stepNum}>
                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-sm ${step >= stepNum ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                  {stepNum}
                </div>
                {index < 4 && (
                  <div className={`w-8 sm:w-16 h-1 ${step > stepNum ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
                )}
              </React.Fragment>
            ))}

          </div>

        </div>

        {/* Step 1: Personal Information */}
        {step === 1 && (
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 text-center">Personal Information</h2>
            <p className="text-slate-600 text-center mb-6 sm:mb-8 text-sm sm:text-base">Tell us about yourself</p>

            <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">First Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.first_name ? 'border-red-500' : 'border-slate-300'
                        }`}
                      placeholder="Enter your first name"
                    />
                  </div>
                  {errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Last Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.last_name ? 'border-red-500' : 'border-slate-300'
                        }`}
                      placeholder="Enter your last name"
                    />
                  </div>
                  {errors.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.phone_number ? 'border-red-500' : 'border-slate-300'
                      }`}
                    placeholder="123-456-7890"
                    maxLength={12}
                  />
                </div>
                {errors.phone_number && <p className="text-red-500 text-sm mt-1">{errors.phone_number}</p>}
              </div>
            </div>

            <div className="flex justify-center mt-6 sm:mt-8">
              <button
                onClick={nextStep}
                className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 text-sm sm:text-base"
              >
                <span>Continue</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Account Setup */}
        {step === 2 && (
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 text-center">Account Setup</h2>
            <p className="text-slate-600 text-center mb-6 sm:mb-8 text-sm sm:text-base">Create your login credentials</p>

            <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Username *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.username ? 'border-red-500' : 'border-slate-300'
                      }`}
                    placeholder="Choose a username"
                  />
                </div>
                {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-slate-300'
                      }`}
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password ? 'border-red-500' : 'border-slate-300'
                      }`}
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Confirm Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.password2}
                    onChange={(e) => handleInputChange('password2', e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password2 ? 'border-red-500' : 'border-slate-300'
                      }`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password2 && <p className="text-red-500 text-sm mt-1">{errors.password2}</p>}
              </div>
            </div>

            <div className="flex justify-center mt-6 sm:mt-8 space-x-4">
              <button
                onClick={prevStep}
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm sm:text-base"
              >
                Back
              </button>
              <button
                onClick={nextStep}
                className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 text-sm sm:text-base"
              >
                <span>Continue</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Primary Trade Selection */}
        {step === 3 && (
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 text-center">What's your primary trade?</h2>
            <p className="text-slate-600 text-center mb-6 sm:mb-8 text-sm sm:text-base">This will customize your entire MemBlue experience</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {Object.entries(tradeConfigs).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => handleInputChange('primary_trade', key)}
                  className={`p-4 sm:p-6 rounded-lg border-2 transition-all hover:shadow-md ${formData.primary_trade === key
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                    }`}
                >
                  <div className="text-center">
                    <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">{config.icon}</div>
                    <h3 className="font-semibold text-slate-900 mb-1 sm:mb-2 text-sm sm:text-base">{config.name}</h3>
                    <p className="text-xs sm:text-sm text-slate-600">
                      {config.jobTypes.slice(0, 3).join(', ')}...
                    </p>
                  </div>
                  {formData.primary_trade === key && (
                    <div className="mt-2 sm:mt-3 flex justify-center">
                      <Check className="text-blue-600" size={20} />
                    </div>
                  )}
                </button>
              ))}
            </div>
            {errors.primary_trade && <p className="text-red-500 text-sm mt-4 text-center">{errors.primary_trade}</p>}

            <div className="flex justify-center mt-6 sm:mt-8 space-x-4">
              <button
                onClick={prevStep}
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm sm:text-base"
              >
                Back
              </button>
              <button
                onClick={nextStep}
                className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 text-sm sm:text-base"
              >
                <span>Continue</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Secondary Trades */}
        {step === 4 && (
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 text-center">Secondary Trades</h2>
            <p className="text-slate-600 text-center mb-6 sm:mb-8 text-sm sm:text-base">Any secondary trades? (Optional)</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {Object.entries(tradeConfigs)
                .filter(([key]) => key !== formData.primary_trade)
                .map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => handleSecondaryTradeToggle(key)}
                    className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${formData.secondary_trades.includes(key)
                      ? 'border-green-600 bg-green-50'
                      : 'border-slate-200 hover:border-slate-300'
                      }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl sm:text-3xl mb-2">{config.icon}</div>
                      <h3 className="font-medium text-slate-900 text-sm sm:text-base">{config.name}</h3>
                    </div>
                    {formData.secondary_trades.includes(key) && (
                      <div className="mt-2 flex justify-center">
                        <Check className="text-green-600" size={16} />
                      </div>
                    )}
                  </button>
                ))}
            </div>

            <div className="flex justify-center mt-6 sm:mt-8 space-x-4">
              <button
                onClick={prevStep}
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm sm:text-base"
              >
                Back
              </button>
              <button
                onClick={nextStep}
                className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 text-sm sm:text-base"
              >
                <span>Continue</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Business Type */}
        {step === 5 && (
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 text-center">Business Type</h2>
            <p className="text-slate-600 text-center mb-6 sm:mb-8 text-sm sm:text-base">How do you operate your business?</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-2xl mx-auto">
              <button
                onClick={() => handleInputChange('business_type', 'solo_business')}
                className={`p-4 sm:p-6 rounded-lg border-2 transition-all hover:shadow-md ${formData.business_type === 'solo_business'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300'
                  }`}
              >
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">👤</div>
                  <h3 className="font-semibold text-slate-900 mb-1 sm:mb-2 text-sm sm:text-base">Solo Business</h3>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Just you handling jobs and customers
                  </p>
                </div>
                {formData.business_type === 'solo_business' && (
                  <div className="mt-2 sm:mt-3 flex justify-center">
                    <Check className="text-blue-600" size={20} />
                  </div>
                )}
              </button>

              <button
                onClick={() => handleInputChange('business_type', 'team_business')}
                className={`p-4 sm:p-6 rounded-lg border-2 transition-all hover:shadow-md ${formData.business_type === 'team_business'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300'
                  }`}
              >
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">👥</div>
                  <h3 className="font-semibold text-slate-900 mb-1 sm:mb-2 text-sm sm:text-base">Team Business</h3>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Multiple technicians and job coordination
                  </p>
                </div>
                {formData.business_type === 'team_business' && (
                  <div className="mt-2 sm:mt-3 flex justify-center">
                    <Check className="text-blue-600" size={20} />
                  </div>
                )}
              </button>
            </div>

            {errors.submit && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-center text-sm sm:text-base">{errors.submit}</p>
              </div>
            )}

            <div className="flex justify-center mt-6 sm:mt-8 space-x-4">
              <button
                onClick={prevStep}
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-50 text-sm sm:text-base"
                disabled={isSubmitting}
              >
                Back
              </button>
              <button
                onClick={handleComplete}
                disabled={isSubmitting}
                className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Setup</span>
                    <Check size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
        <p className=' mt-4 inline'>Already Have An Account? <p onClick={login} className='mt-4 text-blue-600 text-sm hover:underline inline'>Login</p></p>
      </div>
    </div>
  );
};

export default TradeSelection;