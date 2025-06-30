import React from 'react';
import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom';
import TradeSelection from './components/Setup/TradeSelection';
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
import LoginPage from './components/Login/Login';
import OnboardPage from './components/TeamOnboarding/Onboarding';
import TeamInvite from './components/Team/Team';
import DashboardLayout from './components/Layout/DashboardLayout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/onboard/:inviteToken" element={<OnboardPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<TradeSelection onComplete={() => { }} login={() => { }} />} />

        {/* Protected dashboard layout */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardOverview />} />
          <Route path="/mobile-dashboard" element={<MobileDashboard />} />
          <Route path="/my-jobs" element={<JobsList />} />
          <Route path="/schedule" element={<ScheduleView />} />
          <Route path="/jobs" element={<JobsList />} />
          <Route path="/customers" element={<CustomersList />} />
          <Route path="/estimates" element={<EstimatesInvoices />} />
          <Route path="/inventory" element={<InventoryList />} />
          <Route path="/reports" element={<ReportsView />} />
          <Route path="/team" element={<TeamInvite />} />
          <Route path="/settings" element={<div className="p-4 lg:p-6">Settings Page</div>} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;