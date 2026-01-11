import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Input = forwardRef(({
    label,
    id,
    type = 'text',
    error,
    className,
    ...props
}, ref) => {
    return (
        <div className="w-full">
            {label && (
                <label
                    htmlFor={id}
                    className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                    {label}
                </label>
            )}
            <input
                ref={ref}
                id={id}
                type={type}
                className={twMerge(
                    clsx(
                        'w-full rounded-lg border bg-white px-4 py-2 text-sm transition-colors focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-white',
                        error
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                            : 'border-gray-300 focus:border-primary focus:ring-primary/20 dark:border-gray-700',
                        className
                    )
                )}
                {...props}
            />
            {error && (
                <p className="mt-1 text-xs text-red-500">{error}</p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
