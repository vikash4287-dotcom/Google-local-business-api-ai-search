import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Check, Trash2, ExternalLink, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function RazorpayKeysForm() {
  const [keyId, setKeyId] = useState('');
  const [keySecret, setKeySecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [statusText, setStatusText] = useState('Standard Sandbox Simulation');
  const [statusColor, setStatusColor] = useState('bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400');

  useEffect(() => {
    const savedKeyId = localStorage.getItem('custom_razorpay_key_id') || '';
    const savedKeySecret = localStorage.getItem('custom_razorpay_key_secret') || '';
    setKeyId(savedKeyId);
    setKeySecret(savedKeySecret);
    
    if (savedKeyId && savedKeySecret) {
      setIsSaved(true);
      updateStatus(savedKeyId);
    }
  }, []);

  const updateStatus = (id: string) => {
    if (id.startsWith('rzp_live_')) {
      setStatusText('Live Production Mode Active');
      setStatusColor('bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400');
    } else if (id.startsWith('rzp_test_')) {
      setStatusText('Custom Test Sandbox Mode Active');
      setStatusColor('bg-indigo-500/10 border-indigo-500/20 text-indigo-700 dark:text-indigo-400');
    } else {
      setStatusText('Custom Key Active');
      setStatusColor('bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedId = keyId.trim();
    const trimmedSecret = keySecret.trim();

    if (!trimmedId || !trimmedSecret) {
      toast.error('Both Key ID and Key Secret are required.');
      return;
    }

    if (!trimmedId.startsWith('rzp_test_') && !trimmedId.startsWith('rzp_live_')) {
      toast.error('Key ID must start with "rzp_test_" or "rzp_live_". Please verify your Razorpay API Credentials.');
      return;
    }

    localStorage.setItem('custom_razorpay_key_id', trimmedId);
    localStorage.setItem('custom_razorpay_key_secret', trimmedSecret);
    setIsSaved(true);
    updateStatus(trimmedId);
    toast.success('Razorpay dynamic credentials configured successfully!');
  };

  const handleClear = () => {
    localStorage.removeItem('custom_razorpay_key_id');
    localStorage.removeItem('custom_razorpay_key_secret');
    setKeyId('');
    setKeySecret('');
    setIsSaved(false);
    setStatusText('Standard Sandbox Simulation');
    setStatusColor('bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400');
    toast.success('Custom keys cleared. Reverted back to system sandbox simulation mode.');
  };

  return (
    <div id="razorpay-keys-setup" className="bg-white border rounded-2xl p-6 dark:bg-slate-950 dark:border-slate-850 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-slate-900 pb-4 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/50 rounded-lg text-indigo-600 dark:text-indigo-400">
              <Key className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">🔌 Custom Razorpay Credentials Setup</h3>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">
            Integrate and test your own live or test Razorpay accounts in this application dynamically.
          </p>
        </div>
        
        {/* Status indicator badge */}
        <div className={`px-3 py-1 border text-[10px] font-bold uppercase rounded-full tracking-wider shrink-0 w-fit ${statusColor}`}>
          {statusText}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Key ID Field */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block font-sans">
              Razorpay Key ID
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Key className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                value={keyId}
                onChange={(e) => setKeyId(e.target.value)}
                placeholder="rzp_test_T8XLzCT..."
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 dark:bg-slate-900/50 dark:border-slate-800 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-800 dark:text-slate-200"
              />
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
              Starts with <code className="font-mono text-slate-500 dark:text-slate-400">rzp_test_</code> or <code className="font-mono text-slate-500 dark:text-slate-400">rzp_live_</code>
            </p>
          </div>

          {/* Key Secret Field */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block font-sans">
              Razorpay Key Secret
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
              <input
                type={showSecret ? 'text' : 'password'}
                value={keySecret}
                onChange={(e) => setKeySecret(e.target.value)}
                placeholder="••••••••••••••••••••••••"
                className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 dark:bg-slate-900/50 dark:border-slate-800 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-800 dark:text-slate-200 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
              Your secret key remains on your browser and is never stored permanently on our server.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <a
            href="https://dashboard.razorpay.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-bold flex items-center gap-1"
          >
            <span>Retrieve keys from Razorpay Dashboard</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <div className="flex items-center gap-2">
            {isSaved && (
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-rose-600 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800/80 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer select-none"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Custom Keys</span>
              </button>
            )}
            
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer select-none"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Credentials</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
