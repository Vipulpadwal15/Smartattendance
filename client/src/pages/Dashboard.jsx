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
        attendanceRate: 0,
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await axios.get('/api/analytics/dashboard');
                setStats({
                    classesCount: data.classesCount,
                    studentsCount: data.studentsCount,
                    attendanceRate: data.attendanceRate,
                });
                setRecentActivity(data.recentActivity);
                // TODO: Store recent activity in state if needed, for now just stats
                // We'll add recent activity display next
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
                <StatCard
                    title="Overall Attendance"
                    value={`${stats.attendanceRate}%`}
                    icon={CalendarCheck}
                    color="bg-orange-500"
                />
            </motion.div>

            {/* Recent Activity */}
            <div className="pt-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700 shadow-sm overflow-hidden">
                        {recentActivity.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">No recent activity found.</div>
                        ) : (
                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                {recentActivity.map((activity) => (
                                    <div key={activity.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">{activity.subject}</p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(activity.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                                {activity.presentCount} Present
                                            </span>
                                            <p className="text-xs text-gray-400 mt-1">
                                                out of {activity.totalCount}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
