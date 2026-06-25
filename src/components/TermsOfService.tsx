import React, { useEffect, useState } from 'react';
import { FileText, Mail, Globe, BookOpen, ArrowLeft } from 'lucide-react';

interface TermsOfServiceProps {
  onBackToHome: () => void;
}

export default function TermsOfService({ onBackToHome }: TermsOfServiceProps) {
  const [activeSection, setActiveSection] = useState<string>('');

  // Update SEO Metadata dynamically
  useEffect(() => {
    // Save previous SEO values
    const prevTitle = document.title;
    const prevMetaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content');

    // Update Title and Metas
    document.title = "Terms of Service | LocalShopAI — Usage Rules & Agreement";
    
    let descMeta = document.querySelector('meta[name="description"]');
    if (!descMeta) {
      descMeta = document.createElement('meta');
      descMeta.setAttribute('name', 'description');
      document.head.appendChild(descMeta);
    }
    descMeta.setAttribute('content', 'These Terms of Service explain the rules, rights, and responsibilities that apply when you access or use LocalShopAI.');

    // Add OG tags dynamically
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute('content', 'Terms of Service | LocalShopAI');

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) {
      ogDesc = document.createElement('meta');
      ogDesc.setAttribute('property', 'og:description');
      document.head.appendChild(ogDesc);
    }
    ogDesc.setAttribute('content', 'These Terms of Service explain the rules, rights, and responsibilities that apply when you access or use LocalShopAI.');

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', window.location.href);

    // Scroll to top
    window.scrollTo(0, 0);

    return () => {
      // Restore previous SEO values
      document.title = prevTitle;
      if (prevMetaDesc) {
        descMeta?.setAttribute('content', prevMetaDesc);
      }
    };
  }, []);

  const sections = [
    { id: 'section-1', title: '1. Eligibility & Registration' },
    { id: 'section-2', title: '2. Description of Services' },
    { id: 'section-3', title: '3. License & Permitted Use' },
    { id: 'section-4', title: '4. User Content and Inputs' },
    { id: 'section-5', title: '5. AI & Data Disclaimer' },
    { id: 'section-6', title: '6. Acceptable Use' },
    { id: 'section-7', title: '7. Fees & Subscriptions' },
    { id: 'section-8', title: '8. Refunds and Cancellations' },
    { id: 'section-9', title: '9. Intellectual Property' },
    { id: 'section-10', title: '10. Third-Party Services' },
    { id: 'section-11', title: '11. Service & Beta Features' },
    { id: 'section-12', title: '12. Termination & Suspension' },
    { id: 'section-13', title: '13. Disclaimers' },
    { id: 'section-14', title: '14. Limitation of Liability' },
    { id: 'section-15', title: '15. Indemnification' },
    { id: 'section-16', title: '16. Governing Law' },
    { id: 'section-17', title: '17. Changes to Terms' },
    { id: 'section-18', title: '18. General Provisions' },
    { id: 'section-19', title: '19. Contact Us' }
  ];

  const handleScrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -90; // Fixed header spacing offset
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200 py-6">
      {/* Centered Container wrapper */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back navigation option */}
        <button
          onClick={onBackToHome}
          className="mb-8 inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Lead Discovery</span>
        </button>

        {/* Dynamic Header Hero Section */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-100 dark:border-slate-850 bg-gradient-to-br from-indigo-50/20 via-white to-indigo-50/5 dark:from-indigo-950/10 dark:via-slate-950/40 dark:to-slate-950/60 p-8 sm:p-12 mb-10 text-center shadow-xs">
          <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.06] pointer-events-none select-none">
            <img
              src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop"
              alt="Terms Agreement"
              className="w-full h-full object-cover object-center mix-blend-luminosity select-none"
              referrerPolicy="no-referrer"
            />
          </div>
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 tracking-wider inline-block border border-indigo-100/30 dark:border-indigo-900/40">
              Terms & Conditions
            </span>
            <h1 id="terms-title" className="text-3xl sm:text-4.5xl font-black tracking-tight text-slate-900 dark:text-white font-sans">
              Terms of Service
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-350 font-medium leading-relaxed max-w-xl mx-auto">
              These Terms of Service govern your access to and use of www.localshopai.com and the LocalShopAI platform.
            </p>
            <div className="pt-2 flex items-center justify-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
              <span>Last Updated:</span>
              <span className="text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/40 px-2 py-0.5 rounded">June 25, 2026</span>
            </div>
          </div>
        </div>

        {/* Two-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Desktop Left Sidebar: Sticky Mini Table of Contents */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 p-5 bg-white border border-slate-100 rounded-2xl dark:bg-slate-950 dark:border-slate-850 shadow-xs space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-850 dark:text-slate-300 pb-3 border-b border-slate-100 dark:border-slate-850">
                <BookOpen className="w-4 h-4 text-indigo-500" />
                <span>On This Page</span>
              </div>
              <nav className="flex flex-col gap-1 text-xs">
                {sections.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => handleScrollToSection(sec.id)}
                    className={`text-left py-1.5 px-2.5 rounded-lg font-semibold transition-all cursor-pointer ${
                      activeSection === sec.id
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400'
                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-250 hover:bg-slate-50 dark:hover:bg-slate-900/60'
                    }`}
                  >
                    {sec.title}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Right Long-Form Semantic legal-content container */}
          <article className="lg:col-span-9 max-w-3xl mx-auto bg-white border border-slate-150/80 rounded-2xl dark:bg-slate-950 dark:border-slate-850 shadow-xs p-6 sm:p-10 lg:p-12">
            <div className="prose prose-slate dark:prose-invert max-w-none text-sm sm:text-base text-slate-650 dark:text-slate-300 space-y-8 leading-relaxed font-normal select-text">
              
              <p className="font-semibold text-slate-700 dark:text-slate-200 border-l-4 border-indigo-500 pl-4 py-1 bg-slate-50/50 dark:bg-slate-900/30 rounded-r-xl">
                These Terms of Service (“<strong>Terms</strong>”) govern your access to and use of <strong><a href="https://www.localshopai.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline dark:text-indigo-400">www.localshopai.com</a></strong>, the LocalShopAI platform, and any related products, applications, websites, content, features, and services (collectively, the “<strong>Services</strong>”) provided by LocalShopAI (“<strong>LocalShopAI</strong>,” “<strong>we</strong>,” “<strong>us</strong>,” or “<strong>our</strong>”).
              </p>
              
              <p>
                By accessing or using the Services, creating an account, clicking to accept these Terms, or otherwise using LocalShopAI, you agree to be bound by these Terms. If you do not agree to these Terms, do not use the Services.
              </p>

              <hr className="border-slate-100 dark:border-slate-850" />

              {/* SECTION 1 */}
              <section id="section-1" className="space-y-4 pt-4 scroll-mt-24">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-sans tracking-tight">
                  1. Eligibility and Account Registration
                </h2>
                <p>
                  To use LocalShopAI, you must be at least 18 years old and legally capable of entering into a binding contract.
                </p>
                <p>
                  You may need to create an account to access certain features. You agree to provide accurate, complete, and up-to-date information and to keep your login credentials secure. You are responsible for all activity that occurs under your account.
                </p>
                <p>
                  We may suspend or terminate access if we believe information provided is inaccurate, misleading, fraudulent, or used in violation of these Terms.
                </p>
              </section>

              <hr className="border-slate-100 dark:border-slate-850" />

              {/* SECTION 2 */}
              <section id="section-2" className="space-y-4 pt-4 scroll-mt-24">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-sans tracking-tight">
                  2. Description of Services
                </h2>
                <p>
                  LocalShopAI provides software tools and related features designed to help users discover, analyze, organize, and act on business lead opportunities, including through lead discovery, business analysis, outreach drafting, proposal assistance, and related productivity or AI-enabled features.
                </p>
                <p>
                  LocalShopAI may use third-party data sources, public business information, analytics, and artificial intelligence or automation features to generate insights, suggestions, summaries, outreach drafts, and recommendations. These outputs are provided for informational and productivity purposes only and may not always be complete, accurate, or current.
                </p>
                <p>
                  We may modify, improve, suspend, or discontinue all or part of the Services at any time.
                </p>
              </section>

              <hr className="border-slate-100 dark:border-slate-850" />

              {/* SECTION 3 */}
              <section id="section-3" className="space-y-4 pt-4 scroll-mt-24">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-sans tracking-tight">
                  3. License and Permitted Use
                </h2>
                <p>
                  Subject to your compliance with these Terms, LocalShopAI grants you a limited, non-exclusive, non-transferable, non-sublicensable, revocable license to access and use the Services for your internal business use.
                </p>
                <p>
                  You may use LocalShopAI to discover leads, evaluate businesses, organize prospecting workflows, and generate outreach or proposal drafts, provided that your use complies with applicable laws and these Terms.
                </p>
                <p>You may not:</p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>resell, sublicense, rent, lease, or commercially exploit the Services except as expressly permitted by us;</li>
                  <li>copy, reproduce, modify, reverse engineer, decompile, disassemble, or create derivative works of the Services except as permitted by law;</li>
                  <li>use automated bots, scrapers, or abusive methods to overload, probe, or interfere with the Services;</li>
                  <li>access the Services to build a competing product or benchmark the platform without permission;</li>
                  <li>remove proprietary notices, branding, or copyright information;</li>
                  <li>use the Services in a way that violates applicable laws, privacy rights, anti-spam laws, or intellectual property rights.</li>
                </ul>
              </section>

              <hr className="border-slate-100 dark:border-slate-850" />

              {/* SECTION 4 */}
              <section id="section-4" className="space-y-4 pt-4 scroll-mt-24">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-sans tracking-tight">
                  4. User Content and Inputs
                </h2>
                <p>
                  You may provide information, prompts, notes, saved leads, exports, outreach inputs, feedback, or other content to the Services (“<strong>User Content</strong>”).
                </p>
                <p>
                  You retain ownership of your User Content. However, you grant LocalShopAI a non-exclusive, worldwide, royalty-free license to host, use, reproduce, process, store, and display User Content solely as necessary to operate, maintain, improve, and provide the Services.
                </p>
                <p>You represent and warrant that:</p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>you have the necessary rights to provide User Content to LocalShopAI;</li>
                  <li>your User Content does not violate any law or third-party rights;</li>
                  <li>your User Content does not contain unlawful, defamatory, abusive, or infringing material.</li>
                </ul>
                <p>
                  We may remove or restrict access to User Content that we reasonably believe violates these Terms or creates risk for LocalShopAI or others.
                </p>
              </section>

              <hr className="border-slate-100 dark:border-slate-850" />

              {/* SECTION 5 */}
              <section id="section-5" className="space-y-4 pt-4 scroll-mt-24">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-sans tracking-tight">
                  5. AI-Generated Content and Business Data Disclaimer
                </h2>
                <p>
                  LocalShopAI may generate lead scores, website observations, outreach drafts, business recommendations, proposals, and other AI-assisted outputs. These outputs may rely on public information, third-party data, model-generated text, or automated analysis.
                </p>
                <p>You acknowledge and agree that:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>AI-generated or automated outputs may contain errors, omissions, outdated information, or subjective judgments;</li>
                  <li>lead scores, opportunity scores, website observations, and outreach suggestions are indicative only and are not guarantees of business results;</li>
                  <li>you are solely responsible for reviewing, editing, validating, and approving any outreach, proposal, recommendation, or business decision before using it in the real world;</li>
                  <li>LocalShopAI is not responsible for the content, legality, deliverability, or effectiveness of messages or proposals you send using or based on the Services.</li>
                </ul>
              </section>

              <hr className="border-slate-100 dark:border-slate-850" />

              {/* SECTION 6 */}
              <section id="section-6" className="space-y-4 pt-4 scroll-mt-24">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-sans tracking-tight">
                  6. Acceptable Use and Compliance
                </h2>
                <p>
                  You agree to use the Services responsibly and lawfully. Without limitation, you may not use LocalShopAI to:
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>send unlawful, deceptive, harassing, abusive, or misleading communications;</li>
                  <li>violate anti-spam, consumer protection, privacy, advertising, or solicitation laws;</li>
                  <li>scrape, harvest, or misuse personal information in violation of law;</li>
                  <li>upload malicious code, viruses, or harmful content;</li>
                  <li>interfere with the operation, security, or integrity of the Services;</li>
                  <li>impersonate another person or misrepresent your identity;</li>
                  <li>use the Services for illegal lead generation, fraud, or deceptive business practices.</li>
                </ul>
                <p>
                  If you use LocalShopAI for outreach, you are solely responsible for ensuring your campaigns, emails, and sales practices comply with applicable laws, including anti-spam, marketing, privacy, and solicitation requirements.
                </p>
              </section>

              <hr className="border-slate-100 dark:border-slate-850" />

              {/* SECTION 7 */}
              <section id="section-7" className="space-y-4 pt-4 scroll-mt-24">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-sans tracking-tight">
                  7. Fees, Billing, and Subscriptions
                </h2>
                <p>
                  Certain features of LocalShopAI may be offered on a paid subscription or usage-based basis. By purchasing a paid plan, you agree to pay all fees and applicable taxes associated with your selected plan.
                </p>
                <p>Unless otherwise stated:</p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>subscriptions may renew automatically until canceled;</li>
                  <li>fees are charged in advance on a recurring basis;</li>
                  <li>you authorize us and our payment processors to charge your selected payment method;</li>
                  <li>pricing, features, quotas, and limits may change with reasonable notice.</li>
                </ul>
                <p>
                  You are responsible for providing current billing information and for any taxes, duties, or government charges associated with your purchase.
                </p>
                <p>
                  If payment fails, we may suspend or limit access to paid features until payment is resolved.
                </p>
              </section>

              <hr className="border-slate-100 dark:border-slate-850" />

              {/* SECTION 8 */}
              <section id="section-8" className="space-y-4 pt-4 scroll-mt-24">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-sans tracking-tight">
                  8. Refunds and Cancellations
                </h2>
                <p>
                  Unless otherwise required by law or explicitly stated in writing, subscription fees are generally non-refundable once charged.
                </p>
                <p>
                  You may cancel your subscription at any time, and cancellation will typically take effect at the end of the then-current billing period unless otherwise stated.
                </p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  “Users may request a refund within 14 days of first purchase if they have not materially exceeded plan usage limits.”
                </p>
              </section>

              <hr className="border-slate-100 dark:border-slate-850" />

              {/* SECTION 9 */}
              <section id="section-9" className="space-y-4 pt-4 scroll-mt-24">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-sans tracking-tight">
                  9. Intellectual Property
                </h2>
                <p>
                  The Services, including software, design, text, branding, graphics, workflows, models, interfaces, databases, and related materials, are owned by or licensed to LocalShopAI and are protected by intellectual property laws.
                </p>
                <p>
                  Except for the limited rights expressly granted in these Terms, no rights are granted to you by implication, estoppel, or otherwise.
                </p>
                <p>
                  “LocalShopAI,” related logos, and associated marks are our trademarks or brand assets and may not be used without our prior written consent.
                </p>
              </section>

              <hr className="border-slate-100 dark:border-slate-850" />

              {/* SECTION 10 */}
              <section id="section-10" className="space-y-4 pt-4 scroll-mt-24">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-sans tracking-tight">
                  10. Third-Party Services and Data Sources
                </h2>
                <p>
                  LocalShopAI may rely on or integrate with third-party providers for hosting, authentication, payments, analytics, business data, maps, AI functionality, communications, or other services.
                </p>
                <p>
                  We are not responsible for third-party products, services, websites, business listings, or data sources. Your use of third-party services may be governed by separate terms and privacy policies.
                </p>
                <p>
                  We do not guarantee the completeness, accuracy, legality, availability, or continued access to third-party data or integrations.
                </p>
              </section>

              <hr className="border-slate-100 dark:border-slate-850" />

              {/* SECTION 11 */}
              <section id="section-11" className="space-y-4 pt-4 scroll-mt-24">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-sans tracking-tight">
                  11. Service Availability and Beta Features
                </h2>
                <p>
                  We aim to provide a reliable service, but we do not guarantee uninterrupted, secure, or error-free operation. The Services may occasionally be unavailable due to maintenance, updates, outages, or events beyond our control.
                </p>
                <p>
                  We may label certain features as beta, preview, experimental, or early access. Such features may be incomplete, unstable, or changed or removed at any time without liability.
                </p>
              </section>

              <hr className="border-slate-100 dark:border-slate-850" />

              {/* SECTION 12 */}
              <section id="section-12" className="space-y-4 pt-4 scroll-mt-24">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-sans tracking-tight">
                  12. Termination and Suspension
                </h2>
                <p>
                  We may suspend, restrict, or terminate your access to the Services at any time, with or without notice, if:
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>you violate these Terms;</li>
                  <li>you misuse the Services or create risk for us or others;</li>
                  <li>we suspect fraud, abuse, unlawful conduct, or payment issues;</li>
                  <li>we are required to do so by law.</li>
                </ul>
                <p>
                  You may stop using the Services at any time and may request account deletion by contacting us.
                </p>
                <p>
                  Upon termination, your right to access the Services will cease immediately, but provisions of these Terms that by their nature should survive termination will remain in effect.
                </p>
              </section>

              <hr className="border-slate-100 dark:border-slate-850" />

              {/* SECTION 13 */}
              <section id="section-13" className="space-y-4 pt-4 scroll-mt-24">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-sans tracking-tight">
                  13. Disclaimers
                </h2>
                <p className="font-bold italic uppercase">
                  THE SERVICES ARE PROVIDED ON AN “AS IS” AND “AS AVAILABLE” BASIS.
                </p>
                <p>
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, LOCALSHOPAI DISCLAIMS ALL WARRANTIES, EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, NON-INFRINGEMENT, AND ANY WARRANTIES ARISING FROM COURSE OF DEALING OR USAGE OF TRADE.
                </p>
                <p>
                  WITHOUT LIMITING THE FOREGOING, LOCALSHOPAI DOES NOT WARRANT THAT:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>THE SERVICES WILL BE UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE;</li>
                  <li>ANY DATA, RESULTS, SCORES, OR AI OUTPUTS WILL BE ACCURATE, COMPLETE, OR RELIABLE;</li>
                  <li>THE SERVICES WILL RESULT IN LEADS, REVENUE, CLIENTS, OR BUSINESS OUTCOMES;</li>
                  <li>ANY DEFECTS OR ERRORS WILL BE CORRECTED.</li>
                </ul>
              </section>

              <hr className="border-slate-100 dark:border-slate-850" />

              {/* SECTION 14 */}
              <section id="section-14" className="space-y-4 pt-4 scroll-mt-24">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-sans tracking-tight">
                  14. Limitation of Liability
                </h2>
                <p className="uppercase font-bold">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, LOCALSHOPAI AND ITS FOUNDERS, AFFILIATES, LICENSORS, SERVICE PROVIDERS, AND PARTNERS WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, REVENUE, GOODWILL, DATA, BUSINESS OPPORTUNITY, OR OTHER INTANGIBLE LOSSES ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICES.
                </p>
                <p>
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, LOCALSHOPAI’S TOTAL AGGREGATE LIABILITY FOR ALL CLAIMS ARISING OUT OF OR RELATING TO THE SERVICES OR THESE TERMS WILL NOT EXCEED THE GREATER OF:
                </p>
                <ol className="list-decimal pl-5 space-y-1 font-semibold">
                  <li>THE AMOUNT YOU PAID TO LOCALSHOPAI FOR THE SERVICES IN THE 12 MONTHS BEFORE THE EVENT GIVING RISE TO THE CLAIM; OR</li>
                  <li>USD $100.</li>
                </ol>
                <p>
                  Some jurisdictions do not allow certain limitations of liability, so some of the above limitations may not apply to you.
                </p>
              </section>

              <hr className="border-slate-100 dark:border-slate-850" />

              {/* SECTION 15 */}
              <section id="section-15" className="space-y-4 pt-4 scroll-mt-24">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-sans tracking-tight">
                  15. Indemnification
                </h2>
                <p>
                  You agree to defend, indemnify, and hold harmless LocalShopAI and its affiliates, founders, officers, service providers, and partners from and against any claims, liabilities, damages, losses, costs, and expenses (including reasonable legal fees) arising out of or related to:
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>your use of the Services;</li>
                  <li>your User Content;</li>
                  <li>your violation of these Terms;</li>
                  <li>your violation of applicable laws or third-party rights;</li>
                  <li>any outreach, campaign, message, or proposal you send using or based on the Services.</li>
                </ul>
              </section>

              <hr className="border-slate-100 dark:border-slate-850" />

              {/* SECTION 16 */}
              <section id="section-16" className="space-y-4 pt-4 scroll-mt-24">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-sans tracking-tight">
                  16. Governing Law and Dispute Resolution
                </h2>
                <p>
                  These Terms are governed by and construed in accordance with the laws of the <strong>State of Washington, United States</strong>, without regard to conflict of law principles.
                </p>
                <p>
                  Any dispute arising out of or relating to these Terms or the Services will be subject to the exclusive jurisdiction of the courts located in <strong>Seattle, Washington, United States</strong>, unless applicable law requires otherwise.
                </p>
              </section>

              <hr className="border-slate-100 dark:border-slate-850" />

              {/* SECTION 17 */}
              <section id="section-17" className="space-y-4 pt-4 scroll-mt-24">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-sans tracking-tight">
                  17. Changes to the Services or Terms
                </h2>
                <p>
                  We may modify the Services and these Terms from time to time. If we make material changes, we may provide notice by posting the updated Terms on our website, updating the “Last updated” date, emailing users, or providing in-product notice where appropriate.
                </p>
                <p>
                  Your continued use of the Services after the updated Terms become effective constitutes acceptance of the revised Terms.
                </p>
              </section>

              <hr className="border-slate-100 dark:border-slate-850" />

              {/* SECTION 18 */}
              <section id="section-18" className="space-y-4 pt-4 scroll-mt-24">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-sans tracking-tight">
                  18. General Provisions
                </h2>
                <p>
                  If any provision of these Terms is held invalid or unenforceable, the remaining provisions will remain in full force and effect.
                </p>
                <p>
                  Our failure to enforce any provision of these Terms is not a waiver of that provision or any other rights.
                </p>
                <p>
                  You may not assign or transfer these Terms without our prior written consent. We may assign these Terms in connection with a merger, acquisition, reorganization, or sale of assets.
                </p>
                <p>
                  These Terms, together with our Privacy Policy and any additional policies or plan-specific terms we provide, constitute the entire agreement between you and LocalShopAI regarding the Services.
                </p>
              </section>

              <hr className="border-slate-100 dark:border-slate-850" />

              {/* SECTION 19 */}
              <section id="section-19" className="space-y-5 pt-4 scroll-mt-24">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-sans tracking-tight">
                  19. Contact Us
                </h2>
                <p>If you have any questions, concerns, or requests regarding these Terms of Service, please contact us:</p>
                
                {/* Contact block container */}
                <div className="mt-6 p-6 border border-slate-150 rounded-2xl dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/30 space-y-3.5">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span className="text-sm font-black text-slate-900 dark:text-white">LocalShopAI</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm font-semibold">
                    <div className="space-y-1">
                      <span className="block text-[10px] uppercase font-bold text-slate-400">Email Inquiries</span>
                      <a href="mailto:hello@localshopai.com" className="text-indigo-650 hover:underline dark:text-indigo-400 flex items-center gap-1.5">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span>hello@localshopai.com</span>
                      </a>
                    </div>
                    <div className="space-y-1">
                      <span className="block text-[10px] uppercase font-bold text-slate-400">Support Desk</span>
                      <a href="mailto:support@localshopai.com" className="text-indigo-650 hover:underline dark:text-indigo-400 flex items-center gap-1.5">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span>support@localshopai.com</span>
                      </a>
                    </div>
                    <div className="space-y-1 sm:col-span-2 pt-2 border-t border-dashed border-slate-150 dark:border-slate-800">
                      <span className="block text-[10px] uppercase font-bold text-slate-400">Official Portal</span>
                      <a href="https://www.localshopai.com" target="_blank" rel="noopener noreferrer" className="text-indigo-650 hover:underline dark:text-indigo-400 flex items-center gap-1.5">
                        <Globe className="w-4 h-4 text-slate-400" />
                        <span>https://www.localshopai.com</span>
                      </a>
                    </div>
                  </div>
                </div>
              </section>

            </div>
          </article>

        </div>
      </div>
    </div>
  );
}
