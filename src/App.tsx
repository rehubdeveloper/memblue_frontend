import React, { useContext, useEffect, useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { mockBusiness } from './data/mockData';
import TradeSelection from './components/Setup/TradeSelection';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import DashboardOverview from './components/Dashboard/DashboardOverview';
import ScheduleView from './components/Schedule/ScheduleView';
import JobsList from './components/Jobs/JobsList';
import CustomersList from './components/Customers/CustomersList';
import EstimatesInvoices from './components/Estimates/EstimatesInvoices';
import InventoryList from './components/Inventory/InventoryList';
import ReportsView from './components/Reports/ReportsView';
import MobileDashboard from './components/Technician/MobileDashboard';
import TradeSpecificJobForm from './components/Jobs/TradeSpecificJobForm';
import TradeSpecificEstimate from './components/Estimates/TradeSpecificEstimate';
import LandingPage from './components/Landing/LandingPage';
import { TradeType } from './types';
import LoginPage from './components/Login/Login';
import { AuthContext } from './context/AppContext';

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gray-100 flex items-center justify-center">
    <div className="bg-white p-8 rounded-lg shadow-md flex flex-col items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-gray-600 text-lg">Loading your profile...</p>
    </div>
  </div>
);

function App() {
  const authContext = useContext(AuthContext);
  const isLoading = authContext?.isLoading ?? false;
  const { currentUser, isAuthenticated, switchUser, } = useAuth();
  const [activeTab, setActiveTab] = useState(
    currentUser?.role === 'technician' ? 'mobile-dashboard' : 'dashboard'
  );
  const [showJobForm, setShowJobForm] = useState(false);
  const [showEstimateForm, setShowEstimateForm] = useState(false);
  const [businessSetup, setBusinessSetup] = useState(mockBusiness.setupComplete);
  const [showLanding, setShowLanding] = useState(true);
  const [showLogin, setShowLogin] = useState(false);

  const handleGetStarted = () => {
    setShowLanding(false);
  };

  const handleLogin = () => {
    setShowLogin(true);
  };
  const getToken = () => {
    const token = localStorage.getItem("token")
    return token
  }
  const [token, setToken] = useState<string | null>(null)
  useEffect(() => {
    const newtoken = getToken();
    setToken(newtoken)
  }, []);
  // Show loading spinner while fetching user profile
  if (isLoading && !token == null) {
    return <LoadingSpinner />;
  }

  if (showLogin) {
    return <LoginPage
      completeLogin={() => {
        alert('Login Successful!')
        setShowLogin(false);
        setShowLanding(false);
        setBusinessSetup(true);
      }}
      signUp={() => {
        setShowLogin(false);
        setBusinessSetup(false);
        setShowLanding(false);
      }}
    />
  }

  // Show landing page by default
  if (showLanding) {
    return <LandingPage onGetStarted={handleGetStarted} onLogin={handleLogin} />;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-6 lg:p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-4">MemBlue Login</h1>
          <p className="text-center text-gray-600">Please log in to continue</p>
        </div>
      </div>
    );
  }

  if (!businessSetup) {
    return (
      <TradeSelection
        onComplete={(userData) => {
          if (userData !== null) {
            alert('Registration Successful, Welcome To Memblue!')
            setShowLanding(true);
            setBusinessSetup(false);
          }
        }}
        login={() => {
          setShowLogin(true);
          setBusinessSetup(true);
        }}
      />
    );
  }

  const handleNewJob = (jobData: any) => {
    console.log('New job created:', jobData);
    setShowJobForm(false);
  };

  const handleNewEstimate = (estimateData: any) => {
    console.log('New estimate created:', estimateData);
    setShowEstimateForm(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'schedule':
        return <ScheduleView />;
      case 'jobs':
      case 'my-jobs':
        return (
          <>
            <JobsList onNewJob={() => setShowJobForm(true)} />
            {showJobForm && (
              <TradeSpecificJobForm
                trade={mockBusiness.primaryTrade}
                onClose={() => setShowJobForm(false)}
                onSubmit={handleNewJob}
              />
            )}
          </>
        );
      case 'customers':
        return <CustomersList />;
      case 'estimates':
        return (
          <>
            <EstimatesInvoices onNewEstimate={() => setShowEstimateForm(true)} />
            {showEstimateForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                    <h2 className="text-xl font-semibold">New Estimate</h2>
                    <button
                      onClick={() => setShowEstimateForm(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      ×
                    </button>
                  </div>
                  <div className="p-4">
                    <TradeSpecificEstimate
                      trade={mockBusiness.primaryTrade}
                      onSave={handleNewEstimate}
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        );
      case 'inventory':
        return <InventoryList />;
      case 'reports':
        return <ReportsView />;
      case 'mobile-dashboard':
        return <MobileDashboard currentUserId={currentUser.id} />;
      case 'settings':
        return (
          <div className="p-4 lg:p-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Settings</h1>
            <div className="bg-white rounded-lg p-4 lg:p-6 shadow-sm border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-4">Business Configuration</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Primary Trade</label>
                  <p className="text-slate-900">{mockBusiness.primaryTrade.toUpperCase()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Business Type</label>
                  <p className="text-slate-900 capitalize">{mockBusiness.businessType}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Service Area</label>
                  <p className="text-slate-900">Memphis Metro ({mockBusiness.serviceAreaZipcodes.length} zip codes)</p>
                </div>
                <button
                  onClick={() => setBusinessSetup(false)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full sm:w-auto"
                >
                  Reconfigure Business
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar
        currentUser={currentUser}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <Header
          currentUser={currentUser}
          onUserSwitch={switchUser}
        />

        <main className="flex-1 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;