import React from 'react';
import { Sun, Moon, Database, Menu, ShieldCheck, Mail, Sparkles, Search, Bookmark } from 'lucide-react';
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
  activeTab: 'search' | 'saved';
  setActiveTab: (tab: 'search' | 'saved') => void;
  savedCount: number;
}

export default function Header({
  user,
  isDark,
  setIsDark,
  supabaseConfigured,
  googleMapsConfigured,
  setMobileOpen,
  onOpenConnections,
  onOpenSearch,
  activeTab,
  setActiveTab,
  savedCount
}: HeaderProps) {
  // Format formatted initial profile badge
  const userInitial = user.email ? user.email.charAt(0).toUpperCase() : 'V';

  return (
    <header className="flex items-center justify-between h-16 px-4 border-b bg-white border-slate-200 text-slate-800 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 md:px-8">
      {/* Brand logo (Persistent and beautifully detailed) */}
      <div className="flex items-center space-x-2.5">
        <div className="flex items-center justify-center w-8.5 h-8.5 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20 shrink-0">
          <Sparkles className="w-4.5 h-4.5 animate-pulse" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-black tracking-tight bg-gradient-to-r from-slate-950 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text leading-none mt-1">
            LeadMine <span className="text-indigo-600 dark:text-indigo-400">AI</span>
          </span>
          <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 tracking-wider uppercase">Local SaaS</span>
        </div>
      </div>

      {/* Sleek Search bar launcher button */}
      {onOpenSearch && (
        <button
          onClick={onOpenSearch}
          className="hidden sm:flex items-center space-x-2 px-3.5 py-1.5 w-44 lg:w-56 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-850 rounded-xl text-xs font-semibold text-slate-400 dark:text-slate-500 transition-colors cursor-pointer ml-4"
        >
          <Search className="w-3.5 h-3.5 shrink-0" />
          <span className="flex-1 text-left truncate">Search leads...</span>
          <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-extrabold text-slate-450 dark:text-slate-500 bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-800 tracking-normal font-mono">
            ⌘K
          </kbd>
        </button>
      )}

      {/* Segmented top navigation - placed towards the right side */}
      <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-150/10 dark:border-slate-800/20 ml-auto mr-3">
        <button
          onClick={() => setActiveTab('search')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold tracking-normal transition-all leading-none ${
            activeTab === 'search'
              ? 'bg-white dark:bg-slate-950 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Search Discoverer</span>
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold tracking-normal transition-all leading-none relative ${
            activeTab === 'saved'
              ? 'bg-white dark:bg-slate-950 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Saved Leads</span>
          {savedCount > 0 && (
            <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 text-[10px] font-black rounded-full leading-none">
              {savedCount}
            </span>
          )}
        </button>
      </div>

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
