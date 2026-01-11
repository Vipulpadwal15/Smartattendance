import React, { useContext } from 'react';
import { UserCircle } from 'lucide-react';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
    const { user } = useContext(AuthContext);

    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white/80 px-6 backdrop-blur-md dark:bg-gray-800/80 dark:border-gray-700">
            <div className="flex items-center gap-4 md:hidden">
                {/* Mobile Menu Trigger would go here */}
                <span className="text-lg font-bold text-primary">SmartAttend</span>
            </div>

            <div className="ml-auto flex items-center gap-4">
                <div className="flex items-center gap-2 rounded-full bg-gray-50 px-3 py-1.5 dark:bg-gray-700/50">
                    <UserCircle className="h-5 w-5 text-gray-500 dark:text-gray-300" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        {user?.name || 'Teacher'}
                    </span>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
