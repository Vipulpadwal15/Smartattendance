import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    BookOpen,
    CalendarCheck,
    BarChart3,
    LogOut
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Sidebar = ({ logout }) => {
    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Classes', path: '/classes', icon: BookOpen },
        { name: 'Attendance', path: '/attendance', icon: CalendarCheck },
        { name: 'Reports', path: '/reports', icon: BarChart3 },
    ];

    return (
        <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700 hidden md:flex flex-col">
            <div className="flex h-16 items-center justify-center border-b border-gray-100 dark:border-gray-700/50">
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    SmartAttend
                </h1>
            </div>

            <nav className="flex-1 space-y-1 px-3 py-4">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            className={({ isActive }) =>
                                twMerge(
                                    clsx(
                                        'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all',
                                        isActive
                                            ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground'
                                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800/50'
                                    )
                                )
                            }
                        >
                            <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                            {item.name}
                        </NavLink>
                    );
                })}
            </nav>

            <div className="border-t border-gray-100 p-4 dark:border-gray-700/50">
                <button
                    onClick={logout}
                    className="flex w-full items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors dark:hover:bg-red-900/20"
                >
                    <LogOut className="mr-3 h-5 w-5" />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
