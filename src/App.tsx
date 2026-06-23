import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, 
  MapPin, 
  Star, 
  BookmarkCheck, 
  Sparkles, 
  History, 
  SlidersHorizontal,
  ChevronRight,
  Database,
  Trash2,
  TrendingDown,
  Building2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Business, SavedBusiness, SearchHistory, ActiveUser } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ResultsTable from './components/ResultsTable';
import SearchMap from './components/SearchMap';
import BusinessModal from './components/BusinessModal';
import ConnectionsPanel from './components/ConnectionsPanel';
import { generateMockLeads } from './services/leadsMock';
import { USA_STATES_AND_CITIES } from './services/usaGeographics';
import { databaseService } from './services/db';
import { auth } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import SearchOverlay from './components/SearchOverlay';
import PipelineStats from './components/PipelineStats';

export default function App() {
  // Theme state (SaaS default is high-contrast light, with full dark mode support)
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('leadmine_ai_theme');
    return saved === 'dark';
  });

  const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false);

  // Navigation state
  const [activeTab, setActiveTab] = useState<'search' | 'saved' | 'connections'>('search');
  const [mobileOpen, setMobileOpen] = useState(false);

  // Core CRM data structures states
  const [user, setUser] = useState<ActiveUser>({ id: '', email: 'vikash4287@gmail.com', createdAt: '' });
  const [savedLeads, setSavedLeads] = useState<SavedBusiness[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  
  // Active search query parameters
  const [city, setCity] = useState('Seattle');
  const [category, setCategory] = useState('Restaurants');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Geographic columns
  const [country] = useState('USA');
  const [selectedState, setSelectedState] = useState('WA');

  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [highlightedSuggestionIndex, setHighlightedSuggestionIndex] = useState(-1);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Dynamically filtered cities based on query, country, and selected state
  const filteredCities = useMemo(() => {
    if (!city || city.trim() === '') return [];
    const query = city.trim().toLowerCase();

    let pool: string[] = [];
    if (selectedState === 'All') {
      // Gather all unique cities in USA
      const allCities = new Set<string>();
      USA_STATES_AND_CITIES.forEach(st => {
        st.cities.forEach(c => allCities.add(c));
      });
      pool = Array.from(allCities);
    } else {
      const target = USA_STATES_AND_CITIES.find(st => st.code === selectedState);
      if (target) {
        pool = target.cities;
      }
    }

    return pool
      .filter(c => c.toLowerCase().startsWith(query))
      .sort((a, b) => a.localeCompare(b));
  }, [city, selectedState]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowCitySuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelectCity = (selectedCity: string) => {
    setCity(selectedCity);
    setShowCitySuggestions(false);
    setHighlightedSuggestionIndex(-1);
    
    // Auto-align the state dropdown if we're in "All" mode
    if (selectedState === 'All') {
      const matchState = USA_STATES_AND_CITIES.find(st => 
        st.cities.some(c => c.toLowerCase() === selectedCity.toLowerCase())
      );
      if (matchState) {
        setSelectedState(matchState.code);
      }
    }
    
    handleSearch(false, selectedCity);
  };

  const handleSelectStateChange = (stateCode: string) => {
    setSelectedState(stateCode);
    if (stateCode !== 'All') {
      const target = USA_STATES_AND_CITIES.find(st => st.code === stateCode);
      if (target && target.cities.length > 0) {
        // Change to the first city of that state and search it
        const firstCity = target.cities[0];
        setCity(firstCity);
        handleSearch(false, firstCity);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (filteredCities.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedSuggestionIndex(prev => 
        prev < filteredCities.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedSuggestionIndex(prev => 
        prev > 0 ? prev - 1 : filteredCities.length - 1
      );
    } else if (e.key === 'Enter') {
      if (highlightedSuggestionIndex >= 0 && highlightedSuggestionIndex < filteredCities.length) {
        e.preventDefault();
        handleSelectCity(filteredCities[highlightedSuggestionIndex]);
      } else {
        // Find best match if exact match or single result
        const exactMatch = filteredCities.find(c => c.toLowerCase() === city.trim().toLowerCase());
        if (exactMatch) {
          e.preventDefault();
          handleSelectCity(exactMatch);
        } else if (filteredCities.length > 0) {
          e.preventDefault();
          handleSelectCity(filteredCities[0]);
        }
      }
    } else if (e.key === 'Escape') {
      setShowCitySuggestions(false);
    }
  };

  // Filter values
  const [minRating, setMinRating] = useState<number>(1.0);
  const [maxRating, setMaxRating] = useState<number>(5.0);
  const [minReviews, setMinReviews] = useState<number>(0);
  const [maxReviews, setMaxReviews] = useState<number>(10000);
  const [hasWebsite, setHasWebsite] = useState<'any' | 'yes' | 'no'>('any');

  // Search execution states
  const [leads, setLeads] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastCitySearched, setLastCitySearched] = useState('Seattle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchLayout, setSearchLayout] = useState<'both' | 'map' | 'list'>('list');

  // UI inspection items
  const [selectedLead, setSelectedLead] = useState<Business | null>(null);

  // Configuration indicators
  const MAPS_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';
  const isRealGoogleMapsKey = (key: string): boolean => {
    return typeof key === 'string' && key.trim().startsWith('AIzaSy') && key.trim().length > 30;
  };
  const googleMapsConfigured = isRealGoogleMapsKey(MAPS_KEY);
  const [firebaseConnected, setFirebaseConnected] = useState<boolean>(false);

  // Categories list
  const CATEGORIES = [
    'Accountants',
    'Bakeries',
    'Boutiques',
    'Cafes',
    'Car Dealers',
    'Car Garage',
    'Car wash',
    'Dentists',
    'Doctors',
    'Electricians',
    'Gyms',
    'Hotels',
    'HVAC Services',
    'Interior Designers',
    'Lawyers',
    'Make up Artists',
    'Pest Control',
    'Pet Groomers',
    'Plumbers',
    'Real Estate Agencies',
    'Restaurants',
    'Roofing Contractors',
    'Salons',
    'Spas'
  ];

  // Load initial systemic state & monitor Cloud Auth changes reactively
  useEffect(() => {
    let active = true;
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      let activeUser: ActiveUser;
      if (firebaseUser) {
        activeUser = {
          id: firebaseUser.uid,
          email: firebaseUser.email || 'user@example.com',
          createdAt: firebaseUser.metadata.creationTime || new Date().toISOString()
        };
      } else {
        activeUser = await databaseService.getCurrentUser();
      }

      const saved = await databaseService.getSavedBusinesses();
      const history = await databaseService.getSearchHistory();
      
      if (active) {
        setUser(activeUser);
        setSavedLeads(saved);
        setSearchHistory(history);
        setFirebaseConnected(!!firebaseUser);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  // Theme effect hook
  useEffect(() => {
    localStorage.setItem('leadmine_ai_theme', isDark ? 'dark' : 'light');
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Initial Seed Search to fill page on load
  useEffect(() => {
    handleSearch(true);
  }, []);

  // Global search overlay keyboard shortcut listener (Cmd/Ctrl + K)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOverlayOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, []);

  // Execution Search Logic
  const handleSearch = async (isInitialSeed = false, forcedCity?: string) => {
    const targetCity = (forcedCity !== undefined ? forcedCity : city).trim();
    if (!targetCity) return;
    setIsLoading(true);
    setErrorMessage(null);

    const activeFilters = {
      minRating: Number(minRating),
      maxRating: Number(maxRating),
      minReviews: Number(minReviews),
      maxReviews: Number(maxReviews),
      hasWebsite
    };

    try {
      // Dynamic script loader for Google Maps Places API if configured
      if (googleMapsConfigured && (window as any).google?.maps?.places) {
        // Direct Query through active Places Library
        const tempDiv = document.createElement('div');
        const service = new (window as any).google.maps.places.PlacesService(tempDiv);
        
        service.textSearch({
          query: `${category} in ${targetCity}`
        }, async (results: any[], status: any) => {
          if (status === 'OK' && results) {
            const mappedLeads: Business[] = results.map((place: any, index: number) => {
              // Convert Google model matching schema (CF4 Schema safe check)
              const hasWeb = place.website || (place.photos && place.photos.length > 2);
              return {
                id: place.place_id || `gplace_${index}_${Date.now()}`,
                name: place.name,
                address: place.formatted_address || place.vicinity,
                phone: place.formatted_phone_number || undefined,
                website: place.website || undefined,
                rating: place.rating || undefined,
                reviewCount: place.user_ratings_total || 0,
                category,
                city: targetCity,
                latitude: place.geometry?.location?.lat ? (typeof place.geometry.location.lat === 'function' ? place.geometry.location.lat() : place.geometry.location.lat) : undefined,
                longitude: place.geometry?.location?.lng ? (typeof place.geometry.location.lng === 'function' ? place.geometry.location.lng() : place.geometry.location.lng) : undefined,
              };
            });

            // Filter mapping results
            const filtered = mappedLeads.filter(lead => {
              const matchesRating = (lead.rating || 0) >= activeFilters.minRating && (lead.rating || 0) <= activeFilters.maxRating;
              const matchesReviews = (lead.reviewCount || 0) >= activeFilters.minReviews && (lead.reviewCount || 0) <= activeFilters.maxReviews;
              let matchesWeb = true;
              if (activeFilters.hasWebsite === 'yes') matchesWeb = !!lead.website;
              if (activeFilters.hasWebsite === 'no') matchesWeb = !lead.website;
              return matchesRating && matchesReviews && matchesWeb;
            });

            setLeads(filtered);
            setLastCitySearched(targetCity);
            setIsLoading(false);

            if (!isInitialSeed) {
              const hEntry = await databaseService.addSearchHistory({
                city: targetCity,
                category,
                resultsCount: filtered.length,
                filters: activeFilters
              });
              setSearchHistory(prev => [hEntry, ...prev]);
            }
          } else {
            throw new Error(`Google Places query failed with status: ${status}`);
          }
        });
      } else {
        // Run with LeadMine Smart Generator simulator
        // Simulates realistic delays
        await new Promise(resolve => setTimeout(resolve, 800));
        const mockResults = generateMockLeads(targetCity, category, activeFilters);
        setLeads(mockResults);
        setLastCitySearched(targetCity);
        setIsLoading(false);

        if (!isInitialSeed) {
          const hEntry = await databaseService.addSearchHistory({
            city: targetCity,
            category,
            resultsCount: mockResults.length,
            filters: activeFilters
          });
          setSearchHistory(prev => [hEntry, ...prev]);
        }
      }
    } catch (err: any) {
      console.error('Unified lead discovery error:', err);
      // Fallback cleanly
      const mockResults = generateMockLeads(targetCity, category, activeFilters);
      setLeads(mockResults);
      setLastCitySearched(targetCity);
      setIsLoading(false);
      setErrorMessage(err.message || 'Connecting to Google Places API failed, loaded LeadMine local simulator results instead.');
    }
  };

  // Saved Leads operations
  const handleSaveLead = async (business: Business) => {
    try {
      const savedItem = await databaseService.saveBusiness(business);
      setSavedLeads(prev => [savedItem, ...prev]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveLead = async (id: string) => {
    try {
      await databaseService.removeSavedBusiness(id);
      setSavedLeads(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (id: string, status: SavedBusiness['status']) => {
    try {
      if (!status) return;
      const updatedItem = await databaseService.updateBusinessStatus(id, status);
      if (updatedItem) {
        setSavedLeads(prev => prev.map(item => item.id === id ? { ...item, status } : item));
        setSelectedLead(prev => prev && prev.id === id ? { ...prev, status } : prev);
      }
    } catch (err) {
      console.error('Failed to update lead status:', err);
    }
  };

  const handleClearHistory = async () => {
    if (confirm('Clear all local search history?')) {
      await databaseService.clearSearchHistory();
      setSearchHistory([]);
    }
  };

  const applyHistoryItem = (item: SearchHistory) => {
    setCity(item.city);
    setCategory(item.category);
    if (item.filters) {
      setMinRating(item.filters.minRating || 1.0);
      setMaxRating(item.filters.maxRating || 5.0);
      setMinReviews(item.filters.minReviews || 0);
      setMaxReviews(item.filters.maxReviews || 10000);
      setHasWebsite(item.filters.hasWebsite || 'any');
    }
    setActiveTab('search');
    // Trigger action next frame
    setTimeout(() => {
      handleSearch();
    }, 50);
  };

  // Saved leads helper maps for check verification toggles
  const savedLeadsNameCityMap = useMemo(() => {
    const set = new Set<string>();
    savedLeads.forEach(item => {
      set.add(`${item.name.toLowerCase()}_${item.city.toLowerCase()}`);
    });
    return set;
  }, [savedLeads]);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        savedCount={savedLeads.length}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        supabaseConfigured={firebaseConnected}
      />

      {/* Main Core Frame */}
      <div className="flex flex-col flex-1 min-w-0">
        <Header 
          user={user}
          isDark={isDark}
          setIsDark={setIsDark}
          supabaseConfigured={firebaseConnected}
          googleMapsConfigured={googleMapsConfigured}
          setMobileOpen={setMobileOpen}
          onOpenConnections={() => setActiveTab('connections')}
          onOpenSearch={() => setIsSearchOverlayOpen(true)}
        />

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'search' && (
              <motion.div
                key="search-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Hero block */}
                <div className="space-y-1.5 py-2">
                  <h1 className="text-2xl font-black font-sans md:text-3.5xl tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
                    <span>Find Businesses Losing Customers Online</span>
                    <Sparkles className="w-5.5 h-5.5 text-indigo-500 animate-pulse hidden sm:inline-block" />
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                    Discover local businesses with poor online presence, outdated metrics, or zero website and turn them into high-paying web and marketing clients.
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-700 dark:text-amber-400 text-xs font-semibold flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Filters/Search Hub card */}
                <div className="p-6 bg-white border border-slate-200 rounded-2xl dark:border-slate-850 dark:bg-slate-950/70 shadow-xs space-y-4">
                  {/* First row: Comprehensive US Geographic controls (Country, State, City/Town) */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-12 pb-2 border-b border-dashed border-slate-150 dark:border-slate-850">
                    {/* Country column */}
                    <div className="space-y-1.5 md:col-span-3">
                      <label className="text-xs font-bold text-slate-450 uppercase tracking-widest block">Country</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base">🇺🇸</span>
                        <select
                          disabled
                          className="w-full pl-9 pr-4 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 dark:text-slate-400 text-slate-500 rounded-xl text-sm font-semibold cursor-not-allowed outline-hidden"
                        >
                          <option value="USA">USA ({country})</option>
                        </select>
                      </div>
                    </div>

                    {/* State column - Full 50 states dropdown */}
                    <div className="space-y-1.5 md:col-span-4">
                      <label className="text-xs font-bold text-slate-450 uppercase tracking-widest block">US State</label>
                      <select
                        value={selectedState}
                        onChange={(e) => handleSelectStateChange(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-55/65 hover:bg-slate-55 border border-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-850/60 dark:text-slate-100 rounded-xl text-sm font-semibold transition-all focus:border-indigo-500 outline-hidden cursor-pointer"
                      >
                        <option value="All">All States (Comprehensive)</option>
                        {USA_STATES_AND_CITIES.map((st) => (
                          <option key={st.code} value={st.code}>
                            {st.name} ({st.code})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* City input column with reactive suggestions */}
                    <div className="space-y-1.5 md:col-span-5">
                      <label className="text-xs font-bold text-slate-455 uppercase tracking-widest block flex items-center justify-between">
                        <span>City or Town</span>
                        {showCitySuggestions && (
                          <span className="text-[10px] text-indigo-505 dark:text-indigo-400 font-bold normal-case tracking-normal">
                            Matching {filteredCities.length} cities...
                          </span>
                        )}
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                        <input
                          ref={inputRef}
                          type="text"
                          value={city}
                          onChange={(e) => {
                            setCity(e.target.value);
                            setShowCitySuggestions(true);
                            setHighlightedSuggestionIndex(-1);
                          }}
                          onFocus={() => setShowCitySuggestions(true)}
                          onKeyDown={handleKeyDown}
                          placeholder={selectedState === 'All' ? "Type a letter, e.g. S, D, L..." : "Type first letter..."}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-55/65 hover:bg-slate-55 border border-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-850/60 dark:text-slate-100 rounded-xl text-sm font-semibold transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden"
                        />
                        {showCitySuggestions && filteredCities.length > 0 && (
                          <div 
                            ref={suggestionsRef}
                            className="absolute left-0 right-0 top-full mt-1.5 z-50 max-h-60 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl divide-y divide-slate-150 dark:divide-slate-850/60"
                          >
                            {filteredCities.map((item, index) => {
                              const isHighlighted = index === highlightedSuggestionIndex;
                              const queryLen = city.trim().length;
                              const matchingPart = item.substring(0, queryLen);
                              const remainingPart = item.substring(queryLen);

                              return (
                                <button
                                  key={item}
                                  type="button"
                                  onClick={() => handleSelectCity(item)}
                                  onMouseEnter={() => setHighlightedSuggestionIndex(index)}
                                  className={`w-full text-left px-4 py-2.5 text-xs sm:text-sm font-semibold flex items-center justify-between transition-colors ${
                                    isHighlighted 
                                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300' 
                                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850/40'
                                  }`}
                                >
                                  <div className="flex items-center space-x-2">
                                    <MapPin className={`w-3.5 h-3.5 ${isHighlighted ? 'text-indigo-500 animate-pulse' : 'text-slate-400'}`} />
                                    <span>
                                      <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{matchingPart}</span>
                                      <span className="opacity-90">{remainingPart}</span>
                                    </span>
                                  </div>
                                  <span className="text-[9px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md uppercase tracking-wider font-mono">
                                    Select
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Second row: Business Category Selector & CTA actions */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-12 pt-1">
                    {/* Category Selector */}
                    <div className="space-y-1.5 md:col-span-8">
                      <label className="text-xs font-bold text-slate-455 uppercase tracking-widest block font-sans">Business Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-55/65 hover:bg-slate-55 border border-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-850/60 dark:text-slate-100 rounded-xl text-sm font-semibold transition-all focus:border-indigo-500 outline-hidden cursor-pointer"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    {/* Filter Toggle & Search button combo */}
                    <div className="flex items-end space-x-2.5 md:col-span-4">
                      <button
                        onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                        className={`p-2.5 border rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                          isFiltersOpen 
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950 dark:border-indigo-900 dark:text-indigo-400' 
                            : 'border-slate-250 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900'
                        }`}
                        title="Advanced filters"
                      >
                        <SlidersHorizontal className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => handleSearch(false)}
                        className="flex-1 py-11/12 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md shadow-indigo-600/10 animate-fade-in"
                      >
                        <Search className="w-4.5 h-4.5" />
                        <span>Discover Leads</span>
                      </button>
                    </div>
                  </div>

                  {/* Expanded Filters panel */}
                  {isFiltersOpen && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden border-t border-slate-100 dark:border-slate-850 pt-4"
                    >
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5 text-xs font-semibold">
                        {/* Min Rating */}
                        <div className="space-y-1.5">
                          <label className="text-slate-400 uppercase tracking-widest block">Min Rating (Stars)</label>
                          <input
                            type="number"
                            min="1"
                            max="5"
                            step="0.1"
                            value={minRating}
                            onChange={(e) => setMinRating(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg dark:bg-slate-900 dark:border-slate-850 dark:text-slate-100 outline-hidden"
                          />
                        </div>

                        {/* Max Rating */}
                        <div className="space-y-1.5">
                          <label className="text-slate-400 uppercase tracking-widest block">Max Rating (Stars)</label>
                          <input
                            type="number"
                            min="1"
                            max="5"
                            step="0.1"
                            value={maxRating}
                            onChange={(e) => setMaxRating(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg dark:bg-slate-900 dark:border-slate-850 dark:text-slate-100 outline-hidden"
                          />
                        </div>

                        {/* Min Reviews */}
                        <div className="space-y-1.5">
                          <label className="text-slate-400 uppercase tracking-widest block">Min Reviews</label>
                          <input
                            type="number"
                            min="0"
                            value={minReviews}
                            onChange={(e) => setMinReviews(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg dark:bg-slate-900 dark:border-slate-850 dark:text-slate-100 outline-hidden"
                          />
                        </div>

                        {/* Max Reviews */}
                        <div className="space-y-1.5">
                          <label className="text-slate-400 uppercase tracking-widest block">Max Reviews</label>
                          <input
                            type="number"
                            min="0"
                            value={maxReviews}
                            onChange={(e) => setMaxReviews(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg dark:bg-slate-900 dark:border-slate-850 dark:text-slate-100 outline-hidden"
                          />
                        </div>

                        {/* Website Check */}
                        <div className="space-y-1.5">
                          <label className="text-slate-450 uppercase tracking-widest block">Has Official Website</label>
                          <select
                            value={hasWebsite}
                            onChange={(e) => setHasWebsite(e.target.value as any)}
                            className="w-full px-3 py-2 bg-slate-55 border border-slate-205 rounded-lg dark:bg-slate-900 dark:border-slate-850 dark:text-slate-100 outline-hidden cursor-pointer font-bold"
                          >
                            <option value="any">Any Presence</option>
                            <option value="yes">Yes, Has Website</option>
                            <option value="no">No Website Deficit</option>
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Dynamic Layout / View Mode Slider tabs */}
                {leads.length > 0 && !isLoading && (
                  <div className="flex border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 p-1.5 rounded-2xl items-center self-start gap-1 justify-start max-w-fit shadow-xs">
                    <button 
                      onClick={() => setSearchLayout('list')}
                      className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 ${searchLayout === 'list' ? 'bg-white dark:bg-slate-950 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-100 dark:border-slate-850' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                    >
                      <span>Leads List</span>
                    </button>
                    <button 
                      onClick={() => setSearchLayout('map')}
                      className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 ${searchLayout === 'map' ? 'bg-white dark:bg-slate-950 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-100 dark:border-slate-850' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                    >
                      <span>Map Tracker</span>
                    </button>
                    <button 
                      onClick={() => setSearchLayout('both')}
                      className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 ${searchLayout === 'both' ? 'bg-white dark:bg-slate-950 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-100 dark:border-slate-850' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                    >
                      <span>Split Screen</span>
                    </button>
                  </div>
                )}

                {/* Conditional Geo Discovery & Table displays */}
                {leads.length > 0 && !isLoading && (searchLayout === 'both' || searchLayout === 'map') && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <SearchMap 
                      leads={leads}
                      savedLeads={savedLeads}
                      onSaveLead={handleSaveLead}
                      onRemoveLead={handleRemoveLead}
                      onSelectLead={setSelectedLead}
                      citySearched={lastCitySearched}
                    />
                  </motion.div>
                )}

                {(searchLayout === 'both' || searchLayout === 'list' || isLoading || leads.length === 0) && (
                  <ResultsTable 
                    leads={leads}
                    savedLeads={savedLeads}
                    onSaveLead={handleSaveLead}
                    onRemoveLead={handleRemoveLead}
                    onSelectLead={setSelectedLead}
                    isLoading={isLoading}
                    citySearched={lastCitySearched}
                  />
                )}

                {/* Bottom section: Recent Searches History logs */}
                {searchHistory.length > 0 && (
                  <div className="bg-white border rounded-2xl p-6 dark:bg-slate-950 dark:border-slate-850">
                    <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-850 gap-2.5">
                      <div className="flex items-center space-x-2">
                        <History className="w-5 h-5 text-slate-400" />
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Recent Search Discoveries History</h4>
                      </div>
                      <button
                        onClick={handleClearHistory}
                        className="text-xs text-slate-400 hover:text-rose-600 transition-colors uppercase font-bold tracking-wider cursor-pointer"
                      >
                        Clear logs
                      </button>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-slate-850 text-xs">
                      {searchHistory.slice(0, 5).map((item) => (
                        <div
                          key={item.id}
                          onClick={() => applyHistoryItem(item)}
                          className="flex items-center justify-between py-3 hover:bg-slate-50/40 dark:hover:bg-slate-900/10 px-2 rounded-lg cursor-pointer transition-colors group"
                        >
                          <div className="flex items-center space-x-3 truncate">
                            <span className="font-bold text-slate-800 dark:text-slate-200">{item.category}</span>
                            <span className="text-slate-400 font-semibold">•</span>
                            <span className="text-slate-500 font-medium dark:text-slate-400">{item.city}</span>
                            <span className="hidden text-[10px] text-slate-400 font-mono sm:inline">
                              (Min rating: {item.filters?.minRating || 1.0} | Website: {item.filters?.hasWebsite || 'any'})
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-bold shrink-0">
                            <span>{item.resultsCount} leads mapped</span>
                            <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'saved' && (
              <motion.div
                key="saved-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="space-y-1 py-1">
                  <h1 className="text-2xl font-black font-sans tracking-tight text-indigo-700 dark:text-indigo-400">
                    Your Saved Business Leads CRM ({savedLeads.length})
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-404 font-medium">
                    Analyze, manage, and plan high-conversion outbound strategies for saved targets locally or sync'd online.
                  </p>
                </div>

                {savedLeads.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-16 text-center border-2 border-dashed border-slate-200 rounded-3xl dark:border-slate-800 bg-white dark:bg-slate-950">
                    <div className="p-4 rounded-full bg-slate-50 dark:bg-slate-900 text-indigo-500 mb-4 animate-bounce">
                      <BookmarkCheck className="w-10 h-10 stroke-1.5" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">CRM Inventory Empty</h3>
                    <p className="max-w-md mt-2 text-sm text-slate-500 dark:text-slate-400">
                      When discovering matching directories in Search Discoverer, toggle the bookmark save flag to collect prospects here.
                    </p>
                    <button
                      onClick={() => setActiveTab('search')}
                      className="mt-5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 font-bold text-sm text-white rounded-xl transition-all cursor-pointer shadow-md"
                    >
                      Go discover prospects
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Pipeline Health Analytics */}
                    <PipelineStats savedLeads={savedLeads} />

                    {/* CRM Leads grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {savedLeads.map((item) => {
                        const hasWeb = !!item.website;
                        const isLowReviews = (item.reviewCount || 0) < 30;
                        const isPoorRating = (item.rating || 0) < 4.2;

                        return (
                          <div 
                            key={item.id} 
                            className="p-5 border border-slate-200 bg-white rounded-2xl dark:border-slate-850 dark:bg-slate-950 flex flex-col justify-between hover:border-indigo-200 dark:hover:border-indigo-800/60 shadow-xs transition-all relative group"
                          >
                            <div>
                              <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase bg-indigo-55/10 px-2 py-0.5 rounded-md">
                                    {item.category}
                                  </span>
                                  <h3 
                                    onClick={() => setSelectedLead(item)}
                                    className="text-base font-black text-slate-900 group-hover:text-indigo-600 dark:text-slate-50 dark:group-hover:text-indigo-400 transition-colors cursor-pointer pt-1"
                                  >
                                    {item.name}
                                  </h3>
                                  <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center space-x-1.5 mt-0.5">
                                    <MapPin className="w-3.5 h-3.5" />
                                    <span className="truncate max-w-[200px]" title={item.address}>{item.address}</span>
                                  </p>
                                </div>

                                <div className="flex items-center space-x-1 bg-amber-50 dark:bg-amber-950/20 text-amber-805 px-2 py-1 rounded-md border border-amber-100 dark:border-amber-900/20 shrink-0">
                                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                  <span className="text-xs font-bold text-amber-800 dark:text-amber-300">{item.rating ? item.rating.toFixed(1) : 'N/A'}</span>
                                </div>
                              </div>

                              {/* Outreach deficit items badges */}
                              <div className="flex flex-wrap gap-1.5 mt-4">
                                {!hasWeb && (
                                  <span className="text-[10px] bg-rose-50 border border-rose-100 text-rose-800 dark:bg-rose-950/30 dark:border-rose-900/30 dark:text-rose-350 px-2 py-0.5 rounded-md font-bold uppercase tracking-wide">
                                    No Website
                                  </span>
                                )}
                                {isLowReviews && (
                                  <span className="text-[10px] bg-amber-50 border border-amber-100 text-amber-800 dark:bg-amber-950/30 dark:border-amber-900/30 dark:text-amber-300 px-2 py-0.5 rounded-md font-semibold tracking-wide">
                                    Low reviews ({item.reviewCount})
                                  </span>
                                )}
                                {isPoorRating && (
                                  <span className="text-[10px] bg-red-55/10 border border-red-200 text-red-800 dark:border-red-900/30 dark:text-red-350 px-2 py-0.5 rounded-md font-semibold tracking-wide">
                                    Poor Rating ({item.rating})
                                  </span>
                                )}
                                {hasWeb && !isLowReviews && !isPoorRating && (
                                  <span className="text-[10px] bg-slate-50 border text-slate-400 dark:bg-slate-900 dark:border-slate-800 px-2 py-0.5 rounded-md">
                                    Healthy Profile
                                  </span>
                                )}
                              </div>

                              {/* Outreach Tracking Status */}
                              <div className="mt-4 pt-3 border-t border-dashed border-slate-150 dark:border-slate-850 flex items-center justify-between gap-2">
                                <span className="text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-widest">Outreach Status:</span>
                                <select
                                  value={item.status || 'New'}
                                  onChange={async (e) => {
                                    await handleUpdateStatus(item.id, e.target.value as any);
                                  }}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold uppercase border cursor-pointer outline-hidden transition-all dark:bg-slate-950 ${
                                    item.status === 'Contacted' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/40 dark:border-indigo-900/40 dark:text-indigo-400' :
                                    item.status === 'Interested' ? 'bg-emerald-50 border-emerald-250 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-900/40 dark:text-emerald-400' :
                                    item.status === 'Do Not Contact' ? 'bg-rose-50 border-rose-250 text-rose-700 dark:bg-rose-950/40 dark:border-rose-900/40 dark:text-rose-400' :
                                    'bg-slate-50 border-slate-205 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300'
                                  }`}
                                >
                                  <option value="New">🏷 New Lead</option>
                                  <option value="Contacted">✉ Contacted</option>
                                  <option value="Interested">🔥 Interested</option>
                                  <option value="Do Not Contact">✖ Do Not Contact</option>
                                </select>
                              </div>
                            </div>

                            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-850 pt-4 mt-5 gap-3.5">
                              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                                Saved: {new Date(item.savedAt).toLocaleDateString()}
                              </span>
                              <div className="flex items-center space-x-2 shrink-0">
                                <button
                                  onClick={() => setSelectedLead(item)}
                                  className="px-3 py-1.5 bg-slate-50 border hover:bg-slate-100 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800 dark:text-slate-305 text-xs font-semibold rounded-lg flex items-center space-x-1 cursor-pointer transition-colors border-slate-200"
                                >
                                  <span>Generate Pitch</span>
                                </button>
                                <button
                                  onClick={() => handleRemoveLead(item.id)}
                                  className="p-1.5 border border-transparent text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 dark:hover:bg-rose-950/50 rounded-lg cursor-pointer transition-all"
                                  title="Delete Lead"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'connections' && (
              <motion.div
                key="connections-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
              >
                <ConnectionsPanel 
                  googleMapsStatus={{
                    hasKey: googleMapsConfigured,
                    keyPlaceholder: MAPS_KEY
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Immersive Business Inspectors Drawer / Modal */}
      {selectedLead && (
        <BusinessModal 
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onSave={handleSaveLead}
          isSaved={savedLeadsNameCityMap.has(`${selectedLead.name.toLowerCase()}_${selectedLead.city.toLowerCase()}`)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      {/* Global Command Palette search overlay */}
      <SearchOverlay
        isOpen={isSearchOverlayOpen}
        onClose={() => setIsSearchOverlayOpen(false)}
        savedLeads={savedLeads}
        onSelectLead={(lead) => {
          setSelectedLead(lead);
        }}
      />
    </div>
  );
}
