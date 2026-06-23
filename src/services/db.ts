import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Business, SavedBusiness, SearchHistory, ActiveUser } from '../types';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

let supabase: SupabaseClient | null = null;
let isConnected = false;
let initError: string | null = null;

if (SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL !== 'YOUR_SUPABASE_URL' && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY') {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    isConnected = true;
  } catch (err: any) {
    console.error('Failed to initialize Supabase client:', err);
    initError = err.message || 'Unknown error';
    isConnected = false;
  }
}

// Keys for LocalStorage fallbacks
const STORAGE_PREFIX = 'leadmine_ai_';
const LOCAL_KEYS = {
  USER: `${STORAGE_PREFIX}user`,
  SAVED: `${STORAGE_PREFIX}saved_businesses`,
  HISTORY: `${STORAGE_PREFIX}search_history`
};

export const databaseService = {
  getSupabaseStatus() {
    return {
      hasCredentials: !!(SUPABASE_URL && SUPABASE_ANON_KEY),
      url: SUPABASE_URL,
      isConnected,
      error: initError
    };
  },

  // ----------------------------------------------------
  // User Operations
  // ----------------------------------------------------
  async getCurrentUser(): Promise<ActiveUser> {
    // If Supabase is available, get session
    if (supabase) {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        if (user) {
          return {
            id: user.id,
            email: user.email || 'user@example.com',
            createdAt: user.created_at
          };
        }
      } catch (err) {
        console.warn('Supabase auth query failed, using local user:', err);
      }
    }

    // Local fallback
    const localUserStr = localStorage.getItem(LOCAL_KEYS.USER);
    if (localUserStr) {
      try {
        return JSON.parse(localUserStr);
      } catch (e) {
        // ignore
      }
    }

    // Default mock user matching metadata or generic preset
    const defaultUser: ActiveUser = {
      id: 'usr_default_vikash',
      email: 'vikash4287@gmail.com', // Active pre-set based on user context
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(LOCAL_KEYS.USER, JSON.stringify(defaultUser));
    return defaultUser;
  },

  async updateLocalUserEmail(email: string): Promise<ActiveUser> {
    const user = await this.getCurrentUser();
    user.email = email;
    localStorage.setItem(LOCAL_KEYS.USER, JSON.stringify(user));
    return user;
  },

  // ----------------------------------------------------
  // Search History Operations
  // ----------------------------------------------------
  async getSearchHistory(): Promise<SearchHistory[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('search_history')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        if (data) {
          return data.map((item: any) => ({
            id: item.id,
            city: item.city,
            category: item.category,
            timestamp: item.created_at,
            resultsCount: item.results_count || 0,
            filters: item.filters || {}
          }));
        }
      } catch (err) {
        console.warn('Failed to fetch search history from Supabase, reverting to local:', err);
      }
    }

    // Local fallback
    const localHistory = localStorage.getItem(LOCAL_KEYS.HISTORY);
    if (localHistory) {
      try {
        return JSON.parse(localHistory);
      } catch (e) {
        return [];
      }
    }
    return [];
  },

  async addSearchHistory(entry: {
    city: string;
    category: string;
    resultsCount: number;
    filters: any;
  }): Promise<SearchHistory> {
    const user = await this.getCurrentUser();
    const newEntry: SearchHistory = {
      id: `history_${Math.random().toString(36).substr(2, 9)}`,
      city: entry.city,
      category: entry.category,
      resultsCount: entry.resultsCount,
      timestamp: new Date().toISOString(),
      filters: entry.filters
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('search_history')
          .insert({
            user_id: user.id,
            city: entry.city,
            category: entry.category,
            results_count: entry.resultsCount,
            filters: entry.filters
          })
          .select()
          .single();
        if (error) throw error;
        if (data) {
          return {
            id: data.id,
            city: data.city,
            category: data.category,
            timestamp: data.created_at,
            resultsCount: data.results_count,
            filters: data.filters
          };
        }
      } catch (err) {
        console.warn('Failed to insert search history in Supabase, keeping local:', err);
      }
    }

    // Local storage persistence
    const history = await this.getSearchHistory();
    const updated = [newEntry, ...history].slice(0, 50); // Keep last 50
    localStorage.setItem(LOCAL_KEYS.HISTORY, JSON.stringify(updated));
    return newEntry;
  },

  async clearSearchHistory(): Promise<void> {
    if (supabase) {
      try {
        const user = await this.getCurrentUser();
        const { error } = await supabase
          .from('search_history')
          .delete()
          .eq('user_id', user.id);
        if (error) throw error;
      } catch (err) {
        console.warn('Failed to clear search history in Supabase:', err);
      }
    }
    localStorage.removeItem(LOCAL_KEYS.HISTORY);
  },

  // ----------------------------------------------------
  // Status Local Mappings
  // ----------------------------------------------------
  getLocalStatuses(): Record<string, 'New' | 'Contacted' | 'Interested' | 'Do Not Contact'> {
    try {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}status_map`);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  },

  setLocalStatus(id: string, status: 'New' | 'Contacted' | 'Interested' | 'Do Not Contact') {
    const map = this.getLocalStatuses();
    map[id] = status;
    localStorage.setItem(`${STORAGE_PREFIX}status_map`, JSON.stringify(map));
  },

  // ----------------------------------------------------
  // Saved Businesses Operations
  // ----------------------------------------------------
  async getSavedBusinesses(): Promise<SavedBusiness[]> {
    const statuses = this.getLocalStatuses();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('saved_businesses')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        if (data) {
          return data.map((item: any) => ({
            id: item.id,
            name: item.name,
            category: item.category,
            address: item.address,
            phone: item.phone,
            website: item.website || undefined,
            rating: item.rating ? Number(item.rating) : undefined,
            reviewCount: item.review_count,
            city: item.city || '',
            savedAt: item.created_at,
            status: statuses[item.id] || item.status || 'New'
          }));
        }
      } catch (err) {
        console.warn('Failed to fetch saved businesses from Supabase, reverting to local:', err);
      }
    }

    // Local fallback
    const localBusinesses = localStorage.getItem(LOCAL_KEYS.SAVED);
    if (localBusinesses) {
      try {
        const parsed = JSON.parse(localBusinesses);
        return parsed.map((item: any) => ({
          ...item,
          status: statuses[item.id] || item.status || 'New'
        }));
      } catch (e) {
        return [];
      }
    }
    return [];
  },

  async saveBusiness(business: Business): Promise<SavedBusiness> {
    const user = await this.getCurrentUser();
    const savedAt = new Date().toISOString();
    const newSaved: SavedBusiness = {
      ...business,
      savedAt,
      status: 'New'
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('saved_businesses')
          .insert({
            user_id: user.id,
            name: business.name,
            category: business.category,
            address: business.address,
            phone: business.phone,
            website: business.website,
            rating: business.rating,
            review_count: business.reviewCount,
            city: business.city
          })
          .select()
          .single();
        if (error) throw error;
        if (data) {
          return {
            id: data.id,
            name: data.name,
            category: data.category,
            address: data.address,
            phone: data.phone,
            website: data.website || undefined,
            rating: data.rating ? Number(data.rating) : undefined,
            reviewCount: data.review_count,
            city: data.city || '',
            savedAt: data.created_at,
            status: 'New'
          };
        }
      } catch (err) {
        console.warn('Failed to save business in Supabase, keeping local:', err);
      }
    }

    // Save locally
    const saved = await this.getSavedBusinesses();
    // Avoid duplicates
    if (!saved.some(b => b.name === business.name && b.city === business.city)) {
      const updated = [newSaved, ...saved];
      localStorage.setItem(LOCAL_KEYS.SAVED, JSON.stringify(updated));
    }
    return newSaved;
  },

  async updateBusinessStatus(id: string, status: 'New' | 'Contacted' | 'Interested' | 'Do Not Contact'): Promise<SavedBusiness | null> {
    this.setLocalStatus(id, status);
    
    // Also update in local save list
    const localBusinesses = localStorage.getItem(LOCAL_KEYS.SAVED);
    if (localBusinesses) {
      try {
        const parsed: SavedBusiness[] = JSON.parse(localBusinesses);
        const idx = parsed.findIndex(b => b.id === id);
        if (idx !== -1) {
          parsed[idx].status = status;
          localStorage.setItem(LOCAL_KEYS.SAVED, JSON.stringify(parsed));
        }
      } catch (e) {
        // ignore
      }
    }
    
    // Return updated lead
    const saved = await this.getSavedBusinesses();
    return saved.find(b => b.id === id) || null;
  },

  async removeSavedBusiness(id: string): Promise<void> {
    if (supabase) {
      try {
        const { error } = await supabase
          .from('saved_businesses')
          .delete()
          .eq('id', id);
        if (error) throw error;
      } catch (err) {
        console.warn('Failed to remove saved business from Supabase, using local fallback:', err);
      }
    }

    // Remove locally
    const saved = await this.getSavedBusinesses();
    const updated = saved.filter(b => b.id !== id);
    localStorage.setItem(LOCAL_KEYS.SAVED, JSON.stringify(updated));
  },

  // ----------------------------------------------------
  // Schema Export for Supabase console
  // ----------------------------------------------------
  getSQLSchema(): string {
    return `-- --- LEADMINE AI SETUP RULES (PostgreSQL / Supabase Schema) ---
-- Run this SQL code inside your Supabase SQL Editor to provision the exact tables structure!

-- 1. Enable Row Level Security (RLS) policies or custom UUID extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Search History table
CREATE TABLE IF NOT EXISTS search_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  city VARCHAR(255) NOT NULL,
  category VARCHAR(255) NOT NULL,
  results_count INTEGER DEFAULT 0,
  filters JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Saved Businesses table
CREATE TABLE IF NOT EXISTS saved_businesses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(100),
  website TEXT,
  rating DECIMAL(2,1),
  review_count INTEGER,
  city VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_lead UNIQUE (user_id, name, city)
);

-- 4. Enable Row Level Security on the created tables
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_businesses ENABLE ROW LEVEL SECURITY;

-- 5. Open-access policies (or authenticated specific user policies) and bindings
CREATE POLICY "Allow select for all users" ON search_history FOR SELECT USING (true);
CREATE POLICY "Allow insert for all users" ON search_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow delete for all users" ON search_history FOR DELETE USING (true);

CREATE POLICY "Allow select saved" ON saved_businesses FOR SELECT USING (true);
CREATE POLICY "Allow insert saved" ON saved_businesses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow delete saved" ON saved_businesses FOR DELETE USING (true);
`;
  }
};
