import React, { useEffect, useState } from 'react';
import { Mail, Globe, ArrowLeft, MessageSquare, Send, CheckCircle, Clock } from 'lucide-react';
import Breadcrumbs from './Breadcrumbs';

interface ContactPageProps {
  onBackToHome: () => void;
  onNavigate?: (path: string) => void;
}

export default function ContactPage({ onBackToHome, onNavigate }: ContactPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    agency: '',
    subject: 'General Inquiry',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Update SEO Metadata dynamically
  useEffect(() => {
    const prevTitle = document.title;
    const prevMetaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content');

    document.title = "Contact Us & Sales | LocalShopAI — B2B Lead Generation Partner";
    
    let descMeta = document.querySelector('meta[name="description"]');
    if (!descMeta) {
      descMeta = document.createElement('meta');
      descMeta.setAttribute('name', 'description');
      document.head.appendChild(descMeta);
    }
    descMeta.setAttribute('content', 'Get in touch with the LocalShopAI team. Whether you have sales questions, support requests, or partnership inquiries, we are here to help.');

    // Canonical tag update
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', 'https://localshopai.com/contact');

    // Scroll to top
    window.scrollTo(0, 0);

    return () => {
      document.title = prevTitle;
      if (prevMetaDesc) {
        descMeta?.setAttribute('content', prevMetaDesc);
      }
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API request
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormData({
        name: '',
        email: '',
        agency: '',
        subject: 'General Inquiry',
        message: ''
      });
    }, 1200);
  };

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
              Connect With Us
            </span>
            <h1 className="text-3xl sm:text-4.5xl font-black tracking-tight text-slate-900 dark:text-white font-sans">
              Contact LocalShopAI
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-350 font-medium leading-relaxed max-w-xl mx-auto">
              Have questions about our local business lead finder, custom website audits, or agency scaling plans? We would love to hear from you.
            </p>
          </div>
        </div>

        {/* Two-Column Form and Info layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Contact Cards & Info */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 bg-white border border-slate-150 rounded-2xl dark:bg-slate-950 dark:border-slate-850 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Direct Contacts</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                Our support and sales channels are open Monday through Friday, 9:00 AM – 6:00 PM EST.
              </p>
              
              <div className="space-y-4 pt-2">
                <div className="space-y-1">
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Support Desk</span>
                  <a href="mailto:support@localshopai.com" className="text-indigo-650 hover:underline dark:text-indigo-400 flex items-center gap-1.5 text-xs sm:text-sm font-semibold">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>support@localshopai.com</span>
                  </a>
                </div>
                
                <div className="space-y-1">
                  <span className="block text-[10px] uppercase font-bold text-slate-400">General Inquiries</span>
                  <a href="mailto:hello@localshopai.com" className="text-indigo-650 hover:underline dark:text-indigo-400 flex items-center gap-1.5 text-xs sm:text-sm font-semibold">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>hello@localshopai.com</span>
                  </a>
                </div>

                <div className="space-y-1">
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Official Portal</span>
                  <a href="https://localshopai.com" target="_blank" rel="noopener noreferrer" className="text-indigo-650 hover:underline dark:text-indigo-400 flex items-center gap-1.5 text-xs sm:text-sm font-semibold">
                    <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>https://localshopai.com</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="p-6 bg-indigo-600/5 border border-indigo-100 dark:border-indigo-950 rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <Clock className="w-4 h-4 shrink-0" />
                <h4 className="text-xs font-black uppercase tracking-wider">Fast Turnarounds</h4>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-semibold">
                SEO agencies, consultants, and developers receive priority replies. We typically respond to support tickets within 4 to 12 hours.
              </p>
            </div>
          </div>

          {/* Right Column: Beautiful Contact Form */}
          <div className="lg:col-span-8 bg-white border border-slate-150 rounded-2xl dark:bg-slate-950 dark:border-slate-850 shadow-xs p-6 sm:p-8">
            {isSuccess ? (
              <div className="text-center py-12 space-y-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">Message Dispatched!</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-semibold leading-relaxed">
                  Thank you for reaching out. A LocalShopAI growth specialist has been notified and will contact you back shortly.
                </p>
                <button
                  onClick={() => setIsSuccess(false)}
                  className="mt-4 px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-850 dark:text-slate-300 pb-3 border-b border-slate-100 dark:border-slate-850">
                  <MessageSquare className="w-4 h-4 text-indigo-500" />
                  <span>Send a secure message</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="jane@agency.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Agency / Company Name</label>
                    <input
                      type="text"
                      placeholder="Peak Flow SEO"
                      value={formData.agency}
                      onChange={(e) => setFormData({ ...formData, agency: e.target.value })}
                      className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Inquiry Subject</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Enterprise Billing">Enterprise Sales / Upgrades</option>
                      <option value="Technical Support">Technical Support</option>
                      <option value="Partnership">Agency Partnerships</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Your Message *</label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Describe your inquiry in detail..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-xs shadow-indigo-600/10"
                >
                  <Send className="w-3.5 h-3.5 shrink-0" />
                  <span>{isSubmitting ? 'Sending...' : 'Transmit Message'}</span>
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
