import React from 'react';
import { motion } from 'framer-motion';

const ProgressRing = ({
    percentage = 0,
    size = 120,
    strokeWidth = 8,
    color = '#4F46E5',
    label = '',
    showPercentage = true
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background Circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="none"
                    className="text-gray-700/30"
                />
                {/* Progress Circle */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    style={{
                        filter: `drop-shadow(0 0 8px ${color}40)`
                    }}
                />
            </svg>

            {/* Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                {showPercentage && (
                    <motion.span
                        className="text-2xl font-bold text-white"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                    >
                        {Math.round(percentage)}%
                    </motion.span>
                )}
                {label && (
                    <span className="text-xs text-gray-400 mt-1">{label}</span>
                )}
            </div>
        </div>
    );
};

export default ProgressRing;
