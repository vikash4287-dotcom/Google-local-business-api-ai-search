import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path: string;
}

interface BreadcrumbsProps {
  onNavigate?: (path: string) => void;
  customItems?: BreadcrumbItem[];
}

const routeLabels: Record<string, string> = {
  '': 'Home',
  'privacy-policy': 'Privacy Policy',
  'terms-of-service': 'Terms of Service',
  'pricing': 'Plans & Pricing',
  'faq': 'Frequently Asked Questions',
  'contact': 'Contact Us',
  'blog': 'Blog',
  'no-website-outreach': 'Land Web Design Clients with "No Website" Deficit',
  'local-seo-secrets': 'Google Maps 3-Pack Rankings Blueprint',
  'personalization-vs-spam': 'Why Cold Emails Fail & GBP Pitches Win',
};

export default function Breadcrumbs({ onNavigate, customItems }: BreadcrumbsProps) {
  // Determine current items either from customItems or by parsing the URL
  let items: BreadcrumbItem[] = [];

  if (customItems && customItems.length > 0) {
    items = customItems;
  } else {
    const pathname = window.location.pathname;
    const segments = pathname.split('/').filter(Boolean);
    
    // Always start with Home
    items.push({ label: 'Home', path: '/' });
    
    let accumulatedPath = '';
    segments.forEach((segment) => {
      accumulatedPath += `/${segment}`;
      const label = routeLabels[segment] || segment.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      items.push({
        label,
        path: accumulatedPath
      });
    });
  }

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(path);
    } else {
      // Fallback if onNavigate is not provided
      window.history.pushState(null, '', path);
      window.dispatchEvent(new Event('popstate'));
    }
  };

  // Generate dynamic JSON-LD BreadcrumbList Schema for Google Search Engine indexing
  const schemaJson = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => {
      // Use absolute URLs for schema indexing
      const absoluteUrl = `${window.location.origin}${item.path}`;
      return {
        '@type': 'ListItem',
        'position': index + 1,
        'name': item.label,
        'item': absoluteUrl
      };
    })
  };

  return (
    <nav 
      aria-label="Breadcrumb" 
      className="mb-6 flex items-center"
      id="breadcrumbs-navigation"
    >
      {/* Inject JSON-LD directly into the document head dynamically or inside the body */}
      <script type="application/ld+json">
        {JSON.stringify(schemaJson)}
      </script>

      <ol 
        className="flex items-center flex-wrap gap-1.5 sm:gap-2 text-xs font-medium text-slate-500 dark:text-slate-400"
        itemScope 
        itemType="https://schema.org/BreadcrumbList"
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const absoluteUrl = `${window.location.origin}${item.path}`;

          return (
            <li 
              key={item.path} 
              className="flex items-center"
              itemProp="itemListElement" 
              itemScope 
              itemType="https://schema.org/ListItem"
            >
              <meta itemProp="position" content={String(index + 1)} />
              <meta itemProp="name" content={item.label} />
              
              {index > 0 && (
                <ChevronRight className="w-3.5 h-3.5 mx-1 text-slate-350 dark:text-slate-650 shrink-0" aria-hidden="true" />
              )}

              {isLast ? (
                <span 
                  className="text-slate-800 dark:text-slate-200 font-semibold truncate max-w-[200px] sm:max-w-[300px] md:max-w-md"
                  aria-current="page"
                  itemProp="item"
                  content={absoluteUrl}
                >
                  {item.label}
                </span>
              ) : (
                <a
                  href={item.path}
                  onClick={(e) => handleLinkClick(e, item.path)}
                  className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                  itemProp="item"
                >
                  {index === 0 && (
                    <Home className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  )}
                  <span>{item.label}</span>
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
