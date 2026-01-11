import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Modal = ({ isOpen, onClose, title, children }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => (document.body.style.overflow = 'unset');
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {title}
                        </h3>
                        <button
                            onClick={onClose}
                            className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        </button>
                    </div>
                    {children}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default Modal;
