import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import ClassCard from '../components/ClassCard';
import AddClassModal from '../components/AddClassModal';
import Spinner from '../components/ui/Spinner';

const Classes = () => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [classToEdit, setClassToEdit] = useState(null);

    const fetchClasses = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/api/classes');
            setClasses(data);
        } catch (error) {
            console.error('Error fetching classes:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClasses();
    }, []);

    const handleAddClick = () => {
        setClassToEdit(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (classItem) => {
        setClassToEdit(classItem);
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (id) => {
        if (window.confirm('Are you sure you want to delete this class? This action cannot be undone.')) {
            try {
                await axios.delete(`/api/classes/${id}`);
                fetchClasses(); // Refresh list
            } catch (error) {
                console.error('Error deleting class:', error);
                alert('Failed to delete class');
            }
        }
    };

    const handleModalSave = () => {
        fetchClasses();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Manage Classes
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Create and manage your subjects and student batches.
                    </p>
                </div>
                <Button onClick={handleAddClick} className="shadow-lg shadow-primary/20">
                    <Plus className="mr-2 h-4 w-4" /> Add Class
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Spinner size={40} />
                </div>
            ) : (
                <>
                    {classes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                            <p className="text-gray-500 font-medium">No classes found</p>
                            <p className="text-sm text-gray-400 mb-4">Get started by creating a new class.</p>
                            <Button variant="outline" onClick={handleAddClick}>Create First Class</Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {classes.map((cls) => (
                                <motion.div
                                    key={cls._id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <ClassCard
                                        classItem={cls}
                                        onEdit={handleEditClick}
                                        onDelete={handleDeleteClick}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    )}
                </>
            )}

            <AddClassModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSaved={handleModalSave}
                classToEdit={classToEdit}
            />
        </div>
    );
};

export default Classes;
