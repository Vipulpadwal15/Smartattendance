import React from 'react';
import { Users, MoreVertical, Edit2, Trash2, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from './ui/Button';

const ClassCard = ({ classItem, onEdit, onDelete, onManage }) => {
    return (
        <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="relative overflow-hidden rounded-2xl glass-card hover-lift group"
        >
            {/* Gradient Accent */}
            <div className="absolute top-0 left-0 right-0 h-1 gradient-primary" />

            {/* Shimmer Effect */}
            <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative p-6">
                {/* Action Buttons */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-10">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onEdit(classItem)}
                        className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg backdrop-blur-sm border border-blue-500/30"
                        title="Edit"
                    >
                        <Edit2 className="h-4 w-4" />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onDelete(classItem._id)}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg backdrop-blur-sm border border-red-500/30"
                        title="Delete"
                    >
                        <Trash2 className="h-4 w-4" />
                    </motion.button>
                </div>

                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-start gap-3">
                        <div className="gradient-primary rounded-lg p-2.5 shadow-lg">
                            <BookOpen className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-white group-hover:gradient-text transition-all">
                                {classItem.subjectName}
                            </h3>
                            <p className="text-sm font-medium text-primary mt-1">
                                {classItem.semester}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Student Count */}
                <div className="flex items-center gap-2 mb-6 bg-white/5 rounded-lg px-3 py-2 border border-white/10">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-300">
                        <span className="font-bold text-white">{classItem.students ? classItem.students.length : 0}</span> Students
                    </span>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        fullWidth
                        onClick={(e) => { e.preventDefault(); onManage(classItem); }}
                        className="text-sm text-gray-300 hover:text-white hover:bg-white/10 border border-white/10"
                    >
                        <Users className="mr-2 h-4 w-4" /> Manage Students
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        fullWidth
                        onClick={(e) => { e.preventDefault(); /* Navigate to Attendance */ }}
                        className="text-sm gradient-primary text-white border-0 shadow-lg hover:shadow-xl"
                    >
                        Take Attendance
                    </Button>
                </div>
            </div>
        </motion.div>
    );
};

export default ClassCard;
