import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Classes from './pages/Classes';
import Attendance from './pages/Attendance';
import Reports from './pages/Reports';

const NotFound = () => <div className="flex h-screen items-center justify-center text-xl">404 - Not Found</div>;

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route element={<Layout />}>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/classes" element={<Classes />} />
                        <Route path="/attendance" element={<Attendance />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="*" element={<Dashboard />} /> {/* Fallback to dashboard */}
                    </Route>

                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
