import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Mail, 
  Linkedin, 
  Copy, 
  Check, 
  RefreshCw, 
  MessageSquare, 
  Globe, 
  Star, 
  AlertTriangle, 
  Sliders, 
  PlusCircle, 
  ChevronRight, 
  FileText,
  HelpCircle,
  Clock
} from 'lucide-react';
import { Business } from '../types';

interface AIPitchModalProps {
  lead: Business;
  onClose: () => void;
}

export default function AIPitchModal({ lead, onClose }: AIPitchModalProps) {
  const [channel, setChannel] = useState<'email' | 'linkedin'>('email');
  const [tone, setTone] = useState<'professional' | 'persuasive' | 'helpful' | 'casual' | 'bold'>('persuasive');
  const [customInstructions, setCustomInstructions] = useState('');
  
  // Deficit toggles
  const [includeNoWebsite, setIncludeNoWebsite] = useState(!lead.website);
  const [includeLowRating, setIncludeLowRating] = useState(!!lead.rating && lead.rating < 4.2);
  const [includeLowReviews, setIncludeLowReviews] = useState(!!lead.reviewCount && lead.reviewCount < 30);
  const [includeOtherOpt, setIncludeOtherOpt] = useState(!(!lead.website) && !(lead.rating && lead.rating < 4.2) && !(lead.reviewCount && lead.reviewCount < 30));

  // Generation states
  const [pitch, setPitch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const stepsForLoading = [
    'Benchmarking regional competitor metrics...',
    'Analyzing Google Business Profile deficit signals...',
    'Mapping regional digital category gaps...',
    'Synthesizing personalized outreach strategy...',
    'Tailoring messaging style with Gemini API...'
  ];

  // Rotate loading steps for visual immersion
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setActiveStepIndex((prev) => (prev + 1) % stepsForLoading.length);
      }, 1600);
    } else {
      setActiveStepIndex(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleGeneratePitch = async () => {
    setLoading(true);
    setError('');
    
    // Compile active selected deficits
    const activeDeficits: string[] = [];
    if (includeNoWebsite) {
      activeDeficits.push('Web Presence Deficit: The business has no search-reachable official website listed on GMB.');
    }
    if (includeLowRating && lead.rating) {
      activeDeficits.push(`Low Rating Gap: Google rating is ${lead.rating} ★, risking exclusion from the local GMB Top 3-pack.`);
    }
    if (includeLowReviews && lead.reviewCount !== undefined) {
      activeDeficits.push(`Low Social Proof Gap: Only ${lead.reviewCount} total review(s) found, making them look less reputable than local competitors.`);
    }
    if (includeOtherOpt) {
      activeDeficits.push('Competitive Optimization Hook: High baseline ratings but lacking modern automation, local voice search schema, or geo-targeted landing campaigns.');
    }

    try {
      const response = await fetch('/api/generate-pitch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: lead.name,
          category: lead.category,
          city: lead.city,
          website: lead.website,
          rating: lead.rating,
          reviewCount: lead.reviewCount,
          deficits: activeDeficits,
          channel,
          tone,
          customInstructions: customInstructions.trim() || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Server responded with an error during pitch drafting.');
      }

      if (data.success && data.pitch) {
        setPitch(data.pitch);
      } else {
        throw new Error('Received empty pitch payload from server.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred. Please verify GEMINI_API_KEY is configured in host secrets.');
    } finally {
      setLoading(false);
    }
  };

  // Generate initial pitch on mount
  useEffect(() => {
    handleGeneratePitch();
  }, [channel, tone]);

  const copyToClipboard = () => {
    if (!pitch) return;
    navigator.clipboard.writeText(pitch);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Estimate read time & word count
  const wordCount = pitch ? pitch.split(/\s+/).filter(Boolean).length : 0;
  const readTimeMin = Math.max(1, Math.round(wordCount / 200));

  return (
    <div id="ai-pitch-generator-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs font-sans">
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 dark:border-slate-800 rounded-2xl dark:bg-slate-950 text-slate-850 dark:text-slate-105 overflow-hidden flex flex-col h-[90vh] md:h-[85vh] shadow-2xl animate-fade-in">
        
        {/* Colorful visual top border */}
        <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 w-full" />

        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 dark:border-slate-850">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-55/65 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg border border-indigo-100/10">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-sans tracking-tight leading-none md:text-xl flex items-center gap-2">
                AI Pitch Generator
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200/20 font-mono tracking-wider">
                  Gemini API 
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-1 dark:text-slate-500">
                Crafting personalized outreach for <span className="font-semibold text-slate-700 dark:text-slate-300">{lead.name}</span> in {lead.city}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 px-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer border border-transparent"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Two-Column Content Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 min-h-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-850">
          
          {/* Left Side: Parameters / Tune Config Box */}
          <div className="p-6 space-y-6 lg:col-span-5 overflow-y-auto max-h-full">
            
            {/* Sector 1: Deficit Audit Checklist */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider flex items-center gap-1.5">
                <Sliders className="w-4 h-4" />
                <span>Include Audit Deficits</span>
              </h4>
              <div className="space-y-2">
                {/* No website deficit */}
                <label className="flex items-start p-2.5 rounded-xl border border-slate-150 bg-slate-50/50 hover:bg-slate-50 dark:border-slate-850 dark:bg-slate-900/35 dark:hover:bg-slate-900/60 cursor-pointer transition-all select-none">
                  <input
                    type="checkbox"
                    checked={includeNoWebsite}
                    onChange={(e) => setIncludeNoWebsite(e.target.checked)}
                    className="mt-1 mr-3 h-4 w-4 text-indigo-600 border-slate-300 rounded-sm focus:ring-indigo-500"
                  />
                  <div className="text-xs">
                    <span className="font-bold block text-slate-755 dark:text-slate-200 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-slate-400" />
                      Website audit hook
                    </span>
                    <span className="text-slate-400 dark:text-slate-400 block mt-0.5">
                      {lead.website ? `Currently has website: ${lead.website}` : 'No listed website found on GMB'}
                    </span>
                  </div>
                </label>

                {/* Rating deficit */}
                <label className="flex items-start p-2.5 rounded-xl border border-slate-150 bg-slate-50/50 hover:bg-slate-50 dark:border-slate-850 dark:bg-slate-900/35 dark:hover:bg-slate-900/60 cursor-pointer transition-all select-none">
                  <input
                    type="checkbox"
                    checked={includeLowRating}
                    onChange={(e) => setIncludeLowRating(e.target.checked)}
                    className="mt-1 mr-3 h-4 w-4 text-indigo-600 border-slate-300 rounded-sm focus:ring-indigo-500"
                  />
                  <div className="text-xs">
                    <span className="font-bold block text-slate-755 dark:text-slate-200 flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-amber-500" />
                      Low rating hook
                    </span>
                    <span className="text-slate-400 dark:text-slate-400 block mt-0.5">
                      Rating is {lead.rating ? `${lead.rating} ★` : 'N/A'} (below GMB elite standards)
                    </span>
                  </div>
                </label>

                {/* Reviews deficit */}
                <label className="flex items-start p-2.5 rounded-xl border border-slate-150 bg-slate-50/50 hover:bg-slate-50 dark:border-slate-850 dark:bg-slate-900/35 dark:hover:bg-slate-900/60 cursor-pointer transition-all select-none">
                  <input
                    type="checkbox"
                    checked={includeLowReviews}
                    onChange={(e) => setIncludeLowReviews(e.target.checked)}
                    className="mt-1 mr-3 h-4 w-4 text-indigo-600 border-slate-300 rounded-sm focus:ring-indigo-500"
                  />
                  <div className="text-xs">
                    <span className="font-bold block text-slate-755 dark:text-slate-200 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
                      GBP social proof hook
                    </span>
                    <span className="text-slate-400 dark:text-slate-400 block mt-0.5">
                      Has review count of: {lead.reviewCount !== undefined ? lead.reviewCount : 'N/A'} (Needs growth)
                    </span>
                  </div>
                </label>

                {/* Additional optimization */}
                <label className="flex items-start p-2.5 rounded-xl border border-slate-150 bg-slate-50/50 hover:bg-slate-50 dark:border-slate-850 dark:bg-slate-900/35 dark:hover:bg-slate-900/60 cursor-pointer transition-all select-none">
                  <input
                    type="checkbox"
                    checked={includeOtherOpt}
                    onChange={(e) => setIncludeOtherOpt(e.target.checked)}
                    className="mt-1 mr-3 h-4 w-4 text-indigo-600 border-slate-300 rounded-sm focus:ring-indigo-500"
                  />
                  <div className="text-xs">
                    <span className="font-bold block text-slate-755 dark:text-slate-200">
                      Standard optimization pitch
                    </span>
                    <span className="text-slate-400 dark:text-slate-400 block mt-0.5">
                      Offer advanced GMB SEO, map pins, or advertising services
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Sector 2: Channel Preference */}
            <div className="space-y-3">
              <label className="text-xs font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider block">
                Outreach Target Channel
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setChannel('email')}
                  className={`py-3 px-4 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                    channel === 'email'
                      ? 'bg-indigo-55/65 border-indigo-500 text-indigo-600 dark:bg-indigo-950/45 dark:text-indigo-400'
                      : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/60 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Mail className="w-5 h-5 mb-1.5" />
                  <span className="text-xs font-bold font-sans">Cold Sales Email</span>
                </button>

                <button
                  type="button"
                  onClick={() => setChannel('linkedin')}
                  className={`py-3 px-4 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                    channel === 'linkedin'
                      ? 'bg-indigo-55/65 border-indigo-500 text-indigo-600 dark:bg-indigo-950/45 dark:text-indigo-400'
                      : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/60 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Linkedin className="w-5 h-5 mb-1.5" />
                  <span className="text-xs font-bold font-sans">LinkedIn Connect</span>
                </button>
              </div>
            </div>

            {/* Sector 3: Tone Preset Choices */}
            <div className="space-y-3">
              <label className="text-xs font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider block">
                Tone of Tone Voice
              </label>
              <div className="flex flex-wrap gap-2">
                {(['persuasive', 'professional', 'helpful', 'casual', 'bold'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer border ${
                      tone === t
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Sector 4: Custom Constraints / Value Propositions */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider block">
                Add Custom CRM Value / instructions (Optional)
              </label>
              <textarea
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="e.g. Mention that I build speed-optimized sites under $600. Keep it short. Draft in Spanish..."
                rows={3}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 dark:bg-slate-900 dark:border-slate-800 text-xs rounded-xl transition-all focus:outline-hidden"
              />
            </div>

            {/* CTA action to manual regenerate */}
            <button
              onClick={handleGeneratePitch}
              disabled={loading}
              className="w-full py-3 bg-indigo-650 hover:bg-indigo-700 disabled:opacity-80 active:scale-98 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Generating draft...' : 'Force Draft Pitch Draft'}</span>
            </button>

          </div>

          {/* Right Side: Render Result Workspace */}
          <div className="p-6 lg:col-span-7 flex flex-col h-full bg-slate-50/50 dark:bg-slate-950/20 max-h-full">
            
            {/* Action Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-850">
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
                <MessageSquare className="w-4 h-4 text-slate-400" />
                <span>Generated CRM Template Output</span>
              </div>
              
              {/* Copy & stats */}
              {pitch && !loading && !error && (
                <div className="flex items-center space-x-3">
                  <div className="hidden sm:flex items-center space-x-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {readTimeMin}m read
                    </span>
                    <span>●</span>
                    <span>{wordCount} words</span>
                  </div>
                  
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 hover:bg-slate-50 text-indigo-650 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-850 dark:text-indigo-400 rounded-lg cursor-pointer transition-colors shadow-xs"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-500">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Pitch</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Display Body Box */}
            <div className="flex-1 overflow-y-auto mt-4 relative min-h-60 rounded-2xl border border-slate-150 bg-white dark:bg-slate-1000 dark:border-slate-850 flex flex-col shadow-xs">
              
              {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-white/95 dark:bg-slate-950/95 z-40">
                  <div className="relative flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin dark:border-slate-800 dark:border-t-indigo-400" />
                    <Sparkles className="w-5 h-5 text-indigo-505 absolute animate-pulse" />
                  </div>
                  <h5 className="text-sm font-bold text-slate-700 dark:text-slate-350 mt-4 leading-none">
                    Gemini API Drafting...
                  </h5>
                  <p className="text-[11px] font-semibold text-slate-400 mt-2 font-mono h-4 tracking-wide text-center">
                    {stepsForLoading[activeStepIndex]}
                  </p>
                  
                  {/* Digital Deficit Checklist Indicator for visual reassurance */}
                  <div className="mt-6 border-t border-dashed border-slate-150 dark:border-slate-850 pt-4 w-full max-w-sm">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center mb-2.5">
                      Target Audit Signals
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 font-mono">
                      <div className="flex items-center space-x-1.5 justify-center">
                        <Check className={`w-3.5 h-3.5 ${includeNoWebsite ? 'text-indigo-500' : 'text-slate-300'}`} />
                        <span>No-Listing Website</span>
                      </div>
                      <div className="flex items-center space-x-1.5 justify-center">
                        <Check className={`w-3.5 h-3.5 ${includeLowRating ? 'text-indigo-500' : 'text-slate-300'}`} />
                        <span>GBP Low Star</span>
                      </div>
                      <div className="flex items-center space-x-1.5 justify-center">
                        <Check className={`w-3.5 h-3.5 ${includeLowReviews ? 'text-indigo-500' : 'text-slate-300'}`} />
                        <span> GBP Reviews</span>
                      </div>
                      <div className="flex items-center space-x-1.5 justify-center">
                        <Check className={`w-3.5 h-3.5 ${includeOtherOpt ? 'text-indigo-500' : 'text-slate-300'}`} />
                        <span>Advanced SEO</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-40 bg-white dark:bg-slate-950">
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 border border-rose-100/30 rounded-full mb-3">
                    <AlertTriangle className="w-8 h-8" />
                  </div>
                  <h5 className="text-sm font-bold text-rose-700 dark:text-rose-400">Gemini Key Connection Refused</h5>
                  <p className="text-xs text-slate-400 mt-2 max-w-md leading-relaxed">
                    {error}
                  </p>
                  <button
                    onClick={handleGeneratePitch}
                    className="mt-4 px-4 py-2 bg-slate-900 font-bold text-xs text-white rounded-lg dark:bg-slate-800 hover:bg-slate-800 cursor-pointer"
                  >
                    Try Reconnecting
                  </button>
                </div>
              )}

              {pitch ? (
                <div className="p-6 text-xs text-slate-700 dark:text-slate-300 font-mono leading-relaxed whitespace-pre-wrap select-all focus:outline-hidden overflow-y-auto max-h-full">
                  {pitch}
                </div>
              ) : (
                !loading && (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400">
                    <FileText className="w-8 h-8 text-slate-300 mb-2" />
                    <span className="text-sm font-semibold">Ready to draft pitch</span>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs">
                      Tune your deficits on the left, then click generate draft.
                    </p>
                  </div>
                )
              )}
            </div>

            {/* Disclaimer advisory */}
            <div className="mt-3.5 bg-indigo-50/30 border border-indigo-100/20 p-3 rounded-xl flex items-start space-x-2.5 dark:bg-indigo-950/10 dark:border-indigo-900/30">
              <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <div className="text-[11px] text-slate-455 dark:text-slate-400 leading-relaxed font-sans font-medium">
                <span className="font-bold text-indigo-600 dark:text-indigo-400">Consultant Note:</span> Verify that your bracketed lines, like <code className="font-mono bg-slate-100 dark:bg-slate-900 px-1 py-0.5 rounded text-[10px]">[Your Name]</code>, are customized to fit your agency details before sending out the outreach!
              </div>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 dark:border-slate-850 dark:bg-slate-950/40 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 hover:bg-slate-100 border text-slate-700 dark:hover:bg-slate-900 dark:text-slate-300 text-xs font-bold rounded-lg cursor-pointer transition-colors border-slate-200 dark:border-slate-800"
          >
            Finished Drafting
          </button>
        </div>

      </div>
    </div>
  );
}
