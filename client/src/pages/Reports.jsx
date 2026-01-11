import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend
} from 'recharts';
import { Download } from 'lucide-react';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';

const Reports = () => {
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState([]);
    const [barData, setBarData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Real Analytics Data
                const { data } = await axios.get('/api/analytics/reports');

                setChartData(data.weeklyTrend);
                setBarData(data.classPerformance);
            } catch (error) {
                console.error('Error fetching reports data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleExport = () => {
        // CSV Export logic placeholder
        alert('Exporting Report as CSV...');
        // Real implementation would convert data to CSV string and trigger download blob.
    };

    if (loading) return <div className="flex justify-center pt-20"><Spinner size={40} /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics & Reports</h1>
                    <p className="text-gray-500 dark:text-gray-400"> visualize student performance and attendance trends.</p>
                </div>
                <Button variant="outline" onClick={handleExport}>
                    <Download className="mr-2 h-4 w-4" /> Export CSV
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Line Chart */}
                <Card title="Weekly Attendance Trend">
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} />
                                <YAxis stroke="#9ca3af" fontSize={12} domain={[0, 100]} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="attendance"
                                    stroke="#4F46E5"
                                    strokeWidth={4}
                                    dot={{ r: 4, fill: '#4F46E5', strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Bar Chart */}
                <Card title="Class Performance Overview">
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tick={{ fontSize: 10 }} interval={0} />
                                <YAxis stroke="#9ca3af" fontSize={12} />
                                <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px' }} />
                                <Legend />
                                <Bar dataKey="avg" name="Avg Attendance %" fill="#10B981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="students" name="Student Count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Summary Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="flex flex-col items-center justify-center p-6 text-center">
                    <h4 className="text-gray-500 font-medium mb-2">Best Performing Class</h4>
                    <span className="text-xl font-bold text-primary">
                        {barData.sort((a, b) => b.avg - a.avg)[0]?.name || 'N/A'}
                    </span>
                </Card>
                <Card className="flex flex-col items-center justify-center p-6 text-center">
                    <h4 className="text-gray-500 font-medium mb-2">Avg Weekly Attendance</h4>
                    <span className="text-xl font-bold text-secondary">
                        {chartData.length > 0
                            ? Math.round(chartData.reduce((a, b) => a + b.attendance, 0) / chartData.length)
                            : 0}%
                    </span>
                </Card>
                <Card className="flex flex-col items-center justify-center p-6 text-center">
                    <h4 className="text-gray-500 font-medium mb-2">Total Classes Tracked</h4>
                    <span className="text-xl font-bold text-orange-500">{barData.length}</span>
                </Card>
            </div>
        </div>
    );
};

export default Reports;
