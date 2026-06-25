import React, { useEffect, useState } from 'react';
import { Shield, Mail, Globe, ArrowRight, BookOpen, Menu, X, ArrowLeft } from 'lucide-react';

interface PrivacyPolicyProps {
  onBackToHome: () => void;
}

export default function PrivacyPolicy({ onBackToHome }: PrivacyPolicyProps) {
  const [activeSection, setActiveSection] = useState<string>('');

  // Update SEO Metadata dynamically
  useEffect(() => {
    // Save previous SEO values
    const prevTitle = document.title;
    const prevMetaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content');

    // Update Title and Metas
    document.title = "Privacy Policy | LocalShopAI — Safe & Compliant Local Lead Discovery";
    
    let descMeta = document.querySelector('meta[name="description"]');
    if (!descMeta) {
      descMeta = document.createElement('meta');
      descMeta.setAttribute('name', 'description');
      document.head.appendChild(descMeta);
    }
    descMeta.setAttribute('content', 'Learn how LocalShopAI collects, uses, stores, and protects your information when you use our website and lead discovery platform.');

    // Add OG tags dynamically
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute('content', 'Privacy Policy | LocalShopAI');

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) {
      ogDesc = document.createElement('meta');
      ogDesc.setAttribute('property', 'og:description');
      document.head.appendChild(ogDesc);
    }
    ogDesc.setAttribute('content', 'Learn how LocalShopAI collects, uses, stores, and protects your information when you use our website and lead discovery platform.');

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
    { id: 'section-1', title: '1. Scope of This Policy' },
    { id: 'section-2', title: '2. Information We Collect' },
    { id: 'section-3', title: '3. How We Use Information' },
    { id: 'section-4', title: '4. Cookies & Tracking' },
    { id: 'section-5', title: '5. Analytics & Third-Party' },
    { id: 'section-6', title: '6. Legal Bases' },
    { id: 'section-7', title: '7. How We Share Data' },
    { id: 'section-8', title: '8. Data Retention' },
    { id: 'section-9', title: '9. Data Security' },
    { id: 'section-10', title: '10. International Transfers' },
    { id: 'section-11', title: '11. Your Privacy Rights' },
    { id: 'section-12', title: '12. California Notice' },
    { id: 'section-13', title: '13. Email Communications' },
    { id: 'section-14', title: '14. Children’s Privacy' },
    { id: 'section-15', title: '15. Third-Party Links' },
    { id: 'section-16', title: '16. Changes to Policy' },
    { id: 'section-17', title: '17. Contact Us' }
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
              alt="Data Integrity"
              className="w-full h-full object-cover object-center mix-blend-luminosity select-none"
              referrerPolicy="no-referrer"
            />
          </div>
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 tracking-wider inline-block border border-indigo-100/30 dark:border-indigo-900/40">
              Trust & Security
            </span>
            <h1 id="privacy-title" className="text-3xl sm:text-4.5xl font-black tracking-tight text-slate-900 dark:text-white font-sans">
              Privacy Policy
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-350 font-medium leading-relaxed max-w-xl mx-auto">
              Learn how LocalShopAI collects, uses, stores, and protects your information when you use our website and lead discovery platform.
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

          {/* Right Long-Form Semantic legal-content container (Max width: ~860px) */}
          <article className="lg:col-span-9 max-w-3xl mx-auto bg-white border border-slate-150/80 rounded-2xl dark:bg-slate-950 dark:border-slate-850 shadow-xs p-6 sm:p-10 lg:p-12">
            <div className="prose prose-slate dark:prose-invert max-w-none text-sm sm:text-base text-slate-650 dark:text-slate-300 space-y-8 leading-relaxed font-normal select-text">
              
              <p className="font-semibold text-slate-700 dark:text-slate-200 border-l-4 border-indigo-500 pl-4 py-1 bg-slate-50/50 dark:bg-slate-900/30 rounded-r-xl">
                LocalShopAI (“<strong>LocalShopAI</strong>,” “<strong>we</strong>,” “<strong>us</strong>,” or “<strong>our</strong>”) respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard information when you visit <strong><a href="https://www.localshopai.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline dark:text-indigo-400">www.localshopai.com</a></strong>, use our website, applications, content, communications, and related services (collectively, the “<strong>Services</strong>”).
              </p>
              
              <p>
                By using the Services, you agree to the collection and use of information in accordance with this Privacy Policy.
              </p>

              <hr className="border-slate-100 dark:border-slate-850" />

              {/* SECTION 1 */}
              <section id="section-1" className="space-y-4 pt-4 scroll-mt-24">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-sans tracking-tight">
                  1. Scope of This Privacy Policy
                </h2>
                <p>This Privacy Policy applies to information we collect when you:</p>
                <ul className="list-disc pl-5 space-y-1.5 font-medium">
                  <li>visit or browse our website;</li>
                  <li>create an account with LocalShopAI;</li>
                  <li>use our lead discovery, search, outreach, proposal, or related features;</li>
                  <li>contact us for support, sales, or general inquiries;</li>
                  <li>subscribe to emails, newsletters, waitlists, or product updates; or</li>
                  <li>otherwise interact with our Services.</li>
                </ul>
                <p>
                  This Privacy Policy does not apply to third-party websites, services, or tools that may be linked from our Services or integrated into our platform. Those third parties have their own privacy policies and practices.
                </p>
              </section>

              <hr className="border-slate-100 dark:border-slate-850" />

              {/* SECTION 2 */}
              <section id="section-2" className="space-y-5 pt-4 scroll-mt-24">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-sans tracking-tight">
                  2. Information We Collect
                </h2>
                <p>We may collect the following categories of information:</p>

                <div className="space-y-3">
                  <h3 className="text-base sm:text-lg font-bold text-slate-850 dark:text-slate-100">
                    2.1 Information You Provide Directly
                  </h3>
                  <p>When you use LocalShopAI, you may provide information such as:</p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li>name;</li>
                    <li>email address;</li>
                    <li>company or agency name;</li>
                    <li>billing information and payment-related details (processed by our payment providers);</li>
                    <li>account credentials and profile information;</li>
                    <li>support messages, survey responses, or feedback;</li>
                    <li>business preferences, saved searches, notes, and lead lists you create inside the platform.</li>
                  </ul>
                </div>

                <div className="space-y-3 pt-2">
                  <h3 className="text-base sm:text-lg font-bold text-slate-850 dark:text-slate-100">
                    2.2 Information Collected Automatically
                  </h3>
                  <p>When you use our Services, we may automatically collect certain technical and usage information, including:</p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li>IP address;</li>
                    <li>browser type, device type, and operating system;</li>
                    <li>referral URLs and pages visited;</li>
                    <li>date/time stamps and session activity;</li>
                    <li>clicks, searches, filters used, lead views, exports, and feature usage;</li>
                    <li>approximate location derived from IP address;</li>
                    <li>cookies, pixels, and similar tracking technologies.</li>
                  </ul>
                </div>

                <div className="space-y-3 pt-2">
                  <h3 className="text-base sm:text-lg font-bold text-slate-850 dark:text-slate-100">
                    2.3 Information from Third Parties
                  </h3>
                  <p>We may receive information from third-party providers and integrations, including analytics, authentication, payments, infrastructure, and business data providers. This may include:</p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li>login or identity data from authentication providers;</li>
                    <li>payment confirmation and billing metadata from payment processors;</li>
                    <li>website analytics and product usage data from analytics tools;</li>
                    <li>publicly available business listing or business-profile information obtained from third-party data sources, maps providers, directories, or publicly available web sources.</li>
                  </ul>
                </div>

                <div className="space-y-3 pt-2">
                  <h3 className="text-base sm:text-lg font-bold text-slate-850 dark:text-slate-100">
                    2.4 Business Listing and Public Data
                  </h3>
                  <p>
                    LocalShopAI may display, analyze, or process publicly available business information such as business names, addresses, phone numbers, ratings, review counts, websites, or other public-facing business details sourced from public web pages, listings, or third-party providers. We do not claim ownership over such third-party business data.
                  </p>
                </div>
              </section>

              <hr className="border-slate-100 dark:border-slate-850" />

              {/* SECTION 3 */}
              <section id="section-3" className="space-y-4 pt-4 scroll-mt-24">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-sans tracking-tight">
                  3. How We Use Information
                </h2>
                <p>We use personal information and usage data to operate, maintain, and improve LocalShopAI, including to:</p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>create and manage user accounts;</li>
                  <li>provide lead discovery, filtering, scoring, outreach, proposal, and related features;</li>
                  <li>personalize user experience and improve relevance of results;</li>
                  <li>communicate with you about your account, product updates, support issues, and administrative notices;</li>
                  <li>send marketing emails, newsletters, or promotional communications where permitted by law;</li>
                  <li>process transactions, subscriptions, and billing;</li>
                  <li>monitor usage, troubleshoot issues, prevent fraud, and improve product performance;</li>
                  <li>analyze trends, feature adoption, and product effectiveness;</li>
                  <li>enforce our Terms of Service and protect the security and integrity of the Services;</li>
                  <li>comply with legal obligations, respond to lawful requests, and protect our rights.</li>
                </ul>
              </section>

              <hr className="border-slate-100 dark:border-slate-850" />

              {/* SECTION 4 */}
              <section id="section-4" className="space-y-4 pt-4 scroll-mt-24">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-sans tracking-tight">
                  4. Cookies and Tracking Technologies
                </h2>
                <p>
                  We use cookies and similar technologies to operate our Services, understand usage, improve performance, and support analytics and marketing.
                </p>
                <p>These technologies may be used to:</p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>keep you signed in;</li>
                  <li>remember preferences and settings;</li>
                  <li>analyze traffic and feature usage;</li>
                  <li>measure campaign performance and conversions;</li>
                  <li>improve site performance and user experience.</li>
                </ul>
                <p>
                  Depending on your location, you may have the ability to manage cookie preferences through your browser settings or through any cookie consent mechanism we make available.
                </p>
              </section>

              <hr className="border-slate-100 dark:border-slate-850" />

              {/* SECTION 5 */}
              <section id="section-5" className="space-y-4 pt-4 scroll-mt-24">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-sans tracking-tight">
                  5. Analytics, Advertising, and Third-Party Tools
                </h2>
                <p>
                  We may use third-party service providers to help operate and improve LocalShopAI. Depending on the tools we use, these may include services for:
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>website and product analytics;</li>
                  <li>session recordings, heatmaps, and user behavior analytics;</li>
                  <li>payment processing and subscription management;</li>
                  <li>cloud hosting, authentication, databases, email delivery, and customer support;</li>
                  <li>marketing attribution, advertising, or performance measurement.</li>
                </ul>
                <p>
                  Examples include hosting providers, database providers, payment processors, and analytics providers such as Google Analytics, Firebase, and Lemon Squeezy or Stripe.
                </p>
                <p>
                  These third parties may collect information in accordance with their own privacy policies and applicable agreements with us.
                </p>
              </section>

              <hr className="border-slate-100 dark:border-slate-850" />

              {/* SECTION 6 */}
              <section id="section-6" className="space-y-4 pt-4 scroll-mt-24">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-sans tracking-tight">
                  6. Legal Bases for Processing (Where Applicable)
                </h2>
                <p>
                  If you are located in a jurisdiction that requires a legal basis for processing personal data, such as the European Economic Area, the United Kingdom, or similar regions, we may process your information based on one or more of the following legal grounds:
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>performance of a contract with you;</li>
                  <li>our legitimate interests in operating, improving, and securing the Services;</li>
                  <li>your consent, where required;</li>
                  <li>compliance with legal obligations;</li>
                  <li>protection against fraud, abuse, or unlawful activity.</li>
                </ul>
              </section>

              <hr className="border-slate-100 dark:border-slate-850" />

              {/* SECTION 7 */}
              <section id="section-7" className="space-y-4 pt-4 scroll-mt-24">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-sans tracking-tight">
                  7. How We Share Information
                </h2>
                <p>We do not sell your personal information. We may share information in the following circumstances:</p>
                
                <div className="space-y-2 pl-4 border-l-2 border-slate-100 dark:border-slate-800">
                  <p className="font-bold text-slate-850 dark:text-slate-100">7.1 Service Providers</p>
                  <p>We may share information with vendors and service providers who help us operate LocalShopAI, such as hosting providers, analytics providers, payment processors, authentication providers, email tools, and support platforms.</p>
                </div>

                <div className="space-y-2 pl-4 border-l-2 border-slate-100 dark:border-slate-800">
                  <p className="font-bold text-slate-850 dark:text-slate-100">7.2 Business Transfers</p>
                  <p>If LocalShopAI is involved in a merger, acquisition, financing, asset sale, or similar transaction, your information may be transferred as part of that transaction.</p>
                </div>

                <div className="space-y-2 pl-4 border-l-2 border-slate-100 dark:border-slate-800">
                  <p className="font-bold text-slate-850 dark:text-slate-100">7.3 Legal Compliance and Protection</p>
                  <p>We may disclose information if we believe it is necessary to comply with applicable law, regulation, legal process, or governmental request; enforce our agreements; detect and prevent fraud or security incidents; and protect the rights or safety of LocalShopAI, our users, or others.</p>
                </div>

                <div className="space-y-2 pl-4 border-l-2 border-slate-100 dark:border-slate-800">
                  <p className="font-bold text-slate-850 dark:text-slate-100">7.4 With Your Direction</p>
                  <p>We may share information where you instruct us to do so or where sharing is necessary to provide a feature you request.</p>
                </div>
              </section>

              <hr className="border-slate-100 dark:border-slate-850" />

              {/* SECTION 8 */}
              <section id="section-8" className="space-y-4 pt-4 scroll-mt-24">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-sans tracking-tight">
                  8. Data Retention
                </h2>
                <p>We retain personal information for as long as reasonably necessary to:</p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>provide the Services;</li>
                  <li>maintain your account;</li>
                  <li>comply with legal, tax, accounting, or reporting obligations;</li>
                  <li>resolve disputes and enforce agreements;</li>
                  <li>maintain legitimate business records and security logs.</li>
                </ul>
                <p>
                  If you request deletion of your account, we will take reasonable steps to delete or anonymize your personal information, subject to our legal obligations and legitimate retention needs.
                </p>
              </section>

              <hr className="border-slate-100 dark:border-slate-850" />

              {/* SECTION 9 */}
              <section id="section-9" className="space-y-4 pt-4 scroll-mt-24">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-sans tracking-tight">
                  9. Data Security
                </h2>
                <p>
                  We use reasonable administrative, technical, and organizational safeguards designed to protect personal information from unauthorized access, disclosure, alteration, or destruction. However, no method of transmission over the internet or method of storage is completely secure, and we cannot guarantee absolute security.
                </p>
                <p>
                  You are responsible for maintaining the confidentiality of your account credentials and for promptly notifying us of any suspected unauthorized use of your account.
                </p>
              </section>

              <hr className="border-slate-100 dark:border-slate-850" />

              {/* SECTION 10 */}
              <section id="section-10" className="space-y-4 pt-4 scroll-mt-24">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-sans tracking-tight">
                  10. International Data Transfers
                </h2>
                <p>
                  LocalShopAI may be operated from and supported by service providers located in multiple countries. As a result, your information may be transferred to, stored in, and processed in countries other than the one in which you reside.
                </p>
                <p>
                  Where required by applicable law, we will take appropriate measures to safeguard cross-border transfers of personal information.
                </p>
              </section>

              <hr className="border-slate-100 dark:border-slate-850" />

              {/* SECTION 11 */}
              <section id="section-11" className="space-y-4 pt-4 scroll-mt-24">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-sans tracking-tight">
                  11. Your Privacy Rights
                </h2>
                <p>Depending on your location and applicable law, you may have rights regarding your personal information, including the right to:</p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>access the personal information we hold about you;</li>
                  <li>request correction of inaccurate or incomplete information;</li>
                  <li>request deletion of your information;</li>
                  <li>object to or restrict certain processing;</li>
                  <li>withdraw consent where processing is based on consent;</li>
                  <li>request a copy of certain data in a portable format;</li>
                  <li>opt out of certain marketing communications.</li>
                </ul>
                <p>
                  To exercise these rights, contact us at <strong><a href="mailto:support@localshopai.com" className="text-indigo-600 hover:underline dark:text-indigo-400">support@localshopai.com</a></strong> or <strong><a href="mailto:hello@localshopai.com" className="text-indigo-600 hover:underline dark:text-indigo-400">hello@localshopai.com</a></strong>. We may need to verify your identity before processing certain requests.
                </p>
              </section>

              <hr className="border-slate-100 dark:border-slate-850" />

              {/* SECTION 12 */}
              <section id="section-12" className="space-y-4 pt-4 scroll-mt-24">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-sans tracking-tight">
                  12. California Privacy Notice
                </h2>
                <p>
                  If you are a California resident, you may have certain rights under California privacy laws, including rights to know, delete, correct, and limit certain uses of personal information, subject to applicable exceptions.
                </p>
                <p>
                  You may contact us at <strong><a href="mailto:support@localshopai.com" className="text-indigo-600 hover:underline dark:text-indigo-400">support@localshopai.com</a></strong> to submit a privacy request. We will not discriminate against you for exercising applicable privacy rights.
                </p>
              </section>

              <hr className="border-slate-100 dark:border-slate-850" />

              {/* SECTION 13 */}
              <section id="section-13" className="space-y-4 pt-4 scroll-mt-24">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-sans tracking-tight">
                  13. Email Communications and Marketing
                </h2>
                <p>
                  We may send service-related emails such as account confirmations, security alerts, billing notices, and support messages. We may also send promotional emails, product updates, or newsletters where permitted by law.
                </p>
                <p>
                  You can opt out of promotional emails at any time by clicking the unsubscribe link in the email or contacting us at <strong><a href="mailto:support@localshopai.com" className="text-indigo-600 hover:underline dark:text-indigo-400">support@localshopai.com</a></strong>. Even if you opt out of marketing communications, we may still send essential service-related messages.
                </p>
              </section>

              <hr className="border-slate-100 dark:border-slate-850" />

              {/* SECTION 14 */}
              <section id="section-14" className="space-y-4 pt-4 scroll-mt-24">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-sans tracking-tight">
                  14. Children’s Privacy
                </h2>
                <p>
                  LocalShopAI is not directed to children under the age of 13 (or the minimum age required in your jurisdiction), and we do not knowingly collect personal information from children. If you believe a child has provided personal information to us, please contact us so we can take appropriate action.
                </p>
              </section>

              <hr className="border-slate-100 dark:border-slate-850" />

              {/* SECTION 15 */}
              <section id="section-15" className="space-y-4 pt-4 scroll-mt-24">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-sans tracking-tight">
                  15. Third-Party Links and Integrations
                </h2>
                <p>
                  Our Services may contain links to third-party websites, tools, integrations, or services. We are not responsible for the privacy practices, content, or security of third parties. We encourage you to review their privacy policies before sharing information with them.
                </p>
              </section>

              <hr className="border-slate-100 dark:border-slate-850" />

              {/* SECTION 16 */}
              <section id="section-16" className="space-y-4 pt-4 scroll-mt-24">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-sans tracking-tight">
                  16. Changes to This Privacy Policy
                </h2>
                <p>
                  We may update this Privacy Policy from time to time to reflect changes in our Services, legal requirements, or business practices. When we make material changes, we will update the “Last updated” date at the top of this page and, where appropriate, provide additional notice.
                </p>
                <p>
                  Your continued use of the Services after changes become effective means you accept the updated Privacy Policy.
                </p>
              </section>

              <hr className="border-slate-100 dark:border-slate-850" />

              {/* SECTION 17 */}
              <section id="section-17" className="space-y-5 pt-4 scroll-mt-24">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-sans tracking-tight">
                  17. Contact Us
                </h2>
                <p>If you have any questions, concerns, or requests regarding this Privacy Policy, please contact us:</p>
                
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
