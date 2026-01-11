import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Card = ({
    children,
    className,
    title,
    glass = false, // Enable glassmorphism
    noPadding = false,
    ...props
}) => {
    return (
        <div
            className={twMerge(
                clsx(
                    'rounded-xl transition-all shadow-sm',
                    glass
                        ? 'bg-white/70 backdrop-blur-md border border-white/20 text-gray-900 dark:bg-gray-800/60 dark:border-gray-700/50 dark:text-white'
                        : 'bg-white border border-gray-100 text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-white',
                    !noPadding && 'p-6',
                    className
                )
            )}
            {...props}
        >
            {title && (
                <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
                    {title}
                </h3>
            )}
            {children}
        </div>
    );
};

export default Card;
