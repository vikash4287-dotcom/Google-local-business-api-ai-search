import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Phone, 
  Globe, 
  Star, 
  Sparkles, 
  CornerDownRight, 
  Copy, 
  Check, 
  Mail, 
  AlertTriangle,
  Lightbulb,
  Building,
  Target,
  Award,
  Lock,
  RefreshCw,
  Settings,
  User,
  Briefcase
} from 'lucide-react';
import { Business } from '../types';
import AIPitchModal from './AIPitchModal';
import { calculateLeadScore } from '../utils/score';
import { databaseService } from '../services/db';

interface BusinessModalProps {
  lead: (Business & { status?: 'New' | 'Contacted' | 'Interested' | 'Do Not Contact' }) | null;
  onClose: () => void;
  onSave: (lead: Business) => void;
  isSaved: boolean;
  onUpdateStatus?: (id: string, status: 'New' | 'Contacted' | 'Interested' | 'Do Not Contact') => void;
  firebaseConnected?: boolean;
  onOpenAuth?: (mode: 'login' | 'signup') => void;
}

export default function BusinessModal({
  lead,
  onClose,
  onSave,
  isSaved,
  onUpdateStatus,
  firebaseConnected = false,
  onOpenAuth
}: BusinessModalProps) {
  const [copied, setCopied] = useState(false);
  const [isAIPitchOpen, setIsAIPitchOpen] = useState(false);
  const [websiteAudit, setWebsiteAudit] = useState<any | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);

  // Customizable Cold Outreach Email States
  const [senderName, setSenderName] = useState(() => localStorage.getItem('outreach_sender_name') || 'Alex');
  const [agencyName, setAgencyName] = useState(() => localStorage.getItem('outreach_agency_name') || 'Local Growth Agency');
  const [outreachTone, setOutreachTone] = useState<'professional' | 'casual' | 'direct'>(() => {
    return (localStorage.getItem('outreach_tone') as any) || 'professional';
  });

  const [selectedGaps, setSelectedGaps] = useState({
    noWebsite: false,
    lowReviews: false,
    poorRating: false,
  });

  const [customSubject, setCustomSubject] = useState('');
  const [customBody, setCustomBody] = useState('');
  const [isManualEdit, setIsManualEdit] = useState(false);

  // Sync gaps when lead changes
  React.useEffect(() => {
    if (!lead) return;
    setSelectedGaps({
      noWebsite: !lead.website,
      lowReviews: (lead.reviewCount || 0) < 30,
      poorRating: (lead.rating || 0) < 4.2,
    });
    setIsManualEdit(false);
  }, [lead?.id]);

  const handleSenderNameChange = (val: string) => {
    setSenderName(val);
    localStorage.setItem('outreach_sender_name', val);
  };

  const handleAgencyNameChange = (val: string) => {
    setAgencyName(val);
    localStorage.setItem('outreach_agency_name', val);
  };

  const handleOutreachToneChange = (val: 'professional' | 'casual' | 'direct') => {
    setOutreachTone(val);
    localStorage.setItem('outreach_tone', val);
  };

  const generateDynamicEmail = (
    nameVal: string,
    agencyVal: string,
    toneVal: string,
    gapsVal: { noWebsite: boolean; lowReviews: boolean; poorRating: boolean }
  ) => {
    if (!lead) return { subject: '', body: '' };
    const leadRating = lead.rating || 0;
    const leadReviewCount = lead.reviewCount || 0;
    
    let subject = '';
    let body = '';

    // Generate Subject Line
    if (toneVal === 'direct') {
      if (gapsVal.noWebsite) {
        subject = `Grow your business: Website for ${lead.name}`;
      } else if (gapsVal.poorRating || gapsVal.lowReviews) {
        subject = `GMB optimization & reviews for ${lead.name}`;
      } else {
        subject = `Quick growth idea for ${lead.name}`;
      }
    } else if (toneVal === 'casual') {
      if (gapsVal.noWebsite) {
        subject = `Quick question about the website for ${lead.name}`;
      } else if (gapsVal.poorRating || gapsVal.lowReviews) {
        subject = `Quick question regarding ${lead.name}'s Google reviews`;
      } else {
        subject = `Ideas for ${lead.name}`;
      }
    } else { // professional
      if (gapsVal.noWebsite) {
        subject = `Digital expansion and web optimization for ${lead.name}`;
      } else if (gapsVal.poorRating || gapsVal.lowReviews) {
        subject = `GMB search reputation review for ${lead.name}`;
      } else {
        subject = `Growth strategy partnership - ${lead.name}`;
      }
    }

    // Generate Body
    if (toneVal === 'direct') {
      body += `Hi team at ${lead.name},\n\n`;
      body += `I’ll keep this brief. I was looking up local businesses in ${lead.city} and came across ${lead.name}.\n\n`;
      
      let gapParagraphs = [];
      if (gapsVal.noWebsite) {
        gapParagraphs.push(`- Website: I noticed you don't have a website listed on Google. We can design a high-converting landing page to bring you direct customers.`);
      }
      if (gapsVal.poorRating) {
        gapParagraphs.push(`- Google Reviews: Your current Google rating is sitting at ${leadRating}★. Most potential clients skip any business below 4.3★. We can help you raise this to secure more local bookings.`);
      } else if (gapsVal.lowReviews) {
        gapParagraphs.push(`- Review Volume: You only have ${leadReviewCount} Google reviews. Boosting your review count will rank you higher in local search results.`);
      }

      if (gapParagraphs.length > 0) {
        body += `We identified a couple of quick improvements that can help you win more clients in ${lead.city}:\n\n` + gapParagraphs.join('\n') + `\n\n`;
      } else {
        body += `You have fantastic ratings! We would love to run hyper-targeted local campaigns using your stellar record to double your client bookings.\n\n`;
      }

      body += `Are you free for a quick 5-minute call this Thursday to discuss?\n\n`;
      body += `Best,\n\n${nameVal}\n${agencyVal}`;
    } else if (toneVal === 'casual') {
      body += `Hi there,\n\n`;
      body += `Hope you're having a great week! I was browsing through some local ${lead.category.toLowerCase()} offices in ${lead.city} and found ${lead.name}.\n\n`;

      if (gapsVal.noWebsite) {
        body += `I couldn't find a website link for you guys online. I was wondering if you primarily rely on word-of-mouth, or if you've been meaning to set up a clean, simple site? We build beautiful, modern websites for ${lead.category.toLowerCase()} businesses that practically pay for themselves by bringing in local searchers.\n\n`;
      } else if (gapsVal.poorRating) {
        body += `I noticed you have a solid business, but your Google listing is around ${leadRating} Stars. Since people often filter out places below 4.3 stars, you might be missing out on customers. We help businesses easily gather more happy reviews from their clients.\n\n`;
      } else if (gapsVal.lowReviews) {
        body += `I noticed you guys have an awesome rating of ${leadRating} ★, but only ${leadReviewCount} reviews! Since competitors with more reviews often steal the spotlight on search, we built a tool that helps local offices double their review count automatically.\n\n`;
      } else {
        body += `I noticed you guys have awesome reviews! We help premium services like yours run simple ads to turn that great reputation into steady bookings.\n\n`;
      }

      body += `Would you be open to a casual chat sometime soon? Just 5 minutes to see if we'd be a good fit to help you grow.\n\n`;
      body += `Cheers,\n\n${nameVal}\n${agencyVal}`;
    } else { // professional
      body += `Dear Business Owner,\n\n`;
      body += `I hope this email finds you well. My name is ${nameVal} from ${agencyVal}. We specialize in digital marketing and client acquisition for ${lead.category.toLowerCase()} businesses in the ${lead.city} region.\n\n`;
      body += `While conducting a routine local search audit of ${lead.name}, our team identified a few digital presence gaps that may be hindering your local search visibility and conversion rates:\n\n`;

      let bulletCount = 1;
      if (gapsVal.noWebsite) {
        body += `• Absence of a Dedicated Website: Establishing a professional web presence typically increases direct customer inquiries by up to 40% for ${lead.category.toLowerCase()} services.\n`;
        bulletCount++;
      }
      if (gapsVal.poorRating) {
        body += `• GMB Rating Deficit: At ${leadRating} Stars, your listing is currently sitting below the neighborhood threshold (4.3+ Stars), redirecting prospective clients to competitor listings.\n`;
        bulletCount++;
      } else if (gapsVal.lowReviews) {
        body += `• Low Review Volume: Having only ${leadReviewCount} reviews makes it challenging to maintain premium placement in Google's Local 3-Pack.\n`;
        bulletCount++;
      }

      if (bulletCount === 1) {
        body += `• Digital Optimization: Although your current rating is highly competitive, there are active opportunities to leverage your strong reputation to drive targeted local ads.\n`;
      }

      body += `\nWe have developed a customized digital blueprint designed to address these exact areas and accelerate your growth.\n\n`;
      body += `Could we schedule a brief, 5-minute call this coming Thursday to share these insights with you?\n\n`;
      body += `Sincerely,\n\n${nameVal}\n${agencyVal}`;
    }

    return { subject, body };
  };

  // Sync subject and body when variables change, unless manual editing is active
  React.useEffect(() => {
    if (!lead || isManualEdit) return;
    const { subject, body } = generateDynamicEmail(senderName, agencyName, outreachTone, selectedGaps);
    setCustomSubject(subject);
    setCustomBody(body);
  }, [senderName, agencyName, outreachTone, selectedGaps.noWebsite, selectedGaps.lowReviews, selectedGaps.poorRating, lead?.id, isManualEdit]);

  const handleResetTemplate = () => {
    if (!lead) return;
    setIsManualEdit(false);
    const { subject, body } = generateDynamicEmail(senderName, agencyName, outreachTone, selectedGaps);
    setCustomSubject(subject);
    setCustomBody(body);
  };

  React.useEffect(() => {
    if (!lead) return;
    let active = true;
    const fetchData = async () => {
      try {
        setWebsiteAudit(null);
        setAuditError(null);

        const savedAudit = await databaseService.getWebsiteAudit(lead.id);

        if (active) {
          if (savedAudit) setWebsiteAudit(savedAudit);
        }
      } catch (err) {
        console.error("Error loading web audit:", err);
      }
    };
    fetchData();
    return () => {
      active = false;
    };
  }, [lead?.id]);



  const handleAnalyzeWebsite = async () => {
    if (!lead) return;
    if (!firebaseConnected) {
      if (onOpenAuth) onOpenAuth('login');
      return;
    }
    setIsAuditing(true);
    setAuditError(null);
    try {
      const response = await fetch('/api/analyze-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: lead.id,
          businessName: lead.name,
          website: lead.website || `http://www.${lead.name.toLowerCase().replace(/[^a-z0-9]/g, '')}-${lead.city.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
          category: lead.category,
          city: lead.city
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to complete website audit.');
      }

      const data = await response.json();
      if (data.success && data.audit) {
        const newAudit = {
          id: `audit_${Math.random().toString(36).substr(2, 9)}`,
          businessId: lead.id,
          businessName: lead.name,
          website: lead.website || `Provisional Website Pitch`,
          score: data.audit.score,
          strengths: data.audit.strengths,
          weaknesses: data.audit.weaknesses,
          recommendedImprovements: data.audit.recommendedImprovements,
          potentialServicesToSell: data.audit.potentialServicesToSell,
          estimatedProjectValue: data.audit.estimatedProjectValue,
          auditedAt: new Date().toISOString()
        };

        // Persist to database
        await databaseService.saveWebsiteAudit(newAudit);
        setWebsiteAudit(newAudit);
      } else {
        throw new Error('Audit did not return valid result data.');
      }
    } catch (err: any) {
      console.error(err);
      setAuditError(err.message || 'Audit analysis failed.');
    } finally {
      setIsAuditing(false);
    }
  };

  const handleLaunchAIPitch = () => {
    if (!firebaseConnected) {
      if (onOpenAuth) onOpenAuth('login');
      return;
    }
    setIsAIPitchOpen(true);
  };
  
  if (!lead) return null;

  // Audit calculations
  const rating = lead.rating || 0;
  const reviewCount = lead.reviewCount || 0;
  const hasWebsite = !!lead.website;

  const isLowReviews = reviewCount < 30;
  const isPoorRating = rating < 4.2;

  // Generate customized marketing audit
  const deficits: string[] = [];
  if (!hasWebsite) deficits.push('Web Presence Deficit (No official website found)');
  if (isLowReviews) deficits.push(`Low Social Proof (${reviewCount} GMB reviews - Gaps in review funnel)`);
  if (isPoorRating) deficits.push(`Reputation Deficit (${rating} ★ - Falling below GMB local 3-pack standards)`);

  // Pitch template generator based on deficits
  const generatePitchText = () => {
    let msg = `Hi there,\n\n`;
    msg += `I was looking at local ${lead.category.toLowerCase()} businesses in ${lead.city} and came across ${lead.name}.\n\n`;
    
    if (!hasWebsite) {
      msg += `I noticed you don't have a modern website listed online. In today's digital climate, over 74% of clients research online before visiting. My team builds conversion-focused websites specifically for ${lead.category.toLowerCase()} agencies that help secure customers directly from Google.\n\n`;
    } else if (isPoorRating) {
      msg += `I noticed that while you have a web presence, your Google ranking is sitting around ${rating} Stars. Since most prospects skip any place below 4.3 stars, you're likely losing high-intent customers to competing ${lead.category.toLowerCase()} offices in the neighborhood. We design customized reputational pipelines to help clients capture authentic positive reviews.\n\n`;
    } else if (isLowReviews) {
      msg += `I noticed you have a premium service but only have ${reviewCount} reviews on Google. Competitors with more reviews are likely drawing customers away because they look more established. We specialize in automated local review pipelines to boost GMB search placement safely and rapidly.\n\n`;
    } else {
      msg += `I noticed ${lead.name} has great ratings! We help local ${lead.category.toLowerCase()} operations run targeted geo-ads to double their client bookings using their excellent reviews.\n\n`;
    }
    
    msg += `Could we hop on a quick 5-minute call this Thursday to discuss how we can turn this into a growth channel for ${lead.name}?\n\n`;
    msg += `Best regards,\n[Your Name] - Local Lead Consultant`;
    return msg;
  };

  const getSubjectLine = () => {
    if (!hasWebsite) {
      return `Website optimization question for ${lead.name}`;
    } else if (isPoorRating) {
      return `Online reputation query for ${lead.name}`;
    } else if (isLowReviews) {
      return `Google Business review channel for ${lead.name}`;
    } else {
      return `Growth partnership query for ${lead.name}`;
    }
  };

  const sendQuickEmail = () => {
    const subject = getSubjectLine();
    const body = generatePitchText();
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatePitchText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/55 backdrop-blur-xs font-sans">
      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 dark:border-slate-800 rounded-2xl dark:bg-slate-950 text-slate-850 dark:text-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header decoration */}
        <div className="h-2 bg-indigo-600 w-full" />

        {/* Top/Title */}
        <div className="flex items-center justify-between p-6 pb-2 border-b border-slate-100 dark:border-slate-850">
          <div className="flex items-start space-x-3.5">
            <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl text-indigo-600 dark:text-indigo-400 border border-indigo-100/30">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-sans tracking-tight leading-7 md:text-2xl">
                {lead.name}
              </h3>
              <div className="flex flex-wrap gap-2 mt-1.5 items-center">
                <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-900 border dark:border-slate-800 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                  {lead.category}
                </span>
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                  Located in: {lead.city}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 px-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Outreach Campaign Tracking Status Banner */}
          {isSaved && onUpdateStatus && (
            <div className="p-4 rounded-xl border border-indigo-150 bg-indigo-50/5 dark:border-indigo-900/30 dark:bg-indigo-950/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-extrabold uppercase bg-indigo-50/70 dark:bg-indigo-950 text-indigo-750 dark:text-indigo-400 px-2 py-0.5 rounded-md border border-indigo-100/20 tracking-wider">
                  CRM Tracking
                </span>
                <h4 className="text-sm font-bold text-slate-850 dark:text-slate-100 mt-1">
                  Outreach Campaign Status
                </h4>
              </div>
              <select
                value={lead.status || 'New'}
                onChange={(e) => {
                  onUpdateStatus(lead.id, e.target.value as any);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border cursor-pointer outline-hidden transition-all dark:bg-slate-950 ${
                  lead.status === 'Contacted' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/40 dark:border-indigo-900/30 dark:text-indigo-400' :
                  lead.status === 'Interested' ? 'bg-emerald-50 border-emerald-250 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-900/30 dark:text-emerald-405' :
                  lead.status === 'Do Not Contact' ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-900/30 dark:text-rose-400' :
                  'bg-slate-50 border-slate-205 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300'
                }`}
              >
                <option value="New">🏷 New Lead</option>
                <option value="Contacted">✉ Contacted</option>
                <option value="Interested">🔥 Interested</option>
                <option value="Do Not Contact">✖ Do Not Contact</option>
              </select>
            </div>
          )}

          {/* Metadata info cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Rating */}
            <div className="p-4 rounded-xl border border-slate-150 bg-slate-55/40 dark:border-slate-850 dark:bg-slate-900/40">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 block uppercase tracking-wide">
                GMB Rating
              </span>
              <div className="flex items-baseline space-x-1.5 mt-2">
                <span className="text-2xl font-black text-slate-900 dark:text-slate-50">
                  {rating ? rating.toFixed(1) : 'N/A'}
                </span>
                <div className="flex items-center text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400" />
                </div>
              </div>
              <span className={`text-[11px] font-semibold block mt-1 ${isPoorRating ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {isPoorRating ? '● Poor Rating' : '✓ Rating Stable'}
              </span>
            </div>

            {/* Review count */}
            <div className="p-4 rounded-xl border border-slate-150 bg-slate-55/40 dark:border-slate-850 dark:bg-slate-900/40">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 block uppercase tracking-wide">
                Total Reviews
              </span>
              <div className="flex items-baseline space-x-1.5 mt-2">
                <span className="text-2xl font-black text-slate-900 dark:text-slate-50">
                  {reviewCount}
                </span>
                <span className="text-xs text-slate-400 font-medium">listings</span>
              </div>
              <span className={`text-[11px] font-semibold block mt-1 ${isLowReviews ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {isLowReviews ? '● Needs social proof' : '✓ Standard Social proof'}
              </span>
            </div>

            {/* Website existence */}
            <div className="p-4 rounded-xl border border-slate-150 bg-slate-55/40 dark:border-slate-850 dark:bg-slate-900/40">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 block uppercase tracking-wide">
                Web Presence
              </span>
              <div className="flex items-center space-x-2 mt-2 h-8">
                {hasWebsite ? (
                  <a
                    href={lead.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 hover:underline dark:text-emerald-400 text-sm font-bold flex items-center gap-1 leading-none"
                  >
                    <Globe className="w-4 h-4" />
                    <span>Active Website</span>
                  </a>
                ) : (
                  <span className="text-rose-600 dark:text-rose-400 text-sm font-black uppercase flex items-center gap-1 leading-none">
                    <AlertTriangle className="w-4 h-4" />
                    <span>No Web Presence</span>
                  </span>
                )}
              </div>
              <span className={`text-[11px] font-semibold block mt-1 ${hasWebsite ? 'text-slate-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {hasWebsite ? 'Low barrier to entrance' : '● High Conversion Value'}
              </span>
            </div>
          </div>

          {/* Lead Quality Score audit meter */}
          {(() => {
            const { score, label, badgeClass, dotColor } = calculateLeadScore(
              lead.rating,
              lead.reviewCount,
              !!lead.website
            );

            // Determine color grade styling for progress bar
            let barColor = 'bg-rose-500';
            if (score >= 75) barColor = 'bg-rose-500';
            else if (score >= 50) barColor = 'bg-indigo-600';
            else if (score >= 30) barColor = 'bg-amber-500';
            else barColor = 'bg-slate-400';

            return (
              <div className="p-5 border border-slate-150 bg-slate-50/50 rounded-xl dark:border-slate-800 dark:bg-slate-900/30 flex flex-col space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 flex items-center space-x-1.5">
                      <Award className="w-4.5 h-4.5 text-indigo-554 dark:text-indigo-400" />
                      <span>Lead Outreach Quality Score</span>
                    </h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wide">
                      Compound Marketing Deficit Opportunity Scorecard
                    </p>
                  </div>
                  <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-black border shadow-xs shrink-0 self-start sm:self-center ${badgeClass}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                    <span>{score} &bull; {label}</span>
                  </div>
                </div>

                {/* Progress bar visual meter */}
                <div className="space-y-1">
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ease-out rounded-full ${barColor}`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wide">
                    <span>Baseline (0)</span>
                    <span>High Deficit / High Priority Opportunity (100)</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                  This scorecard grades local leads based on outreach potential. A higher score highlights significant digital gaps (lack of responsive website, rating deficit, or low reviews) representing lucrative design, development, SEO, and rating acquisition packages you can sell.
                </p>
              </div>
            );
          })()}

          {/* Core audited deficits list */}
          <div className="p-5 border border-amber-200 bg-amber-50/20 rounded-xl dark:border-amber-900/40 dark:bg-amber-950/10">
            <div className="flex items-center space-x-2 text-amber-800 dark:text-amber-300">
              <Target className="w-4.5 h-4.5 animate-pulse" />
              <h4 className="text-sm font-bold uppercase tracking-wider">Identified Agency Target Deficits</h4>
            </div>
            {deficits.length > 0 ? (
              <ul className="mt-2.5 space-y-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
                {deficits.map((deficit, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <CornerDownRight className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>{deficit}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2.5 text-xs text-slate-500">
                Excellent natural stats. High GMB presence. Best outreach strategy is running geo-focused optimization campaigns rather than core rebuild audits.
              </p>
            )}
          </div>

          {/* Website conversion & SEO Audit card */}
          <div className="p-5 border border-slate-200 bg-slate-50/30 rounded-xl dark:border-slate-800 dark:bg-slate-900/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 flex items-center space-x-2">
                  <Globe className="w-4.5 h-4.5 text-indigo-500" />
                  <span>Website & Conversion Optimization Audit</span>
                </h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wide">
                  Agency-grade audit of user EXPERIENCE, SEO, & conversion pathways
                </p>
              </div>

              {!websiteAudit && !isAuditing && (
                <button
                  type="button"
                  onClick={handleAnalyzeWebsite}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all shadow-sm cursor-pointer whitespace-nowrap self-start sm:self-center"
                >
                  {firebaseConnected ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{hasWebsite ? 'Analyze Website' : 'Perform Digital Presence Audit'}</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Unlock AI Audit (Sign In)</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {isAuditing && (
              <div className="p-6 bg-slate-150/10 border border-slate-200/50 dark:bg-slate-950/40 dark:border-slate-800/80 rounded-xl flex flex-col items-center justify-center text-center space-y-3.5 py-8">
                <div className="flex items-center justify-center space-x-1.5">
                  <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                  <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-350">
                    Running Advanced Website & Digital CRO Audit...
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">
                    Gemini AI is examining Homepage Quality, CTAs, SEO Basics, Trust Signals, and Up-sell options. This will take ~3 seconds.
                  </p>
                </div>
              </div>
            )}

            {auditError && (
              <div className="p-3 text-[11px] bg-rose-50 border border-rose-100 text-rose-800 rounded-xl dark:bg-rose-950/20 dark:border-rose-900 font-bold leading-relaxed">
                ⚠️ Error running audit: {auditError}
                <button 
                  onClick={handleAnalyzeWebsite} 
                  className="block mt-1 text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  Click here to try again
                </button>
              </div>
            )}

            {!websiteAudit && !isAuditing && !auditError && (
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold animate-pulse">
                {hasWebsite 
                  ? `This business has a website registered at ${lead.website || ''}. Click below to perform an automated AI audit of their design standard, call-to-actions, SEO metadata, and project values.`
                  : "No official website found for this business. You can run an AI Digital Audit to formulate a modern webpage proposal draft tailored specifically to this category."
                }
              </p>
            )}

            {websiteAudit && (
              <div className="space-y-4 animate-in fade-in duration-300">
                {/* Score & Estimated contract value */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="p-4 bg-white border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-wider">
                        Website Audit Score
                      </span>
                      <span className="text-2xl font-black text-slate-900 dark:text-slate-50 mt-1 block">
                        {websiteAudit.score}/100
                      </span>
                    </div>
                    <div className="relative flex items-center justify-center w-12 h-12">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="24" cy="24" r="20" fill="transparent" className="stroke-slate-100 dark:stroke-slate-900" strokeWidth="4" />
                        <circle 
                          cx="24" 
                          cy="24" 
                          r="20" 
                          fill="transparent" 
                          className="stroke-indigo-600 dark:stroke-indigo-400 transition-all duration-1000 ease-out" 
                          strokeWidth="4" 
                          strokeDasharray={2 * Math.PI * 20}
                          strokeDashoffset={2 * Math.PI * 20 * (1 - websiteAudit.score / 100)}
                        />
                      </svg>
                      <span className="absolute text-[10px] font-black text-indigo-600 dark:text-indigo-400">
                        {websiteAudit.score}%
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-indigo-600/5 border border-indigo-100 dark:bg-indigo-950/20 dark:border-indigo-900/30 rounded-xl">
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 block uppercase tracking-wider">
                      Est. Agency Project Value
                    </span>
                    <span className="text-xl font-extrabold text-indigo-750 dark:text-indigo-350 mt-1.5 block">
                      {websiteAudit.estimatedProjectValue}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
                      Target contract fee based on digital weaknesses
                    </span>
                  </div>
                </div>

                {/* Grid for Strengths & Weaknesses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Strengths */}
                  <div className="p-4 bg-emerald-50/5 border border-emerald-150 rounded-xl dark:bg-emerald-950/5 dark:border-emerald-900/20">
                    <h5 className="text-[11px] font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Website Strengths
                    </h5>
                    <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                      {websiteAudit.strengths.map((str: string, index: number) => (
                        <li key={index} className="flex items-start gap-1.5 leading-relaxed font-semibold">
                          <span className="text-emerald-500 mt-0.5 font-bold">✓</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div className="p-4 bg-rose-50/5 border border-rose-150 rounded-xl dark:bg-rose-950/5 dark:border-rose-900/20">
                    <h5 className="text-[11px] font-black text-rose-800 dark:text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      Identified conversion Gaps
                    </h5>
                    <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                      {websiteAudit.weaknesses.map((weak: string, index: number) => (
                        <li key={index} className="flex items-start gap-1.5 leading-relaxed font-semibold">
                          <span className="text-rose-500 mt-0.5 font-bold">⚠</span>
                          <span>{weak}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Recommended Improvements */}
                <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl dark:bg-slate-900/30 dark:border-slate-800">
                  <h5 className="text-[11px] font-black text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Actionable CRO Recommendations
                  </h5>
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                    {websiteAudit.recommendedImprovements.map((imp: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 leading-relaxed font-semibold">
                        <span className="w-4 h-4 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Services to Up-sell */}
                <div className="p-4.5 bg-gradient-to-tr from-indigo-500/5 to-purple-500/5 border border-indigo-200/50 rounded-xl dark:border-indigo-900/30">
                  <h5 className="text-[11px] font-black text-indigo-750 dark:text-indigo-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 font-extrabold">⚡ Agency Services to Sell</span>
                  </h5>
                  <div className="flex flex-wrap gap-1.5">
                    {websiteAudit.potentialServicesToSell.map((svc: string, index: number) => (
                      <span 
                        key={index} 
                        className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs bg-white border border-indigo-100 text-indigo-850 font-bold shadow-xs dark:bg-slate-950 dark:border-indigo-900/30 dark:text-indigo-305 transition-colors"
                      >
                        {svc}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-850 pt-2 font-bold">
                  <span>Audited on: {new Date(websiteAudit.auditedAt).toLocaleDateString()}</span>
                  <button 
                    onClick={handleAnalyzeWebsite}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-1"
                    disabled={isAuditing}
                  >
                    {!firebaseConnected && <Lock className="w-3 h-3" />}
                    <span>{firebaseConnected ? 'Re-Run Audit' : 'Sign In to Re-Run'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Contact Directory Details */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Contact & Address Directory</h4>
            <div className="grid grid-cols-1 gap-3 text-xs font-medium bg-slate-50 p-4.5 rounded-xl border border-slate-150 dark:bg-slate-900/40 dark:border-slate-850">
              <div className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <span className="text-slate-700 dark:text-slate-350">{lead.address || 'No Address Listed'}</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-mono text-slate-700 dark:text-slate-350">{lead.phone || 'No Phone Number Listed'}</span>
              </div>
              {hasWebsite && (
                <div className="flex items-center space-x-2.5">
                  <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                  <a 
                    href={lead.website} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-indigo-600 dark:text-indigo-400 hover:underline truncate"
                  >
                    {lead.website}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Gemini AI Premium Pitch CTA Card */}
          <div className="p-4 rounded-xl bg-linear-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/5 border border-indigo-200/30 dark:border-indigo-900/30 dark:from-indigo-950/20 dark:to-purple-950/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 -transtion-y-1 translate-x-1 p-8 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-100 text-indigo-750 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200/20 tracking-wider leading-none">
                  ✨ Gemini Core Upgrade
                </span>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 mt-1">
                  Personalize Outreach Pitch with AI
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Use Gemini to draft an outreach cold template structured specifically around this lead's deficits.
                </p>
              </div>
              <button
                type="button"
                onClick={handleLaunchAIPitch}
                className="px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all shadow-md shadow-indigo-505 active:scale-97 cursor-pointer shrink-0"
              >
                {firebaseConnected ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                    <span>Launch AI Pitcher</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Unlock AI Pitcher (Sign In)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Cold Pitch Generator Section */}
          <div className="p-5 border border-slate-200 bg-slate-50/20 rounded-2xl dark:border-slate-800 dark:bg-slate-900/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-850 pb-3">
              <div className="space-y-0.5">
                <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  <Mail className="w-4.5 h-4.5 text-indigo-500" />
                  <span>Customizable Cold Outreach Template</span>
                </h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wide">
                  Tailored around business's specific marketing gaps and conversion goals
                </p>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-100/30">
                Interactive Composer
              </span>
            </div>

            {/* Customization Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column: Personalization */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>Your Name (Sender)</span>
                  </label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => handleSenderNameChange(e.target.value)}
                    placeholder="E.g., Alex"
                    className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-lg dark:bg-slate-950 dark:border-slate-800 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Briefcase className="w-3 h-3" />
                    <span>Your Agency Name</span>
                  </label>
                  <input
                    type="text"
                    value={agencyName}
                    onChange={(e) => handleAgencyNameChange(e.target.value)}
                    placeholder="E.g., Local Growth Partners"
                    className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-lg dark:bg-slate-950 dark:border-slate-800 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Right Column: Tone & Gaps */}
              <div className="space-y-3">
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Settings className="w-3 h-3" />
                    <span>Outreach Tone</span>
                  </span>
                  <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg">
                    {(['professional', 'casual', 'direct'] as const).map((tone) => (
                      <button
                        key={tone}
                        type="button"
                        onClick={() => handleOutreachToneChange(tone)}
                        className={`py-1 rounded-md text-xs font-semibold capitalize cursor-pointer transition-all ${
                          outreachTone === tone
                            ? 'bg-white shadow-xs text-indigo-650 dark:bg-slate-850 dark:text-indigo-400'
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                        }`}
                      >
                        {tone}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                    Target Deficits to Highlight
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {/* Website Checkbox */}
                    <button
                      type="button"
                      onClick={() => setSelectedGaps(prev => ({ ...prev, noWebsite: !prev.noWebsite }))}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
                        selectedGaps.noWebsite
                          ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-405'
                          : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600 dark:bg-slate-950 dark:border-slate-800'
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        checked={selectedGaps.noWebsite} 
                        onChange={() => {}} // Controlled by button click
                        className="rounded-sm border-slate-300 text-rose-600 focus:ring-rose-500/20 w-3 h-3 pointer-events-none"
                      />
                      <span>No Website</span>
                    </button>

                    {/* Low Reviews Checkbox */}
                    <button
                      type="button"
                      onClick={() => setSelectedGaps(prev => ({ ...prev, lowReviews: !prev.lowReviews }))}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
                        selectedGaps.lowReviews
                          ? 'bg-amber-50 border-amber-250 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/50 dark:text-amber-400'
                          : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600 dark:bg-slate-950 dark:border-slate-800'
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        checked={selectedGaps.lowReviews} 
                        onChange={() => {}} // Controlled by button click
                        className="rounded-sm border-slate-300 text-amber-600 focus:ring-amber-500/20 w-3 h-3 pointer-events-none"
                      />
                      <span>Low Reviews</span>
                    </button>

                    {/* Poor Rating Checkbox */}
                    <button
                      type="button"
                      onClick={() => setSelectedGaps(prev => ({ ...prev, poorRating: !prev.poorRating }))}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
                        selectedGaps.poorRating
                          ? 'bg-rose-50 border-rose-250 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-400'
                          : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600 dark:bg-slate-950 dark:border-slate-800'
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        checked={selectedGaps.poorRating} 
                        onChange={() => {}} // Controlled by button click
                        className="rounded-sm border-slate-300 text-rose-600 focus:ring-rose-500/20 w-3 h-3 pointer-events-none"
                      />
                      <span>Poor Rating</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Simulated Email Client UI */}
            <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
              <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-850 flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50">
                <span className="text-[10px] font-bold text-slate-400 block w-14 uppercase shrink-0">To:</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                  Owner at {lead.name} &bull; <span className="font-medium text-slate-400 italic">No public email (using contact fallback)</span>
                </span>
              </div>
              
              <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-850 flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50">
                <label htmlFor="custom-subject-input" className="text-[10px] font-bold text-slate-400 block w-14 uppercase shrink-0">Subject:</label>
                <input
                  id="custom-subject-input"
                  type="text"
                  value={customSubject}
                  onChange={(e) => {
                    setCustomSubject(e.target.value);
                    setIsManualEdit(true);
                  }}
                  className="w-full bg-transparent border-none p-0 focus:ring-0 focus:outline-hidden text-xs font-bold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:bg-transparent"
                  placeholder="Email Subject Line"
                />
              </div>

              <div className="p-4 bg-white dark:bg-slate-950">
                <textarea
                  value={customBody}
                  onChange={(e) => {
                    setCustomBody(e.target.value);
                    setIsManualEdit(true);
                  }}
                  rows={10}
                  className="w-full bg-transparent border-none p-0 focus:ring-0 focus:outline-hidden font-mono text-xs text-slate-800 dark:text-slate-300 leading-relaxed resize-y min-h-[160px] focus:bg-transparent"
                  placeholder="Draft your pitch here..."
                />
              </div>
            </div>

            {/* Action buttons and state indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                {isManualEdit ? (
                  <button
                    type="button"
                    onClick={handleResetTemplate}
                    className="text-xs font-bold text-indigo-650 hover:text-indigo-850 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 animate-spin-reverse" />
                    <span>Reset to Template Default</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Template auto-sync active</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={sendQuickEmail}
                  className="w-1/2 sm:w-auto flex items-center justify-center space-x-1.5 px-4 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl cursor-pointer transition-colors shadow-xs"
                >
                  <Mail className="w-4 h-4" />
                  <span>Send Quick Email</span>
                </button>
                
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="w-1/2 sm:w-auto flex items-center justify-center space-x-1.5 px-4 py-2.5 text-xs font-bold bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800 dark:text-slate-200 rounded-xl cursor-pointer transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span className="text-emerald-500 font-bold">Copied Email Body!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-450" />
                      <span>Copy Email Body</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Footer controls: Save / Dismiss */}
        <div className="flex items-center justify-between p-6 border-t border-slate-100 bg-slate-55 dark:border-slate-850 dark:bg-slate-950/30 gap-3">
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider hidden sm:block">
            LOCALSHOP CRM PLANNERS
          </p>
          <div className="flex items-center space-x-2.5 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 hover:bg-slate-100 border text-slate-700 dark:hover:bg-slate-900 dark:text-slate-300 text-sm font-semibold rounded-lg w-full sm:w-auto cursor-pointer transition-colors border-slate-200 dark:border-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onSave(lead);
                onClose();
              }}
              disabled={isSaved}
              className={`px-4 py-2 rounded-lg text-sm font-semibold text-white w-full sm:w-auto flex items-center justify-center space-x-1.5 transition-colors cursor-pointer ${
                isSaved 
                  ? 'bg-emerald-500 cursor-not-allowed hover:bg-emerald-500 opacity-80' 
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSaved ? 'Lead Saved in CRM' : 'Save Business Lead'}</span>
            </button>
          </div>
        </div>

      </div>

      {isAIPitchOpen && (
        <AIPitchModal 
          lead={lead} 
          onClose={() => setIsAIPitchOpen(false)} 
        />
      )}
    </div>
  );
}
