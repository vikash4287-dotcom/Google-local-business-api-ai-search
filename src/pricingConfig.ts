export interface PlanDetails {
  tier: 'Free' | 'Starter' | 'Agency';
  prices: {
    USD: {
      amount: number;
      formatted: string;
    };
    INR: {
      amount: number;
      formatted: string;
    };
  };
  period: string;
  description: string;
  features: string[];
  notIncluded: string[];
  color: 'slate' | 'indigo' | 'purple';
  btnText: string;
  accent: string;
  iconName: 'User' | 'TrendingUp' | 'Building2';
}

export const PRICING_CONFIG = {
  currencies: {
    USD: { symbol: '$', code: 'USD' },
    INR: { symbol: '₹', code: 'INR' },
  },
  plans: [
    {
      tier: 'Free',
      prices: {
        USD: { amount: 0, formatted: '$0' },
        INR: { amount: 0, formatted: '₹0' },
      },
      period: 'forever',
      description: 'Foundational access for freelancers testing the waters.',
      features: [
        '5 searches per day',
        'Only 10 leads shown per search',
        'Basic business info (Address, Phone)',
        'Opportunity Score calculator',
        'Basic local search simulation'
      ],
      notIncluded: [
        'Advanced website audits',
        'Growth sales proposal generator',
        'Personalized Outreach templates',
        'Direct leads export to CSV'
      ],
      color: 'slate',
      btnText: 'Current Plan',
      accent: 'border-slate-200 dark:border-slate-800',
      iconName: 'User'
    },
    {
      tier: 'Starter',
      prices: {
        USD: { amount: 9, formatted: '$9' },
        INR: { amount: 750, formatted: '₹750' },
      },
      period: 'month',
      description: 'Ideal for specialized local consultants launching their pipeline.',
      features: [
        '20 searches per day',
        'Up to 20 leads shown per search',
        'Advanced Website SEO Auditing',
        'Custom Opportunity ranks',
        'Full review & reputation stats',
        'Interactive service packages builder',
        'Save unlimited qualified leads'
      ],
      notIncluded: [
        'Cold email and pitch templates',
        'Google Places native routing',
        'Custom reports download'
      ],
      color: 'indigo',
      btnText: 'Upgrade to Starter',
      accent: 'border-indigo-500 ring-2 ring-indigo-500/10 dark:ring-indigo-400/10',
      iconName: 'TrendingUp'
    },
    {
      tier: 'Agency',
      prices: {
        USD: { amount: 49, formatted: '$49' },
        INR: { amount: 4100, formatted: '₹4100' },
      },
      period: 'month',
      description: 'Uncensored access for fully scaled digital marketing agencies.',
      features: [
        'Unlimited reports & searches',
        'Unlimited custom proposal builds',
        'Unlimited tailored outreach copy',
        'Unlimited lead exports to CSV',
        'Enterprise Google Places lookup',
        'Full custom email & WhatsApp kits',
        'Priority customer support'
      ],
      notIncluded: [],
      color: 'purple',
      btnText: 'Upgrade to Agency',
      accent: 'border-purple-500 ring-2 ring-purple-500/10 dark:ring-purple-400/10',
      iconName: 'Building2'
    }
  ] as PlanDetails[]
};

export function detectDefaultCurrency(): 'INR' | 'USD' {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && (tz.includes('Kolkata') || tz.includes('Calcutta') || tz === 'Asia/Kolkata' || tz === 'Asia/Calcutta')) {
      return 'INR';
    }
    // Check navigator locales
    const locale = navigator.language || '';
    if (locale.endsWith('-IN') || locale.startsWith('en-IN') || locale === 'hi-IN') {
      return 'INR';
    }
  } catch (e) {
    console.warn("Failed to detect currency from locale/timezone:", e);
  }
  return 'USD';
}
