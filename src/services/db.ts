import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  updateDoc 
} from 'firebase/firestore';
import { Business, SavedBusiness, SearchHistory, ActiveUser } from '../types';

// Keys for LocalStorage fallbacks
const STORAGE_PREFIX = 'leadmine_ai_';
const LOCAL_KEYS = {
  USER: `${STORAGE_PREFIX}user`,
  SAVED: `${STORAGE_PREFIX}saved_businesses`,
  HISTORY: `${STORAGE_PREFIX}search_history`
};

export const databaseService = {
  // ----------------------------------------------------
  // User Operations
  // ----------------------------------------------------
  async getCurrentUser(): Promise<ActiveUser> {
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      return {
        id: firebaseUser.uid,
        email: firebaseUser.email || 'user@example.com',
        createdAt: firebaseUser.metadata.creationTime || new Date().toISOString()
      };
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

    // Default mock user matching pre-set based on user context
    const defaultUser: ActiveUser = {
      id: 'usr_default_vikash',
      email: 'vikash4287@gmail.com', 
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
    const user = auth.currentUser;
    if (user) {
      const pathStr = `users/${user.uid}/search_history`;
      try {
        const q = query(collection(db, pathStr), orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(docSnap => {
          const d = docSnap.data();
          return {
            id: docSnap.id,
            city: d.city,
            category: d.category,
            timestamp: d.timestamp,
            resultsCount: d.resultsCount || 0,
            filters: d.filters || {}
          };
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, pathStr);
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
    const user = auth.currentUser;
    const historyId = `history_${Math.random().toString(36).substr(2, 9)}`;
    const timestampStr = new Date().toISOString();
    const newEntry: SearchHistory = {
      id: historyId,
      city: entry.city,
      category: entry.category,
      resultsCount: entry.resultsCount,
      timestamp: timestampStr,
      filters: entry.filters
    };

    if (user) {
      const pathStr = `users/${user.uid}/search_history`;
      try {
        const docRef = doc(db, pathStr, historyId);
        await setDoc(docRef, {
          id: historyId,
          city: entry.city,
          category: entry.category,
          resultsCount: entry.resultsCount,
          timestamp: timestampStr,
          filters: entry.filters
        });
        return newEntry;
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `${pathStr}/${historyId}`);
      }
    }

    // Local storage persistence
    const history = await this.getSearchHistory();
    const updated = [newEntry, ...history].slice(0, 50); // Keep last 50
    localStorage.setItem(LOCAL_KEYS.HISTORY, JSON.stringify(updated));
    return newEntry;
  },

  async clearSearchHistory(): Promise<void> {
    const user = auth.currentUser;
    if (user) {
      const pathStr = `users/${user.uid}/search_history`;
      try {
        const q = query(collection(db, pathStr));
        const querySnapshot = await getDocs(q);
        const deletePromises = querySnapshot.docs.map(docSnap => deleteDoc(docSnap.ref));
        await Promise.all(deletePromises);
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, pathStr);
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
    const user = auth.currentUser;
    const statuses = this.getLocalStatuses();
    
    if (user) {
      const pathStr = `users/${user.uid}/saved_businesses`;
      try {
        const q = query(collection(db, pathStr), orderBy('savedAt', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(docSnap => {
          const d = docSnap.data();
          const mappedId = docSnap.id;
          return {
            id: mappedId,
            name: d.name,
            category: d.category,
            address: d.address || undefined,
            phone: d.phone || undefined,
            website: d.website || undefined,
            rating: d.rating !== undefined ? Number(d.rating) : undefined,
            reviewCount: d.reviewCount !== undefined ? Number(d.reviewCount) : undefined,
            city: d.city || '',
            savedAt: d.savedAt,
            status: statuses[mappedId] || d.status || 'New'
          };
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, pathStr);
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
    const user = auth.currentUser;
    const savedAt = new Date().toISOString();
    const businessId = business.id && !business.id.startsWith('temp') 
      ? business.id 
      : `biz_${Math.random().toString(36).substr(2, 9)}`;

    const newSaved: SavedBusiness = {
      ...business,
      id: businessId,
      savedAt,
      status: 'New'
    };

    if (user) {
      const pathStr = `users/${user.uid}/saved_businesses`;
      try {
        const docRef = doc(db, pathStr, businessId);
        const payload: any = {
          id: businessId,
          name: business.name,
          category: business.category,
          city: business.city,
          savedAt,
          status: 'New'
        };
        if (business.address) payload.address = business.address;
        if (business.phone) payload.phone = business.phone;
        if (business.website) payload.website = business.website;
        if (business.rating !== undefined) payload.rating = Number(business.rating);
        if (business.reviewCount !== undefined) payload.reviewCount = Number(business.reviewCount);

        await setDoc(docRef, payload);
        return newSaved;
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `${pathStr}/${businessId}`);
      }
    }

    // Save locally
    const saved = await this.getSavedBusinesses();
    if (!saved.some(b => b.name === business.name && b.city === business.city)) {
      const updated = [newSaved, ...saved];
      localStorage.setItem(LOCAL_KEYS.SAVED, JSON.stringify(updated));
    }
    return newSaved;
  },

  async updateBusinessStatus(id: string, status: 'New' | 'Contacted' | 'Interested' | 'Do Not Contact'): Promise<SavedBusiness | null> {
    this.setLocalStatus(id, status);
    const user = auth.currentUser;

    if (user) {
      const pathStr = `users/${user.uid}/saved_businesses`;
      try {
        const docRef = doc(db, pathStr, id);
        await updateDoc(docRef, { status });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `${pathStr}/${id}`);
      }
    }

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
    const user = auth.currentUser;
    if (user) {
      const pathStr = `users/${user.uid}/saved_businesses`;
      try {
        const docRef = doc(db, pathStr, id);
        await deleteDoc(docRef);
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `${pathStr}/${id}`);
      }
    }

    // Remove locally
    const saved = await this.getSavedBusinesses();
    const updated = saved.filter(b => b.id !== id);
    localStorage.setItem(LOCAL_KEYS.SAVED, JSON.stringify(updated));
  },

  // ----------------------------------------------------
  // Schema Export for Firestore Rules / Blueprint Info
  // ----------------------------------------------------
  getSQLSchema(): string {
    return `// --- FIRESTORE BLUEPRINT SCHEMA PATTERN ---
// The Firestore collection hierarchy follows a secure sandbox pattern:
// Users authenticate securely via Firebase Auth (Google Sign-In).
// Their assets are kept safe behind ABAC rules and restricted pathways:

match /users/{userId} {
  allow get, create, update: if request.auth.uid == userId;
}

match /users/{userId}/saved_businesses/{businessId} {
  allow get, list, create, update, delete: if request.auth.uid == userId;
}

match /users/{userId}/search_history/{historyId} {
  allow get, list, create, delete: if request.auth.uid == userId;
}`;
  }
};
