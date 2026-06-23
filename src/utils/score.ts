export interface ScoreDetails {
  score: number;
  label: 'High Priority' | 'Good Value' | 'Moderate' | 'Secondary';
  badgeClass: string;
  dotColor: string;
}

/**
 * Calculates a comprehensive "Lead Quality Score" (0-100) specifically designed for outreach evaluation.
 * High scores indicate substantial deficits in their marketing or footprint, representing premier opportunities
 * for design, development, and local SEO services.
 */
export function calculateLeadScore(
  rating: number | undefined,
  reviewCount: number | undefined,
  hasWebsite: boolean
): ScoreDetails {
  let score = 0;

  // 1. Web Presence Deficit Evaluation (Weight: 45%)
  // No website represents an outstanding high-conversion contract opportunity for design/SEO consultation.
  if (!hasWebsite) {
    score += 45;
  } else {
    score += 12; // Base scoring for having a digital anchor
  }

  // 2. Reviews/Social Proof Gaps Evaluation (Weight: 30%)
  const reviews = reviewCount || 0;
  if (reviews === 0) {
    score += 30; // Brand-new target or review pipeline completely empty
  } else if (reviews <= 5) {
    score += 25; // Critical deficit
  } else if (reviews <= 15) {
    score += 18; // Under-leveraged local proof
  } else if (reviews <= 40) {
    score += 10; // Moderate presence
  } else {
    score += 3;  // Well-established, high social proof
  }

  // 3. GBP/Google Search Engine Reputation Rank Deficit (Weight: 25%)
  const rVal = rating || 0;
  if (rVal === 0) {
    score += 25; // Unrated / Blank profile represents high growth potential
  } else if (rVal < 4.0) {
    score += 25; // Severe reputation deficit, prime targets for recovery campaigns
  } else if (rVal < 4.4) {
    score += 16; // Solid but sub-optimal rating (less likely to win the "GMB 3-pack")
  } else if (rVal < 4.8) {
    score += 8;  // High rating
  } else {
    score += 2;  // Immaculate rating, lower urgency for reputation fixes
  }

  // Bound the score safely between 0 and 100
  score = Math.min(Math.max(score, 0), 100);

  // Determine elegant SaaS classification categories
  let label: 'High Priority' | 'Good Value' | 'Moderate' | 'Secondary';
  let badgeClass = '';
  let dotColor = '';

  if (score >= 75) {
    label = 'High Priority';
    badgeClass = 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/20 dark:border-rose-900/40 dark:text-rose-350';
    dotColor = 'bg-rose-500';
  } else if (score >= 50) {
    label = 'Good Value';
    badgeClass = 'bg-indigo-50 border-indigo-200 text-indigo-800 dark:bg-indigo-950/20 dark:border-indigo-900/40 dark:text-indigo-305';
    dotColor = 'bg-indigo-500';
  } else if (score >= 30) {
    label = 'Moderate';
    badgeClass = 'bg-amber-50 border-amber-200 text-amber-805 dark:bg-amber-950/20 dark:border-amber-900/40 dark:text-amber-300';
    dotColor = 'bg-amber-500';
  } else {
    label = 'Secondary';
    badgeClass = 'bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-900/40 dark:border-slate-800 dark:text-slate-400';
    dotColor = 'bg-slate-400';
  }

  return { score, label, badgeClass, dotColor };
}
