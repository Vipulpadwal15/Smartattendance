import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const AttendanceToggle = ({ status, onChange }) => {
    const isPresent = status === 'Present';

    return (
        <button
            type="button"
            onClick={() => onChange(isPresent ? 'Absent' : 'Present')}
            className={twMerge(
                clsx(
                    'relative flex h-8 w-24 items-center rounded-full p-1 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
                    isPresent
                        ? 'bg-emerald-100 text-emerald-800 ring-emerald-500'
                        : 'bg-red-100 text-red-800 ring-red-500'
                )
            )}
        >
            <motion.div
                className={clsx(
                    'flex h-6 w-11 items-center justify-center rounded-full text-xs font-bold shadow-sm',
                    isPresent ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                )}
                layout
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                style={{
                    position: 'absolute',
                    left: isPresent ? 'calc(100% - 3rem)' : '0.25rem', // Simple positioning
                }}
            >
                {isPresent ? 'P' : 'A'}
            </motion.div>
            <span className={clsx("w-full text-center text-xs font-medium", isPresent ? "pl-2" : "pr-2")}>
                {isPresent ? 'Present' : 'Absent'}
            </span>
        </button>
    );
};

export default AttendanceToggle;
