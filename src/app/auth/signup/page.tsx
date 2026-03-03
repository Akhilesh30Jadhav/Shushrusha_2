"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { HeartPulse } from 'lucide-react';

export default function SignupPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', district: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Signup failed');

            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4 font-sans py-12">

            <Link href="/" className="absolute top-8 left-8 flex items-center gap-3 hover:scale-105 transition-transform z-10">
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
                        Join Sushrusha
                    </h2>
                    <p className="text-gray-500 text-sm font-medium">Enhance your clinical skills through roleplay.</p>
                </div>

                {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 border border-red-100 font-medium">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Full Name</label>
                        <input required type="text" className="w-full px-5 py-3.5 bg-white/60 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00] outline-none transition-all shadow-inner text-gray-800 font-medium" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Email (Optional)</label>
                        <input type="email" className="w-full px-5 py-3.5 bg-white/60 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00] outline-none transition-all shadow-inner text-gray-800 font-medium" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Phone Number</label>
                        <input type="tel" required className="w-full px-5 py-3.5 bg-white/60 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00] outline-none transition-all shadow-inner text-gray-800 font-medium" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">District (Optional)</label>
                        <input type="text" className="w-full px-5 py-3.5 bg-white/60 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00] outline-none transition-all shadow-inner text-gray-800 font-medium" value={formData.district} onChange={e => setFormData({ ...formData, district: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Password</label>
                        <input type="password" required className="w-full px-5 py-3.5 bg-white/60 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00] outline-none transition-all shadow-inner text-gray-800 font-medium" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                    </div>

                    <button type="submit" disabled={loading} className="w-full py-4 mt-4 rounded-2xl bg-gradient-to-r from-[#FF7A00] to-[#E55A00] text-white font-bold text-lg shadow-[0_8px_20px_rgb(229,90,0,0.25)] hover:-translate-y-0.5 hover:shadow-[0_12px_25px_rgb(229,90,0,0.35)] transition-all disabled:opacity-70 disabled:hover:translate-y-0">
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-gray-500 font-medium">
                    Already registered?{' '}
                    <Link href="/auth/login" className="text-[#E55A00] font-bold hover:underline">
                        Sign In Instead
                    </Link>
                </p>
            </div>
        </div>
    );
}
