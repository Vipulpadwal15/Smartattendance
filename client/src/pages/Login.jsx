import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthContext from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        if (!email || !password) {
            setError('Please fill in all fields');
            setIsSubmitting(false);
            return;
        }

        const res = await login(email, password);
        if (res.success) {
            navigate('/dashboard');
        } else {
            setError(res.message);
        }
        setIsSubmitting(false);
    };



    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900 overflow-hidden relative">
            {/* Background Decoration */}
            <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-primary/20 blur-[100px]" />
            <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-secondary/20 blur-[100px]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                <Card glass className="shadow-2xl border-white/40 dark:border-gray-700/50">
                    <div className="mb-6 text-center">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-300">Sign in to manage attendance</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="rounded-lg bg-red-50 p-3 text-sm text-red-500 dark:bg-red-900/20"
                            >
                                {error}
                            </motion.div>
                        )}

                        <Input
                            id="email"
                            label="Email Address"
                            type="email"
                            placeholder="teacher@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <Input
                            id="password"
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            isLoading={isSubmitting}
                        >
                            Sign In
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        <p className="mt-2">New here? <Link to="/register" className="text-primary hover:underline">Create an account</Link></p>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
};

export default Login;
