"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { HeartPulse } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [emailOrPhone, setEmailOrPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const isEmail = emailOrPhone.includes('@');
        const payload = isEmail ? { email: emailOrPhone, password } : { phone: emailOrPhone, password };

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Login failed');

            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4 font-sans">

            <Link href="/" className="absolute top-8 left-8 flex items-center gap-3 hover:scale-105 transition-transform">
                <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-md">
                    <HeartPulse className="text-white w-5 h-5" />
                </div>
                <div className="flex flex-col hidden sm:flex">
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#FF7A00] to-[#E55A00]">
                        Sushrusha
                    </h1>
                </div>
            </Link>

            <div className="w-full max-w-md bg-white/70 backdrop-blur-xl p-8 sm:p-10 rounded-[2.5rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/60">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
                        Welcome Back
                    </h2>
                    <p className="text-gray-500 text-sm font-medium">Sign in to continue your training.</p>
                </div>

                {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 border border-red-100 font-medium">{error}</div>}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Email or Phone Number</label>
                        <input
                            type="text"
                            required
                            className="w-full px-5 py-3.5 bg-white/60 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00] outline-none transition-all shadow-inner text-gray-800 font-medium"
                            placeholder="e.g. asha@village.in or 9876543210"
                            value={emailOrPhone}
                            onChange={(e) => setEmailOrPhone(e.target.value)}
                        />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-1.5 ml-1 mr-1">
                            <label className="block text-sm font-bold text-gray-700">Password</label>
                            <a href="#" className="text-xs font-semibold text-[#FF7A00] hover:underline">Forgot?</a>
                        </div>
                        <input
                            type="password"
                            required
                            className="w-full px-5 py-3.5 bg-white/60 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00] outline-none transition-all shadow-inner text-gray-800 font-medium"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 mt-2 rounded-2xl bg-gradient-to-r from-[#FF7A00] to-[#E55A00] text-white font-bold text-lg shadow-[0_8px_20px_rgb(229,90,0,0.25)] hover:-translate-y-0.5 hover:shadow-[0_12px_25px_rgb(229,90,0,0.35)] transition-all disabled:opacity-70 disabled:hover:translate-y-0"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-gray-500 font-medium">
                    Don't have an account?{' '}
                    <Link href="/auth/signup" className="text-[#E55A00] font-bold hover:underline">
                        Register here
                    </Link>
                </p>
            </div>
        </div>
    );
}
