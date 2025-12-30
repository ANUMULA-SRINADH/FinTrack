import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { authService } from '../services/api';

const ResetPassword = () => {
    const { token } = useParams(); // Matches the :token in your App.js route
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return setError("Passwords do not match");
        }
        try {
            // Your API should receive the token from the URL and the new password
            await authService.resetPassword(token, password);
            setMessage("Password reset successful! Redirecting to login...");
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError("Link expired or invalid. Please request a new one.");
        }
    };
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Set New Password</h2>
                
                {message && <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-6 text-sm text-center">{message}</div>}
                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm text-center">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
                        <input 
                            type="password" placeholder="New Password" required
                            className="w-full pl-10 p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            value={password} onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
                        <input 
                            type="password" placeholder="Confirm New Password" required
                            className="w-full pl-10 p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 shadow-lg">
                        Update Password
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;