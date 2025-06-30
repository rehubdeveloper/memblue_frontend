import React, { useContext } from 'react';
import { User, Bell, Search, MapPin } from 'lucide-react';
import { User as UserType } from '../../types';
import { mockBusiness } from '../../data/mockData';
import { AuthContext, useAuth } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';



const Header: React.FC = () => {
  const context = useContext(AuthContext);
  const user = context?.user;
  const navigate = useNavigate();
  const handleLogout = () => {
    context?.logout();
    navigate('/');
  };

  const capitalize = (str: any) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };


  return (
    <header className="bg-white border-b border-slate-200 px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 lg:space-x-4 flex-1">
          {/* Search - Hidden on mobile, shown on tablet+ */}
          <div className="relative hidden md:block flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search jobs, customers..."
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
            />
          </div>

          {/* Service Area Indicator */}
          <div className=" flex items-center space-x-2 px-2 lg:px-3 py-2 bg-blue-50 rounded-lg">
            <MapPin className="text-blue-600" size={16} />
            <span className="text-xs lg:text-sm font-medium text-blue-800 hidden sm:inline">Memphis Metro</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 lg:space-x-4">

          {/* Mobile Search Button */}
          <button className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg">
            <Search size={20} />
          </button>

          {/* Notifications */}
          <button className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              3
            </span>
          </button>




          {/* User Avatar and Logout */}
          {user && (
            <>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">{user?.first_name.charAt(0)}</span>
                </div>
                <div className="hidden sm:block">
                  <span className="text-sm font-medium text-slate-700">{capitalize(user?.first_name)}</span>
                  <p className="text-xs text-slate-500">{user?.primary_trade.toUpperCase()}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="ml-2 px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs font-semibold"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;