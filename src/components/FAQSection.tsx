import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: React.ReactNode;
}

export default function FAQSection() {
  const [isSectionExpanded, setIsSectionExpanded] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqData: FAQItem[] = [
    {
      question: "What is LocalShop AI?",
      answer: (
        <div className="space-y-2">
          <p>LocalShop AI is a local business lead generation and opportunity discovery platform that helps agencies, freelancers, SEO consultants, marketers, and web developers find businesses that need digital marketing services.</p>
          <p>The platform identifies local businesses with weak online presence, low Google review counts, poor ratings, missing websites, and other growth opportunities.</p>
        </div>
      )
    },
    {
      question: "How does LocalShop AI find local business leads?",
      answer: (
        <div className="space-y-2">
          <p>LocalShop AI analyzes publicly available business information, including Google Business Profile data, website presence, ratings, reviews, and business information to identify potential sales opportunities.</p>
          <p className="font-semibold text-slate-800 dark:text-slate-350">Users can search by:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>City</li>
            <li>State</li>
            <li>Business Category</li>
            <li>Review Count</li>
            <li>Rating</li>
            <li>Website Availability</li>
          </ul>
          <p>The platform then ranks businesses using an Opportunity Score.</p>
        </div>
      )
    },
    {
      question: "What is an Opportunity Score?",
      answer: (
        <div className="space-y-2">
          <p>The Opportunity Score helps agencies identify businesses that are most likely to benefit from digital marketing services.</p>
          <p className="font-semibold text-slate-800 dark:text-slate-350">The score considers factors such as:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Missing website</li>
            <li>Low review count</li>
            <li>Poor ratings</li>
            <li>Weak online presence</li>
            <li>Website quality</li>
            <li>Business category competitiveness</li>
          </ul>
          <p>Higher scores indicate stronger sales opportunities.</p>
        </div>
      )
    },
    {
      question: "Who should use LocalShop AI?",
      answer: (
        <div className="space-y-2 flex flex-col">
          <p>LocalShop AI is built for:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Digital Marketing Agencies</li>
            <li>SEO Agencies</li>
            <li>Freelance Marketers</li>
            <li>Website Designers</li>
            <li>Web Development Agencies</li>
            <li>Local SEO Consultants</li>
            <li>Lead Generation Agencies</li>
            <li>Business Growth Consultants</li>
          </ul>
        </div>
      )
    },
    {
      question: "Can I find businesses with no website?",
      answer: (
        <div className="space-y-2">
          <p>Yes.</p>
          <p>LocalShop AI can identify businesses that do not currently have a website.</p>
          <p className="font-semibold text-slate-800 dark:text-slate-350">These businesses are often strong prospects for:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Website Design Services</li>
            <li>Website Development</li>
            <li>Local SEO</li>
            <li>Google Business Profile Optimization</li>
          </ul>
        </div>
      )
    },
    {
      question: "Can I find businesses with low Google reviews?",
      answer: (
        <div className="space-y-2">
          <p>Yes.</p>
          <p>You can filter businesses by review count and identify companies with:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Less than 10 reviews</li>
            <li>Less than 20 reviews</li>
            <li>Less than 50 reviews</li>
          </ul>
          <p>These businesses often need review management and local reputation services.</p>
        </div>
      )
    },
    {
      question: "Does LocalShop AI generate sales proposals?",
      answer: (
        <div className="space-y-2">
          <p>Yes.</p>
          <p>LocalShop AI can generate professional client proposals based on business weaknesses, website analysis, review performance, and growth opportunities.</p>
          <p>Agencies can customize and export proposals before sending them to prospects.</p>
        </div>
      )
    },
    {
      question: "Can LocalShop AI generate cold outreach emails?",
      answer: (
        <div className="space-y-2">
          <p>Yes.</p>
          <p>The platform can create personalized outreach messages, including:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Cold Emails</li>
            <li>LinkedIn Messages</li>
            <li>Follow-Up Emails</li>
            <li>WhatsApp Outreach Messages</li>
            <li>Sales Pitch Templates</li>
          </ul>
          <p>Each message is tailored to the selected business.</p>
        </div>
      )
    },
    {
      question: "How does the website audit feature work?",
      answer: (
        <div className="space-y-2">
          <p>LocalShop AI analyzes business websites and evaluates:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Mobile Friendliness</li>
            <li>Design Quality</li>
            <li>Calls To Action</li>
            <li>Contact Information</li>
            <li>SEO Basics</li>
            <li>User Experience</li>
            <li>Trust Signals</li>
          </ul>
          <p>The system generates a Website Score and improvement recommendations.</p>
        </div>
      )
    },
    {
      question: "Is LocalShop AI a local SEO tool?",
      answer: (
        <div className="space-y-2">
          <p>LocalShop AI is not only a local SEO tool.</p>
          <p>It combines:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Local Business Discovery</li>
            <li>Lead Generation</li>
            <li>Website Auditing</li>
            <li>Opportunity Analysis</li>
            <li>Proposal Generation</li>
            <li>AI Outreach</li>
          </ul>
          <p>into a single platform designed for agencies and consultants.</p>
        </div>
      )
    },
    {
      question: "Can I export business leads?",
      answer: (
        <div className="space-y-2">
          <p>Yes.</p>
          <p>Users can export qualified leads into CSV format for sales prospecting, CRM imports, agency workflows, and outreach campaigns.</p>
        </div>
      )
    },
    {
      question: "Which industries can I search?",
      answer: (
        <div className="space-y-2">
          <p>LocalShop AI supports a wide range of local business categories, including:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1.5 text-xs">
            <span className="bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded">Restaurants</span>
            <span className="bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded">Dentists</span>
            <span className="bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded">Salons</span>
            <span className="bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded">Gyms</span>
            <span className="bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded">Hotels</span>
            <span className="bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded">Realtors</span>
            <span className="bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded">Car Dealerships</span>
            <span className="bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded">Pest Control</span>
            <span className="bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded">Auto Repair Shops</span>
            <span className="bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded">Interior Designers</span>
            <span className="bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded">Medical Practices</span>
            <span className="bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded">Makeup Artists</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">and many more.</p>
        </div>
      )
    },
    {
      question: "Is LocalShop AI suitable for freelancers?",
      answer: (
        <div className="space-y-2">
          <p>Absolutely.</p>
          <p>Many freelancers use LocalShop AI to identify local businesses that need help with:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Website Design</li>
            <li>SEO</li>
            <li>Social Media Marketing</li>
            <li>Google Ads</li>
            <li>Reputation Management</li>
          </ul>
          <p>This allows freelancers to build a pipeline of potential clients.</p>
        </div>
      )
    },
    {
      question: "How is LocalShop AI different from Google Maps?",
      answer: (
        <div className="space-y-2">
          <p>Google Maps shows businesses.</p>
          <p>LocalShop AI identifies business opportunities.</p>
          <p className="font-semibold">Instead of manually reviewing hundreds of listings, users receive:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Opportunity Scores</li>
            <li>Website Analysis</li>
            <li>Business Deficit Reports</li>
            <li>Outreach Recommendations</li>
            <li>Proposal Generation</li>
          </ul>
          <p>saving hours of manual research.</p>
        </div>
      )
    },
    {
      question: "What are the best local business niches for agencies?",
      answer: (
        <div className="space-y-2">
          <p>Popular high-converting categories include:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Dentists</li>
            <li>Restaurants</li>
            <li>Salons</li>
            <li>Auto Repair Shops</li>
            <li>Pest Control Companies</li>
            <li>Chiropractors</li>
            <li>Real Estate Agencies</li>
            <li>Medical Clinics</li>
            <li>Home Service Businesses</li>
          </ul>
          <p>LocalShop AI helps identify businesses in these niches that may need marketing support.</p>
        </div>
      )
    },
    {
      question: "Does LocalShop AI use artificial intelligence?",
      answer: (
        <div className="space-y-2">
          <p>Yes.</p>
          <p>LocalShop AI uses advanced AI models to analyze businesses, generate recommendations, create outreach messages, perform website audits, and build sales proposals.</p>
          <p>The goal is to help agencies spend less time researching and more time closing clients.</p>
        </div>
      )
    },
    {
      question: "Is LocalShop AI available in the United States?",
      answer: (
        <div className="space-y-2">
          <p>Yes.</p>
          <p>LocalShop AI currently supports business discovery across cities and states throughout the United States.</p>
          <p>Additional regions may be added in future updates.</p>
        </div>
      )
    }
  ];

  return (
    <div id="faq-section" className="w-full max-w-4xl mx-auto py-8 px-6 border-t border-slate-100 dark:border-slate-850 mt-16 font-sans">
      {/* Principal Accordion Header for the FAQ Section */}
      <div 
        onClick={() => setIsSectionExpanded(!isSectionExpanded)}
        className="w-full p-6 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/10 hover:bg-slate-50 dark:hover:bg-slate-900/20 cursor-pointer select-none transition-all flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs"
      >
        <div className="flex items-center gap-3.5 text-left w-full sm:w-auto">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100/30 dark:border-indigo-900/10">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
              Frequently Asked Questions (FAQ)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Click to {isSectionExpanded ? 'collapse' : 'view'} answers to key platform questions, scores, and tools.
            </p>
          </div>
        </div>
        
        <button
          type="button"
          aria-label="Toggle FAQ List"
          className="p-2 rounded-xl bg-white dark:bg-slate-950 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white shrink-0 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-center pointer-events-none"
        >
          {isSectionExpanded ? <ChevronUp className="w-5 h-5 text-indigo-500" /> : <ChevronDown className="w-5 h-5 text-indigo-500" />}
        </button>
      </div>

      {isSectionExpanded && (
        <div className="mt-6 space-y-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold px-2 mb-2 uppercase tracking-wider">
            LocalShop AI Platform Information Directory ({faqData.length} topics)
          </p>
          {faqData.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index} 
                className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-950/20 transition-all shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-bold text-slate-800 hover:text-slate-905 dark:text-slate-200 dark:hover:text-white hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors cursor-pointer select-none"
                >
                  <span className="text-sm">{item.question}</span>
                  <span className="p-1 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 shrink-0 border border-slate-100 dark:border-slate-800">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </span>
                </button>
                
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-605 dark:text-slate-400 leading-relaxed border-t border-slate-50 dark:border-slate-900/50 bg-slate-50/20 dark:bg-slate-950/40 animate-fade-in animate-duration-200">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
