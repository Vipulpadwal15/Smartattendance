import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { CheckCircle, XCircle, Camera } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

const StudentScan = () => {
    const [searchParams] = useSearchParams();
    const tokenFromUrl = searchParams.get('token');

    const [sessionToken, setSessionToken] = useState(tokenFromUrl || '');
    const [rollNumber, setRollNumber] = useState('');
    const [status, setStatus] = useState('idle'); // idle, scanning, submitting, success, error
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (tokenFromUrl && localStorage.getItem(`attendance_marked_${tokenFromUrl}`)) {
            setStatus('error');
            setMessage('You have already marked attendance from this device.');
        }
    }, [tokenFromUrl]);

    // Handle Scanner
    useEffect(() => {
        if (sessionToken || status !== 'scanning') return;

        const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: 250 },
            false
        );

        scanner.render((decodedText) => {
            // Assuming QR contains full URL: http://.../scan?token=XYZ
            // or just the token XYZ?
            // My generator creates the full URL.
            try {
                const url = new URL(decodedText);
                const token = url.searchParams.get('token');
                if (token) {
                    // Check for device lock
                    const locked = localStorage.getItem(`attendance_marked_${token}`);
                    if (locked) {
                        setSessionToken(token);
                        setStatus('error');
                        setMessage('You have already marked attendance from this device.');
                        scanner.clear();
                        return;
                    }

                    setSessionToken(token);
                    setStatus('idle');
                    scanner.clear();
                }
            } catch (e) {
                // Maybe it's just the token text?
                const locked = localStorage.getItem(`attendance_marked_${decodedText}`);
                if (locked) {
                    setSessionToken(decodedText);
                    setStatus('error');
                    setMessage('You have already marked attendance from this device.');
                    scanner.clear();
                    return;
                }

                setSessionToken(decodedText);
                setStatus('idle');
                scanner.clear();
            }
        }, (error) => {
            console.warn(error);
        });

        return () => {
            scanner.clear().catch(error => console.error("Failed to clear scanner", error));
        };
    }, [status, sessionToken]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Double check lock before submitting
        if (localStorage.getItem(`attendance_marked_${sessionToken}`)) {
            setStatus('error');
            setMessage('You have already marked attendance from this device.');
            return;
        }

        setStatus('submitting');
        setMessage('');

        try {
            const { data } = await axios.post('/api/attendance/mark-qr', {
                sessionToken,
                rollNumber
            });

            // Set Lock
            localStorage.setItem(`attendance_marked_${sessionToken}`, 'true');

            setStatus('success');
            setMessage(`Welcome, ${data.student || 'Student'}! Attendance Marked.`);
        } catch (error) {
            setStatus('error');
            setMessage(error.response?.data?.message || 'Failed to mark attendance.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 dark:bg-gray-900">
            <Card className="w-full max-w-md">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Student Attendance</h1>
                    <p className="text-gray-500">Scan QR or enter details</p>
                </div>

                {status === 'success' ? (
                    <div className="text-center py-8">
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-green-600">Success!</h2>
                        <p className="text-gray-600 mt-2">{message}</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {status === 'error' && (
                            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
                                <XCircle className="h-5 w-5" />
                                {message}
                            </div>
                        )}

                        {!sessionToken ? (
                            <div className="text-center">
                                {status === 'scanning' ? (
                                    <div id="reader" className="w-full"></div>
                                ) : (
                                    <Button fullWidth onClick={() => setStatus('scanning')}>
                                        <Camera className="mr-2 h-4 w-4" /> Scan QR Code
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="p-3 bg-blue-50 text-blue-700 rounded-lg text-sm mb-4 text-center">
                                    Session Token Detected
                                </div>
                                <Input
                                    label="Enter Roll Number"
                                    placeholder="e.g. 101"
                                    value={rollNumber}
                                    onChange={(e) => setRollNumber(e.target.value)}
                                    required
                                />
                                <Button type="submit" fullWidth isLoading={status === 'submitting'}>
                                    Mark Present
                                </Button>
                            </form>
                        )}
                    </div>
                )}
            </Card>
        </div>
    );
};

export default StudentScan;
