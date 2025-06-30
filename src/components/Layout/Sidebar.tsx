import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Calendar,
  ClipboardList,
  Users,
  FileText,
  Package,
  BarChart3,
  Settings,
  Home,
  Smartphone,
  Wrench,
  Menu,
  X,
  UsersRound
} from 'lucide-react';
import { tradeConfigs } from '../../data/tradeConfigs';
import { mockBusiness } from '../../data/mockData';

interface SidebarProps {
  currentUser: any;
}

const Sidebar: React.FC<SidebarProps> = ({ currentUser }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const tradeConfig = tradeConfigs[mockBusiness.primaryTrade];
  const navigate = useNavigate();
  const location = useLocation();

  const adminMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, route: '/dashboard' },
    { id: 'schedule', label: 'Schedule', icon: Calendar, route: '/schedule' },
    { id: 'jobs', label: 'Work Orders', icon: ClipboardList, route: '/jobs' },
    { id: 'customers', label: 'Customers', icon: Users, route: '/customers' },
    { id: 'estimates', label: 'Estimates', icon: FileText, route: '/estimates' },
    { id: 'inventory', label: 'Inventory', icon: Package, route: '/inventory' },
    { id: 'reports', label: 'Reports', icon: BarChart3, route: '/reports' },
    { id: 'team', label: 'Team', icon: UsersRound, route: '/team' },
    { id: 'settings', label: 'Settings', icon: Settings, route: '/settings' }
  ];

  const technicianMenuItems = [
    { id: 'mobile-dashboard', label: 'My Dashboard', icon: Smartphone, route: '/mobile-dashboard' },
    { id: 'my-jobs', label: 'My Jobs', icon: ClipboardList, route: '/my-jobs' },
    { id: 'schedule', label: 'Schedule', icon: Calendar, route: '/schedule' }
  ];

  // Determine menu items based on business_type
  let menuItems;
  if (['solo_operator', 'team_business'].includes(currentUser.business_type)) {
    // For solo_operator, remove Team tab
    const filteredAdminMenuItems = adminMenuItems.filter(item =>
      item.id !== 'team' || currentUser.business_type === 'team_business'
    );
    menuItems = filteredAdminMenuItems;
  } else {
    menuItems = technicianMenuItems;
  }

  const handleMenuItemClick = (route: string) => {
    navigate(route);
    setIsMobileMenuOpen(false);
  };

  const capitalize = (str: any) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };


  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-cyan-700 text-white rounded-lg shadow-lg"
      >
        <Menu size={24} />
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        bg-slate-900 text-white overflow-y-auto w-64 min-h-screen p-4 fixed lg:relative z-50
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Mobile Close Button */}
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-2 text-white hover:bg-slate-800 rounded-lg"
        >
          <X size={20} />
        </button>

        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Wrench className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-blue-400">MemBlue</h1>
              <p className="text-xs text-slate-400">Memphis Trade Ops</p>
            </div>
          </div>

          {/* Trade Badge */}
          <div className="flex items-center space-x-2 p-2 bg-slate-800 rounded-lg">
            <span className="text-lg">{tradeConfig.icon}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">{currentUser?.username || 'name'}</p>
              <p className="text-xs text-slate-400 truncate">{`${capitalize(currentUser?.primary_trade)} services`}</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center space-x-3 p-3 bg-slate-800 rounded-lg">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-semibold">{currentUser?.first_name?.charAt(0)}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate">{`${capitalize(currentUser?.first_name)} ${capitalize(currentUser?.last_name)}`}</p>
              <p className="text-xs text-slate-400 capitalize">{currentUser.role}</p>
            </div>
          </div>
        </div>

        <nav className="space-y-1 flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.route;
            return (
              <button
                key={item.id}
                onClick={() => handleMenuItemClick(item.route)}
                className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-colors ${isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
              >
                <Icon size={20} className="flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Memphis Pride Footer */}
        <div className="mt-auto pt-6">
          <div className="text-center p-3 bg-slate-800 rounded-lg">
            <p className="text-xs text-slate-400 mb-1">Proudly serving</p>
            <p className="text-sm font-semibold text-blue-400">Memphis, TN</p>
            <p className="text-xs text-slate-500">901 Strong 💪</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;