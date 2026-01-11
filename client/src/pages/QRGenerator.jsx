import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { Timer, AlertTriangle, Play, Square } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';

const QRGenerator = () => {
    const [classes, setClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [session, setSession] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [loading, setLoading] = useState(false);
    const [isLocalhost, setIsLocalhost] = useState(false);

    useEffect(() => {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            setIsLocalhost(true);
        }

        const fetchClasses = async () => {
            try {
                const { data } = await axios.get('/api/classes');
                setClasses(data);
                if (data.length > 0) setSelectedClassId(data[0]._id);
            } catch (error) {
                console.error('Error fetching classes', error);
            }
        };
        fetchClasses();
    }, []);

    // Timer Logic
    useEffect(() => {
        if (!session || !session.expiresAt) return;

        const interval = setInterval(() => {
            const now = new Date();
            const expires = new Date(session.expiresAt);
            const diff = Math.max(0, Math.floor((expires - now) / 1000));

            setTimeLeft(diff);

            if (diff <= 0) {
                clearInterval(interval);
                // Optionally auto-refresh or show "Expired"
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [session]);

    const handleStartSession = async () => {
        setLoading(true);
        try {
            const { data } = await axios.post('/api/attendance/session/start', {
                classId: selectedClassId
            });
            setSession(data);
        } catch (error) {
            console.error('Error starting session', error);
            alert('Failed to start session');
        } finally {
            setLoading(false);
        }
    };

    const handleEndSession = async () => {
        if (!session) return;
        try {
            await axios.post('/api/attendance/session/end', {
                sessionId: session._id
            });
            setSession(null);
            setTimeLeft(0);
        } catch (error) {
            console.error('Error ending session', error);
        }
    };

    const qrUrl = session ? `${window.location.origin}/scan?token=${session.sessionToken}` : '';

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">QR Attendance Generator</h1>

            {isLocalhost && (
                <div className="rounded-lg bg-orange-100 p-4 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200 border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center font-bold mb-1">
                        <AlertTriangle className="mr-2 h-5 w-5" />
                        Warning: You are on Localhost
                    </div>
                    <p className="text-sm">
                        Students <b>cannot scan</b> this QR code because your phone cannot access "localhost".
                        <br />
                        Please open this page using your <b>Network IP</b> (check your terminal, e.g., <code>http://192.168.x.x:5173</code>) and generate the QR code again.
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Controls */}
                <Card title="Session Controls">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Select Class
                            </label>
                            <select
                                className="w-full rounded-lg border border-gray-300 p-2 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                value={selectedClassId}
                                onChange={(e) => setSelectedClassId(e.target.value)}
                                disabled={!!session}
                            >
                                {classes.map(c => (
                                    <option key={c._id} value={c._id}>
                                        {c.subjectName} ({c.semester})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {!session ? (
                            <Button fullWidth onClick={handleStartSession} isLoading={loading}>
                                <Play className="mr-2 h-4 w-4" /> Start Session
                            </Button>
                        ) : (
                            <Button fullWidth variant="danger" onClick={handleEndSession}>
                                <Square className="mr-2 h-4 w-4" /> End Session
                            </Button>
                        )}

                        <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                            <p className="flex items-start">
                                <AlertTriangle className="mr-2 h-5 w-5 flex-shrink-0" />
                                QR Code is valid for 60 seconds. Students must scan and submit within this time.
                            </p>
                        </div>
                    </div>
                </Card>

                {/* QR Display */}
                <Card className="flex flex-col items-center justify-center text-center min-h-[400px]">
                    {session ? (
                        <>
                            <div className="mb-4 rounded-xl bg-white p-4 shadow-lg">
                                <QRCodeSVG value={qrUrl} size={250} />
                            </div>

                            <div className="flex items-center text-2xl font-bold text-gray-900 dark:text-white">
                                <Timer className={`mr-2 h-6 w-6 ${timeLeft < 10 ? 'text-red-500' : 'text-primary'}`} />
                                <span className={timeLeft < 10 ? 'text-red-500' : 'text-primary'}>
                                    00:{timeLeft.toString().padStart(2, '0')}
                                </span>
                            </div>

                            {timeLeft === 0 && (
                                <p className="mt-2 font-medium text-red-500">Session Expired. Please restart.</p>
                            )}

                            <p className="mt-4 text-sm text-gray-500">
                                Scan using the Student App or visit: <br />
                                <span className="font-mono text-xs">{qrUrl}</span>
                            </p>
                        </>
                    ) : (
                        <div className="text-gray-400">
                            <QrCodeSVGPlaceholder size={100} /> {/* Custom or just text */}
                            <p className="mt-4">Start a session to generate QR Code</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

// Simple visual placeholder
const QrCodeSVGPlaceholder = ({ size }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-20"
    >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <rect x="7" y="7" width="3" height="3"></rect>
        <rect x="14" y="7" width="3" height="3"></rect>
        <rect x="7" y="14" width="3" height="3"></rect>
        <rect x="14" y="14" width="3" height="3"></rect>
    </svg>
);

export default QRGenerator;
