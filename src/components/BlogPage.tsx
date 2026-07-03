import React, { useEffect, useState } from 'react';
import { ArrowLeft, BookOpen, Calendar, Clock, User, ArrowRight, Share2, Heart, Search } from 'lucide-react';
import Breadcrumbs from './Breadcrumbs';

interface BlogPageProps {
  onBackToHome: () => void;
  onNavigate?: (path: string) => void;
}

interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string[];
  category: string;
  readTime: string;
  date: string;
  author: string;
  image: string;
}

const articles: Article[] = [
  {
    id: 'no-website-outreach',
    title: 'How to Land Local Web Design Clients with the "No Website" Deficit Strategy',
    excerpt: 'Discover a step-by-step prospecting framework to identify local brick-and-mortar stores without websites and pitch high-ticket conversion landing pages.',
    category: 'Client Acquisition',
    readTime: '6 min read',
    date: 'June 28, 2026',
    author: 'Marcus Vance, Founder of LocalShopAI',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600&auto=format&fit=crop',
    content: [
      'Local brick-and-mortar storefronts are the lifeblood of our communities. Yet, according to industry surveys, over 23% of small businesses still lack a website. These businesses are bleeding potential clients, appointments, and bookings to competitors who maintain even a basic web presence.',
      'For agencies, freelancers, and web developers, this deficit represents a highly lucrative client acquisition opportunity. But standard, impersonal cold calls ("Hey, do you need a website?") fail 99% of the time. To close these deals, you must leverage a consultative outreach strategy that centers value and visualizes their growth.',
      'Step 1: Identify "No Website" Gaps in Your Target Neighborhood. Start by selecting a niche (e.g., HVAC technicians, boutique bakeries, custom auto detailing) in a medium-sized city. Run GMB scans and look for listings that lack a "Website" action button. These represent your warm lead list.',
      'Step 2: Generate an Opportunity Score. When a business lacks a website, its search visibility is severely constrained. Calculate their rating and reviews count. Slower review velocity coupled with no digital footprint means they score extremely high on our Opportunity Index.',
      'Step 3: Draft an AI-Personalized Cold Outreach. Avoid generic templated pitches. Mention their specific neighborhood, their actual business name, and their Google Maps rating constructively. Offer a 1-sentence quick strategy: "I will build a high-performance local mobile landing page designed to turn searchers directly into booked appointments."',
      'Step 4: Keep the Close Low Friction. Do not pitch complex contracts or high prices immediately. Propose a quick, casual 5-minute alignment call, or send them a visual mock-up of what their site could look like. By removing friction, you dramatically accelerate reply rates and close high-ticket retainers.'
    ]
  },
  {
    id: 'local-seo-secrets',
    title: 'The Blueprint to Google Maps 3-Pack Rankings: Ratings, Reviews, and Citations',
    excerpt: 'An in-depth guide on how Google ranks local businesses on Maps and how agencies can sell automated review systems to skyrocket local visibility.',
    category: 'Local SEO',
    readTime: '8 min read',
    date: 'June 24, 2026',
    author: 'Sarah Chen, SEO Consultant',
    image: 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?q=80&w=600&auto=format&fit=crop',
    content: [
      'Google Maps is the single largest driver of foot traffic and phone calls for local businesses. When users search for "dentist near me" or "best pizza in Seattle," Google displays the Map 3-Pack — the top three local business listings featured directly above standard organic search results.',
      'Securing a spot in the Map 3-Pack is transformative for local business revenues. But how does Google determine who ranks there? Understanding these variables allows digital marketing agencies to offer high-ticket reputational optimization services.',
      '1. Proximity, Relevance, and Prominence. Proximity is hardcoded by the searcher\'s location. Relevance is determined by category tags, GMB descriptions, and website keywords. Prominence, however, is where agencies can exert massive influence: it represents how prominent and well-known the business is online.',
      '2. The Supremacy of Reviews and Review Velocity. Google places immense weight on rating parameters and review counts. But absolute reviews are only part of the equation: review velocity (how frequently new reviews are added) and review diversity are equally critical.',
      '3. Selling Automated Review Accelerators. Many businesses struggle to collect reviews because they rely on manual requests. Agencies can package and sell automated text-back and email-feedback pipelines. By increasing review velocity, you directly elevate their Map prominence.',
      '4. Structured Schema and Local Citations. Back your reputation services with technical local SEO. Ensure the business\'s Name, Address, and Phone number (NAP) are fully synchronized across 100+ local citation directories, and embed localized structured Schema markup directly onto their homepages.'
    ]
  },
  {
    id: 'personalization-vs-spam',
    title: 'Why Standard Cold Emails Fail and How Personalized GMB Deficit Pitches Close 3x More Deals',
    excerpt: 'Stop sending bulk templates. Learn how mentioning specific Google Business Profile and website deficits turns cold prospects into warm consultation leads.',
    category: 'Outreach',
    readTime: '5 min read',
    date: 'June 19, 2026',
    author: 'Marcus Vance, Founder of LocalShopAI',
    image: 'https://images.unsplash.com/photo-1557200134-90327ee9fafa?q=80&w=600&auto=format&fit=crop',
    content: [
      'Every single day, local business owners are bombarded with poorly written, automated spam emails from outsourced agencies promising "page 1 of Google" or "social media magic." These emails are instantly deleted or sent to the spam folder because they contain zero personalization.',
      'To pierce through this clutter, your outreach must be hyper-specific, relevant, and immediately highlight a critical business pain point. We call this the GMB Deficit Pitch strategy.',
      'A GMB Deficit Pitch is an outreach message that identifies a specific, public, verifiable gap in their digital presence and outlines how fixing it directly increases their bottom-line revenues.',
      'For example, instead of writing: "We do website SEO," write: "I noticed your business has 48 positive reviews on Google, but your official website link is missing from your profile. This means local searchers who want to book an appointment have no clear next step, costing you dozens of clients monthly."',
      'By framing your pitch around an identified deficit, you accomplish three critical sales goals simultaneously: you prove you actually reviewed their business, you highlight a costly leak in their marketing funnel, and you position yourself as a local growth partner rather than a pushy salesperson.',
      'Leveraging tools like LocalShopAI to audit homepage load speeds, review count benchmarks, and website mobile friendliness allows you to automatically compile these deficits into personalized sales playbooks that convert cold outreach into highly lucrative sales meetings.'
    ]
  }
];

