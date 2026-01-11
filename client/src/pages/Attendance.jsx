import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, CheckSquare } from 'lucide-react';
import { format } from 'date-fns';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import AttendanceToggle from '../components/AttendanceToggle';
import Spinner from '../components/ui/Spinner';

const Attendance = () => {
    const [classes, setClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    const [students, setStudents] = useState([]);
    const [attendanceMap, setAttendanceMap] = useState({}); // studentId -> status

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Fetch Classes on Mount
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const { data } = await axios.get('/api/classes');
                setClasses(data);
                if (data.length > 0) {
                    setSelectedClassId(data[0]._id);
                }
            } catch (error) {
                console.error('Error fetching classes', error);
            }
        };
        fetchClasses();
    }, []);

    // Fetch Data when Class or Date changes
    useEffect(() => {
        if (!selectedClassId || !selectedDate) return;

        const fetchData = async () => {
            setLoading(true);
            setMessage({ type: '', text: '' });
            try {
                // 1. Get Students
                const { data: studentsData } = await axios.get(`/api/students/class/${selectedClassId}`);
                setStudents(studentsData);

                // 2. Get Existing Attendance for this date
                // API supports query param date
                const { data: attendanceList } = await axios.get(`/api/attendance/${selectedClassId}?date=${selectedDate}`);

                let newMap = {};

                // Default everyone to Absent initially
                studentsData.forEach(s => {
                    newMap[s._id] = 'Absent';
                });

                // If record exists, overlay it
                if (attendanceList && attendanceList.length > 0) {
                    // Assuming API returns array of days, pick the first (should be only one due to query)
                    const record = attendanceList[0];
                    if (record && record.records) {
                        record.records.forEach(r => {
                            newMap[r.studentId] = r.status;
                        });
                    }
                }

                setAttendanceMap(newMap);

            } catch (error) {
                console.error('Error fetching data', error);
                setMessage({ type: 'error', text: 'Failed to load data' });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedClassId, selectedDate]);

    const handleToggle = (studentId, newStatus) => {
        setAttendanceMap(prev => ({
            ...prev,
            [studentId]: newStatus
        }));
    };

    const markAllPresent = () => {
        const newMap = { ...attendanceMap };
        Object.keys(newMap).forEach(key => {
            newMap[key] = 'Present';
        });
        setAttendanceMap(newMap);
        setMessage({ type: 'success', text: 'Marked all as Present (Unsaved)' });
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage({ type: '', text: '' });

        // Construct payload
        const records = students.map(s => ({
            studentId: s._id,
            name: s.name,
            rollNumber: s.rollNumber,
            status: attendanceMap[s._id] || 'Absent'
        }));

        try {
            await axios.post('/api/attendance', {
                classId: selectedClassId,
                date: selectedDate,
                records
            });
            setMessage({ type: 'success', text: 'Attendance saved successfully!' });
        } catch (error) {
            console.error('Error saving', error);
            setMessage({ type: 'error', text: 'Failed to save attendance' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance</h1>

                <div className="flex flex-col sm:flex-row gap-3">
                    <select
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                        value={selectedClassId}
                        onChange={(e) => setSelectedClassId(e.target.value)}
                    >
                        {classes.map(c => (
                            <option key={c._id} value={c._id}>{c.subjectName} ({c.semester})</option>
                        ))}
                    </select>

                    <input
                        type="date"
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                    />
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700 shadow-sm">
                <span className="text-sm font-medium text-gray-500">
                    {students.length} Students Found
                </span>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={markAllPresent}>
                        <CheckSquare className="mr-2 h-4 w-4" /> All Present
                    </Button>
                    <Button size="sm" onClick={handleSave} isLoading={saving}>
                        <Save className="mr-2 h-4 w-4" /> Save
                    </Button>
                </div>
            </div>

            {/* Message Toast Placeholder */}
            {message.text && (
                <div className={`p-3 rounded-lg text-sm font-medium ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                    {message.text}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-20"><Spinner size={40} /></div>
            ) : (
                <Card noPadding className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-500 dark:bg-gray-700/50 dark:text-gray-400">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Roll No</th>
                                    <th className="px-6 py-3 font-medium">Name</th>
                                    <th className="px-6 py-3 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {students.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                                            No students in this class yet.
                                        </td>
                                    </tr>
                                ) : (
                                    students.map((student) => (
                                        <tr key={student._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                                {student.rollNumber}
                                            </td>
                                            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                                {student.name}
                                            </td>
                                            <td className="px-6 py-4">
                                                <AttendanceToggle
                                                    status={attendanceMap[student._id] || 'Absent'}
                                                    onChange={(val) => handleToggle(student._id, val)}
                                                />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default Attendance;
