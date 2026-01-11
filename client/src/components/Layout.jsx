import React, { useContext } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Spinner from './ui/Spinner';

const Layout = () => {
    const { user, logout, loading } = useContext(AuthContext);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
                <Spinner size={40} />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
            <Sidebar logout={logout} />

            <div className="flex flex-1 flex-col overflow-hidden ml-0 md:ml-64">
                <Navbar />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
