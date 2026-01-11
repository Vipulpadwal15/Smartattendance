import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    CalendarCheck,
    BarChart,
    LogOut,
    QrCode
} from 'lucide-react';
import { clsx } from 'clsx';
import AuthContext from '../context/AuthContext';

const Sidebar = () => {
    const { logout } = useContext(AuthContext);

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: Users, label: 'Classes', path: '/classes' },
        { icon: CalendarCheck, label: 'Attendance', path: '/attendance' },
        { icon: QrCode, label: 'QR Generator', path: '/qr-generator' },
        { icon: BarChart, label: 'Reports', path: '/reports' },
    ];

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
            <div className="flex h-16 items-center border-b border-gray-200 px-6 dark:border-gray-800">
                <h1 className="text-xl font-bold text-primary">SmartAttend</h1>
            </div>

            <nav className="space-y-1 px-3 py-4">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            clsx(
                                'flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-primary/10 text-primary dark:bg-primary/20'
                                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                            )
                        }
                    >
                        <item.icon className="mr-3 h-5 w-5" />
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <div className="absolute bottom-4 left-0 w-full px-3">
                <button
                    onClick={logout}
                    className="flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                    <LogOut className="mr-3 h-5 w-5" />
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
