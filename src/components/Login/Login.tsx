import React, { useState } from 'react';
import { useAuth } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const { refetchProfile, setToastMessage, setToastType, user } = useAuth();
    const navigate = useNavigate();

    const setToken = (token: string) => {
        if (window.Cookies) {
            window.Cookies.set('token', token, { expires: 7 });
        }
        localStorage.setItem('token', token);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');
        const base_url = import.meta.env.VITE_BASE_URL;
        try {
            const response = await fetch(`${base_url}/login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Login failed');
            }

            const data = await response.json();

            setToken(data.token);
            await refetchProfile();

            setToastMessage('Login successful!');
            setToastType('success');

            setTimeout(() => {
                // Use the freshly fetched user from localStorage or refetchProfile
                const u = JSON.parse(localStorage.getItem('user') || 'null');
                if (
                    u?.role === 'admin' ||
                    u?.role === 'solo' ||
                    u?.business_type === 'solo_operator' ||
                    u?.business_type === 'team_business'
                ) {
                    navigate('/dashboard');
                } else {
                    navigate('/mobile-dashboard');
                }
            }, 200);
        } catch (error: any) {
            setErrorMsg(error.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 px-4">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-center text-slate-900 mb-6">Login to Memblue</h2>
                {errorMsg && <p className="text-red-600 mb-4 text-sm text-center">{errorMsg}</p>}
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-slate-700">Username</label>
                        <input
                            id="username"
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
                        <input
                            id="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md transition-all flex items-center justify-center"
                    >
                        {loading ? (
                            <span className="flex items-center">
                                <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                                </svg>
                                Logging in...
                            </span>
                        ) : 'Login'}
                    </button>
                </form>
                <span ><p className="text-center text-sm text-slate-500 mt-4">Don't have an account?</p> <p onClick={() => navigate('/signup')} className="text-blue-600 cursor-pointer hover:underline">Register</p></span>
            </div>
        </div>
    );
};

export default LoginPage;
