import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, color }) => {
    return (
        <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl glass-card p-6 hover-lift group relative overflow-hidden"
        >
            {/* Background Glow */}
            <div className={`absolute inset-0 ${color} opacity-5 group-hover:opacity-10 transition-opacity`} />

            <div className="relative flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                        {title}
                    </p>
                    <p className="mt-2 text-3xl font-bold text-white">
                        {value}
                    </p>
                </div>
                <div className={`rounded-xl ${color} p-3 shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                </div>
            </div>
        </motion.div>
    );
};

export default StatCard;
