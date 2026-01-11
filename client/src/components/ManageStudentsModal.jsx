import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Plus, UserPlus } from 'lucide-react';
import Modal from './ui/Modal';
import Input from './ui/Input';
import Button from './ui/Button';
import Spinner from './ui/Spinner';

const ManageStudentsModal = ({ isOpen, onClose, classId, subjectName, classes = [] }) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [adding, setAdding] = useState(false);

    // New Student Form
    const [activeTab, setActiveTab] = useState('single');
    const [sourceClassId, setSourceClassId] = useState('');
    const [name, setName] = useState('');
    const [rollNumber, setRollNumber] = useState('');
    const [addError, setAddError] = useState('');

    useEffect(() => {
        if (isOpen && classId) {
            fetchStudents();
        }
    }, [isOpen, classId]);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`/api/students/${classId}`);
            setStudents(data);
        } catch (error) {
            console.error('Error fetching students', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddStudent = async (e) => {
        e.preventDefault();
        setAdding(true);
        setAddError('');

        try {
            const { data } = await axios.post('/api/students', {
                name,
                rollNumber,
                classId
            });
            setStudents([...students, data]);
            setName('');
            setRollNumber('');
        } catch (error) {
            setAddError(error.response?.data?.message || 'Failed to add student');
        } finally {
            setAdding(false);
        }
    };

    const handleAddDemoStudents = async () => {
        setAdding(true);
        try {
            const startRoll = students.length > 0
                ? Math.max(...students.map(s => parseInt(s.rollNumber) || 0)) + 1
                : 101;

            const demoStudents = Array.from({ length: 5 }, (_, i) => ({
                name: `Student ${startRoll + i}`,
                rollNumber: String(startRoll + i),
                classId
            }));

            // Sequential requests to avoid race conditions (VersionError on Class update)
            for (const s of demoStudents) {
                await axios.post('/api/students', s);
            }

            await fetchStudents();
        } catch (error) {
            console.error('Failed to add demo students', error);
            setAddError('Failed to add demo students');
        } finally {
            setAdding(false);
        }
    };

    const handleCopyFromClass = async () => {
        if (!sourceClassId) return;
        setAdding(true);
        setAddError('');
        try {
            // 1. Fetch students from source class
            const { data: sourceStudents } = await axios.get(`/api/students/${sourceClassId}`);

            if (sourceStudents.length === 0) {
                setAddError('Source class has no students.');
                setAdding(false);
                return;
            }

            // 2. Prepare payload
            const studentsToImport = sourceStudents.map(s => ({
                name: s.name,
                rollNumber: s.rollNumber
            }));

            // 3. Bulk Create
            await axios.post('/api/students/bulk', {
                classId,
                students: studentsToImport
            });

            await fetchStudents();
            setActiveTab('single'); // Reset to default
        } catch (error) {
            console.error('Copy failed', error);
            setAddError('Failed to copy students.');
        } finally {
            setAdding(false);
        }
    };

    const handleCSVUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setAdding(true);
        setAddError('');

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const text = event.target.result;
                const lines = text.split(/\r?\n/);
                const studentsToImport = [];

                lines.forEach(line => {
                    const trimmed = line.trim();
                    if (!trimmed) return;

                    // Allow "Name, RollNo" or "Name,RollNo"
                    const parts = trimmed.split(',');
                    if (parts.length >= 2) {
                        const name = parts[0].trim();
                        const rollNumber = parts[1].trim();

                        // Basic validation
                        if (name && rollNumber) {
                            studentsToImport.push({ name, rollNumber });
                        }
                    }
                });

                if (studentsToImport.length === 0) {
                    setAddError('No valid student data found in file.');
                    setAdding(false);
                    return;
                }

                // Bulk Create
                await axios.post('/api/students/bulk', {
                    classId,
                    students: studentsToImport
                });

                await fetchStudents();
                e.target.value = null; // Reset file input
                setActiveTab('single');
            } catch (error) {
                console.error('CSV Import failed', error);
                setAddError('Failed to import students from file.');
            } finally {
                setAdding(false);
            }
        };

        reader.onerror = () => {
            setAddError('Failed to read file.');
            setAdding(false);
        };

        reader.readAsText(file);
    };

    const handleDeleteStudent = async (studentId) => {
        if (!window.confirm('Remove this student?')) return;
        try {
            await axios.delete(`/api/students/${studentId}`);
            setStudents(students.filter(s => s._id !== studentId));
        } catch (error) {
            console.error('Error deleting student', error);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Students - ${subjectName}`}
        >
            <div className="space-y-6">
                {/* Add Student Form */}
                {/* Tabs for Add Methods */}
                <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
                    <button
                        className={`px-4 py-2 text-sm font-medium ${activeTab === 'single' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                        onClick={() => setActiveTab('single')}
                    >
                        Single Add
                    </button>
                    <button
                        className={`px-4 py-2 text-sm font-medium ${activeTab === 'copy' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                        onClick={() => setActiveTab('copy')}
                    >
                        Copy from Class
                    </button>
                    <button
                        className={`px-4 py-2 text-sm font-medium ${activeTab === 'csv' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                        onClick={() => setActiveTab('csv')}
                    >
                        Upload CSV
                    </button>
                </div>

                {/* Single Add Tab */}
                {activeTab === 'single' && (
                    <div className="flex flex-col gap-3">
                        <form onSubmit={handleAddStudent} className="flex gap-2 items-start bg-gray-50 p-4 rounded-lg dark:bg-gray-700/30">
                            <div className="flex-1 space-y-2">
                                <Input
                                    placeholder="Name (e.g. John Doe)"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="bg-white"
                                />
                            </div>
                            <div className="w-1/3">
                                <Input
                                    placeholder="Roll No"
                                    value={rollNumber}
                                    onChange={(e) => setRollNumber(e.target.value)}
                                    required
                                    className="bg-white text-center"
                                />
                            </div>
                            <Button type="submit" isLoading={adding} className="mt-[2px]">
                                <UserPlus className="h-5 w-5" />
                            </Button>
                        </form>

                        <button
                            type="button"
                            onClick={handleAddDemoStudents}
                            disabled={adding}
                            className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline text-right"
                        >
                            + Quick Add 5 Demo Students
                        </button>
                    </div>
                )}

                {/* Copy From Class Tab */}
                {activeTab === 'copy' && (
                    <div className="bg-gray-50 p-4 rounded-lg dark:bg-gray-700/30 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Source Class</label>
                            <select
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                value={sourceClassId}
                                onChange={(e) => setSourceClassId(e.target.value)}
                            >
                                <option value="">-- Select Class --</option>
                                {classes
                                    .filter(c => c._id !== classId) // Exclude current class
                                    .map(c => (
                                        <option key={c._id} value={c._id}>{c.subjectName} ({c.semester})</option>
                                    ))
                                }
                            </select>
                        </div>
                        <Button
                            onClick={handleCopyFromClass}
                            isLoading={adding}
                            disabled={!sourceClassId}
                            fullWidth
                        >
                            Copy Students
                        </Button>
                    </div>
                )}

                {/* CSV Upload Tab */}
                {activeTab === 'csv' && (
                    <div className="bg-gray-50 p-4 rounded-lg dark:bg-gray-700/30 space-y-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            <p className="mb-2">Upload a <strong>.csv</strong> or <strong>.txt</strong> file with the following format:</p>
                            <code className="block bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs overflow-x-auto">
                                John Doe, 101<br />
                                Jane Smith, 102<br />
                                Alice, 103
                            </code>
                        </div>
                        <input
                            type="file"
                            accept=".csv,.txt"
                            onChange={handleCSVUpload}
                            className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-primary/10 file:text-primary
                                hover:file:bg-primary/20"
                        />
                        {adding && <p className="text-center text-sm text-gray-500">Importing...</p>}
                    </div>
                )}
                {addError && <p className="text-red-500 text-sm px-2 text-center">{addError}</p>}

                {/* Student List */}
                <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                    <h4 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">
                        Enrolled Students ({students.length})
                    </h4>

                    <div className="max-h-60 overflow-y-auto space-y-2">
                        {loading && students.length === 0 ? (
                            <div className="flex justify-center p-4">
                                <Spinner size={24} />
                            </div>
                        ) : students.length === 0 ? (
                            <p className="text-center text-gray-400 py-4">No students added yet.</p>
                        ) : (
                            students.map((student) => (
                                <div
                                    key={student._id}
                                    className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg dark:bg-gray-800 dark:border-gray-700 group hover:shadow-sm transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                            {student.rollNumber}
                                        </div>
                                        <p className="font-medium text-gray-900 dark:text-white">{student.name}</p>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteStudent(student._id)}
                                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2"
                                        title="Remove Student"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default ManageStudentsModal;
