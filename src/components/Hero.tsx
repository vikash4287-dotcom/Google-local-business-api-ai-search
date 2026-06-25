import React from 'react';
import { Sparkles, ArrowRight, Play, CheckCircle, Database, Shield, Zap, Target } from 'lucide-react';

interface HeroProps {
  isAuthenticated: boolean;
  onStartFree: () => void;
  onSeeHowItWorks: () => void;
}

export default function Hero({ isAuthenticated, onStartFree, onSeeHowItWorks }: HeroProps) {
  return (
    <div className="relative overflow-hidden bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-900 py-16 sm:py-24">
      {/* Background Cinematic Gradients & Elements */}
      <div className="absolute inset-0 pointer-events-none select-none">
        {/* Soft radial ambient glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-200/20 dark:bg-indigo-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-200/25 dark:bg-violet-900/10 rounded-full blur-3xl" />
        
        {/* Subtle decorative grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        
        {/* Cinematic abstract backdrop */}
        <img
          src="https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1600&auto=format&fit=crop"
          alt="Cinematic abstract backdrop"
          className="absolute inset-0 w-full h-full object-cover object-center mix-blend-overlay dark:mix-blend-color-dodge opacity-[0.03] dark:opacity-[0.05]"
          referrerPolicy="no-referrer"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Badge / Announcement Pill */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-150/30 dark:border-indigo-900/30 mb-8 shadow-xs animate-in fade-in duration-700">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          <span>Next-Gen Local Lead Prospecting</span>
          <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
        </div>

        {/* Main Bold Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6.5xl font-black tracking-tight text-slate-900 dark:text-white font-sans max-w-4.5xl mx-auto leading-[1.1] mb-6">
          Find Local Businesses That{' '}
          <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-500 dark:from-indigo-400 dark:via-violet-400 dark:to-indigo-300 bg-clip-text text-transparent">
            Need Your Services
          </span>
        </h1>

        {/* Supporting Subtitle */}
        <p className="text-sm sm:text-base md:text-lg text-slate-655 dark:text-slate-350 font-medium max-w-3xl mx-auto leading-relaxed mb-10">
          Discover businesses with poor websites, low reviews, weak online presence, or no website at all—then turn them into SEO, web design, and digital marketing clients.
        </p>

        {/* Dual Conversion-Focused CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 max-w-md mx-auto sm:max-w-none">
          <button
            onClick={onStartFree}
            className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/35 flex items-center justify-center gap-2 cursor-pointer group"
          >
            <span>{isAuthenticated ? 'Scan Local Leads Now' : 'Start Free and Scan'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button
            onClick={onSeeHowItWorks}
            className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-850 active:scale-98 text-slate-700 dark:text-slate-200 font-bold text-sm rounded-xl border border-slate-200 dark:border-slate-800 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 text-slate-400 fill-current" />
            <span>See How It Works</span>
          </button>
        </div>

        {/* Modern Trust Badge Strip below */}
        <div className="pt-10 border-t border-slate-150/80 dark:border-slate-900 max-w-5xl mx-auto">
          <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest mb-6">
            Trusted capabilities driving lead conversions
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
            <div className="flex items-start space-x-3 p-3 bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-850/60 rounded-xl shadow-2xs">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg shrink-0">
                <Database className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <span className="block text-[11px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Source</span>
                <span className="text-xs sm:text-sm font-bold text-slate-850 dark:text-slate-200">Google Map Listings</span>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-850/60 rounded-xl shadow-2xs">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <span className="block text-[11px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Audit</span>
                <span className="text-xs sm:text-sm font-bold text-slate-850 dark:text-slate-200">Deficit Evaluation</span>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-850/60 rounded-xl shadow-2xs">
              <div className="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-lg shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <span className="block text-[11px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">AI Engines</span>
                <span className="text-xs sm:text-sm font-bold text-slate-850 dark:text-slate-200">Gemini Intelligence</span>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-850/60 rounded-xl shadow-2xs">
              <div className="p-2 bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 rounded-lg shrink-0">
                <Target className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <span className="block text-[11px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Pitches</span>
                <span className="text-xs sm:text-sm font-bold text-slate-850 dark:text-slate-200">Custom Conversion copy</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
