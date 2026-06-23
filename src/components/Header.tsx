import React from 'react';
import { Sun, Moon, Database, Menu, ShieldCheck, Mail, Sparkles, Search } from 'lucide-react';
import { ActiveUser } from '../types';

interface HeaderProps {
  user: ActiveUser;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  supabaseConfigured: boolean;
  googleMapsConfigured: boolean;
  setMobileOpen: (open: boolean) => void;
  onOpenConnections: () => void;
  onOpenSearch?: () => void;
}

export default function Header({
  user,
  isDark,
  setIsDark,
  supabaseConfigured,
  googleMapsConfigured,
  setMobileOpen,
  onOpenConnections,
  onOpenSearch
}: HeaderProps) {
  // Format formatted initial profile badge
  const userInitial = user.email ? user.email.charAt(0).toUpperCase() : 'V';

  return (
    <header className="flex items-center justify-between h-16 px-4 border-b bg-white border-slate-200 text-slate-800 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 md:px-8">
      {/* Sidebar toggle button (Mobile Only) */}
      <div className="flex items-center space-x-3 lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="font-bold text-sm tracking-tight dark:text-slate-100">
          LeadMine AI
        </span>
      </div>

      {/* Connection Quick Info (Desktop only) */}
      <div className="hidden items-center space-x-3 lg:flex">
        {/* Supabase Indicator */}
        <button
          onClick={onOpenConnections}
          className={`flex items-center space-x-2 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${
            supabaseConfigured
              ? 'bg-emerald-50/50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/60 dark:text-emerald-300'
              : 'bg-amber-50/50 border-amber-200 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/60 dark:text-amber-300'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Supabase: {supabaseConfigured ? 'Sync Live' : 'Sandbox (Demo)'}</span>
        </button>

        {/* Google Maps Indicator */}
        <button
          onClick={onOpenConnections}
          className={`flex items-center space-x-2 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${
            googleMapsConfigured
              ? 'bg-indigo-50/50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/25 dark:border-indigo-900/60 dark:text-indigo-300'
              : 'bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Places API: {googleMapsConfigured ? 'Direct Key' : 'Smart API (Simulated)'}</span>
        </button>
      </div>

      {/* Sleek Search bar launcher button */}
      {onOpenSearch && (
        <button
          onClick={onOpenSearch}
          className="hidden sm:flex items-center space-x-2 px-3.5 py-1.5 w-64 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-805 rounded-xl text-xs font-semibold text-slate-400 dark:text-slate-500 transition-colors cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 shrink-0" />
          <span className="flex-1 text-left">Search CRM Leads...</span>
          <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-extrabold text-slate-450 dark:text-slate-500 bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-800 tracking-normal font-mono">
            ⌘K
          </kbd>
        </button>
      )}

      {/* Right controls: Theme toggle & Profile */}
      <div className="flex items-center space-x-3">
        {/* Theme mode toggle */}
        <button
          onClick={() => setIsDark(!isDark)}
          className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900 transition-colors"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Vertical divider */}
        <div className="h-5 w-px bg-slate-200 dark:bg-slate-800" />

        {/* User profile dropdown pill */}
        <div className="flex items-center space-x-2.5">
          <div className="hidden flex-col items-end text-right md:flex">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Agency Partner
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 max-w-[150px] truncate" title={user.email}>
              {user.email}
            </span>
          </div>

          <div className="flex items-center justify-center w-8.5 h-8.5 rounded-full font-bold text-sm bg-gradient-to-tr from-indigo-600 to-violet-600 text-white border border-indigo-500 shadow-sm relative group cursor-pointer">
            {userInitial}
            {/* Online indicator */}
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-950" />
          </div>
        </div>
      </div>
    </header>
  );
}
