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
  FileText,
  Download
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Business, Proposal, ServicePackagesDraft } from '../types';
import AIPitchModal from './AIPitchModal';
import { calculateLeadScore } from '../utils/score';
import { databaseService } from '../services/db';

interface BusinessModalProps {
  lead: (Business & { status?: 'New' | 'Contacted' | 'Interested' | 'Do Not Contact' }) | null;
  onClose: () => void;
  onSave: (lead: Business) => void;
  isSaved: boolean;
  onUpdateStatus?: (id: string, status: 'New' | 'Contacted' | 'Interested' | 'Do Not Contact') => void;
}

export default function BusinessModal({
  lead,
  onClose,
  onSave,
  isSaved,
  onUpdateStatus
}: BusinessModalProps) {
  const [copied, setCopied] = useState(false);
  const [isAIPitchOpen, setIsAIPitchOpen] = useState(false);
  const [websiteAudit, setWebsiteAudit] = useState<any | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [isGeneratingProposal, setIsGeneratingProposal] = useState(false);
  const [proposalError, setProposalError] = useState<string | null>(null);

  const [packagesDraft, setPackagesDraft] = useState<ServicePackagesDraft | null>(null);
  const [isGeneratingPackages, setIsGeneratingPackages] = useState(false);
  const [packagesError, setPackagesError] = useState<string | null>(null);

  React.useEffect(() => {
    if (!lead) return;
    let active = true;
    const fetchData = async () => {
      try {
        setWebsiteAudit(null);
        setAuditError(null);
        setProposal(null);
        setProposalError(null);
        setPackagesDraft(null);
        setPackagesError(null);

        const [savedAudit, savedProposal, savedPackages] = await Promise.all([
          databaseService.getWebsiteAudit(lead.id),
          databaseService.getProposal(lead.id),
          databaseService.getServicePackagesDraft(lead.id)
        ]);

        if (active) {
          if (savedAudit) setWebsiteAudit(savedAudit);
          if (savedProposal) setProposal(savedProposal);
          if (savedPackages) setPackagesDraft(savedPackages);
        }
      } catch (err) {
        console.error("Error loading web audit, proposal & packages:", err);
      }
    };
    fetchData();
    return () => {
      active = false;
    };
  }, [lead?.id]);

  const handleGeneratePackages = async () => {
    if (!lead) return;
    setIsGeneratingPackages(true);
    setPackagesError(null);
    try {
      const response = await fetch('/api/generate-packages', {
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
        throw new Error(errData.error || 'Failed to generate custom service packages.');
      }

      const data = await response.json();
      if (data.success && data.packages) {
        const newDraft: ServicePackagesDraft = {
          id: `pkg_${Math.random().toString(36).substr(2, 9)}`,
          businessId: lead.id,
          businessName: lead.name,
          starter: {
            name: data.packages.starter.name,
            services: data.packages.starter.services,
            estimatedPricing: data.packages.starter.estimatedPricing,
            expectedOutcomes: data.packages.starter.expectedOutcomes
          },
          professional: {
            name: data.packages.professional.name,
            services: data.packages.professional.services,
            estimatedPricing: data.packages.professional.estimatedPricing,
            expectedOutcomes: data.packages.professional.expectedOutcomes
          },
          premium: {
            name: data.packages.premium.name,
            services: data.packages.premium.services,
            estimatedPricing: data.packages.premium.estimatedPricing,
            expectedOutcomes: data.packages.premium.expectedOutcomes
          },
          recommendedPackage: data.packages.recommendedPackage,
          generatedAt: new Date().toISOString()
        };

        // Persist to database
        await databaseService.saveServicePackagesDraft(newDraft);
        setPackagesDraft(newDraft);
      } else {
        throw new Error('Service package response did not return valid result data.');
      }
    } catch (err: any) {
      console.error(err);
      setPackagesError(err.message || 'Service packages generation failed.');
    } finally {
      setIsGeneratingPackages(false);
    }
  };

  const handleGenerateProposal = async () => {
    if (!lead) return;
    setIsGeneratingProposal(true);
    setProposalError(null);
    try {
      const response = await fetch('/api/generate-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: lead.id,
          businessName: lead.name,
          website: lead.website || `Provisional Website Proposal`,
          category: lead.category,
          city: lead.city,
          rating: lead.rating,
          reviewCount: lead.reviewCount
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to generate proposal.');
      }

      const data = await response.json();
      if (data.success && data.proposal) {
        const newProposal: Proposal = {
          id: `prop_${Math.random().toString(36).substr(2, 9)}`,
          businessId: lead.id,
          businessName: lead.name,
          website: lead.website || `http://www.${lead.name.toLowerCase().replace(/[^a-z0-9]/g, '')}-${lead.city.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
          executiveSummary: data.proposal.executiveSummary,
          businessProblems: data.proposal.businessProblems,
          websiteIssues: data.proposal.websiteIssues,
          reviewAndReputationIssues: data.proposal.reviewAndReputationIssues,
          recommendedServices: data.proposal.recommendedServices,
          expectedResults: data.proposal.expectedResults,
          pricingRecommendations: data.proposal.pricingRecommendations,
          timeline: data.proposal.timeline,
          nextSteps: data.proposal.nextSteps,
          generatedAt: new Date().toISOString()
        };

        // Persist to database
        await databaseService.saveProposal(newProposal);
        setProposal(newProposal);
      } else {
        throw new Error('Proposal did not return valid result data.');
      }
    } catch (err: any) {
      console.error(err);
      setProposalError(err.message || 'Proposal generation failed.');
    } finally {
      setIsGeneratingProposal(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!proposal) return;
    const doc = new jsPDF();
    let y = 20;

    const addHeader = (text: string) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(79, 70, 229); // Brand Indigo
      doc.text(text, 15, y);
      y += 6;
      doc.setDrawColor(226, 232, 240); // Slate-200 boundary line
      doc.line(15, y, 195, y);
      y += 8;
    };

    const addText = (text: string, isBold = false, indent = 0) => {
      doc.setFont("helvetica", isBold ? "bold" : "normal");
      doc.setFontSize(indent > 0 ? 10 : 10.5);
      doc.setTextColor(30, 41, 59); // Slate-800

      const wrapWidth = 180 - indent;
      const lines = doc.splitTextToSize(text, wrapWidth);

      lines.forEach((line: string) => {
        if (y > 272) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, 15 + indent, y);
        y += 6;
      });
      y += 2.5;
    };

    // Header info design
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(17, 24, 39); // Gray 900
    doc.text("Growth & Digital Marketing Proposal", 15, y);
    y += 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text(`Lead Name: ${proposal.businessName}`, 15, y);
    y += 6;
    doc.text(`Location: ${lead.city}`, 15, y);
    y += 6;
    doc.text(`Target URL: ${proposal.website}`, 15, y);
    y += 6;
    doc.text(`Date of Creation: ${new Date(proposal.generatedAt).toLocaleDateString()}`, 15, y);
    y += 16;

    // Executive Summary
    addHeader("1. Executive Summary");
    addText(proposal.executiveSummary);
    y += 5;

    // Business Problems
    addHeader("2. Core Business Gaps & Weaknesses");
    proposal.businessProblems.forEach((prob, i) => {
      addText(`${i + 1}. ${prob}`, false, 4);
    });
    y += 5;

    // Website & UX Issues
    addHeader("3. Website Deficiencies & Conversion Gaps");
    proposal.websiteIssues.forEach((issue, i) => {
      addText(`• ${issue}`, false, 4);
    });
    y += 5;

    // Reputation
    addHeader("4. Review & Local Reputation Impediments");
    proposal.reviewAndReputationIssues.forEach((issue, i) => {
      addText(`• ${issue}`, false, 4);
    });
    y += 5;

    // Solutions
    addHeader("5. Recommended Growth Solutions & Services");
    proposal.recommendedServices.forEach((svc) => {
      addText(`⚡ Solution: ${svc}`, true, 4);
    });
    y += 5;

    // Impact
    addHeader("6. Projected Growth Outcomes");
    proposal.expectedResults.forEach((res) => {
      addText(`✓ KPI Delta: ${res}`, false, 4);
    });
    y += 5;

    // Pricing
    addHeader("7. Commercial Pricing Model");
    addText(proposal.pricingRecommendations);
    y += 5;

    // Timeline
    addHeader("8. Onboarding Phase Timeline");
    addText(proposal.timeline);
    y += 5;

    // Next steps
    addHeader("9. Actionable Kick-Off & Next Steps");
    proposal.nextSteps.forEach((step, i) => {
      addText(`${i + 1}. ${step}`, false, 4);
    });

    doc.save(`${proposal.businessName.replace(/[^a-zA-Z0-9]/g, '_')}_LeadMineAI_Proposal.pdf`);
  };

  const handleAnalyzeWebsite = async () => {
    if (!lead) return;
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
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{hasWebsite ? 'Analyze Website' : 'Perform Digital Presence Audit'}</span>
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
                    <span>Re-Run Audit</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Proposal Generator Card */}
          <div className="p-5 border border-slate-200 bg-slate-50/30 rounded-xl dark:border-slate-800 dark:bg-slate-900/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 flex items-center space-x-2">
                  <FileText className="w-4.5 h-4.5 text-indigo-650 text-indigo-505 dark:text-indigo-400" />
                  <span>Growth & Marketing Proposal Draft</span>
                </h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wide">
                  Formulate a high-ticket, comprehensive sales contract blueprint
                </p>
              </div>

              {!proposal && !isGeneratingProposal && (
                <button
                  type="button"
                  onClick={handleGenerateProposal}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all shadow-sm cursor-pointer whitespace-nowrap self-start sm:self-center"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Proposal</span>
                </button>
              )}
            </div>

            {isGeneratingProposal && (
              <div className="p-6 bg-slate-150/10 border border-slate-200/50 dark:bg-slate-950/40 dark:border-slate-800/80 rounded-xl flex flex-col items-center justify-center text-center space-y-3.5 py-8">
                <div className="flex items-center justify-center space-x-1.5">
                  <div className="w-2.5 h-2.5 bg-indigo-605 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                  <div className="w-2.5 h-2.5 bg-indigo-605 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2.5 h-2.5 bg-indigo-650 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-350">
                    Drafting Contract & Multi-Page Business Proposal...
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">
                    Utilizing Gemini 3.5 AI to formulate Executive Summary, Category Pain Points, Pricing Models, and Timelines. ~4 seconds.
                  </p>
                </div>
              </div>
            )}

            {proposalError && (
              <div className="p-3 text-[11px] bg-rose-50 border border-rose-100 text-rose-800 rounded-xl dark:bg-rose-950/20 dark:border-rose-900 font-bold leading-relaxed">
                ⚠️ Error drafting proposal: {proposalError}
                <button 
                  onClick={handleGenerateProposal} 
                  className="block mt-1 text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  Click here to try again
                </button>
              </div>
            )}

            {!proposal && !isGeneratingProposal && !proposalError && (
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                Turn this registered lead into a paid contract. Click above to generate a client-ready business proposal with custom service deliverables, pricing breakdowns, expected KPI impacts, and instant PDF download.
              </p>
            )}

            {proposal && (
              <div className="space-y-4 animate-in fade-in duration-300">
                {/* PDF download actionable banner */}
                <div className="p-4 bg-indigo-600 text-white rounded-xl flex items-center justify-between shadow-xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black uppercase text-indigo-200 tracking-wider">
                      Proposal Draft Active
                    </span>
                    <h5 className="text-sm font-black text-white">
                      Export Ready PDF Document
                    </h5>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadPDF}
                    className="px-3.5 py-2 bg-white text-indigo-600 hover:bg-slate-50 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all shadow-xs shrink-0 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF</span>
                  </button>
                </div>

                {/* Executive Summary */}
                <div className="p-4 bg-white border border-slate-200 rounded-xl dark:bg-slate-950 dark:border-slate-800">
                  <h5 className="text-[11px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    1. Executive Summary
                  </h5>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
                    {proposal.executiveSummary}
                  </p>
                </div>

                {/* Grid for Business Problems & Website issues */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Business problems */}
                  <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl dark:bg-slate-900/30 dark:border-slate-800">
                    <h5 className="text-[11px] font-black text-indigo-750 dark:text-indigo-400 uppercase tracking-wider mb-2">
                      2. Core Business Problems
                    </h5>
                    <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 font-semibold leading-relaxed">
                      {proposal.businessProblems.map((prob, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-indigo-500 font-bold shrink-0">{i + 1}.</span>
                          <span>{prob}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Website conversion issues */}
                  <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl dark:bg-slate-900/30 dark:border-slate-800">
                    <h5 className="text-[11px] font-black text-indigo-750 dark:text-indigo-400 uppercase tracking-wider mb-2">
                      3. Website Deficiencies
                    </h5>
                    <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 font-semibold leading-relaxed">
                      {proposal.websiteIssues.map((issue, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-amber-500 shrink-0">&bull;</span>
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Grid for Review Issues & Expected Results */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Review Issues */}
                  <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl dark:bg-slate-900/30 dark:border-slate-800">
                    <h5 className="text-[11px] font-black text-rose-800 dark:text-rose-400 uppercase tracking-wider mb-2">
                      4. Reputation & Review Deficits
                    </h5>
                    <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 font-semibold leading-relaxed">
                      {proposal.reviewAndReputationIssues.map((issue, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-rose-505 font-black shrink-0">&bull;</span>
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Expected Results */}
                  <div className="p-4 bg-emerald-50/5 border border-emerald-150 rounded-xl dark:bg-emerald-950/5 dark:border-emerald-900/20">
                    <h5 className="text-[11px] font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-wider mb-2">
                      5. Projected Impact & KPI Deltas
                    </h5>
                    <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 font-semibold leading-relaxed">
                      {proposal.expectedResults.map((res, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-500 font-bold shrink-0">✓</span>
                          <span>{res}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Recommended Services list */}
                <div className="p-4 bg-gradient-to-tr from-indigo-500/5 to-purple-500/5 border border-indigo-200/50 rounded-xl dark:border-indigo-900/30">
                  <h5 className="text-[11px] font-black text-indigo-750 dark:text-indigo-400 uppercase tracking-wider mb-2.5">
                    ⚡ Recommended Growth Solutions & Services
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {proposal.recommendedServices.map((svc, i) => (
                      <span 
                        key={i} 
                        className="inline-flex items-center px-2.5 py-1.5 rounded-xl text-xs bg-white border border-indigo-100 text-indigo-850 font-bold shadow-xs dark:bg-slate-950 dark:border-indigo-900/30 dark:text-indigo-305"
                      >
                        {svc}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Pricing, Deliverables & Timeline */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Pricing */}
                  <div className="p-4 bg-white border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl">
                    <h5 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                      💸 Commercial Pricing Recomendations
                    </h5>
                    <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-semibold">
                      {proposal.pricingRecommendations}
                    </p>
                  </div>

                  {/* Timeline */}
                  <div className="p-4 bg-white border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl">
                    <h5 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                      ⏱ Launch Phase Timeline
                    </h5>
                    <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-semibold">
                      {proposal.timeline}
                    </p>
                  </div>
                </div>

                {/* Actionable Next steps */}
                <div className="p-4 bg-indigo-50/20 border border-indigo-150 rounded-xl dark:bg-indigo-950/10 dark:border-indigo-900/30">
                  <h5 className="text-[11px] font-black text-indigo-750 dark:text-indigo-400 uppercase tracking-wider mb-2">
                    🏁 Kick-off & Actionable Next Steps
                  </h5>
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 font-semibold leading-relaxed">
                    {proposal.nextSteps.map((step, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-white dark:bg-slate-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[9px] font-black shrink-0 shadow-xs border border-indigo-100 dark:border-indigo-900/30">
                          {i + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-850 pt-2 font-bold">
                  <span>Proposal Generated: {new Date(proposal.generatedAt).toLocaleDateString()}</span>
                  <button 
                    onClick={handleGenerateProposal}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-1"
                    disabled={isGeneratingProposal}
                  >
                    <span>Re-Run Proposal Analysis</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Service Package Builder Card */}
          <div className="p-5 border border-slate-200 bg-slate-50/30 rounded-xl dark:border-slate-800 dark:bg-slate-900/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 flex items-center space-x-2">
                  <Award className="w-4.5 h-4.5 text-indigo-500" />
                  <span>Interactive Service Package Builder</span>
                </h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wide">
                  Generate optimized Starter, Professional, and Premium pricing structures
                </p>
              </div>

              {!packagesDraft && !isGeneratingPackages && (
                <button
                  type="button"
                  onClick={handleGeneratePackages}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all shadow-sm cursor-pointer whitespace-nowrap self-start sm:self-center"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Build Service Packages</span>
                </button>
              )}
            </div>

            {isGeneratingPackages && (
              <div className="p-6 bg-slate-150/10 border border-slate-200/50 dark:bg-slate-950/40 dark:border-slate-800/80 rounded-xl flex flex-col items-center justify-center text-center space-y-3.5 py-8">
                <div className="flex items-center justify-center space-x-1.5">
                  <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                  <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2.5 h-2.5 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-350">
                    Formulating Customized Tiered Package Estimates...
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">
                    Sourcing services, pricing benchmarks, and expected returns tailored to this local category. ~4 seconds.
                  </p>
                </div>
              </div>
            )}

            {packagesError && (
              <div className="p-3 text-[11px] bg-rose-50 border border-rose-100 text-rose-800 rounded-xl dark:bg-rose-950/20 dark:border-rose-900 font-bold leading-relaxed">
                ⚠️ Error crafting service packages: {packagesError}
                <button 
                  onClick={handleGeneratePackages} 
                  className="block mt-1 text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  Click here to try again
                </button>
              </div>
            )}

            {!packagesDraft && !isGeneratingPackages && !packagesError && (
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                Generate highly personalized local pricing options spanning 3 major target tiers: Starter (Foundational), Professional (High-Margin Sweet Spot), and Premium (Complete Takeover). Includes service list details, estimated pricing, and expected growth KPIs.
              </p>
            )}

            {packagesDraft && (
              <div className="space-y-5 animate-in fade-in duration-300">
                {/* 3 Tier Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  
                  {/* Starter Package */}
                  <div className={`p-4 rounded-xl border relative flex flex-col justify-between h-full bg-white dark:bg-slate-950 ${packagesDraft.recommendedPackage === 'Starter' ? 'border-indigo-500 ring-2 ring-indigo-500/10' : 'border-slate-100 dark:border-slate-850 bg-slate-50/10'}`}>
                    {packagesDraft.recommendedPackage === 'Starter' && (
                      <span className="absolute -top-2.5 left-4 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-indigo-600 text-white shadow-xs">
                        Recommended Package
                      </span>
                    )}
                    <div className="space-y-3">
                      <div>
                        <span className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider block">Foundational Tier</span>
                        <h5 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">{packagesDraft.starter.name}</h5>
                      </div>
                      
                      <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-slate-100 dark:border-slate-900">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-550 block uppercase tracking-wider">Estimated Pricing</span>
                        <span className="text-sm font-black text-slate-900 dark:text-white mt-1 block">{packagesDraft.starter.estimatedPricing}</span>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Included Services</span>
                        <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400 font-semibold leading-relaxed">
                          {packagesDraft.starter.services.map((svc, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-indigo-600 dark:text-indigo-400 font-extrabold mt-0.5 shrink-0">&bull;</span>
                              <span>{svc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-900">
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Expected Outcomes</span>
                        <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400 font-semibold leading-relaxed">
                          {packagesDraft.starter.expectedOutcomes.map((out, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-emerald-500 font-extrabold shrink-0">✓</span>
                              <span>{out}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Professional Package */}
                  <div className={`p-4 rounded-xl border relative flex flex-col justify-between h-full bg-white dark:bg-slate-950 ${packagesDraft.recommendedPackage === 'Professional' ? 'border-indigo-500 ring-2 ring-indigo-500/10' : 'border-slate-100 dark:border-slate-850 bg-slate-50/10'}`}>
                    {packagesDraft.recommendedPackage === 'Professional' && (
                      <span className="absolute -top-2.5 left-4 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-indigo-600 text-white shadow-xs">
                        Recommended Package
                      </span>
                    )}
                    <div className="space-y-3">
                      <div>
                        <span className="text-[9px] font-black uppercase text-indigo-500 dark:text-indigo-400 tracking-wider block">Growth sweet-spot</span>
                        <h5 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">{packagesDraft.professional.name}</h5>
                      </div>
                      
                      <div className="p-3 bg-indigo-50/20 dark:bg-indigo-950/20 rounded-lg border border-indigo-100/40 dark:border-indigo-900/10">
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 block uppercase tracking-wider">Estimated Pricing</span>
                        <span className="text-sm font-black text-indigo-950 dark:text-indigo-300 mt-1 block">{packagesDraft.professional.estimatedPricing}</span>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Included Services</span>
                        <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400 font-semibold leading-relaxed">
                          {packagesDraft.professional.services.map((svc, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-indigo-600 dark:text-indigo-400 font-extrabold mt-0.5 shrink-0">&bull;</span>
                              <span>{svc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-900">
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Expected Outcomes</span>
                        <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400 font-semibold leading-relaxed">
                          {packagesDraft.professional.expectedOutcomes.map((out, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-emerald-500 font-extrabold shrink-0">✓</span>
                              <span>{out}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Premium Package */}
                  <div className={`p-4 rounded-xl border relative flex flex-col justify-between h-full bg-white dark:bg-slate-950 ${packagesDraft.recommendedPackage === 'Premium' ? 'border-indigo-500 ring-2 ring-indigo-500/10' : 'border-slate-100 dark:border-slate-850 bg-slate-50/10'}`}>
                    {packagesDraft.recommendedPackage === 'Premium' && (
                      <span className="absolute -top-2.5 left-4 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-indigo-600 text-white shadow-xs">
                        Recommended Package
                      </span>
                    )}
                    <div className="space-y-3">
                      <div>
                        <span className="text-[9px] font-black uppercase text-purple-500 tracking-wider block">Enterprise Outperform</span>
                        <h5 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">{packagesDraft.premium.name}</h5>
                      </div>
                      
                      <div className="p-3 bg-purple-50/25 dark:bg-purple-950/20 rounded-lg border border-purple-100/30 dark:border-purple-900/10">
                        <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 block uppercase tracking-wider">Estimated Pricing</span>
                        <span className="text-sm font-black text-purple-950 dark:text-purple-300 mt-1 block">{packagesDraft.premium.estimatedPricing}</span>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Included Services</span>
                        <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400 font-semibold leading-relaxed">
                          {packagesDraft.premium.services.map((svc, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-indigo-600 dark:text-indigo-400 font-extrabold mt-0.5 shrink-0">&bull;</span>
                              <span>{svc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-900">
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Expected Outcomes</span>
                        <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400 font-semibold leading-relaxed">
                          {packagesDraft.premium.expectedOutcomes.map((out, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-emerald-500 font-extrabold shrink-0">✓</span>
                              <span>{out}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-850 pt-2 font-bold">
                  <span>Packages Formulated: {new Date(packagesDraft.generatedAt).toLocaleDateString()}</span>
                  <button 
                    onClick={handleGeneratePackages}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-1"
                    disabled={isGeneratingPackages}
                  >
                    <span>Re-Run Service Pricing Blueprint</span>
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
                onClick={() => setIsAIPitchOpen(true)}
                className="px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all shadow-md shadow-indigo-505 active:scale-97 cursor-pointer shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>Launch AI Pitcher</span>
              </button>
            </div>
          </div>

          {/* Cold Pitch Generator Section */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Mail className="w-4.5 h-4.5 text-indigo-505" />
                <span>Standard Template Outline (Fallback)</span>
              </h4>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={sendQuickEmail}
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 dark:bg-indigo-950 dark:border-indigo-900/50 dark:text-indigo-400 dark:hover:bg-indigo-900 rounded-lg cursor-pointer transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Quick Email</span>
                </button>
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold bg-slate-55 border border-slate-200 hover:bg-slate-100 text-slate-600 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800 dark:text-slate-300 rounded-lg cursor-pointer transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-500 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Template</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="p-4.5 rounded-xl border border-slate-150 bg-slate-950 font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto whitespace-pre-wrap select-all max-h-[180px] border-slate-200 dark:border-slate-850">
              {generatePitchText()}
            </div>
          </div>

        </div>

        {/* Footer controls: Save / Dismiss */}
        <div className="flex items-center justify-between p-6 border-t border-slate-100 bg-slate-55 dark:border-slate-850 dark:bg-slate-950/30 gap-3">
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider hidden sm:block">
            LEADMINE CRM PLANNERS
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
