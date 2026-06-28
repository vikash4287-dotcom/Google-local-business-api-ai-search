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
  updateDoc,
  onSnapshot
} from 'firebase/firestore';
import { Business, SavedBusiness, SearchHistory, ActiveUser, WebsiteAudit, Proposal, ServicePackagesDraft, OutreachToolkit, UserSubscription, SubscriptionTier, SubscriptionHistoryEntry } from '../types';

// Keys for LocalStorage fallbacks
const STORAGE_PREFIX = 'localshop_ai_';
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
  // Website Audit Operations
  // ----------------------------------------------------
  async getWebsiteAudits(): Promise<WebsiteAudit[]> {
    const user = auth.currentUser;
    if (user) {
      const pathStr = `users/${user.uid}/website_audits`;
      try {
        const q = query(collection(db, pathStr), orderBy('auditedAt', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(docSnap => {
          const d = docSnap.data();
          return {
            id: docSnap.id,
            businessId: d.businessId || '',
            businessName: d.businessName || '',
            website: d.website || '',
            score: Number(d.score || 0),
            strengths: d.strengths || [],
            weaknesses: d.weaknesses || [],
            recommendedImprovements: d.recommendedImprovements || [],
            potentialServicesToSell: d.potentialServicesToSell || [],
            estimatedProjectValue: d.estimatedProjectValue || '',
            auditedAt: d.auditedAt
          };
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, pathStr);
      }
    }

    // Local fallback
    const localAudits = localStorage.getItem(`${STORAGE_PREFIX}website_audits`);
    if (localAudits) {
      try {
        return JSON.parse(localAudits);
      } catch {
        return [];
      }
    }
    return [];
  },

  async getWebsiteAudit(businessId: string): Promise<WebsiteAudit | null> {
    const audits = await this.getWebsiteAudits();
    return audits.find(a => a.businessId === businessId) || null;
  },

  async saveWebsiteAudit(audit: WebsiteAudit): Promise<WebsiteAudit> {
    const user = auth.currentUser;
    if (user) {
      const pathStr = `users/${user.uid}/website_audits`;
      try {
        const docRef = doc(db, pathStr, audit.id);
        await setDoc(docRef, { ...audit });
        return audit;
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `${pathStr}/${audit.id}`);
      }
    }

    // Save locally
    const audits = await this.getWebsiteAudits();
    const idx = audits.findIndex(a => a.id === audit.id || a.businessId === audit.businessId);
    let updated: WebsiteAudit[];
    if (idx !== -1) {
      audits[idx] = audit;
      updated = [...audits];
    } else {
      updated = [audit, ...audits];
    }
    localStorage.setItem(`${STORAGE_PREFIX}website_audits`, JSON.stringify(updated));
    return audit;
  },

  // ----------------------------------------------------
  // Proposal Operations
  // ----------------------------------------------------
  async getProposals(): Promise<Proposal[]> {
    const user = auth.currentUser;
    if (user) {
      const pathStr = `users/${user.uid}/proposals`;
      try {
        const q = query(collection(db, pathStr), orderBy('generatedAt', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(docSnap => {
          const d = docSnap.data();
          return {
            id: docSnap.id,
            businessId: d.businessId || '',
            businessName: d.businessName || '',
            website: d.website || '',
            executiveSummary: d.executiveSummary || '',
            businessProblems: d.businessProblems || [],
            websiteIssues: d.websiteIssues || [],
            reviewAndReputationIssues: d.reviewAndReputationIssues || [],
            recommendedServices: d.recommendedServices || [],
            expectedResults: d.expectedResults || [],
            pricingRecommendations: d.pricingRecommendations || '',
            timeline: d.timeline || '',
            nextSteps: d.nextSteps || [],
            generatedAt: d.generatedAt
          };
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, pathStr);
      }
    }

    // Local fallback
    const localProposals = localStorage.getItem(`${STORAGE_PREFIX}proposals`);
    if (localProposals) {
      try {
        return JSON.parse(localProposals);
      } catch {
        return [];
      }
    }
    return [];
  },

  async getProposal(businessId: string): Promise<Proposal | null> {
    const proposals = await this.getProposals();
    return proposals.find(p => p.businessId === businessId) || null;
  },

  async saveProposal(proposal: Proposal): Promise<Proposal> {
    const user = auth.currentUser;
    if (user) {
      const pathStr = `users/${user.uid}/proposals`;
      try {
        const docRef = doc(db, pathStr, proposal.id);
        await setDoc(docRef, { ...proposal });
        return proposal;
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `${pathStr}/${proposal.id}`);
      }
    }

    // Save locally
    const proposals = await this.getProposals();
    const idx = proposals.findIndex(p => p.id === proposal.id || p.businessId === proposal.businessId);
    let updated: Proposal[];
    if (idx !== -1) {
      proposals[idx] = proposal;
      updated = [...proposals];
    } else {
      updated = [proposal, ...proposals];
    }
    localStorage.setItem(`${STORAGE_PREFIX}proposals`, JSON.stringify(updated));
    return proposal;
  },

  // ----------------------------------------------------
  // Service Packages Operations
  // ----------------------------------------------------
  async getServicePackagesDrafts(): Promise<ServicePackagesDraft[]> {
    const user = auth.currentUser;
    if (user) {
      const pathStr = `users/${user.uid}/service_packages`;
      try {
        const q = query(collection(db, pathStr), orderBy('generatedAt', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(docSnap => {
          const d = docSnap.data();
          return {
            id: docSnap.id,
            businessId: d.businessId || '',
            businessName: d.businessName || '',
            starter: d.starter || { name: 'Starter', services: [], estimatedPricing: '', expectedOutcomes: [] },
            professional: d.professional || { name: 'Professional', services: [], estimatedPricing: '', expectedOutcomes: [] },
            premium: d.premium || { name: 'Premium', services: [], estimatedPricing: '', expectedOutcomes: [] },
            recommendedPackage: d.recommendedPackage || 'Professional',
            generatedAt: d.generatedAt
          };
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, pathStr);
      }
    }

    // Local fallback
    const localDrafts = localStorage.getItem(`${STORAGE_PREFIX}service_packages`);
    if (localDrafts) {
      try {
        return JSON.parse(localDrafts);
      } catch {
        return [];
      }
    }
    return [];
  },

  async getServicePackagesDraft(businessId: string): Promise<ServicePackagesDraft | null> {
    const drafts = await this.getServicePackagesDrafts();
    return drafts.find(d => d.businessId === businessId) || null;
  },

  async saveServicePackagesDraft(draft: ServicePackagesDraft): Promise<ServicePackagesDraft> {
    const user = auth.currentUser;
    if (user) {
      const pathStr = `users/${user.uid}/service_packages`;
      try {
        const docRef = doc(db, pathStr, draft.id);
        await setDoc(docRef, { ...draft });
        return draft;
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `${pathStr}/${draft.id}`);
      }
    }

    // Save locally
    const drafts = await this.getServicePackagesDrafts();
    const idx = drafts.findIndex(d => d.id === draft.id || d.businessId === draft.businessId);
    let updated: ServicePackagesDraft[];
    if (idx !== -1) {
      drafts[idx] = draft;
      updated = [...drafts];
    } else {
      updated = [draft, ...drafts];
    }
    localStorage.setItem(`${STORAGE_PREFIX}service_packages`, JSON.stringify(updated));
    return draft;
  },

  // ----------------------------------------------------
  // Outreach Toolkits Operations
  // ----------------------------------------------------
  async getOutreachToolkits(): Promise<OutreachToolkit[]> {
    const user = auth.currentUser;
    if (user) {
      const pathStr = `users/${user.uid}/outreach_toolkits`;
      try {
        const q = query(collection(db, pathStr), orderBy('generatedAt', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(docSnap => {
          const d = docSnap.data();
          return {
            id: docSnap.id,
            businessId: d.businessId || '',
            businessName: d.businessName || '',
            coldEmail: d.coldEmail || { subject: '', body: '' },
            linkedInMessage: d.linkedInMessage || { body: '' },
            whatsAppMessage: d.whatsAppMessage || { body: '' },
            followUpEmail: d.followUpEmail || { subject: '', body: '' },
            salesPitch: d.salesPitch || { body: '' },
            generatedAt: d.generatedAt
          };
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, pathStr);
      }
    }

    // Local fallback
    const localToolkits = localStorage.getItem(`${STORAGE_PREFIX}outreach_toolkits`);
    if (localToolkits) {
      try {
        return JSON.parse(localToolkits);
      } catch {
        return [];
      }
    }
    return [];
  },

  async getOutreachToolkit(businessId: string): Promise<OutreachToolkit | null> {
    const toolkits = await this.getOutreachToolkits();
    return toolkits.find(t => t.businessId === businessId) || null;
  },

  async saveOutreachToolkit(toolkit: OutreachToolkit): Promise<OutreachToolkit> {
    const user = auth.currentUser;
    if (user) {
      const pathStr = `users/${user.uid}/outreach_toolkits`;
      try {
        const docRef = doc(db, pathStr, toolkit.id);
        await setDoc(docRef, { ...toolkit });
        return toolkit;
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `${pathStr}/${toolkit.id}`);
      }
    }

    // Save locally
    const toolkits = await this.getOutreachToolkits();
    const idx = toolkits.findIndex(t => t.id === toolkit.id || t.businessId === toolkit.businessId);
    let updated: OutreachToolkit[];
    if (idx !== -1) {
      toolkits[idx] = toolkit;
      updated = [...toolkits];
    } else {
      updated = [toolkit, ...toolkits];
    }
    localStorage.setItem(`${STORAGE_PREFIX}outreach_toolkits`, JSON.stringify(updated));
    return toolkit;
  },

  // ----------------------------------------------------
  // Subscription & Pricing Operations
  // ----------------------------------------------------
  async getSubscription(): Promise<UserSubscription> {
    const user = auth.currentUser;
    const today = new Date().toISOString().split('T')[0];
    const defaultSub: UserSubscription = {
      tier: 'Free',
      searchesToday: 0,
      lastSearchDate: today
    };

    if (user) {
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const d = docSnap.data();
          if (d.subscription) {
            const s = d.subscription as UserSubscription;
            if (s.lastSearchDate !== today) {
              s.searchesToday = 0;
              s.lastSearchDate = today;
              await updateDoc(docRef, { subscription: s });
            }
            return s;
          }
        }
        // Save default in background or return
        await setDoc(docRef, { subscription: defaultSub }, { merge: true });
        return defaultSub;
      } catch (err) {
        console.warn("Firestore subscription fetch fail, falling back to local:", err);
      }
    }

    // Local fallback
    const localSub = localStorage.getItem(`${STORAGE_PREFIX}subscription`);
    if (localSub) {
      try {
        const s = JSON.parse(localSub) as UserSubscription;
        if (s.lastSearchDate !== today) {
          s.searchesToday = 0;
          s.lastSearchDate = today;
          localStorage.setItem(`${STORAGE_PREFIX}subscription`, JSON.stringify(s));
        }
        return s;
      } catch (e) {
        // ignore
      }
    }

    localStorage.setItem(`${STORAGE_PREFIX}subscription`, JSON.stringify(defaultSub));
    return defaultSub;
  },

  async updateSubscription(tier: SubscriptionTier): Promise<UserSubscription> {
    const user = auth.currentUser;
    const current = await this.getSubscription();
    current.tier = tier;

    const amount = tier === 'Free' ? 0 : (tier === 'Starter' ? 750 : 4100);
    const newEntry: SubscriptionHistoryEntry = {
      id: tier === 'Free' ? 'SUB-' + Math.random().toString(36).substring(2, 11).toUpperCase() : 'PAY-' + Math.random().toString(36).substring(2, 11).toUpperCase(),
      tier,
      date: new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      amount,
      currency: 'INR',
      status: 'Completed'
    };

    if (user) {
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        let history: SubscriptionHistoryEntry[] = [];
        if (docSnap.exists()) {
          const d = docSnap.data();
          if (d.subscriptionHistory) {
            history = d.subscriptionHistory as SubscriptionHistoryEntry[];
          }
        }
        history = [newEntry, ...history];
        await setDoc(docRef, { subscription: current, subscriptionHistory: history }, { merge: true });
      } catch (err) {
        console.error("Failed to update Firestore subscription:", err);
      }
    } else {
      let history: SubscriptionHistoryEntry[] = [];
      const localHistory = localStorage.getItem(`${STORAGE_PREFIX}subscription_history`);
      if (localHistory) {
        try {
          history = JSON.parse(localHistory) as SubscriptionHistoryEntry[];
        } catch (e) {}
      }
      history = [newEntry, ...history];
      localStorage.setItem(`${STORAGE_PREFIX}subscription_history`, JSON.stringify(history));
    }

    localStorage.setItem(`${STORAGE_PREFIX}subscription`, JSON.stringify(current));
    window.dispatchEvent(new Event('localshop_subscription_changed'));
    window.dispatchEvent(new Event('localshop_subscription_history_changed'));
    return current;
  },

  async getSubscriptionHistory(): Promise<SubscriptionHistoryEntry[]> {
    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const d = docSnap.data();
          if (d.subscriptionHistory) {
            return d.subscriptionHistory as SubscriptionHistoryEntry[];
          }
        }
      } catch (err) {
        console.warn("Failed to fetch subscription history from firestore:", err);
      }
    }
    const localHistory = localStorage.getItem(`${STORAGE_PREFIX}subscription_history`);
    if (localHistory) {
      try {
        return JSON.parse(localHistory) as SubscriptionHistoryEntry[];
      } catch (e) {
        // ignore
      }
    }
    return [];
  },

  subscribeToSubscriptionHistory(callback: (history: SubscriptionHistoryEntry[]) => void): () => void {
    const user = auth.currentUser;
    if (user) {
      const docRef = doc(db, 'users', user.uid);
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const d = docSnap.data();
          if (d.subscriptionHistory) {
            callback(d.subscriptionHistory as SubscriptionHistoryEntry[]);
            return;
          }
        }
        callback([]);
      }, (error) => {
        console.warn("Firestore subscription history listener failed:", error);
      });
      return unsubscribe;
    }

    const checkLocal = () => {
      const localHistory = localStorage.getItem(`${STORAGE_PREFIX}subscription_history`);
      if (localHistory) {
        try {
          callback(JSON.parse(localHistory) as SubscriptionHistoryEntry[]);
          return;
        } catch (e) {
          // ignore
        }
      }
      callback([]);
    };

    checkLocal();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `${STORAGE_PREFIX}subscription_history`) {
        checkLocal();
      }
    };

    const handleCustomChange = () => {
      checkLocal();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('localshop_subscription_history_changed', handleCustomChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localshop_subscription_history_changed', handleCustomChange);
    };
  },

  async incrementSearchCount(): Promise<UserSubscription> {
    const current = await this.getSubscription();
    current.searchesToday += 1;
    const user = auth.currentUser;

    if (user) {
      try {
        const docRef = doc(db, 'users', user.uid);
        await setDoc(docRef, { subscription: current }, { merge: true });
      } catch (err) {
        console.error("Failed to increment search count:", err);
      }
    }

    localStorage.setItem(`${STORAGE_PREFIX}subscription`, JSON.stringify(current));
    window.dispatchEvent(new Event('localshop_subscription_changed'));
    return current;
  },

  subscribeToSubscription(callback: (sub: UserSubscription) => void): () => void {
    const user = auth.currentUser;
    const today = new Date().toISOString().split('T')[0];
    const defaultSub: UserSubscription = {
      tier: 'Free',
      searchesToday: 0,
      lastSearchDate: today
    };

    if (user) {
      const docRef = doc(db, 'users', user.uid);
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const d = docSnap.data();
          if (d.subscription) {
            const s = d.subscription as UserSubscription;
            if (s.lastSearchDate !== today) {
              s.searchesToday = 0;
              s.lastSearchDate = today;
              updateDoc(docRef, { subscription: s }).catch(err => console.warn(err));
            }
            callback(s);
            return;
          }
        }
        setDoc(docRef, { subscription: defaultSub }, { merge: true })
          .then(() => callback(defaultSub))
          .catch(err => console.warn(err));
      }, (error) => {
        console.warn("Firestore subscription listener failed:", error);
      });
      return unsubscribe;
    }

    const checkLocal = () => {
      const localSub = localStorage.getItem(`${STORAGE_PREFIX}subscription`);
      if (localSub) {
        try {
          const s = JSON.parse(localSub) as UserSubscription;
          if (s.lastSearchDate !== today) {
            s.searchesToday = 0;
            s.lastSearchDate = today;
            localStorage.setItem(`${STORAGE_PREFIX}subscription`, JSON.stringify(s));
          }
          callback(s);
          return;
        } catch (e) {
          // ignore
        }
      }
      localStorage.setItem(`${STORAGE_PREFIX}subscription`, JSON.stringify(defaultSub));
      callback(defaultSub);
    };

    checkLocal();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `${STORAGE_PREFIX}subscription`) {
        checkLocal();
      }
    };

    const handleCustomChange = () => {
      checkLocal();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('localshop_subscription_changed', handleCustomChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localshop_subscription_changed', handleCustomChange);
    };
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
