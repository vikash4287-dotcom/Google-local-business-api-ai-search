import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, CornerDownLeft, Bookmark, Sparkles, AlertCircle } from 'lucide-react';
import { SavedBusiness } from '../types';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  savedLeads: SavedBusiness[];
  onSelectLead: (lead: SavedBusiness) => void;
}

export default function SearchOverlay({ isOpen, onClose, savedLeads, onSelectLead }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Filter leads based on name or category or city
  const filteredLeads = useMemo(() => {
    if (!query.trim()) return savedLeads;
    const lowerQuery = query.toLowerCase();
    return savedLeads.filter(
      (lead) =>
        lead.name.toLowerCase().includes(lowerQuery) ||
        lead.category.toLowerCase().includes(lowerQuery) ||
        lead.city.toLowerCase().includes(lowerQuery)
    );
  }, [query, savedLeads]);

  // Reset active index when query changes
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Focus input when overlay opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => (filteredLeads.length > 0 ? (prev < filteredLeads.length - 1 ? prev + 1 : 0) : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => (filteredLeads.length > 0 ? (prev > 0 ? prev - 1 : filteredLeads.length - 1) : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredLeads.length > 0 && activeIndex >= 0 && activeIndex < filteredLeads.length) {
          const selected = filteredLeads[activeIndex];
          onSelectLead(selected);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, filteredLeads, activeIndex, onClose, onSelectLead]);

  // Scroll active item into view
  useEffect(() => {
    if (resultsRef.current && activeIndex >= 0) {
      const activeElement = resultsRef.current.children[activeIndex] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-start justify-center pt-[10vh] px-4 md:px-0">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modern Search Palette Box */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[70vh] pointer-events-auto">
        
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search saved leads by name, category, or city..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent border-0 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-0 text-sm font-medium"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] font-extrabold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 tracking-wider font-mono mr-3 uppercase">
            ESC
          </kbd>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic List Content */}
        <div className="flex-1 overflow-y-auto p-2" ref={resultsRef}>
          {filteredLeads.length > 0 ? (
            filteredLeads.map((lead, idx) => {
              const isSelected = idx === activeIndex;
              return (
                <div
                  key={lead.id}
                  onClick={() => {
                    onSelectLead(lead);
                    onClose();
                  }}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-650 dark:bg-indigo-600 text-white'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className={`p-2 rounded-lg shrink-0 ${
                      isSelected 
                        ? 'bg-white/10 text-white' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}>
                      <Bookmark className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs font-bold leading-none truncate ${
                        isSelected ? 'text-white' : 'text-slate-900 dark:text-slate-100'
                      }`}>
                        {lead.name}
                      </p>
                      <p className={`text-[11px] font-medium mt-1 ${
                        isSelected ? 'text-indigo-100' : 'text-slate-400 dark:text-slate-500'
                      }`}>
                        {lead.category} • {lead.city}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    {/* Status Badge */}
                    {lead.status && (
                      <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md tracking-wider ${
                        isSelected
                          ? 'bg-white/20 text-white border border-white/10'
                          : lead.status === 'Contacted' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/40 dark:border-indigo-900/40 dark:text-indigo-400' :
                            lead.status === 'Interested' ? 'bg-emerald-50 border-emerald-250 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-900/40 dark:text-emerald-400' :
                            lead.status === 'Do Not Contact' ? 'bg-rose-50 border-rose-250 text-rose-700 dark:bg-rose-950/40 dark:border-rose-900/40 dark:text-rose-400' :
                            'bg-slate-50 border-slate-205 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400'
                      }`}>
                        {lead.status}
                      </span>
                    )}

                    {/* Hint / Selector indicator */}
                    {isSelected && (
                      <span className="hidden sm:inline-flex items-center text-[10px] text-indigo-100 font-bold opacity-80 gap-1 mt-0.5">
                        <span>Select</span>
                        <CornerDownLeft className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 px-4 text-center">
              <AlertCircle className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {savedLeads.length === 0 ? 'No Saved Leads Found' : 'No Matching Saved Leads'}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                {savedLeads.length === 0 
                  ? 'Identify potential leads from active searches and save them to track progress.' 
                  : `We couldn't find any saved leads matching "${query}".`}
              </p>
            </div>
          )}
        </div>

        {/* Footer controls instruction rail */}
        <div className="bg-slate-50 dark:bg-slate-950 px-4 py-2.5 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-bold tracking-wider uppercase font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-sm">↑↓</kbd> Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-sm">Enter</kbd> Open
            </span>
          </div>
          <span className="flex items-center gap-1">
            Total Saved: <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{savedLeads.length}</span>
          </span>
        </div>

      </div>
    </div>
  );
}
