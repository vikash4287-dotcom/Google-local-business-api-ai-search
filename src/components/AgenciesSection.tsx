import React from 'react';
import { Layout, MapPin, Cpu, Check, ArrowRight } from 'lucide-react';

export default function AgenciesSection() {
  const useCases = [
    {
      id: 'web-design',
      title: 'Web Design Agencies',
      icon: Layout,
      color: 'indigo',
      badge: 'Redesign Pitching',
      description: 'Instantly identify local businesses saddled with slow, outdated, or completely non-mobile-responsive websites. Build custom redesign mockups and present concrete performance deficit metrics.',
      bullets: [
        'Uncover unoptimized performance & layout shifts',
        'Detect missing SSL certificates and security risks',
        'Generate high-converting "Before & After" redesign copy'
      ],
      tagline: 'Ideal for WordPress, Webflow, and Framer creators'
    },
    {
      id: 'local-seo',
      title: 'Local SEO Agencies',
      icon: MapPin,
      color: 'emerald',
      badge: 'GMB & Citation Audit',
      description: 'Target high-intent merchants missing Google Business Profiles (GMB), struggling with low review volume, or completely lacking local directory listings. Pitch instant optimization plans.',
      bullets: [
        'Locate unclaimed map pins and search listings',
        'Identify missing structured local schema data',
        'Draft personalized "Fix My Business Rank" campaigns'
      ],
      tagline: 'Perfect for local consultants & SEO strategists'
    },
    {
      id: 'ai-automation',
      title: 'AI Automation Agencies',
      icon: Cpu,
      color: 'violet',
      badge: 'SaaS & Bot Integration',
      description: 'Find premium local service businesses without live chat, digital scheduling, or lead-capture workflows. Pitch automated booking bots, SMS follow-up setups, and CRM sync systems.',
      bullets: [
        'Pinpoint manually operated intake systems',
        'Highlight missed calls & slow follow-up losses',
        'Create professional AI integration proposals'
      ],
      tagline: 'Built for AAA founders, GoHighLevel, & make.com experts'
    }
  ];

  return (
    <section id="agencies-section" className="py-20 bg-slate-50 dark:bg-slate-950 border-t border-b border-slate-100 dark:border-slate-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 tracking-wider inline-block border border-indigo-100/30 dark:border-indigo-900/40">
            Engineered for Scaling
          </span>
          <h2 className="text-3xl sm:text-4.5xl font-black tracking-tight text-slate-900 dark:text-white font-sans">
            Built for Agencies & Freelancers
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-350 font-medium leading-relaxed max-w-xl mx-auto">
            Stop generic cold-calling. Use highly personalized local deficit audits to approach prospects with proof, confidence, and authority.
          </p>
        </div>

        {/* 3-Column Responsive Use Case Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {useCases.map((useCase) => {
            const IconComponent = useCase.icon;
            
            // Generate tailwind class variations dynamically safely
            const colorMap: Record<string, { bg: string, text: string, border: string, badgeBg: string, ring: string }> = {
              indigo: {
                bg: 'bg-indigo-50/50 dark:bg-indigo-950/20',
                text: 'text-indigo-600 dark:text-indigo-400',
                border: 'border-indigo-100/30 dark:border-indigo-900/40',
                badgeBg: 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400',
                ring: 'group-hover:border-indigo-400/50 dark:group-hover:border-indigo-600/40'
              },
              emerald: {
                bg: 'bg-emerald-50/50 dark:bg-emerald-950/20',
                text: 'text-emerald-600 dark:text-emerald-400',
                border: 'border-emerald-100/30 dark:border-emerald-900/40',
                badgeBg: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400',
                ring: 'group-hover:border-emerald-400/50 dark:group-hover:border-emerald-600/40'
              },
              violet: {
                bg: 'bg-violet-50/50 dark:bg-violet-950/20',
                text: 'text-violet-600 dark:text-violet-400',
                border: 'border-violet-100/30 dark:border-violet-900/40',
                badgeBg: 'bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400',
                ring: 'group-hover:border-violet-400/50 dark:group-hover:border-violet-600/40'
              }
            };

            const classes = colorMap[useCase.color] || colorMap.indigo;

            return (
              <div 
                key={useCase.id}
                id={`agency-card-${useCase.id}`}
                className={`group relative flex flex-col justify-between p-8 bg-white dark:bg-slate-900/60 border border-slate-150 dark:border-slate-850 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 ${classes.ring}`}
              >
                {/* Visual decoration overlay */}
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-slate-100/50 to-transparent dark:from-slate-800/10 dark:to-transparent rounded-full blur-xl pointer-events-none" />

                <div className="space-y-6">
                  {/* Icon & Badge Row */}
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-xl ${classes.bg} ${classes.border} border text-indigo-600 shrink-0`}>
                      <IconComponent className={`w-6 h-6 ${classes.text}`} />
                    </div>
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${classes.badgeBg}`}>
                      {useCase.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2">
                    <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white font-sans">
                      {useCase.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-550 dark:text-slate-400 leading-relaxed font-normal">
                      {useCase.description}
                    </p>
                  </div>

                  {/* Bullet Lists */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 space-y-2.5">
                    <span className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      Deficiencies You Solve
                    </span>
                    <ul className="space-y-2 text-xs font-semibold text-slate-650 dark:text-slate-300">
                      {useCase.bullets.map((bullet, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${classes.text}`} />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card Footer Tagline */}
                <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-850/60 flex items-center justify-between text-[11px] font-medium text-slate-400 dark:text-slate-500">
                  <span>{useCase.tagline}</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-slate-400 dark:text-slate-500" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
