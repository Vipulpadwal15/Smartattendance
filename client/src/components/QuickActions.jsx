import React from 'react';
import { motion } from 'framer-motion';
import { Play, Calendar, Users, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuickActionCard = ({ icon: Icon, title, description, action, gradient = 'gradient-primary' }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (action) {
            if (typeof action === 'string') {
                navigate(action);
            } else {
                action();
            }
        }
    };

    return (
        <motion.button
            onClick={handleClick}
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.98 }}
            className="relative overflow-hidden rounded-xl glass-card p-6 text-left w-full group"
        >
            {/* Gradient Background */}
            <div className={`absolute inset-0 ${gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />

            <div className="relative z-10">
                <div className={`${gradient} rounded-lg p-3 w-fit mb-4 shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
                <p className="text-sm text-gray-400">{description}</p>
            </div>

            {/* Hover Arrow */}
            <motion.div
                initial={{ x: -10, opacity: 0 }}
                whileHover={{ x: 0, opacity: 1 }}
                className="absolute bottom-4 right-4 text-white"
            >
                →
            </motion.div>
        </motion.button>
    );
};

const QuickActions = () => {
    const actions = [
        {
            icon: Play,
            title: 'Start Session',
            description: 'Generate QR code for attendance',
            action: '/qr-generator',
            gradient: 'gradient-primary'
        },
        {
            icon: Calendar,
            title: 'View Reports',
            description: 'Check attendance analytics',
            action: '/reports',
            gradient: 'gradient-secondary'
        },
        {
            icon: Users,
            title: 'Manage Classes',
            description: 'Add or edit your classes',
            action: '/classes',
            gradient: 'gradient-orange'
        },
        {
            icon: TrendingUp,
            title: 'Analytics',
            description: 'View detailed insights',
            action: '/reports',
            gradient: 'gradient-blue'
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {actions.map((action, index) => (
                <motion.div
                    key={action.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                >
                    <QuickActionCard {...action} />
                </motion.div>
            ))}
        </div>
    );
};

export default QuickActions;
