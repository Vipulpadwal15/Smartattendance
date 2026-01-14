import React from 'react';
import { motion } from 'framer-motion';
import { Clock, TrendingUp } from 'lucide-react';

const ActivityTimeline = ({ activities = [] }) => {
    const defaultActivities = activities.length > 0 ? activities : [
        {
            id: 1,
            type: 'session',
            title: 'Attendance Session Started',
            description: 'Data Structures - Semester 5',
            time: '2 hours ago',
            icon: Clock,
            color: 'bg-blue-500'
        },
        {
            id: 2,
            type: 'achievement',
            title: 'High Attendance Rate',
            description: '95% attendance in Web Development',
            time: '5 hours ago',
            icon: TrendingUp,
            color: 'bg-green-500'
        }
    ];

    return (
        <div className="space-y-4">
            {defaultActivities.map((activity, index) => (
                <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-4 group"
                >
                    {/* Timeline Line */}
                    <div className="flex flex-col items-center">
                        <div className={`${activity.color} rounded-full p-2 shadow-lg`}>
                            <activity.icon className="h-4 w-4 text-white" />
                        </div>
                        {index < defaultActivities.length - 1 && (
                            <div className="w-0.5 h-full bg-gray-700 mt-2" />
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-6">
                        <div className="glass-card p-4 hover-lift">
                            <h4 className="font-semibold text-white">{activity.title}</h4>
                            <p className="text-sm text-gray-400 mt-1">{activity.description}</p>
                            <span className="text-xs text-gray-500 mt-2 block">{activity.time}</span>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default ActivityTimeline;
