import Link from 'next/link';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden font-sans">

      {/* Navbar Minimal */}
      <header className="w-full bg-white/60 backdrop-blur-xl border-b border-white/40 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex justify-between items-center">
          {/* Brand Logo Left */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="relative flex items-center justify-center h-10 w-24 sm:h-14 sm:w-32 rounded shadow-sm border border-gray-100 overflow-hidden bg-white flex-shrink-0">
              <Image src="/images/sushrusha_logo.jpeg" alt="Sushrusha Logo" fill className="object-contain" priority />
            </div>
            <div className="hidden md:flex flex-col">
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#FF7A00] to-[#E55A00]">
                Sushrusha
              </h1>
              <span className="text-[10px] text-gray-600 font-semibold tracking-widest uppercase">
                Care • Connect • Educate
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-sm font-semibold text-gray-600 hover:text-[#FF7A00] transition-colors">Log in</Link>
            <Link href="/auth/signup" className="text-sm font-semibold px-6 py-2.5 bg-gradient-to-r from-[#FF7A00] to-[#E55A00] text-white rounded-full hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-sm">Get Started</Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center text-center px-4 z-10 py-12 md:py-20">
        <div className="max-w-4xl space-y-6 sm:space-y-8 bg-white/40 backdrop-blur-md p-6 sm:p-10 md:p-16 rounded-[2rem] sm:rounded-[3rem] border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]">
          <div className="inline-flex items-center rounded-full border border-[#FF7A00]/20 bg-white/60 px-3 py-1.5 sm:px-4 sm:py-1.5 text-xs sm:text-sm text-[#E55A00] font-bold shadow-sm">
            🚀 The Next Generation ASHA Training Simulator
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.15] sm:leading-[1.1]">
            Master Clinical Protocols with <br className="hidden sm:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF7A00] to-pink-500">Confidence</span> & <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">Precision</span>
          </h1>

          <p className="text-gray-600 text-base sm:text-lg md:text-2xl max-w-2xl mx-auto font-medium">
            Interactive scenarios, instant feedback, and certified progress tracking designed exclusively for community health workers in India.
          </p>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/signup"
              className="px-10 py-4 bg-gradient-to-r from-[#FF7A00] to-[#E55A00] text-white font-bold text-lg rounded-full shadow-[0_8px_20px_rgb(229,90,0,0.3)] hover:-translate-y-1 hover:shadow-[0_12px_25px_rgb(229,90,0,0.4)] transition-all w-full sm:w-auto flex items-center justify-center gap-2"
            >
              Start Free Training
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
            </Link>
          </div>
        </div>
      </main>

    </div>
  );
}
