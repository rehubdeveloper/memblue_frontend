import React, { useContext } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AppContext';

const DashboardLayout: React.FC = () => {
    const context = useContext(AuthContext);
    const user = context?.user;

    if (!user) {
        // Show a modern spinner while loading
        return (
            <div className="flex items-center justify-center min-h-screen">
                <svg className="animate-spin h-8 w-8 text-blue-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                <span className="text-slate-600 text-lg">Loading...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Header />
            <div className="flex flex-1">
                <Sidebar currentUser={user} />
                <main className="flex-1 ml-0 lg:ml-4 p-4 lg:p-6 bg-slate-50 min-h-screen">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout; 