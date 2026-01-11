import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from './ui/Modal';
import Input from './ui/Input';
import Button from './ui/Button';

const AddClassModal = ({ isOpen, onClose, onSaved, classToEdit }) => {
    const [subjectName, setSubjectName] = useState('');
    const [semester, setSemester] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (classToEdit) {
            setSubjectName(classToEdit.subjectName);
            setSemester(classToEdit.semester);
        } else {
            setSubjectName('');
            setSemester('');
        }
        setError('');
    }, [classToEdit, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!subjectName || !semester) {
            setError('Please fill in all fields');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            if (classToEdit) {
                await axios.put(`/api/classes/${classToEdit._id}`, {
                    subjectName,
                    semester,
                });
            } else {
                await axios.post('/api/classes', {
                    subjectName,
                    semester,
                });
            }
            onSaved();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save class');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={classToEdit ? 'Edit Class' : 'Add New Class'}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="rounded bg-red-50 p-2 text-sm text-red-500 text-center">
                        {error}
                    </div>
                )}
                <Input
                    label="Subject Name"
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    placeholder="e.g. Advanced Database Systems"
                    autoFocus
                />
                <Input
                    label="Semester"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    placeholder="e.g. Sem 5"
                />
                <div className="flex justify-end gap-3 pt-4">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        isLoading={isLoading}
                    >
                        {classToEdit ? 'Update Class' : 'Create Class'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default AddClassModal;
