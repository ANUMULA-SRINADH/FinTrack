import React, { useState } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        await authService.forgotPassword(email);
        alert("If this email exists, a reset link has been sent to the console.");
        navigate('/login'); // This redirects the user back to Login
    } catch (err) {
        setMessage("An error occurred. Please try again.");
    }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
                <button onClick={() => navigate('/login')} className="flex items-center text-gray-500 mb-4 hover:text-blue-600">
                    <ArrowLeft size={16} className="mr-1" /> Back to Login
                </button>
                <h2 className="text-2xl font-bold mb-6">Reset Password</h2>
                {message && <p className="text-sm mb-4 text-blue-600 bg-blue-50 p-2 rounded">{message}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
                        <input 
                            type="email" placeholder="Enter your email" required
                            className="w-full pl-10 p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            value={email} onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700">
                        Send Reset Link
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;