import React, { useState, useRef, useEffect } from 'react';
import { 
  Sun, 
  Moon, 
  Database, 
  Menu, 
  ShieldCheck, 
  Mail, 
  Sparkles, 
  Search, 
  Bookmark, 
  LogIn, 
  LogOut, 
  ChevronDown, 
  RefreshCw, 
  UserPlus
} from 'lucide-react';
import { ActiveUser } from '../types';
import { loginWithGoogle, logoutUser } from '../services/firebase';

interface HeaderProps {
  user: ActiveUser;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  supabaseConfigured: boolean; // True when Firebase User is active
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Click outside to close dropdown ref
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignIn = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      await loginWithGoogle();
      setDropdownOpen(false);
    } catch (err: any) {
      setAuthError(err.message || "Failed to authenticate via Google.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      await logoutUser();
      setDropdownOpen(false);
    } catch (err: any) {
      setAuthError(err.message || "Failed to sign out.");
    } finally {
      setLoading(false);
    }
  };

  // Format formatted initial profile badge
  const userInitial = user.email ? user.email.charAt(0).toUpperCase() : 'G';

  return (
    <header className="flex items-center justify-between h-16 px-4 border-b bg-white border-slate-200 text-slate-800 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 md:px-8">
      {/* Brand logo (Persistent and beautifully detailed) */}
      <div className="flex items-center space-x-2.5">
        <div className="flex items-center justify-center w-8.5 h-8.5 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20 shrink-0">
          <Sparkles className="w-4.5 h-4.5 animate-pulse" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-black tracking-tight bg-gradient-to-r from-slate-950 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text leading-none mt-1">
            LocalShop <span className="text-indigo-600 dark:text-indigo-400">AI</span>
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
          <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-extrabold text-slate-455 dark:text-slate-500 bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-800 tracking-normal font-mono">
            ⌘K
          </kbd>
        </button>
      )}

      {/* Pricing and navigation links */}
      <button
        onClick={() => {
          const el = document.getElementById('pricing-section');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        className="text-xs font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-all mx-4 cursor-pointer select-none hidden md:inline-block"
      >
        Pricing Plans
      </button>

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

        {/* User profile with interactive Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2.5 p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/40 border border-transparent hover:border-slate-150 dark:hover:border-slate-850 transition-all text-left cursor-pointer"
          >
            <div className="hidden flex-col items-end text-right md:flex select-none">
              <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200 leading-tight">
                {supabaseConfigured ? 'Connected Partner' : 'Sandbox Guest'}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 max-w-[130px] truncate" title={user.email}>
                {user.email}
              </span>
            </div>

            <div className="flex items-center justify-center w-8.5 h-8.5 rounded-full font-bold text-sm bg-gradient-to-tr from-indigo-600 to-violet-600 text-white border border-indigo-500 shadow-sm relative shrink-0">
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
              ) : (
                userInitial
              )}
              {/* Online indicator */}
              <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-950 ${
                supabaseConfigured ? 'bg-emerald-500' : 'bg-amber-500'
              }`} />
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          </button>

          {/* Absolute Dropdown menu popup */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2.5 w-64 bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl shadow-xl p-3 z-55 animate-in fade-in slide-in-from-top-2 duration-100">
              <div className="pb-3 border-b border-slate-100 dark:border-slate-900 mb-2.5 text-xs text-left">
                <p className="font-extrabold text-slate-405 dark:text-slate-500 uppercase tracking-wider text-[9px]">Account Identity</p>
                <p className="font-bold text-slate-800 dark:text-slate-100 mt-1 truncate" title={user.email}>{user.email}</p>
                <div className="flex items-center gap-1.5 mt-2.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${supabaseConfigured ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wide">
                    {supabaseConfigured ? 'Cloud Sync Engaged' : 'Local Sandbox Mode'}
                  </span>
                </div>
              </div>

              {authError && (
                <div className="mb-2 text-[10px] bg-rose-50 border border-rose-100 text-rose-800 p-2 rounded-xl dark:bg-rose-950/20 dark:border-rose-900 font-semibold leading-relaxed">
                  {authError}
                </div>
              )}

              {supabaseConfigured ? (
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={loading}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl cursor-pointer transition-colors text-left"
                >
                  <span className="flex items-center gap-2">
                    <LogOut className="w-4 h-4" />
                    <span>Disconnect Cloud</span>
                  </span>
                  {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl cursor-pointer transition-all hover:shadow-md hover:shadow-indigo-500/10 active:scale-98"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    <span>Connect Google Cloud</span>
                  </span>
                  {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <LogIn className="w-4 h-4" />}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
