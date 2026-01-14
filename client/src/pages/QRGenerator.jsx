import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { Timer, AlertTriangle, Play, Square } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';

const QRGenerator = () => {
    const [classes, setClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [session, setSession] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [loading, setLoading] = useState(false);
    const [isLocalhost, setIsLocalhost] = useState(false);

    // Rotating QR State
    const [qrToken, setQrToken] = useState('');
    const [counter, setCounter] = useState(100);

    // Real-Time Logs
    const [liveLogs, setLiveLogs] = useState([]);

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

    // Socket.io Connection
    useEffect(() => {
        if (!session) return;

        // Connect to server (auto-detects host)
        // If separate backend URL, specify it: io('http://localhost:5000')
        // Here we rely on proxy in dev, or relative path in prod? 
        // Best to use specific URL if known or relative if same origin.
        // For dev with vite proxy, relative '/' connects to frontend port? No.
        // We need backend URL.
        const socket = io('/', { path: '/socket.io' }); // Try default first, usually works with proxy if configured right, else standard

        // Actually, with Vite Proxy, requests to /api go to 5000. 
        // But socket.io connection request starts with /socket.io
        // We should explicitly point to 5000 in dev

        // For simplicity in this env:
        // const ENDPOINT = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '/';

        // Let's assume the proxy setup handles it or we use direct.
    }, [session]);

    // Better Socket Effect
    useEffect(() => {
        if (!session) return;

        const socket = io(window.location.hostname === 'localhost' ? 'http://localhost:5000' : window.location.origin);

        socket.on('connect', () => {
            console.log('Connected to WebSocket');
            socket.emit('join_session', session._id);
        });

        socket.on('attendance_update', (newLog) => {
            console.log('Real-time update:', newLog);
            setLiveLogs((prev) => [newLog, ...prev]);
        });

        return () => {
            socket.disconnect();
        };
    }, [session]);


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
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [session]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // Rotate Token Every 30 Seconds
    useEffect(() => {
        if (!session || !session.isActive) return;

        const rotationInterval = setInterval(async () => {
            try {
                const { data } = await axios.put(`/api/attendance/session/${session._id}/rotate`);
                setQrToken(data.newQrToken);
                setCounter(100);
            } catch (error) {
                console.error('Rotation failed', error);
            }
        }, 30000);

        const progressInterval = setInterval(() => {
            setCounter((prev) => Math.max(0, prev - (100 / 300)));
        }, 100);

        return () => {
            clearInterval(rotationInterval);
            clearInterval(progressInterval);
        };
    }, [session]);

    const handleStartSession = async () => {
        setLoading(true);
        setLiveLogs([]); // Clear logs
        try {
            const { data } = await axios.post('/api/attendance/session/start', {
                classId: selectedClassId
            });
            setSession(data);
            setQrToken(data.currentQrToken || '');
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

    const qrUrl = session ? `${window.location.origin}/scan?token=${session.sessionToken}&qr=${qrToken}` : '';

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
                <div className="space-y-6">
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
                                    QR Code rotates every 30s.
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Live Feed */}
                    {session && (
                        <Card title={<div className="flex items-center gap-2">Live Feed <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs animate-pulse">● Live</span></div>}>
                            <div className="h-[300px] overflow-y-auto pr-2 space-y-2">
                                {liveLogs.length === 0 ? (
                                    <p className="text-center text-gray-400 py-8">Waiting for scans...</p>
                                ) : (
                                    <AnimatePresence>
                                        {liveLogs.map((log, index) => (
                                            <motion.div
                                                key={index} // Ideally use unique ID, but index ok for linear feed
                                                initial={{ opacity: 0, x: -20, scale: 0.95 }}
                                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                                className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-100 dark:bg-gray-800 dark:border-gray-700 shadow-sm"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                        {log.studentName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{log.studentName}</p>
                                                        <p className="text-xs text-gray-500">Roll: {log.rollNumber}</p>
                                                    </div>
                                                </div>
                                                <span className="text-xs font-mono text-gray-400">
                                                    {new Date(log.timestamp).toLocaleTimeString()}
                                                </span>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                )}
                            </div>
                        </Card>
                    )}
                </div>

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
                                    {formatTime(timeLeft)}
                                </span>
                            </div>

                            <div className="w-full max-w-[250px] mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all duration-100 ease-linear"
                                    style={{ width: `${counter}%` }}
                                />
                            </div>

                            {/* Live Counter Big */}
                            <div className="mt-6 flex flex-col items-center">
                                <span className="text-4xl font-extrabold text-gray-900 dark:text-white">{liveLogs.length}</span>
                                <span className="text-sm text-gray-500 uppercase tracking-wider">Present</span>
                            </div>

                            {timeLeft === 0 && (
                                <p className="mt-2 font-medium text-red-500">Session Expired. Please restart.</p>
                            )}
                        </>
                    ) : (
                        <div className="text-gray-400">
                            <QrCodeSVGPlaceholder size={100} />
                            <p className="mt-4">Start a session to generate QR Code</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

// Placeholder...
const QrCodeSVGPlaceholder = ({ size }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-20"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><rect x="7" y="7" width="3" height="3"></rect><rect x="14" y="7" width="3" height="3"></rect><rect x="7" y="14" width="3" height="3"></rect><rect x="14" y="14" width="3" height="3"></rect></svg>
);

export default QRGenerator;
