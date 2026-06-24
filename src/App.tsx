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
  AlertCircle,
  Mail,
  Lock,
  Globe,
  TrendingUp,
  Building,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Business, SavedBusiness, SearchHistory, ActiveUser, UserSubscription, SubscriptionTier } from './types';
import Header from './components/Header';
import ResultsTable from './components/ResultsTable';
import BusinessModal from './components/BusinessModal';
import Footer from './components/Footer';
import { generateMockLeads } from './services/leadsMock';
import { USA_STATES_AND_CITIES } from './services/usaGeographics';
import { databaseService } from './services/db';
import { auth } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import SearchOverlay from './components/SearchOverlay';
import PipelineStats from './components/PipelineStats';
import SearchCategoryChart from './components/SearchCategoryChart';
import FAQSection from './components/FAQSection';
import PricingSection from './components/PricingSection';
import UpgradeModal from './components/UpgradeModal';
import AuthPage from './components/AuthPage';
import { calculateLeadScore } from './utils/score';

export default function App() {
  // Authentication Modal state
  const [activeAuthModal, setActiveAuthModal] = useState<'login' | 'signup' | null>(null);

  // Theme state (SaaS default is high-contrast light, with full dark mode support)
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('localshop_ai_theme');
    return saved === 'dark';
  });

  const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false);

  // Subscription Pricing & Quotas States
  const [subscription, setSubscription] = useState<UserSubscription>({
    tier: 'Free',
    searchesToday: 0,
    lastSearchDate: new Date().toISOString().split('T')[0]
  });
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  // Navigation state
  const [activeTab, setActiveTab] = useState<'search' | 'saved'>('search');
  const [activeFooterModal, setActiveFooterModal] = useState<'privacy' | 'terms' | 'about' | null>(null);
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
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(null);

  const processedLeads = useMemo(() => {
    if (!activeQuickFilter) return leads;
    return leads.filter(lead => {
      if (activeQuickFilter === 'No Website') {
        return !lead.website;
      }
      if (activeQuickFilter === 'Low Reviews') {
        return (lead.reviewCount || 0) < 15;
      }
      if (activeQuickFilter === 'Poor Rating') {
        return (lead.rating || 0) > 0 && (lead.rating || 0) < 3.8;
      }
      if (activeQuickFilter === 'High Opportunity') {
        const scoreObj = calculateLeadScore(lead.rating, lead.reviewCount, !!lead.website);
        return scoreObj.score >= 70;
      }
      if (activeQuickFilter === 'Recently Found') {
        return true;
      }
      if (activeQuickFilter === 'High Priority') {
        const scoreObj = calculateLeadScore(lead.rating, lead.reviewCount, !!lead.website);
        return scoreObj.score >= 75;
      }
      return true;
    });
  }, [leads, activeQuickFilter]);

  const [isLoading, setIsLoading] = useState(false);
  const [lastCitySearched, setLastCitySearched] = useState('Seattle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      const sub = await databaseService.getSubscription();
      
      if (active) {
        setUser(activeUser);
        setSavedLeads(saved);
        setSearchHistory(history);
        setSubscription(sub);
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
    localStorage.setItem('localshop_ai_theme', isDark ? 'dark' : 'light');
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

    // Limit check if not initial seed load
    let currentSub = subscription;
    if (!isInitialSeed) {
      try {
        currentSub = await databaseService.getSubscription();
        setSubscription(currentSub);
        if (currentSub.tier !== 'Agency') {
          const quotaLimit = currentSub.tier === 'Free' ? 5 : 20;
          if (currentSub.searchesToday >= quotaLimit) {
            setIsLoading(false);
            setIsUpgradeModalOpen(true);
            return;
          }
        }
      } catch (err) {
        console.warn("Failed checking subscription limits inside search execution:", err);
      }
    }

    const activeFilters = {
      minRating: Number(minRating),
      maxRating: Number(maxRating),
      minReviews: Number(minReviews),
      maxReviews: Number(maxReviews),
      hasWebsite
    };

    // Helper to slice leads array to respect current subscription plan constraints
    const sliceLeads = (leadsArray: Business[], tier: SubscriptionTier) => {
      if (tier === 'Free') return leadsArray.slice(0, 10);
      if (tier === 'Starter') return leadsArray.slice(0, 20);
      return leadsArray; // Agency gets everything
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

            const sliced = sliceLeads(filtered, currentSub.tier);
            setLeads(sliced);
            setLastCitySearched(targetCity);
            setIsLoading(false);

            if (!isInitialSeed) {
              const updatedSub = await databaseService.incrementSearchCount();
              setSubscription(updatedSub);

              const hEntry = await databaseService.addSearchHistory({
                city: targetCity,
                category,
                resultsCount: sliced.length,
                filters: activeFilters
              });
              setSearchHistory(prev => [hEntry, ...prev]);
            }
          } else {
            throw new Error(`Google Places query failed with status: ${status}`);
          }
        });
      } else {
        // Run with LocalShop Smart Generator simulator
        // Simulates realistic delays
        await new Promise(resolve => setTimeout(resolve, 800));
        const mockResults = generateMockLeads(targetCity, category, activeFilters);
        const sliced = sliceLeads(mockResults, currentSub.tier);
        setLeads(sliced);
        setLastCitySearched(targetCity);
        setIsLoading(false);

        if (!isInitialSeed) {
          const updatedSub = await databaseService.incrementSearchCount();
          setSubscription(updatedSub);

          const hEntry = await databaseService.addSearchHistory({
            city: targetCity,
            category,
            resultsCount: sliced.length,
            filters: activeFilters
          });
          setSearchHistory(prev => [hEntry, ...prev]);
        }
      }
    } catch (err: any) {
      console.error('Unified lead discovery error:', err);
      // Fallback cleanly
      const mockResults = generateMockLeads(targetCity, category, activeFilters);
      const sliced = sliceLeads(mockResults, currentSub.tier);
      setLeads(sliced);
      setLastCitySearched(targetCity);
      setIsLoading(false);
      setErrorMessage(err.message || 'Connecting to Google Places API failed, loaded LocalShop local simulator results instead.');
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
      {/* Main Core Frame - Uses full screen seamlessly */}
      <div className="flex flex-col flex-1 min-w-0">
        <Header 
          user={user}
          isDark={isDark}
          setIsDark={setIsDark}
          supabaseConfigured={firebaseConnected}
          googleMapsConfigured={googleMapsConfigured}
          setMobileOpen={setMobileOpen}
          onOpenConnections={() => setActiveFooterModal('info')}
          onOpenSearch={() => setIsSearchOverlayOpen(true)}
          onOpenAuth={(mode) => setActiveAuthModal(mode)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          savedCount={savedLeads.length}
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
                {/* Hero block - 60% reduced height, premium minimal look */}
                <div className="relative overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-850 bg-gradient-to-br from-indigo-50/30 via-white to-indigo-50/10 dark:from-indigo-950/10 dark:via-slate-950/40 dark:to-slate-950/60 px-6 py-6 md:py-8 text-center max-w-4xl mx-auto shadow-xs">
                  {/* Watermark Statue of Liberty overlay */}
                  <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.08] pointer-events-none select-none">
                    <img
                      src="https://images.unsplash.com/photo-1501594907352-04cda38ebc29?q=80&w=1200&auto=format&fit=crop"
                      alt="Statue of Liberty"
                      className="w-full h-full object-cover object-center mix-blend-luminosity select-none animate-fade-in"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="relative z-10 space-y-2.5 max-w-2xl mx-auto animate-in fade-in duration-300">
                    <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans flex items-center justify-center gap-2">
                      <span>Find Businesses That Need Your Services</span>
                      <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse hidden sm:inline-block" />
                    </h1>
                    <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto">
                      Discover local businesses with weak websites, low reviews, poor ratings and untapped growth opportunities.
                    </p>
                    
                    {/* Trust Badges Row */}
                    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 pt-1.5 text-[10px] md:text-xs font-semibold text-slate-500 dark:text-slate-450">
                      <span className="flex items-center gap-1">
                        <span className="text-emerald-500 font-bold">✓</span> AI Powered Analysis
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="text-emerald-500 font-bold">✓</span> Proposal Generator
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="text-emerald-500 font-bold">✓</span> Lead Discovery
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="text-emerald-500 font-bold">✓</span> Website Audit
                      </span>
                    </div>
                  </div>
                </div>

                {errorMessage && (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-700 dark:text-amber-400 text-xs font-semibold flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Filters/Search Hub card redesigned to a modern high-density single row */}
                <div className="p-5 bg-white border border-slate-200 rounded-2xl dark:border-slate-850 dark:bg-slate-950/70 shadow-xs space-y-4">
                  <div className="flex flex-col gap-3.5 lg:flex-row lg:items-end">
                    
                    {/* Country select */}
                    <div className="space-y-1 lg:w-24 shrink-0">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Country</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs">🇺🇸</span>
                        <select
                          disabled
                          className="w-full pl-7 pr-2 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 dark:text-slate-400 text-slate-500 rounded-xl text-xs font-bold cursor-not-allowed outline-hidden"
                        >
                          <option value="USA">USA</option>
                        </select>
                      </div>
                    </div>

                    {/* US State */}
                    <div className="space-y-1 lg:w-36 shrink-0">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">US State</label>
                      <select
                        value={selectedState}
                        onChange={(e) => handleSelectStateChange(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-205 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-850/60 dark:text-slate-100 rounded-xl text-xs font-semibold transition-all focus:border-indigo-500 outline-hidden cursor-pointer"
                      >
                        <option value="All">All States</option>
                        {USA_STATES_AND_CITIES.map((st) => (
                          <option key={st.code} value={st.code}>
                            {st.name} ({st.code})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* City / Town input with suggestions */}
                    <div className="space-y-1 flex-1 relative min-w-0">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans flex items-center justify-between">
                        <span>City or Town</span>
                        {showCitySuggestions && (
                          <span className="text-[9px] text-indigo-500 dark:text-indigo-400 font-semibold normal-case tracking-normal">
                            Matching {filteredCities.length} cities...
                          </span>
                        )}
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
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
                          placeholder={selectedState === 'All' ? "Type to search..." : "Type first letter..."}
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-205 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-850/60 dark:text-slate-100 rounded-xl text-xs font-semibold transition-all focus:border-indigo-500 outline-hidden"
                        />
                        {showCitySuggestions && filteredCities.length > 0 && (
                          <div 
                            ref={suggestionsRef}
                            className="absolute left-0 right-0 top-full mt-1.5 z-50 max-h-56 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl divide-y divide-slate-150 dark:divide-slate-850/60"
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
                                  className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between transition-colors ${
                                    isHighlighted 
                                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300' 
                                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850/40'
                                  }`}
                                >
                                  <div className="flex items-center space-x-1.5">
                                    <MapPin className={`w-3 h-3 ${isHighlighted ? 'text-indigo-500 animate-pulse' : 'text-slate-400'}`} />
                                    <span>
                                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">{matchingPart}</span>
                                      <span className="opacity-90">{remainingPart}</span>
                                    </span>
                                  </div>
                                  <span className="text-[8px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded uppercase font-mono">
                                    Select
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Business Category */}
                    <div className="space-y-1 lg:w-48 shrink-0">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Business Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-205 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-850/60 dark:text-slate-100 rounded-xl text-xs font-semibold transition-all focus:border-indigo-500 outline-hidden cursor-pointer"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    {/* Buttons Combo */}
                    <div className="flex items-center gap-2 shrink-0 pt-1 lg:pt-0">
                      <button
                        onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                        className={`p-2 border rounded-xl flex items-center justify-center transition-all cursor-pointer h-8 ${
                          isFiltersOpen 
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950 dark:border-indigo-900 dark:text-indigo-400' 
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900'
                        }`}
                        title="Advanced filters"
                      >
                        <SlidersHorizontal className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleSearch(false)}
                        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer h-8 shadow-sm shadow-indigo-600/10 shrink-0"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span>Discover Leads</span>
                      </button>
                    </div>

                  </div>

                  {/* Daily Search Quota Progress indicator */}
                  {subscription.tier !== 'Agency' && (
                    <div className="pt-2 border-t border-dashed border-slate-150 dark:border-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-[11px]">
                      <div className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                        <span className="font-bold uppercase text-[9px] tracking-wider text-slate-400">Active Quota:</span>
                        <span className="text-slate-700 dark:text-slate-300">
                          {subscription.searchesToday} of {subscription.tier === 'Free' ? 5 : 20} searches used today (Plan: {subscription.tier})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const el = document.getElementById('pricing-section');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline text-left cursor-pointer inline-flex items-center space-x-1 text-[11px]"
                      >
                        <span>🚀 Upgrade your plan</span>
                      </button>
                    </div>
                  )}

                  {/* Expanded Filters panel */}
                  {isFiltersOpen && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden border-t border-slate-100 dark:border-slate-850 pt-3"
                    >
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 text-[11px] font-semibold">
                        {/* Min Rating */}
                        <div className="space-y-1">
                          <label className="text-slate-400 uppercase tracking-widest block">Min Rating</label>
                          <input
                            type="number"
                            min="1"
                            max="5"
                            step="0.1"
                            value={minRating}
                            onChange={(e) => setMinRating(Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg dark:bg-slate-900 dark:border-slate-850 dark:text-slate-100 outline-hidden"
                          />
                        </div>

                        {/* Max Rating */}
                        <div className="space-y-1">
                          <label className="text-slate-400 uppercase tracking-widest block">Max Rating</label>
                          <input
                            type="number"
                            min="1"
                            max="5"
                            step="0.1"
                            value={maxRating}
                            onChange={(e) => setMaxRating(Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg dark:bg-slate-900 dark:border-slate-850 dark:text-slate-100 outline-hidden"
                          />
                        </div>

                        {/* Min Reviews */}
                        <div className="space-y-1">
                          <label className="text-slate-400 uppercase tracking-widest block">Min Reviews</label>
                          <input
                            type="number"
                            min="0"
                            value={minReviews}
                            onChange={(e) => setMinReviews(Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg dark:bg-slate-900 dark:border-slate-850 dark:text-slate-100 outline-hidden"
                          />
                        </div>

                        {/* Max Reviews */}
                        <div className="space-y-1">
                          <label className="text-slate-400 uppercase tracking-widest block">Max Reviews</label>
                          <input
                            type="number"
                            min="0"
                            value={maxReviews}
                            onChange={(e) => setMaxReviews(Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg dark:bg-slate-900 dark:border-slate-850 dark:text-slate-100 outline-hidden"
                          />
                        </div>

                        {/* Website Check */}
                        <div className="space-y-1">
                          <label className="text-slate-450 uppercase tracking-widest block">Website Presence</label>
                          <select
                            value={hasWebsite}
                            onChange={(e) => setHasWebsite(e.target.value as any)}
                            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-205 rounded-lg dark:bg-slate-900 dark:border-slate-850 dark:text-slate-100 outline-hidden cursor-pointer"
                          >
                            <option value="any">Any Presence</option>
                            <option value="yes">Has Website</option>
                            <option value="no">No Website Deficit</option>
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Quick Filter Chips Section */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider select-none shrink-0 mr-1 flex items-center gap-1">
                    <SlidersHorizontal className="w-3 h-3 text-slate-400" />
                    <span>Quick Filters:</span>
                  </span>
                  {[
                    'No Website',
                    'Low Reviews',
                    'Poor Rating',
                    'High Opportunity',
                    'Recently Found',
                    'High Priority'
                  ].map((chip) => {
                    const isActive = activeQuickFilter === chip;
                    return (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setActiveQuickFilter(isActive ? null : chip)}
                        className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
                          isActive
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                            : 'bg-slate-50/70 border-slate-200 text-slate-600 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-850'
                        }`}
                      >
                        {chip}
                      </button>
                    );
                  })}
                  {activeQuickFilter && (
                    <button
                      type="button"
                      onClick={() => setActiveQuickFilter(null)}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer ml-1"
                    >
                      Reset filter
                    </button>
                  )}
                </div>

                {/* KPI Metrics Dashboard Cards directly above results */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Businesses Found */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut", delay: 0 }}
                    whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.2 } }}
                    className="p-4 bg-white border border-slate-100 rounded-xl dark:bg-slate-950 dark:border-slate-850 shadow-xs flex flex-col justify-between relative overflow-hidden group cursor-pointer transition-colors hover:border-indigo-100 dark:hover:border-slate-800"
                  >
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 p-6 bg-slate-50 dark:bg-slate-900 rounded-full blur-xs pointer-events-none" />
                    <div className="flex items-center justify-between relative z-10">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Businesses Found</span>
                      <div className="p-1.5 bg-slate-50 rounded-lg dark:bg-slate-900 text-slate-500">
                        <Building className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="mt-3 relative z-10">
                      <div className="text-xl font-black text-slate-900 dark:text-white leading-none">
                        {leads.length}
                      </div>
                      <div className="text-[9px] text-slate-400 dark:text-slate-500 font-bold mt-1.5 flex items-center gap-0.5">
                        <span className="text-indigo-500 font-bold">●</span> Active corpus
                      </div>
                    </div>
                  </motion.div>

                  {/* High Opportunity Leads */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut", delay: 0.05 }}
                    whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.2 } }}
                    className="p-4 bg-white border border-slate-100 rounded-xl dark:bg-slate-950 dark:border-slate-850 shadow-xs flex flex-col justify-between relative overflow-hidden group cursor-pointer transition-colors hover:border-rose-100 dark:hover:border-slate-800"
                  >
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 p-6 bg-rose-50/10 dark:bg-rose-950/10 rounded-full blur-xs pointer-events-none" />
                    <div className="flex items-center justify-between relative z-10">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">High Opportunity</span>
                      <div className="p-1.5 bg-rose-50 rounded-lg dark:bg-rose-950/40 text-rose-500">
                        <TrendingUp className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="mt-3 relative z-10">
                      <div className="text-xl font-black text-rose-600 dark:text-rose-400 leading-none">
                        {leads.filter(lead => calculateLeadScore(lead.rating, lead.reviewCount, !!lead.website).score >= 70).length}
                      </div>
                      <div className="text-[9px] text-rose-500 dark:text-rose-455 font-bold mt-1.5 flex items-center gap-0.5">
                        <span className="text-rose-500 font-bold">●</span> Critical deficit scope
                      </div>
                    </div>
                  </motion.div>

                  {/* No Website Leads */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
                    whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.2 } }}
                    className="p-4 bg-white border border-slate-100 rounded-xl dark:bg-slate-950 dark:border-slate-850 shadow-xs flex flex-col justify-between relative overflow-hidden group cursor-pointer transition-colors hover:border-amber-100 dark:hover:border-slate-800"
                  >
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 p-6 bg-amber-50/10 dark:bg-amber-950/10 rounded-full blur-xs pointer-events-none" />
                    <div className="flex items-center justify-between relative z-10">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">No Website Deficits</span>
                      <div className="p-1.5 bg-amber-50 rounded-lg dark:bg-amber-950/40 text-amber-500">
                        <Globe className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="mt-3 relative z-10">
                      <div className="text-xl font-black text-amber-600 dark:text-amber-400 leading-none">
                        {leads.filter(lead => !lead.website).length}
                      </div>
                      <div className="text-[9px] text-amber-500 dark:text-amber-450 font-bold mt-1.5 flex items-center gap-0.5">
                        <span className="text-amber-500 font-bold">●</span> Rebuild pipelines
                      </div>
                    </div>
                  </motion.div>

                  {/* Low Review Leads */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut", delay: 0.15 }}
                    whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.2 } }}
                    className="p-4 bg-white border border-slate-100 rounded-xl dark:bg-slate-950 dark:border-slate-850 shadow-xs flex flex-col justify-between relative overflow-hidden group cursor-pointer transition-colors hover:border-indigo-100 dark:hover:border-slate-800"
                  >
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 p-6 bg-indigo-50/10 dark:bg-indigo-950/10 rounded-full blur-xs pointer-events-none" />
                    <div className="flex items-center justify-between relative z-10">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Low Social Proof</span>
                      <div className="p-1.5 bg-indigo-50 rounded-lg dark:bg-indigo-950/40 text-indigo-500">
                        <Star className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="mt-3 relative z-10">
                      <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 leading-none">
                        {leads.filter(lead => (lead.reviewCount || 0) < 15).length}
                      </div>
                      <div className="text-[9px] text-indigo-500 dark:text-indigo-400 font-bold mt-1.5 flex items-center gap-0.5">
                        <span className="text-indigo-500 font-bold">●</span> Social proof target
                      </div>
                    </div>
                  </motion.div>
                </div>

                <ResultsTable 
                  leads={processedLeads}
                  savedLeads={savedLeads}
                  onSaveLead={handleSaveLead}
                  onRemoveLead={handleRemoveLead}
                  onSelectLead={setSelectedLead}
                  isLoading={isLoading}
                  citySearched={lastCitySearched}
                />

                {/* Bottom analytics & logs grid */}
                {searchHistory.length > 0 && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left: Recent Searches History logs */}
                    <div className="lg:col-span-6 bg-white border rounded-2xl p-6 dark:bg-slate-950 dark:border-slate-850">
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

                    {/* Right: Data Visualization Category Distribution Donut Chart */}
                    <div className="lg:col-span-6 bg-white border rounded-2xl p-6 dark:bg-slate-950 dark:border-slate-850 flex flex-col">
                      <SearchCategoryChart searchHistory={searchHistory} />
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
                {!firebaseConnected ? (
                  <div className="max-w-md mx-auto my-12 text-center p-8 bg-white border border-slate-200 rounded-3xl dark:border-slate-850 dark:bg-slate-950/70 shadow-lg space-y-6 animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden">
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-600" />
                    <div className="mx-auto flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                      <Lock className="w-6.5 h-6.5 animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-xl font-black text-slate-900 dark:text-white">Authentication Required</h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                        Please Sign Up or Log In to access your Saved Leads CRM. Keep your prospects organized, synchronized online, and secured.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <button
                        onClick={() => setActiveAuthModal('login')}
                        className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm active:scale-97"
                      >
                        Sign In
                      </button>
                      <button
                        onClick={() => setActiveAuthModal('signup')}
                        className="flex-1 py-2.5 border border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-305 rounded-xl text-xs font-black transition-all cursor-pointer active:scale-97"
                      >
                        Create Account
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1 py-1">
                      <h1 className="text-2xl font-black font-sans tracking-tight text-indigo-700 dark:text-indigo-400">
                        Your Saved Business Leads CRM ({savedLeads.length})
                      </h1>
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
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
                  </>
                )}
              </motion.div>
            )}

          </AnimatePresence>
          <PricingSection subscription={subscription} onSubscriptionUpdate={setSubscription} />
          <FAQSection />
          <Footer 
            activeModal={activeFooterModal}
            setActiveModal={setActiveFooterModal}
            googleMapsStatus={{
              hasKey: googleMapsConfigured,
              keyPlaceholder: MAPS_KEY
            }}
            firebaseConnected={firebaseConnected}
          />
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
          firebaseConnected={firebaseConnected}
          onOpenAuth={(mode) => setActiveAuthModal(mode)}
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

      {/* Freemium Upgrade Quota Dialog */}
      <UpgradeModal 
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        subscription={subscription}
        onSubscriptionUpdate={setSubscription}
      />

      {/* Global Authentication Dialog (Login, Sign Up, Forgot Password) */}
      {activeAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="absolute inset-0" onClick={() => setActiveAuthModal(null)} />
          <div className="relative w-full max-w-md animate-in fade-in zoom-in-95 duration-200 my-auto">
            <AuthPage 
              initialMode={activeAuthModal}
              onSuccess={() => setActiveAuthModal(null)}
              onCancel={() => setActiveAuthModal(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
