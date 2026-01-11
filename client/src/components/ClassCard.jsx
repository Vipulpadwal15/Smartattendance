import React from 'react';
import { Users, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import Card from './ui/Card';
import Button from './ui/Button';

const ClassCard = ({ classItem, onEdit, onDelete }) => {
    return (
        <Card className="relative group transition-all hover:shadow-lg dark:hover:bg-gray-800/80">
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button
                    onClick={() => onEdit(classItem)}
                    className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-full dark:hover:bg-blue-900/20"
                    title="Edit"
                >
                    <Edit2 className="h-4 w-4" />
                </button>
                <button
                    onClick={() => onDelete(classItem._id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-full dark:hover:bg-red-900/20"
                    title="Delete"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>

            <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {classItem.subjectName}
                </h3>
                <p className="text-sm font-medium text-primary">
                    {classItem.semester}
                </p>
            </div>

            <div className="flex items-center text-gray-500 dark:text-gray-400">
                <Users className="mr-2 h-4 w-4" />
                <span className="text-sm">
                    {classItem.students ? classItem.students.length : 0} Students
                </span>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={(e) => { e.preventDefault(); /* Navigate to Attendance */ }}
                    className="text-sm"
                >
                    Take Attendance
                </Button>
            </div>
        </Card>
    );
};

export default ClassCard;
