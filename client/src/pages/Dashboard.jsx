import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { BookOpen, Users, CalendarCheck, TrendingUp, Clock, Award } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { io } from 'socket.io-client';
import AuthContext from '../context/AuthContext';
import EnhancedStatCard from '../components/EnhancedStatCard';
import QuickActions from '../components/QuickActions';
import AttendanceTrendChart from '../components/charts/AttendanceTrendChart';
import ActivityTimeline from '../components/ActivityTimeline';
import ProgressRing from '../components/ui/ProgressRing';
import Spinner from '../components/ui/Spinner';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState(null);
    const [recentActivity, setRecentActivity] = useState([]);
    const [trendData, setTrendData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchStats = async (isBackground = false) => {
        try {
            if (!isBackground) setLoading(true);
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('/api/analytics/dashboard', config);

            setStats({
                classesCount: data.classesCount,
                studentsCount: data.studentsCount,
                attendanceRate: data.attendanceRate,
            });
            setRecentActivity(data.recentActivity || []);

            // Generate trend data from recent activity
            if (data.recentActivity && data.recentActivity.length > 0) {
                const trends = data.recentActivity.slice(0, 7).reverse().map(activity => ({
                    date: new Date(activity.date).toLocaleDateString('en-US', { weekday: 'short' }),
                    attendance: activity.totalCount > 0 ? Math.round((activity.presentCount / activity.totalCount) * 100) : 0
                }));
                setTrendData(trends);
            }

            if (!isBackground) setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            if (!isBackground) {
                toast.error('Failed to load dashboard data');
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchStats();

        // Socket.io Connection
        const newSocket = io('http://localhost:5000');

        newSocket.on('connect', () => {
            console.log('Connected to socket server');
            if (user && user._id) {
                // Join teacher-specific room
                newSocket.emit('join_session', `teacher_${user._id}`);
            }
        });

        newSocket.on('dashboard_update', (data) => {
            console.log('Dashboard update received:', data);

            // Refresh stats silently
            fetchStats(true);

            // Show toast notification
            if (data.type === 'new_attendance') {
                toast.success(
                    <div className="text-sm">
                        <p className="font-semibold">New Attendance!</p>
                        <p>{data.studentName} checked in for {data.subject}</p>
                    </div>,
                    { duration: 4000, icon: '🎓' }
                );
            }
        });

        return () => {
            newSocket.disconnect();
        };
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spinner size={40} />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-8">
            <Toaster position="top-right" />

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div>
                    <h1 className="text-4xl font-bold gradient-text mb-2">
                        Welcome back, {user?.name.split(' ')[0]}! 👋
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Here's what's happening with your classes today
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="glass-card px-4 py-2 rounded-lg">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-primary" />
                            <span className="text-sm text-gray-300">
                                {new Date().toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Quick Actions
                </h2>
                <QuickActions />
            </motion.div>

            {/* Stats Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Overview
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <EnhancedStatCard
                        title="Total Classes"
                        value={stats?.classesCount || 0}
                        icon={BookOpen}
                        gradient="gradient-primary"
                        trend={5}
                    />
                    <EnhancedStatCard
                        title="Total Students"
                        value={stats?.studentsCount || 0}
                        icon={Users}
                        gradient="gradient-secondary"
                        trend={12}
                    />
                    <EnhancedStatCard
                        title="Overall Attendance"
                        value={stats?.attendanceRate || 0}
                        icon={CalendarCheck}
                        gradient="gradient-orange"
                        suffix="%"
                        trend={3}
                    />
                </div>
            </motion.div>

            {/* Charts and Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Attendance Trend Chart */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="lg:col-span-2 glass-card p-6 rounded-2xl hover-lift"
                >
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Attendance Trend (Last 7 Days)
                    </h3>
                    <div className="h-64">
                        <AttendanceTrendChart data={trendData} />
                    </div>
                </motion.div>

                {/* Attendance Progress Ring */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass-card p-6 rounded-2xl hover-lift flex flex-col items-center justify-center"
                >
                    <h3 className="text-lg font-bold text-white mb-6">Overall Performance</h3>
                    <ProgressRing
                        percentage={stats?.attendanceRate || 0}
                        size={180}
                        strokeWidth={12}
                        color="#4F46E5"
                    />
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-400">Average Attendance Rate</p>
                        <p className="text-xs text-gray-500 mt-1">Across all classes</p>
                    </div>
                </motion.div>
            </div>

            {/* Recent Activity and Timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Sessions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="glass-card p-6 rounded-2xl hover-lift"
                >
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <CalendarCheck className="h-5 w-5 text-primary" />
                        Recent Sessions
                    </h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {recentActivity.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-gray-500 mb-2">📊</div>
                                <p className="text-gray-400">No recent sessions found</p>
                                <p className="text-sm text-gray-500 mt-1">Start a session to see activity here</p>
                            </div>
                        ) : (
                            recentActivity.map((activity, index) => (
                                <motion.div
                                    key={activity.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.6 + index * 0.05 }}
                                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <p className="font-semibold text-white group-hover:text-primary transition-colors">
                                                {activity.subject}
                                            </p>
                                            <p className="text-sm text-gray-400 mt-1">
                                                {new Date(activity.date).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-2">
                                                <ProgressRing
                                                    percentage={activity.totalCount > 0 ? (activity.presentCount / activity.totalCount) * 100 : 0}
                                                    size={50}
                                                    strokeWidth={4}
                                                    color="#10B981"
                                                    showPercentage={false}
                                                />
                                                <div>
                                                    <span className="text-lg font-bold text-white">
                                                        {activity.presentCount}
                                                    </span>
                                                    <span className="text-gray-400">/{activity.totalCount}</span>
                                                    <p className="text-xs text-gray-500">Present</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </motion.div>

                {/* Activity Timeline */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="glass-card p-6 rounded-2xl hover-lift"
                >
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        Activity Timeline
                    </h3>
                    <div className="max-h-96 overflow-y-auto pr-2">
                        <ActivityTimeline activities={[]} />
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;
