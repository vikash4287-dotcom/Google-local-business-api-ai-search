import React, { useEffect } from 'react';
import { ArrowLeft, CreditCard } from 'lucide-react';
import PricingSection from './PricingSection';
import { UserSubscription } from '../types';
import Breadcrumbs from './Breadcrumbs';

interface PricingPageProps {
  subscription: UserSubscription;
  onSubscriptionUpdate: (updated: UserSubscription) => void;
  onBackToHome: () => void;
  onNavigate?: (path: string) => void;
}

export default function PricingPage({ subscription, onSubscriptionUpdate, onBackToHome, onNavigate }: PricingPageProps) {
  // Update SEO Metadata dynamically
  useEffect(() => {
    const prevTitle = document.title;
    const prevMetaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content');

    document.title = "Plans & Subscriptions | LocalShopAI — Pricing for Growth Agencies";
    
    let descMeta = document.querySelector('meta[name="description"]');
    if (!descMeta) {
      descMeta = document.createElement('meta');
      descMeta.setAttribute('name', 'description');
      document.head.appendChild(descMeta);
    }
    descMeta.setAttribute('content', 'Explore LocalShopAI subscription plans tailored for freelancers, web developers, SEO consultants, and marketing agencies. Choose the perfect tier for local client prospecting.');

    // Canonical tag update
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', 'https://localshopai.com/pricing');

    // Scroll to top
    window.scrollTo(0, 0);

    return () => {
      document.title = prevTitle;
      if (prevMetaDesc) {
        descMeta?.setAttribute('content', prevMetaDesc);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <Breadcrumbs onNavigate={onNavigate} />

        {/* Back navigation */}
        <button
          onClick={onBackToHome}
          className="mb-8 inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Lead Discovery</span>
        </button>

        {/* Header Hero Section */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-100 dark:border-slate-850 bg-gradient-to-br from-indigo-50/20 via-white to-indigo-50/5 dark:from-indigo-950/10 dark:via-slate-950/40 dark:to-slate-950/60 p-8 sm:p-12 mb-10 text-center shadow-xs">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 tracking-wider inline-block border border-indigo-100/30 dark:border-indigo-900/40">
              Agency Growth Plans
            </span>
            <h1 className="text-3xl sm:text-4.5xl font-black tracking-tight text-slate-900 dark:text-white font-sans">
              Simple, transparent pricing
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-350 font-medium leading-relaxed max-w-xl mx-auto">
              Choose the level that matches your client prospecting needs. Scale your outbound outreach with professional lead intelligence data.
            </p>
          </div>
        </div>

        {/* Embedded Pricing Section Component */}
        <div className="bg-white border border-slate-150 rounded-2xl dark:bg-slate-950 dark:border-slate-850 shadow-xs p-2 sm:p-6 lg:p-8">
          <PricingSection subscription={subscription} onSubscriptionUpdate={onSubscriptionUpdate} />
        </div>

      </div>
    </div>
  );
}
