import React from 'react';
import { motion } from 'framer-motion';
import Card from './ui/Card';

const StatCard = ({ title, value, icon: Icon, color = 'bg-primary' }) => {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            transition={{ type: 'spring', stiffness: 300 }}
        >
            <Card className="flex items-center gap-4 border-l-4 border-l-primary">
                <div className={`p-3 rounded-full ${color}/10`}>
                    <Icon className={`h-8 w-8 ${color.replace('bg-', 'text-')}`} />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{value}</h3>
                </div>
            </Card>
        </motion.div>
    );
};

export default StatCard;
