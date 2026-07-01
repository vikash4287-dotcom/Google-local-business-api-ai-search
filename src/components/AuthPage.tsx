import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  Sparkles, 
  ArrowLeft, 
  RefreshCw, 
  UserPlus, 
  LogIn, 
  CheckCircle,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';
import { 
  loginWithEmail, 
  signUpWithEmail, 
  forgotPassword, 
  loginWithGoogle 
} from '../services/firebase';

interface AuthPageProps {
  onSuccess: () => void;
  onCancel?: () => void;
  initialMode?: 'login' | 'signup';
}

export default function AuthPage({ onSuccess, onCancel, initialMode = 'login' }: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to authenticate via Google.");
    } finally {
      setLoading(false);
    }
  };

  const handleLocalSandboxBypass = () => {
    setLoading(true);
    try {
      const sandboxUser = {
        id: `usr_sandbox_${Math.random().toString(36).substr(2, 9)}`,
        email: email.trim() || 'sandbox@localshopai.com',
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('localshop_ai_user', JSON.stringify(sandboxUser));
      setSuccess("Bypass successful! Entering Local Sandbox Mode...");
      setTimeout(() => {
        onSuccess();
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      setError("Failed to initialize Sandbox Mode.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please input your email address.");
      return;
    }
    
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (mode === 'forgot') {
        await forgotPassword(email.trim());
        setSuccess("A recovery password link was sent to your email address.");
      } else if (mode === 'login') {
        if (!password) {
          setError("Please enter your password.");
          setLoading(false);
          return;
        }
        await loginWithEmail(email.trim(), password);
        onSuccess();
      } else {
        // Sign Up
        if (!password || password.length < 6) {
          setError("Password should be at least 6 characters.");
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError("Passwords do not match. Please verify.");
          setLoading(false);
          return;
        }
        await signUpWithEmail(email.trim(), password);
        setSuccess("Account successfully created! Welcome to LocalShop AI.");
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || "An authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-3xl shadow-xl flex flex-col relative overflow-hidden">
      {/* Decorative premium visual backdrop */}
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 animate-pulse" />
      
      <div className="relative z-10 space-y-6">
        {/* Header section */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex items-center justify-center w-11 h-11 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
            <Sparkles className="w-5.5 h-5.5 animate-pulse" />
          </div>
          <h2 className="text-xl font-black font-sans tracking-tight text-slate-900 dark:text-white">
            {mode === 'login' && "Sign in to LocalShop AI"}
            {mode === 'signup' && "Create your account"}
            {mode === 'forgot' && "Recover your password"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {mode === 'login' && "Discover leads, perform website audits & build proposals"}
            {mode === 'signup' && "Unlock full lead-discovery pipelines & AI toolkits"}
            {mode === 'forgot' && "Enter your email to receive a recovery link"}
          </p>
        </div>

        {/* Feedback alerts */}
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl dark:bg-rose-950/20 dark:border-rose-900/40 text-xs font-semibold leading-relaxed flex flex-col gap-2 animate-in fade-in duration-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
              <span className="break-all">{error}</span>
            </div>
            {error.includes('auth/unauthorized-domain') && (
              <div className="mt-2 pt-2 border-t border-rose-200/40 dark:border-rose-900/30 text-[11px] font-medium text-rose-700 dark:text-rose-350 space-y-2">
                <p className="font-extrabold text-rose-950 dark:text-rose-200 text-xs">🛠️ Action Required (Firebase Setup):</p>
                <p>Firebase Authentication requires you to authorize this website's domain to allow sign-in/sign-up.</p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>Go to your <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="underline font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800">Firebase Console</a></li>
                  <li>Open your project and go to <strong>Build &gt; Authentication &gt; Settings &gt; Authorized domains</strong></li>
                  <li>Click <strong>Add domain</strong> and enter:</li>
                </ol>
                <div className="bg-white/60 dark:bg-slate-900/60 p-2 rounded-lg border border-rose-200/30 font-mono text-[10px] break-all select-all flex justify-between items-center text-slate-800 dark:text-slate-100">
                  <span>{window.location.hostname}</span>
                  <span className="text-[9px] uppercase font-black text-slate-400">Copy</span>
                </div>
                <p className="text-[10px] italic font-semibold text-indigo-600 dark:text-indigo-400">Once added, refresh this page and try again!</p>
              </div>
            )}
            {(error.includes('auth/operation-not-allowed') || error.includes('operation-not-allowed')) && (
              <div className="mt-2 pt-2 border-t border-rose-200/40 dark:border-rose-900/30 text-[11px] font-medium text-rose-700 dark:text-rose-350 space-y-2">
                <p className="font-extrabold text-rose-950 dark:text-rose-200 text-xs">🔒 Email/Password Sign-In Disabled:</p>
                <p>The Email/Password provider is currently not enabled in your Firebase project.</p>
                <p className="font-bold">To resolve this:</p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>Go to your Firebase Console under <strong>Authentication &gt; Sign-in method</strong></li>
                  <li>Click <strong>Add new provider</strong> and select <strong>Email/Password</strong>, then toggle it to <strong>Enabled</strong> and Save.</li>
                </ol>
                <p className="font-semibold text-indigo-600 dark:text-indigo-400">Alternative: You can use the "Continue with Google" button below which is enabled by default!</p>
              </div>
            )}

            {(error.includes('auth/popup-closed-by-user') || error.includes('popup-closed-by-user') || error.includes('cancelled-popup-request')) && (
              <div className="mt-2 pt-2 border-t border-rose-200/40 dark:border-rose-900/30 text-[11px] font-medium text-rose-700 dark:text-rose-350 space-y-2">
                <p className="font-extrabold text-rose-950 dark:text-rose-200 text-xs">🌐 Iframe Preview Restriction Detected:</p>
                <p>Google Sign-In popup was closed or blocked. Because the app is running in an <strong>iframe preview</strong>, modern browsers restrict cross-origin authentication cookies, causing popup sign-ins to fail.</p>
                <p className="font-bold">To resolve this easily:</p>
                <div className="space-y-1.5 pl-2 border-l-2 border-indigo-500/40">
                  <p><strong>Option A:</strong> Open the app in a new dedicated tab where Google Sign-In will work perfectly:</p>
                  <a 
                    href={window.location.href} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-bold text-[10px] uppercase tracking-wider transition-all shadow-xs cursor-pointer decoration-none"
                  >
                    <span>↗️ Open App in New Tab</span>
                  </a>
                </div>
                <div className="space-y-1 pt-1">
                  <p><strong>Option B:</strong> Click the button below to use <strong>Local Sandbox Mode</strong> instantly with zero setup!</p>
                </div>
              </div>
            )}
            
            {/* Direct Sandbox bypass button if any error is encountered */}
            <div className="mt-2 pt-2 border-t border-rose-200/40 dark:border-rose-900/30 space-y-1.5">
              <p className="text-[10px] text-rose-700 dark:text-rose-350 font-semibold">
                💡 Instant Bypassing: You can use our fully functional local sandbox mode with no setup or domain authorization required!
              </p>
              <button
                type="button"
                onClick={handleLocalSandboxBypass}
                className="w-full py-1.5 px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>🚀 Enter Local Sandbox Mode (Recommended)</span>
              </button>
            </div>
          </div>
        )}

        {success && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl dark:bg-emerald-950/20 dark:border-emerald-900/40 text-xs font-semibold leading-relaxed flex items-start gap-2 animate-in fade-in duration-200">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* Auth form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-201 dark:border-slate-800 rounded-xl text-sm font-semibold outline-hidden focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 transition-all text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setError(null); setSuccess(null); }}
                    className="text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-201 dark:border-slate-800 rounded-xl text-sm font-semibold outline-hidden focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 transition-all text-slate-800 dark:text-slate-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-sm cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {mode === 'signup' && (
            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
              <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-201 dark:border-slate-800 rounded-xl text-sm font-semibold outline-hidden focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 transition-all text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/10 active:scale-98 disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                {mode === 'login' && <LogIn className="w-4 h-4" />}
                {mode === 'signup' && <UserPlus className="w-4 h-4" />}
                <span>
                  {mode === 'login' && "Sign In with Credentials"}
                  {mode === 'signup' && "Register Account"}
                  {mode === 'forgot' && "Send Reset Instructions"}
                </span>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-150 dark:border-slate-850"></div>
          <span className="flex-shrink mx-3 text-[10px] text-slate-400 uppercase font-black tracking-widest">or</span>
          <div className="flex-grow border-t border-slate-150 dark:border-slate-850"></div>
        </div>

        {/* Continue with Google */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          type="button"
          className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-200 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-98 disabled:opacity-50"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Alternate mode toggle */}
        <div className="text-center pt-2">
          {mode === 'login' && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              New to LocalShop AI?{" "}
              <button
                type="button"
                onClick={() => { setMode('signup'); setError(null); setSuccess(null); }}
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Sign Up
              </button>
            </p>
          )}

          {mode === 'signup' && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Already registered?{" "}
              <button
                type="button"
                onClick={() => { setMode('login'); setError(null); setSuccess(null); }}
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Login
              </button>
            </p>
          )}

          {mode === 'forgot' && (
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); setSuccess(null); }}
              className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </button>
          )}
        </div>

        {/* Instant Sandbox Mode Link */}
        <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-900">
          <button
            type="button"
            onClick={handleLocalSandboxBypass}
            className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center justify-center gap-1 mx-auto"
          >
            <span>✨ Skip setup & enter Local Sandbox Mode</span>
          </button>
        </div>

        {/* Dev disclaimer - remind them to enable email auth if they haven't */}
        <p className="text-[10px] text-slate-405 leading-relaxed text-center mt-1 select-none">
          Note: To use Email/Password Sign Up/Login, make sure **Email/Password Provider** is enabled in your Firebase console.
        </p>

        {onCancel && (
          <button
            onClick={onCancel}
            type="button"
            className="w-full pt-1.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-semibold cursor-pointer underline"
          >
            Cancel and Return
          </button>
        )}
      </div>
    </div>
  );
}
