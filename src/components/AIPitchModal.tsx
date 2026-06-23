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
  ChevronRight, 
  FileText,
  HelpCircle,
  Clock,
  MessageCircle,
  PhoneCall
} from 'lucide-react';
import { Business, OutreachToolkit } from '../types';
import { databaseService as db } from '../services/db';

interface AIPitchModalProps {
  lead: Business;
  onClose: () => void;
}

export default function AIPitchModal({ lead, onClose }: AIPitchModalProps) {
  const [tone, setTone] = useState<'professional' | 'persuasive' | 'helpful' | 'casual' | 'bold'>('persuasive');
  const [customInstructions, setCustomInstructions] = useState('');
  
  // Deficit toggles
  const [includeNoWebsite, setIncludeNoWebsite] = useState(!lead.website);
  const [includeLowRating, setIncludeLowRating] = useState(!!lead.rating && lead.rating < 4.2);
  const [includeLowReviews, setIncludeLowReviews] = useState(!!lead.reviewCount && lead.reviewCount < 30);
  const [includeOtherOpt, setIncludeOtherOpt] = useState(!(!lead.website) && !(lead.rating && lead.rating < 4.2) && !(lead.reviewCount && lead.reviewCount < 30));

  // Current active toolkit container
  const [toolkit, setToolkit] = useState<OutreachToolkit | null>(null);
  
  // Navigation
  const [activeTab, setActiveTab] = useState<'coldEmail' | 'linkedInMessage' | 'whatsAppMessage' | 'followUpEmail' | 'salesPitch'>('coldEmail');

  // Generation states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Individual copied flags
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const stepsForLoading = [
    'Parsing Google Maps deficit markers...',
    'Synthesizing multi-touch local copy assets...',
    'Engaging persuasion optimization algorithms...',
    'Reviewing neighborhood benchmark references...',
    'Engraving copy structures with Gemini API...'
  ];

  // Rotate loading steps for progressive visual feedback
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setActiveStepIndex((prev) => (prev + 1) % stepsForLoading.length);
      }, 1500);
    } else {
      setActiveStepIndex(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleGenerateToolkit = async () => {
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
      const response = await fetch('/api/generate-outreach-toolkit', {
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
          tone,
          customInstructions: customInstructions.trim() || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Server responded with an error during multi-outreach rendering.');
      }

      if (data.success && data.toolkit) {
        const newToolkit: OutreachToolkit = {
          id: toolkit?.id || `outreach_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          businessId: lead.id,
          businessName: lead.name,
          coldEmail: data.toolkit.coldEmail,
          linkedInMessage: data.toolkit.linkedInMessage,
          whatsAppMessage: data.toolkit.whatsAppMessage,
          followUpEmail: data.toolkit.followUpEmail,
          salesPitch: data.toolkit.salesPitch,
          generatedAt: new Date().toISOString()
        };

        await db.saveOutreachToolkit(newToolkit);
        setToolkit(newToolkit);
      } else {
        throw new Error('Received incomplete outreach toolkit packet from server.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred. Please verify GEMINI_API_KEY is configured in host secrets.');
    } finally {
      setLoading(false);
    }
  };

  // Load on mount
  useEffect(() => {
    const loadSaved = async () => {
      try {
        const saved = await db.getOutreachToolkit(lead.id);
        if (saved) {
          setToolkit(saved);
        } else {
          await handleGenerateToolkit();
        }
      } catch (err) {
        console.error(err);
        await handleGenerateToolkit();
      }
    };
    loadSaved();
  }, [lead.id]);

  const copyText = (text: string, type: 'subject' | 'body' | 'all') => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (type === 'subject') {
      setCopiedSubject(true);
      setTimeout(() => setCopiedSubject(false), 2000);
    } else if (type === 'body') {
      setCopiedBody(true);
      setTimeout(() => setCopiedBody(false), 2000);
    } else {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    }
  };

  const getActiveContent = () => {
    if (!toolkit) return null;
    return toolkit[activeTab];
  };

  const copyEntireTab = () => {
    const content = getActiveContent();
    if (!content) return;
    if (activeTab === 'coldEmail' || activeTab === 'followUpEmail') {
      const fullMail = `Subject: ${(content as any).subject || ''}\n\n${content.body}`;
      copyText(fullMail, 'all');
    } else {
      copyText(content.body, 'all');
    }
  };

  const currentSnippet = getActiveContent();

  return (
    <div id="ai-pitch-generator-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs font-sans">
      <div className="relative w-full max-w-5xl bg-white border border-slate-200 dark:border-slate-800 rounded-2xl dark:bg-slate-950 text-slate-850 dark:text-slate-100 overflow-hidden flex flex-col h-[90vh] md:h-[85vh] shadow-2xl animate-fade-in animate-duration-200">
        
        {/* Top Accent Gradient strip */}
        <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-indigo-600 to-indigo-400 w-full" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-850">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-55/65 dark:bg-emerald-950/45 text-emerald-600 dark:text-emerald-400 rounded-lg border border-emerald-100/10">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight leading-none md:text-xl flex items-center gap-2">
                Outreach Toolkit
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-250/20 font-mono tracking-wider">
                  Multi-Touch CRM
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-1 dark:text-slate-500">
                Custom marketing templates and scripts constructed for <span className="font-semibold text-slate-700 dark:text-slate-350">{lead.name}</span> in {lead.city}
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

        {/* Master Column Grid config */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 min-h-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-850">
          
          {/* Left Frame: Adjust Tone and Active Deficit Hooks */}
          <div className="p-6 space-y-6 lg:col-span-4 overflow-y-auto max-h-full">
            
            {/* Deficit triggers */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-slate-400" />
                <span>Trigger Signal Audits</span>
              </h4>
              <div className="space-y-2">
                {/* Website checklist */}
                <label className="flex items-start p-2.5 rounded-xl border border-slate-150 bg-slate-50/50 hover:bg-slate-50 dark:border-slate-850 dark:bg-slate-900/35 dark:hover:bg-slate-900/60 cursor-pointer transition-all select-none">
                  <input
                    type="checkbox"
                    checked={includeNoWebsite}
                    onChange={(e) => setIncludeNoWebsite(e.target.checked)}
                    className="mt-1 mr-3 h-4 w-4 text-emerald-600 border-slate-300 rounded-sm focus:ring-emerald-500"
                  />
                  <div className="text-xs">
                    <span className="font-bold block text-slate-750 dark:text-slate-250 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-slate-400" />
                      Website Deficiency
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5 leading-snug">
                      {lead.website ? `${lead.website.substring(0, 32)}...` : 'No official GMB website listed'}
                    </span>
                  </div>
                </label>

                {/* Star Rating Hook */}
                <label className="flex items-start p-2.5 rounded-xl border border-slate-150 bg-slate-50/50 hover:bg-slate-50 dark:border-slate-850 dark:bg-slate-900/35 dark:hover:bg-slate-900/60 cursor-pointer transition-all select-none">
                  <input
                    type="checkbox"
                    checked={includeLowRating}
                    onChange={(e) => setIncludeLowRating(e.target.checked)}
                    className="mt-1 mr-3 h-4 w-4 text-emerald-600 border-slate-300 rounded-sm focus:ring-emerald-500"
                  />
                  <div className="text-xs">
                    <span className="font-bold block text-slate-755 dark:text-slate-205 flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-amber-500" />
                      Rating Optimization Hook
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5 leading-snug">
                      Rating: {lead.rating ? `${lead.rating} ★ (Needs improvement)` : 'No Google rating found'}
                    </span>
                  </div>
                </label>

                {/* Review Count Gap */}
                <label className="flex items-start p-2.5 rounded-xl border border-slate-150 bg-slate-50/50 hover:bg-slate-50 dark:border-slate-850 dark:bg-slate-900/35 dark:hover:bg-slate-900/60 cursor-pointer transition-all select-none">
                  <input
                    type="checkbox"
                    checked={includeLowReviews}
                    onChange={(e) => setIncludeLowReviews(e.target.checked)}
                    className="mt-1 mr-3 h-4 w-4 text-emerald-600 border-slate-300 rounded-sm focus:ring-emerald-500"
                  />
                  <div className="text-xs">
                    <span className="font-bold block text-slate-755 dark:text-slate-205 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
                      Social Proof deficit
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5 leading-snug">
                      Total Reviews: {lead.reviewCount !== undefined ? lead.reviewCount : 'N/A'} (below local average)
                    </span>
                  </div>
                </label>

                {/* general services pitch */}
                <label className="flex items-start p-2.5 rounded-xl border border-slate-150 bg-slate-50/50 hover:bg-slate-50 dark:border-slate-850 dark:bg-slate-900/35 dark:hover:bg-slate-900/60 cursor-pointer transition-all select-none">
                  <input
                    type="checkbox"
                    checked={includeOtherOpt}
                    onChange={(e) => setIncludeOtherOpt(e.target.checked)}
                    className="mt-1 mr-3 h-4 w-4 text-emerald-600 border-slate-300 rounded-sm focus:ring-emerald-500"
                  />
                  <div className="text-xs">
                    <span className="font-bold block text-slate-755 dark:text-slate-205">
                      Advanced Conversion Services
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5 leading-snug">
                      Pitch advanced CRO Schema metadata and local landing pages
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Tone Preference block */}
            <div className="space-y-3">
              <label className="text-xs font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider block">
                Outreach copywriting Tone
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['persuasive', 'professional', 'helpful', 'casual', 'bold'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer border ${
                      tone === t
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom CRM parameter instructions */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider block">
                Custom copy instructions (Optional)
              </label>
              <textarea
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="e.g. Keep it extremely brief. Reference standard flat pricing under $800. Address local competitor..."
                rows={3}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-250 hover:border-slate-350 dark:hover:border-slate-700 focus:border-emerald-500 dark:bg-slate-900 dark:border-slate-800 text-xs rounded-xl transition-all focus:outline-hidden"
              />
            </div>

            {/* Manual regeneration CTA button */}
            <button
              onClick={handleGenerateToolkit}
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-85 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md border-transparent"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Compiling templates...' : 'Regenerate Outreach Toolkit'}</span>
            </button>

          </div>

          {/* Right Frame: Render Outreach templates workspace with beautiful bento tab triggers */}
          <div className="lg:col-span-8 flex flex-col md:flex-row h-full min-h-0 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-850">
            
            {/* Left side checklist tabs of 5 Outreach materials */}
            <div className="w-full md:w-56 p-4 space-y-2 bg-slate-50/50 dark:bg-slate-950/45 shrink-0 overflow-y-auto">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block px-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
                Touchpoints
              </span>
              
              <div className="space-y-1 mt-3">
                {/* Cold Email tab */}
                <button
                  type="button"
                  onClick={() => { setActiveTab('coldEmail'); setCopiedSubject(false); setCopiedBody(false); setCopiedAll(false); }}
                  className={`w-full text-left p-2.5 rounded-xl flex items-center space-x-3 transition-all cursor-pointer ${
                    activeTab === 'coldEmail'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-250 dark:bg-emerald-950/45 dark:border-emerald-800 dark:text-emerald-350 font-bold'
                      : 'border border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <Mail className="w-4 h-4 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs truncate leading-none">Cold Email</p>
                    <span className="text-[9px] text-slate-400 font-semibold uppercase font-mono mt-1 block">Initial Touch</span>
                  </div>
                </button>

                {/* LinkedIn Message tab */}
                <button
                  type="button"
                  onClick={() => { setActiveTab('linkedInMessage'); setCopiedSubject(false); setCopiedBody(false); setCopiedAll(false); }}
                  className={`w-full text-left p-2.5 rounded-xl flex items-center space-x-3 transition-all cursor-pointer ${
                    activeTab === 'linkedInMessage'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-250 dark:bg-emerald-950/45 dark:border-emerald-800 dark:text-emerald-350 font-bold'
                      : 'border border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <Linkedin className="w-4 h-4 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs truncate leading-none">LinkedIn Message</p>
                    <span className="text-[9px] text-slate-400 font-semibold uppercase font-mono mt-1 block">Social outreach</span>
                  </div>
                </button>

                {/* WhatsApp Message tab */}
                <button
                  type="button"
                  onClick={() => { setActiveTab('whatsAppMessage'); setCopiedSubject(false); setCopiedBody(false); setCopiedAll(false); }}
                  className={`w-full text-left p-2.5 rounded-xl flex items-center space-x-3 transition-all cursor-pointer ${
                    activeTab === 'whatsAppMessage'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-250 dark:bg-emerald-950/45 dark:border-emerald-800 dark:text-emerald-350 font-bold'
                      : 'border border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <MessageCircle className="w-4 h-4 shrink-0 text-emerald-500" />
                  <div className="min-w-0">
                    <p className="text-xs truncate leading-none">WhatsApp Message</p>
                    <span className="text-[9px] text-slate-400 font-semibold uppercase font-mono mt-1 block">Direct Chat</span>
                  </div>
                </button>

                {/* Follow-up Email tab */}
                <button
                  type="button"
                  onClick={() => { setActiveTab('followUpEmail'); setCopiedSubject(false); setCopiedBody(false); setCopiedAll(false); }}
                  className={`w-full text-left p-2.5 rounded-xl flex items-center space-x-3 transition-all cursor-pointer ${
                    activeTab === 'followUpEmail'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-250 dark:bg-emerald-950/45 dark:border-emerald-800 dark:text-emerald-350 font-bold'
                      : 'border border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <Clock className="w-4 h-4 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs truncate leading-none">Follow-Up Email</p>
                    <span className="text-[9px] text-slate-400 font-semibold uppercase font-mono mt-1 block">Bump (Day 3)</span>
                  </div>
                </button>

                {/* Sales Pitch tab */}
                <button
                  type="button"
                  onClick={() => { setActiveTab('salesPitch'); setCopiedSubject(false); setCopiedBody(false); setCopiedAll(false); }}
                  className={`w-full text-left p-2.5 rounded-xl flex items-center space-x-3 transition-all cursor-pointer ${
                    activeTab === 'salesPitch'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-250 dark:bg-emerald-950/45 dark:border-emerald-800 dark:text-emerald-350 font-bold'
                      : 'border border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <PhoneCall className="w-4 h-4 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs truncate leading-none">Sales Pitch</p>
                    <span className="text-[9px] text-slate-400 font-semibold uppercase font-mono mt-1 block">Phone Script</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Template preview content */}
            <div className="flex-1 p-6 flex flex-col min-h-0 bg-slate-50/20 dark:bg-slate-950/5 hover:transition-all">
              
              {/* Header inside Preview context */}
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-850">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-550 dark:text-slate-400">
                  <span className="uppercase text-[10px] tracking-widest text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/20 font-mono">
                    Workspace
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                  <span>Interactive Outreach Card</span>
                </div>

                {toolkit && !loading && !error && (
                  <button
                    onClick={copyEntireTab}
                    className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-850 text-emerald-600 dark:text-emerald-400 rounded-lg cursor-pointer transition-colors shadow-xs"
                  >
                    {copiedAll ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-500">Copied Section!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Entire Piece</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Central Text Box / Loading Overlay */}
              <div className="flex-1 mt-4 relative min-h-64 bg-white dark:bg-slate-1000 border border-slate-150 rounded-2xl dark:border-slate-850 flex flex-col shadow-xs overflow-hidden">
                
                {loading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-white/95 dark:bg-slate-950/95 z-40">
                    <div className="relative flex items-center justify-center">
                      <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin dark:border-slate-800 dark:border-t-emerald-400" />
                      <Sparkles className="w-5 h-5 text-emerald-650 absolute animate-pulse" />
                    </div>
                    <h5 className="text-sm font-bold mt-4">Drafting Outreach Toolkit...</h5>
                    <p className="text-[11px] font-semibold text-slate-400 mt-2 font-mono h-4 tracking-wide text-center">
                      {stepsForLoading[activeStepIndex]}
                    </p>
                  </div>
                )}

                {error && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-40 bg-white dark:bg-slate-950">
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 border border-rose-100/30 rounded-full mb-3">
                      <AlertTriangle className="w-8 h-8" />
                    </div>
                    <h5 className="text-sm font-bold text-rose-700 dark:text-rose-400">Outreach Toolkit Offline</h5>
                    <p className="text-xs text-slate-400 mt-2 max-w-sm leading-relaxed">
                      {error}
                    </p>
                    <button
                      onClick={handleGenerateToolkit}
                      className="mt-4 px-4 py-2 bg-slate-900 font-bold text-xs text-white rounded-lg dark:bg-slate-850 hover:bg-slate-850 cursor-pointer"
                    >
                      Retry Rendering
                    </button>
                  </div>
                )}

                {toolkit && !loading ? (
                  <div className="flex-1 flex flex-col min-h-0">
                    {/* If Email type, render custom Subject card segment */}
                    {(activeTab === 'coldEmail' || activeTab === 'followUpEmail') && (
                      <div className="p-4 bg-slate-50 border-b border-slate-150 dark:bg-slate-900/40 dark:border-slate-850 flex items-center justify-between space-x-3">
                        <div className="min-w-0 flex-1">
                          <span className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider block">
                            Subject Line
                          </span>
                          <p className="text-xs font-bold font-sans text-slate-800 dark:text-slate-200 truncate mt-1">
                            {(currentSnippet as any).subject || '(None generated)'}
                          </p>
                        </div>
                        <button
                          onClick={() => copyText((currentSnippet as any).subject || '', 'subject')}
                          className="p-1.5 hover:bg-slate-100 hover:text-emerald-600 dark:hover:bg-slate-800 text-slate-400 rounded-lg cursor-pointer transition-colors border border-transparent"
                          title="Copy Subject Line"
                        >
                          {copiedSubject ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    )}

                    {/* render actual body */}
                    <div className="flex-1 p-5 overflow-y-auto min-h-0">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] uppercase font-bold text-slate-410 tracking-widest font-mono">
                          Template Copy Body
                        </span>
                        <button
                          onClick={() => copyText(currentSnippet?.body || '', 'body')}
                          className="flex items-center space-x-1 px-2.3 py-1 bg-slate-50 border border-slate-150 text-slate-500 hover:bg-slate-100 dark:bg-slate-950 dark:border-slate-850 hover:text-emerald-500 rounded-md text-[10px] font-bold cursor-pointer transition-all"
                        >
                          {copiedBody ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-500" />
                              <span className="text-emerald-500 font-bold">Body Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Body Only</span>
                            </>
                          )}
                        </button>
                      </div>
                      
                      <div className="text-xs text-slate-700 dark:text-slate-300 font-mono leading-relaxed whitespace-pre-wrap select-all focus:outline-hidden">
                        {currentSnippet?.body || '(Generating templates, check connection details...)'}
                      </div>
                    </div>
                  </div>
                ) : (
                  !loading && (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400">
                      <FileText className="w-8 h-8 text-slate-300 mb-2 animate-bounce" />
                      <span className="text-sm font-semibold">Ready to draft toolkit</span>
                      <p className="text-xs text-slate-400 mt-1 max-w-xs">
                        Adjust signals on the left to personalize outreach templates.
                      </p>
                    </div>
                  )
                )}

              </div>

              {/* Consultation disclaimer */}
              <div className="mt-3.5 bg-emerald-50/20 border border-emerald-100/20 p-3 rounded-xl flex items-start space-x-2.5 dark:bg-emerald-950/10 dark:border-emerald-900/30">
                <HelpCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div className="text-[11px] text-slate-455 dark:text-slate-400 leading-relaxed font-sans font-medium">
                  <span className="font-bold text-emerald-600 dark:text-emerald-450">Copy Note:</span> Ensure parameters like <code className="font-mono bg-slate-100 dark:bg-slate-900 px-1 py-0.5 rounded text-[10px]">[Your Name]</code> or <code className="font-mono bg-slate-100 dark:bg-slate-900 px-1 py-0.5 rounded text-[10px]">[Your Agency]</code> are replaced with actual agency details prior to communication.
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 dark:border-slate-850 dark:bg-slate-950/40 flex items-center justify-end shadow-inner">
          <button
            onClick={onClose}
            className="px-5 py-2 hover:bg-slate-100 border text-slate-700 dark:hover:bg-slate-900 dark:text-slate-300 text-xs font-bold rounded-lg cursor-pointer transition-colors border-slate-200 dark:border-slate-850"
          >
            Finished Drafting
          </button>
        </div>

      </div>
    </div>
  );
}
