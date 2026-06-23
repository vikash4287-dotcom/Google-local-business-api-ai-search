import React from 'react';
import { Search, Bookmark, Database, Menu, X, ShieldAlert, Sparkles, Info, HelpCircle } from 'lucide-react';

interface SidebarProps {
  activeTab: 'search' | 'saved';
  setActiveTab: (tab: 'search' | 'saved') => void;
  savedCount: number;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  supabaseConfigured: boolean;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  savedCount,
  mobileOpen,
  setMobileOpen,
  supabaseConfigured
}: SidebarProps) {
  const navItems = [
    {
      id: 'search' as const,
      label: 'Search Discoverer',
      icon: Search,
      badge: null
    },
    {
      id: 'saved' as const,
      label: 'Saved Leads',
      icon: Bookmark,
      badge: savedCount > 0 ? savedCount : null
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 border-r transition-transform duration-300 ease-in-out
        bg-white border-slate-200 text-slate-800
        dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100
        lg:static lg:translate-x-0
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header/Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-slate-950 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text">
                LocalShop <span className="text-indigo-600 dark:text-indigo-400">AI</span>
              </span>
              <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 tracking-wider uppercase">Local SaaS Discovery</p>
            </div>
          </div>
          <button 
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 lg:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <div className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileOpen(false);
                  }}
                  className={`
                    flex items-center justify-between w-full px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group
                    ${isActive 
                      ? 'bg-indigo-55 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4.5 h-4.5 transition-transform duration-200 group-hover:scale-105 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== null && (
                    <span className={`
                      px-2 py-0.5 text-xs font-semibold rounded-full tracking-wide
                      ${isActive
                        ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }
                    `}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer info containing workspace safety seal */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Workspace Secure</span>
          </div>
        </div>
      </aside>
    </>
  );
}
