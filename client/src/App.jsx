import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Classes from './pages/Classes';
import Attendance from './pages/Attendance';
import Reports from './pages/Reports';
import QRGenerator from './pages/QRGenerator';
import StudentScan from './pages/StudentScan';

const NotFound = () => <div className="flex h-screen items-center justify-center text-xl">404 - Not Found</div>;

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/scan" element={<StudentScan />} />

                    <Route element={<Layout />}>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/classes" element={<Classes />} />
                        <Route path="/attendance" element={<Attendance />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/qr-generator" element={<QRGenerator />} />
                        <Route path="*" element={<Dashboard />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
