import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const AttendanceTrendChart = ({ data = [] }) => {
    // Default sample data if none provided
    const chartData = data.length > 0 ? data : [
        { date: 'Mon', attendance: 85 },
        { date: 'Tue', attendance: 92 },
        { date: 'Wed', attendance: 78 },
        { date: 'Thu', attendance: 88 },
        { date: 'Fri', attendance: 95 },
        { date: 'Sat', attendance: 82 },
        { date: 'Sun', attendance: 90 },
    ];

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 shadow-xl">
                    <p className="text-white text-sm font-medium">
                        {payload[0].payload.date}
                    </p>
                    <p className="text-primary text-lg font-bold">
                        {payload[0].value}%
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis
                    dataKey="date"
                    stroke="#9CA3AF"
                    style={{ fontSize: '12px' }}
                    tickLine={false}
                />
                <YAxis
                    stroke="#9CA3AF"
                    style={{ fontSize: '12px' }}
                    tickLine={false}
                    domain={[0, 100]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                    type="monotone"
                    dataKey="attendance"
                    stroke="#4F46E5"
                    strokeWidth={3}
                    fill="url(#colorAttendance)"
                    animationDuration={1500}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
};

export default AttendanceTrendChart;
