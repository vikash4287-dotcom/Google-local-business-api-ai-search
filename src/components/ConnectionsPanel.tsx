import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Map, 
  Key, 
  Check, 
  Copy, 
  Code, 
  Info, 
  RefreshCw,
  HardDrive,
  Cpu,
  Terminal,
  Compass,
  LogOut,
  Sparkles,
  Lock,
  Wifi,
  CloudLightning
} from 'lucide-react';
import { auth, loginWithGoogle, logoutUser } from '../services/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { databaseService } from '../services/db';

interface ConnectionsPanelProps {
  googleMapsStatus: {
    hasKey: boolean;
    keyPlaceholder: string;
  };
}

export default function ConnectionsPanel({
  googleMapsStatus
}: ConnectionsPanelProps) {
  const [copied, setCopied] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleCopySQL = () => {
    navigator.clipboard.writeText(databaseService.getSQLSchema());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSignIn = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error("Google Sign In Error:", err);
      setAuthError(err.message || "Failed to authenticate via Google.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await logoutUser();
    } catch (err: any) {
      console.error("Sign Out Error:", err);
      setAuthError(err.message || "Failed to sign out.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans">
      {/* Overview Intro Banner */}
      <div className="p-6 bg-linear-to-r from-indigo-900/10 to-indigo-600/5 border border-indigo-150 rounded-2xl dark:border-indigo-950/40">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-indigo-500 animate-pulse" />
          <span>SaaS Service Hub & Firebase Credentials</span>
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
          LocalShop AI operates on an offline-first, cloud-capable SaaS pipeline. Discover business leads instantly using our local smart simulator, or synchronize directly with Google Places and your Firebase Firestore cloud database by signing in below.
        </p>
      </div>

      {/* Auth Error Toast if any */}
      {authError && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl dark:bg-rose-950/20 dark:border-rose-900 text-xs">
          {authError}
        </div>
      )}

      {/* Dual Column credentials tracking status */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        
        {/* Firebase Live Cloud Status Panel */}
        <div className="p-5 border border-slate-200 rounded-2xl bg-white dark:border-slate-850 dark:bg-slate-950 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className={`p-2 rounded-lg border flex items-center justify-center ${
                  currentUser
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900/60 dark:text-emerald-400'
                    : 'bg-amber-50 border-amber-100 text-amber-600 dark:bg-amber-950/20 dark:border-amber-900/60 dark:text-amber-400'
                }`}>
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Firebase Firestore</h4>
                  <p className="text-[11px] text-slate-400">Enterprise Edition Cloud DB</p>
                </div>
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                currentUser
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
              }`}>
                {currentUser ? 'Cloud Sync Active' : 'Sandbox Mode'}
              </span>
            </div>

            <div className="mt-5 space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-2 border-b dark:border-slate-900">
                <span className="text-slate-400">Auth Identity Status</span>
                <span className="font-semibold text-slate-700 dark:text-slate-350">
                  {currentUser ? '✓ Google Profile Active' : '⚠ Guest Mode (Running Locally)'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b dark:border-slate-900">
                <span className="text-slate-400">Storage Sync Class</span>
                <span className="font-semibold text-slate-700 dark:text-slate-350 flex items-center gap-1">
                  {currentUser ? (
                    <>
                      <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Full Real-Time Cloud</span>
                    </>
                  ) : (
                    <>
                      <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                      <span>Local Sandbox Cache</span>
                    </>
                  )}
                </span>
              </div>
              
              {currentUser && (
                <div className="space-y-2 pt-2">
                  <div>
                    <span className="text-slate-400 block pb-0.5">Active Cloud User</span>
                    <span className="font-mono bg-slate-50 text-[10px] p-2 rounded-lg block border truncate text-slate-605 dark:bg-slate-900 dark:border-slate-850 dark:text-slate-400">
                      {currentUser.email}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block pb-0.5">Account UID</span>
                    <span className="font-mono bg-slate-50 text-[10px] p-2 rounded-lg block border truncate text-slate-550 dark:bg-slate-900 dark:border-slate-850 dark:text-slate-400">
                      {currentUser.uid}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            {currentUser ? (
              <button
                onClick={handleSignOut}
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl border border-rose-200 hover:bg-rose-50/50 text-rose-600 text-xs font-bold transition-all hover:border-rose-300 dark:border-rose-955 dark:hover:bg-rose-950/20 cursor-pointer"
              >
                {loading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Disconnect Firebase Cloud Sync</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/10 hover:shadow-md text-white text-xs font-bold transition-all cursor-pointer transform active:scale-98"
              >
                {loading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                    <span>Connect Google Cloud Sync</span>
                  </>
                )}
              </button>
            )}
            <p className="text-[10px] text-slate-400 leading-relaxed text-center mt-1">
              Connecting Google accounts authorizes real-time data streaming backends for all saved business contacts.
            </p>
          </div>
        </div>

        {/* Google Places Key Status */}
        <div className="p-5 border border-slate-200 rounded-2xl bg-white dark:border-slate-850 dark:bg-slate-950 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className={`p-2 rounded-lg border flex items-center justify-center ${
                  googleMapsStatus.hasKey
                    ? 'bg-indigo-50 border-indigo-100 text-indigo-600 dark:bg-indigo-950/20 dark:border-indigo-900/60 dark:text-indigo-400'
                    : 'bg-slate-50 border-slate-200 text-slate-400 dark:bg-slate-900 dark:border-slate-800'
                }`}>
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Google Places API Setup</h4>
                  <p className="text-[11px] text-slate-400">Location-Based Business Discoverer</p>
                </div>
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                googleMapsStatus.hasKey
                  ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                  : 'bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400'
              }`}>
                {googleMapsStatus.hasKey ? 'API Key Active' : 'Simulated (Mock)'}
              </span>
            </div>

            <div className="mt-5 space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-2 border-b dark:border-slate-900">
                <span className="text-slate-400">Places Active Driver</span>
                <span className="font-semibold text-slate-700 dark:text-slate-350">
                  {googleMapsStatus.hasKey ? '✓ Official Places JS' : 'LocalShop Smart Simulator'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b dark:border-slate-900">
                <span className="text-slate-400 font-medium">Search Accuracy</span>
                <span className="font-semibold text-slate-700 dark:text-slate-350">
                  {googleMapsStatus.hasKey ? 'Direct Live Google Core' : 'Synthesized Target Leads'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b dark:border-slate-900">
                <span className="text-slate-400">CORS Handshake Safety</span>
                <span className="font-semibold text-slate-700 dark:text-slate-350">✓ Enabled</span>
              </div>
            </div>
          </div>

          <div className="mt-5 text-left bg-slate-50/50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-850">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              To trigger direct Google Places queries, add an API Key:
              <br />
              1. Open **Settings** (⚙️ top-right gear icon) → **Secrets** 
              <br />
              2. Save as `GOOGLE_MAPS_PLATFORM_KEY`
              <br />
              The app auto-rebuilds and activates live, real Map/Places queries.
            </p>
          </div>
        </div>
      </div>

      {/* Firebase Rules Security Code Block */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Code className="w-5 h-5 text-indigo-500" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Active Firestore DB Schema Rules</h4>
          </div>
          <button
            onClick={handleCopySQL}
            className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg cursor-pointer transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Blueprint Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Blueprint</span>
              </>
            )}
          </button>
        </div>
        
        <div className="relative border border-slate-200 rounded-xl dark:border-slate-850 overflow-hidden">
          <div className="bg-slate-900 text-slate-450 text-[11px] font-semibold px-4 py-2 border-b dark:border-slate-850 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              <span>firestore-security-blueprint.rules</span>
            </span>
            <span className="text-indigo-455 font-mono">Firestore rules v2</span>
          </div>
          <pre className="p-4.5 bg-slate-950 text-slate-300 font-mono text-[11.5px] leading-relaxed max-h-[160px] overflow-y-auto overflow-x-auto whitespace-pre select-all text-left">
            {databaseService.getSQLSchema()}
          </pre>
        </div>
      </div>

      {/* Security notice block */}
      <div className="flex items-start space-x-3 bg-indigo-50/20 border border-indigo-100 p-4.5 rounded-xl dark:bg-indigo-950/10 dark:border-indigo-900/30 text-xs">
        <Info className="w-4.5 h-4.5 text-indigo-500 shrink-0 mt-0.5" />
        <div className="space-y-1 text-slate-600 dark:text-slate-400">
          <p className="font-bold">Zero-Trust Security & Sync Protocol</p>
          <p className="leading-relaxed">
            All user record syncs run purely behind a Zero-Trust client verification script. No user can read or overwrite lists belonging to another authenticated account. All keys remain safe on browser memory storage.
          </p>
        </div>
      </div>
    </div>
  );
}
