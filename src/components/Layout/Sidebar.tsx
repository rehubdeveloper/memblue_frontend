import React, { useState } from 'react';
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
  X
} from 'lucide-react';
import { User } from '../../types';
import { tradeConfigs } from '../../data/tradeConfigs';
import { mockBusiness } from '../../data/mockData';

interface SidebarProps {
  currentUser: User;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentUser, activeTab, onTabChange }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const tradeConfig = tradeConfigs[mockBusiness.primaryTrade];
  
  const adminMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'jobs', label: 'Work Orders', icon: ClipboardList },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'estimates', label: 'Estimates', icon: FileText },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const technicianMenuItems = [
    { id: 'mobile-dashboard', label: 'My Dashboard', icon: Smartphone },
    { id: 'my-jobs', label: 'My Jobs', icon: ClipboardList },
    { id: 'schedule', label: 'Schedule', icon: Calendar }
  ];

  const menuItems = currentUser.role === 'admin' ? adminMenuItems : technicianMenuItems;

  const handleMenuItemClick = (itemId: string) => {
    onTabChange(itemId);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 text-white rounded-lg shadow-lg"
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
        bg-slate-900 text-white w-64 min-h-screen p-4 fixed lg:relative z-50
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
              <p className="text-sm font-medium text-white truncate">{tradeConfig.name}</p>
              <p className="text-xs text-slate-400 truncate">{mockBusiness.name}</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center space-x-3 p-3 bg-slate-800 rounded-lg">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-semibold">{currentUser.name.charAt(0)}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate">{currentUser.name}</p>
              <p className="text-xs text-slate-400 capitalize">{currentUser.role}</p>
            </div>
          </div>
        </div>

        <nav className="space-y-1 flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleMenuItemClick(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-colors ${
                  activeTab === item.id
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