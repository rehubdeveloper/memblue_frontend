import React, { useContext } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AppContext';

const DashboardLayout: React.FC = () => {
    const context = useContext(AuthContext);
    const user = context?.user;

    if (!user) {
        // Optionally, show a loading spinner or redirect to login
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Header />
            <div className="flex flex-1">
                <Sidebar currentUser={user} />
                <main className="flex-1 ml-0 lg:ml-64 p-4 lg:p-6 bg-slate-50 min-h-screen">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout; 