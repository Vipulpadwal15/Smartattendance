import React from 'react';
import { motion } from 'framer-motion';
import AnimatedCounter from './ui/AnimatedCounter';

const EnhancedStatCard = ({
    title,
    value,
    icon: Icon,
    gradient = 'gradient-primary',
    trend = null,
    suffix = ''
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="relative overflow-hidden rounded-2xl glass-card hover-lift group"
        >
            {/* Gradient Background */}
            <div className={`absolute inset-0 ${gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />

            {/* Shimmer Effect */}
            <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                            {title}
                        </p>
                        <div className="mt-2 flex items-baseline gap-2">
                            <h3 className="text-4xl font-bold text-white">
                                <AnimatedCounter value={typeof value === 'number' ? value : parseFloat(value) || 0} suffix={suffix} />
                            </h3>
                            {trend && (
                                <span className={`text-sm font-medium ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {trend > 0 ? '+' : ''}{trend}%
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Icon */}
                    <div className={`${gradient} rounded-xl p-3 shadow-lg`}>
                        <Icon className="h-6 w-6 text-white" />
                    </div>
                </div>
            </div>

            {/* Bottom Glow */}
            <div className={`absolute bottom-0 left-0 right-0 h-1 ${gradient} opacity-50`} />
        </motion.div>
    );
};

export default EnhancedStatCard;
