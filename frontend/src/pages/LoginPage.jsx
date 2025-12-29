import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Using this for redirect
import { Lock, Mail } from 'lucide-react'; // Using icons for better UI
import { authService } from '../services/api';

const LoginPage = () => { // Renamed to LoginPage to match your file name and export
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignup, setIsSignup] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
        if (isSignup) {
            await authService.signup({ email, password });
            alert("Account created! Please sign in.");
            setIsSignup(false);
        } else {
            const data = await authService.login(email, password);
            
            // 1. Force save the token just in case
            if (data.access_token) {
                localStorage.setItem('token', data.access_token);
                
                // 2. Use a "Hard" redirect to break out of the Chrome warning hang
                window.location.href = '/dashboard'; 
            }
        }
    } catch (err) {
        // If we reach here, it's a real backend failure (401 Unauthorized)
        setError("Invalid email or password. Please try again.");
    }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
                <h1 className="text-3xl font-bold text-blue-600 mb-6">FinTrack</h1>
                
                {error && <div className="bg-red-100 text-red-600 p-2 rounded mb-4 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
                        <input 
                            type="email" placeholder="Email" required
                            className="w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={email} onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
                        <input 
                            type="password" placeholder="Password" required
                            className="w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={password} onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    
                    <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg">
                        {isSignup ? "Create Account" : "Sign In"}
                    </button>
                </form>

                <div className="mt-6 text-sm text-gray-600">
                    {isSignup ? "Already have an account?" : "Don't have an account?"}{' '}
                    <button 
                        type="button"
                        onClick={() => setIsSignup(!isSignup)}
                        className="text-blue-600 font-bold hover:underline"
                    >
                        {isSignup ? "Login here" : "Register here"}
                    </button>
                </div>
                {/* Add this inside your <form> after the password input field */}
                <div className="flex justify-end text-xs mb-4">
                    <button 
                        type="button"
                        onClick={() => navigate('/forgot-password')}
                        className="text-blue-600 hover:underline"
                    >
                        Forgot Password?
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage; // Now matches the component name at the top