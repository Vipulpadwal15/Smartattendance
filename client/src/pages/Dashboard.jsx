import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { BookOpen, Users, CalendarCheck } from 'lucide-react';
import AuthContext from '../context/AuthContext';
import StatCard from '../components/StatCard';
import Spinner from '../components/ui/Spinner';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState({
        classesCount: 0,
        studentsCount: 0,
        attendanceRate: 0, // Placeholder
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data: classes } = await axios.get('/api/classes');

                const totalClasses = classes.length;
                const totalStudents = classes.reduce((acc, curr) => acc + (curr.students ? curr.students.length : 0), 0);

                setStats({
                    classesCount: totalClasses,
                    studentsCount: totalStudents,
                    attendanceRate: 0, // To be implemented with real attendance data
                });
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <Spinner className="mt-20" size={40} />;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Dashboard
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Welcome back, {user?.name.split(' ')[0]}! Here's an overview of your classes.
                    </p>
                </div>
            </div>

            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <StatCard
                    title="Total Classes"
                    value={stats.classesCount}
                    icon={BookOpen}
                    color="bg-primary"
                />
                <StatCard
                    title="Total Students"
                    value={stats.studentsCount}
                    icon={Users}
                    color="bg-secondary"
                />
                {/* Placeholder for Attendance Rate */}
                <StatCard
                    title="Recent Attendance"
                    value="--%"
                    icon={CalendarCheck}
                    color="bg-orange-500"
                />
            </motion.div>

            {/* Recent Activity / Charts Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6">
                <div className="rounded-xl border border-dotted border-gray-300 bg-gray-50 p-10 text-center dark:border-gray-700 dark:bg-gray-800/50">
                    <p className="text-gray-500">Attendance Chart will appear here</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