export default function BlogPage({ onBackToHome, onNavigate }: BlogPageProps) {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(() => {
    const path = window.location.pathname;
    if (path.startsWith('/blog/')) {
      const id = path.substring('/blog/'.length);
      const matched = articles.find(a => a.id === id);
      return matched || null;
    }
    return null;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [likes, setLikes] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.startsWith('/blog/')) {
        const id = path.substring('/blog/'.length);
        const matched = articles.find(a => a.id === id);
        setSelectedArticle(matched || null);
      } else {
        setSelectedArticle(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update SEO Metadata dynamically
  useEffect(() => {
    const prevTitle = document.title;
    const prevMetaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content');
    let descMeta = document.querySelector('meta[name="description"]');

    if (selectedArticle) {
      document.title = `${selectedArticle.title} | LocalShopAI Blog`;
      
      if (descMeta) {
        descMeta.setAttribute('content', selectedArticle.excerpt);
      }
      
      let canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) {
        canonical.setAttribute('href', `https://localshopai.com/blog/${selectedArticle.id}`);
      }
    } else {
      document.title = "B2B Local SEO & Agency Growth Blog | LocalShopAI";
      
      if (!descMeta) {
        descMeta = document.createElement('meta');
        descMeta.setAttribute('name', 'description');
        document.head.appendChild(descMeta);
      }
      descMeta.setAttribute('content', 'Explore our expert-written local agency growth blog. Read case studies, scripts, and guides on how to find local leads, audit business websites, and scale your digital agency.');

      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', 'https://localshopai.com/blog');
    }

    // Scroll to top
    window.scrollTo(0, 0);

    return () => {
      document.title = prevTitle;
      if (prevMetaDesc && descMeta) {
        descMeta.setAttribute('content', prevMetaDesc);
      }
    };
  }, [selectedArticle]);

  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredArticles = articles.filter(art => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return art.title.toLowerCase().includes(query) || 
           art.excerpt.toLowerCase().includes(query) ||
           art.category.toLowerCase().includes(query);
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <Breadcrumbs onNavigate={onNavigate} />

        {/* Navigation / Back links */}
        {selectedArticle ? (
          <button
            onClick={() => {
              setSelectedArticle(null);
              window.history.pushState(null, '', '/blog');
            }}
            className="mb-8 inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Article List</span>
          </button>
        ) : (
          <button
            onClick={onBackToHome}
            className="mb-8 inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Lead Discovery</span>
          </button>
        )}

        {selectedArticle ? (
          /* READ VIEW: FULL BLOG ARTICLE */
          <article className="max-w-3xl mx-auto bg-white border border-slate-150/85 rounded-2xl dark:bg-slate-950 dark:border-slate-850 shadow-xs p-6 sm:p-10 lg:p-12 space-y-6">
            <div className="space-y-4">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 tracking-wider inline-block">
                {selectedArticle.category}
              </span>
              
              <h1 className="text-2xl sm:text-4.2xl font-black text-slate-900 dark:text-white font-sans leading-tight tracking-tight">
                {selectedArticle.title}
              </h1>

              {/* Author & date metadata block */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-450 dark:text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-850 pb-5">
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-slate-400" />
                  <span>{selectedArticle.author}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>{selectedArticle.date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{selectedArticle.readTime}</span>
                </div>
              </div>
            </div>

            {/* Featured Image inside Article frame */}
            <div className="w-full h-56 sm:h-80 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm relative">
              <img
                src={selectedArticle.image}
                alt={selectedArticle.title}
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Rich narrative content block */}
            <div className="prose prose-slate dark:prose-invert max-w-none text-sm sm:text-base text-slate-650 dark:text-slate-350 space-y-6 leading-relaxed font-normal select-text">
              {selectedArticle.content.map((paragraph, idx) => (
                <p key={idx} className="font-medium">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Interaction Footer Bar inside Article */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-850 text-xs font-bold uppercase tracking-widest text-slate-400">
              <button
                onClick={(e) => handleLike(selectedArticle.id, e)}
                className={`flex items-center gap-2 cursor-pointer transition-colors ${
                  likes[selectedArticle.id] ? 'text-rose-500' : 'hover:text-rose-500'
                }`}
              >
                <Heart className={`w-4 h-4 ${likes[selectedArticle.id] ? 'fill-current' : ''}`} />
                <span>{likes[selectedArticle.id] ? 'Liked article' : 'Like'}</span>
              </button>
              
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Article URL copied to your clipboard!');
                }}
                className="flex items-center gap-2 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </article>
        ) : (
          /* GRID VIEW: ALL ARTICLES */
          <div className="space-y-10">
            {/* Header Hero Title Section */}
            <div className="relative overflow-hidden rounded-3xl border border-slate-100 dark:border-slate-850 bg-gradient-to-br from-indigo-50/20 via-white to-indigo-50/5 dark:from-indigo-950/10 dark:via-slate-950/40 dark:to-slate-950/60 p-8 sm:p-12 text-center shadow-xs">
              <div className="relative z-10 max-w-2xl mx-auto space-y-4">
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 tracking-wider inline-block border border-indigo-100/30 dark:border-indigo-900/40">
                  Authority & Growth Blog
                </span>
                <h1 className="text-3xl sm:text-4.5xl font-black tracking-tight text-slate-900 dark:text-white font-sans">
                  The Local Agency Growth Guide
                </h1>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-350 font-medium leading-relaxed max-w-xl mx-auto">
                  Master the art of local prospecting, selling high-value web design, automated review velocity acceleration, and dominating GMB Map Packs.
                </p>

                {/* Inline Article Search Bar */}
                <div className="max-w-md mx-auto pt-4 relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search articles, tactics, categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs font-semibold bg-white border border-slate-200 dark:bg-slate-950 dark:border-slate-850 rounded-2xl focus:outline-none focus:border-indigo-500 shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Articles list grid */}
            {filteredArticles.length === 0 ? (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <p className="text-xs font-semibold">No articles match your active search filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredArticles.map((art) => (
                  <div
                    key={art.id}
                    onClick={() => {
                      setSelectedArticle(art);
                      window.history.pushState(null, '', `/blog/${art.id}`);
                    }}
                    className="group bg-white border border-slate-150 rounded-2xl dark:bg-slate-950 dark:border-slate-850 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col h-full cursor-pointer overflow-hidden"
                  >
                    {/* Visual Card Image container */}
                    <div className="relative w-full h-44 overflow-hidden border-b border-slate-100 dark:border-slate-850">
                      <img
                        src={art.image}
                        alt={art.title}
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute top-3 left-3 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-indigo-600 text-white shadow-sm">
                        {art.category}
                      </span>
                    </div>

                    {/* Metadata Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          <span>{art.date}</span>
                          <span>•</span>
                          <span>{art.readTime}</span>
                        </div>
                        <h3 className="text-base font-black text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400 transition-colors font-sans leading-snug">
                          {art.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold line-clamp-3">
                          {art.excerpt}
                        </p>
                      </div>

                      {/* Interactive read footer link */}
                      <div className="flex items-center justify-between pt-2 text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
                        <span className="flex items-center gap-1">
                          <span>Read Full Article</span>
                          <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
