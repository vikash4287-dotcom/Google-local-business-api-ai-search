import React from 'react';
import { Sparkles, FileText, Shield, Info, X, HelpCircle, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ConnectionsPanel from './ConnectionsPanel';

interface FooterProps {
  activeModal: 'privacy' | 'terms' | 'about' | 'info' | null;
  setActiveModal: (modal: 'privacy' | 'terms' | 'about' | 'info' | null) => void;
  googleMapsStatus: {
    hasKey: boolean;
    keyPlaceholder: string;
  };
  firebaseConnected: boolean;
}

export default function Footer({ activeModal, setActiveModal, googleMapsStatus, firebaseConnected }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <>
      <footer className="mt-12 border-t border-slate-200 dark:border-slate-850 bg-white/70 dark:bg-slate-950/20 backdrop-blur-md py-10 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
          
          {/* Brand Column */}
          <div className="space-y-4 max-w-sm">
            <div className="flex items-center space-x-2.5">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-600 text-white shadow-sm shadow-indigo-600/10">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-50">
                LeadMine <span className="text-indigo-600 dark:text-indigo-400">AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              Leading local lead visualizer and conversion SaaS. Instantly scan local markets, identify business website deficiencies, and secure high-value contracts.
            </p>
          </div>

          {/* Links Column Group */}
          <div className="grid grid-cols-2 gap-8 md:gap-14">
            {/* About Group */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-850 dark:text-slate-305">Company</h4>
              <ul className="space-y-2 text-xs font-semibold">
                <li>
                  <button
                    onClick={() => setActiveModal('about')}
                    className="text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5 cursor-pointer text-left"
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span>About Us</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveModal('info')}
                    className="text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5 cursor-pointer text-left"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>More Info</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Legal Group */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-850 dark:text-slate-305">Legal & trust</h4>
              <ul className="space-y-2 text-xs font-semibold">
                <li>
                  <button
                    onClick={() => setActiveModal('privacy')}
                    className="text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5 cursor-pointer text-left"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Privacy Policy</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveModal('terms')}
                    className="text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5 cursor-pointer text-left"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Terms of Service</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-150 dark:border-slate-850/60 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-slate-450 dark:text-slate-500 font-semibold">
          <p>© {currentYear} LeadMine AI. All rights registered globally.</p>
          <div className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse mr-1" />
            <span>App Instance: Active Platform Hub</span>
          </div>
        </div>
      </footer>

      {/* Elegant Modal Overlays inside AnimatePresence */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            {/* Backdrop blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              id="modal-backdrop"
            />

            {/* Modal Body container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
              className={`relative w-full max-h-[85vh] overflow-y-auto bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-5 select-text transition-all duration-300 ${activeModal === 'info' ? 'max-w-4xl' : 'max-w-xl'}`}
              id="footer-modal-content"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveModal(null)}
                className="absolute right-4 top-4 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer transition-colors"
                title="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>

              {/* MODAL 1: PRIVACY POLICY */}
              {activeModal === 'privacy' && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 pb-3 border-b border-slate-100 dark:border-slate-850">
                    <span className="p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400">
                      <Shield className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-slate-50">Privacy Integrity Commitment</h3>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Effective: June 23, 2026</p>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-350 space-y-3.5 leading-relaxed font-semibold">
                    <p className="font-medium">
                      At <strong>LeadMine AI</strong>, we prioritize structural data safety. This Privacy Policy clarifies how we index, locate, and coordinate geographic business records displayed on client dashboards.
                    </p>
                    
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-slate-850 dark:text-slate-202 text-[13px]">1. Information Aggregated</h4>
                      <p className="font-medium text-slate-500 dark:text-slate-400">
                        We operate purely over public Business Profiles and directory metrics (such as rating parameters, business domain registration existence, address, category tags, and approximate geographical coordinate pairs). No confidential personal identity information is recorded or stored.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-extrabold text-slate-850 dark:text-slate-202 text-[13px]">2. Cloud Services & Security</h4>
                      <p className="font-medium text-slate-500 dark:text-slate-400">
                        All user configurations, bookmarks, outreach progress status values, and personalized speech/email pitches are persisted securely on Firebase Firestore DB instances. Your direct credentials remain enclosed inside local browser sandbox frames.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-extrabold text-slate-850 dark:text-slate-202 text-[13px]">3. Third-party Providers</h4>
                      <p className="font-medium text-slate-500 dark:text-slate-400">
                        Our Google Maps visualization queries are proxied natively using the client keys provided inside your local integrations manager. No credentials flow into external servers outside your secure active execution boundary.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* MODAL 2: TERMS OF SERVICE */}
              {activeModal === 'terms' && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 pb-3 border-b border-slate-100 dark:border-slate-850">
                    <span className="p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400">
                      <FileText className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-slate-50">Terms of Service Agreement</h3>
                      <p className="text-[10px] text-slate-405 dark:text-slate-500 font-bold uppercase tracking-wider">Revised: June 23, 2026</p>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-350 space-y-3.5 leading-relaxed font-semibold">
                    <p className="font-medium">
                      Welcome to LeadMine AI. By using our website scanners, visualisers, pitch generators, and pipeline organization dashboards, you consent strictly to the following binding parameters.
                    </p>

                    <div className="space-y-1">
                      <h4 className="font-extrabold text-slate-850 dark:text-slate-202 text-[13px]">1. Permissible System Utilization</h4>
                      <p className="font-medium text-slate-500 dark:text-slate-400">
                        The platform is engineered exclusively for freelancers, marketing agencies, design professionals, and consultants to crawl, discover, inspect, and draft business suggestions. Automated high-velocity scraping or botting actions on our live hosting limits is strictly prohibited.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-extrabold text-slate-850 dark:text-slate-202 text-[13px]">2. Integrity of External APIs and Credentials</h4>
                      <p className="font-medium text-slate-500 dark:text-slate-400">
                        You hold exclusive authority and responsibility for managing any personal keys (e.g. Google Cloud Maps API credentials) passed to the client. We bear no liability for costs, over-limit issues, or queries incurred on your personal Google Cloud Platform account.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-extrabold text-slate-850 dark:text-slate-202 text-[13px]">3. Liability Safeguards</h4>
                      <p className="font-medium text-slate-500 dark:text-slate-400">
                        Pitch materials and outreach scripts generated using our contextual builders carry no absolute guarantee of deal closures. All business efforts and compliance parameters (such as anti-spam marketing controls) are the responsibility of the operator.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* MODAL 3: ABOUT US PAGE */}
              {activeModal === 'about' && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 pb-3 border-b border-slate-100 dark:border-slate-850">
                    <span className="p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400">
                      <Info className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-slate-50">About LeadMine AI</h3>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Our vision and team</p>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-350 space-y-4 leading-relaxed font-semibold">
                    <p className="font-medium">
                      At <strong>LeadMine AI</strong>, we believe local brick-and-mortar storefronts are the backbone of vibrant communities — but too many are losing customers because of poor online discoverability, absence of modern websites, or outdated reviews.
                    </p>

                    <p className="font-medium">
                      We solve this asymmetric disadvantage by equipping web designers, digital marketers, and local outreach agencies with an all-in-one local lead discovery visually integrated sandbox. We map deficient businesses instantly, prepare contextual bespoke marketing pitches, and manage a robust pipeline to convert cold prospects into long-term clients.
                    </p>
                  </div>
                </div>
              )}

              {/* MODAL 4: MORE INFO PAGE */}
              {activeModal === 'info' && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 pb-3 border-b border-slate-100 dark:border-slate-850">
                    <span className="p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400">
                      <HelpCircle className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-slate-50">More Information & Core Sync</h3>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider font-sans">System capabilities and integrations</p>
                    </div>
                  </div>

                  {/* System Status Indicators - Relocated from Headers */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Firebase Badge */}
                    <div className={`flex items-center space-x-3 p-3.5 rounded-xl border transition-colors ${
                      firebaseConnected
                        ? 'bg-emerald-50/40 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/60 dark:text-emerald-300'
                        : 'bg-amber-50/40 border-amber-200 text-amber-800 dark:bg-amber-950/20 dark:border-amber-900/60 dark:text-amber-300'
                    }`}>
                      <div className="p-1.5 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-100 dark:border-slate-800 shrink-0">
                        <Database className={`w-4 h-4 ${firebaseConnected ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-500'}`} />
                      </div>
                      <div>
                        <div className="font-extrabold text-[13px] text-slate-800 dark:text-slate-200">Firebase: {firebaseConnected ? 'Sync Live' : 'Sandbox (Offline)'}</div>
                        <div className="text-[10.5px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide">
                          {firebaseConnected ? 'Cloud Production Active' : 'Offline Browser Sandbox'}
                        </div>
                      </div>
                    </div>

                    {/* Places API Badge */}
                    <div className={`flex items-center space-x-3 p-3.5 rounded-xl border transition-colors ${
                      googleMapsStatus.hasKey
                        ? 'bg-indigo-50/40 border-indigo-200 text-indigo-800 dark:bg-indigo-950/20 dark:border-indigo-900/60 dark:text-indigo-300'
                        : 'bg-slate-50/80 border-slate-200 text-slate-600 dark:bg-slate-900/40 dark:border-slate-800/80 dark:text-slate-400'
                    }`}>
                      <div className="p-1.5 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-100 dark:border-slate-800 shrink-0">
                        <Sparkles className={`w-4 h-4 ${googleMapsStatus.hasKey ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
                      </div>
                      <div>
                        <div className="font-extrabold text-[13px] text-slate-800 dark:text-slate-200">Places API: {googleMapsStatus.hasKey ? 'Direct Key' : 'Smart API (Simulated)'}</div>
                        <div className="text-[10.5px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide">
                          {googleMapsStatus.hasKey ? 'Enterprise Production' : 'Mock sandbox engine'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fully Embed Active Integrations & Sync Manager directly in the More Info Page */}
                  <div className="pt-2">
                    <ConnectionsPanel googleMapsStatus={googleMapsStatus} />
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
