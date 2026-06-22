import { Business } from '../types';

// Helper lists for realistic generation
const BUSINESS_TEMPLATES: Record<string, { prefixes: string[]; suffixes: string[] }> = {
  Restaurants: {
    prefixes: ['Golden Spoon', 'The Rustic Table', 'Taste of', 'Bella', 'The Sizzling', 'Le', 'Oasis', 'Salty', 'Urban', 'Spicy'],
    suffixes: ['Bistro', 'Kitchen', 'Grill', 'Diner', 'Eatery', 'House', 'Tavern', 'Trattoria', 'Steakhouse', 'Garden']
  },
  Dentists: {
    prefixes: ['BrightSiles', 'Mile High', 'Apex', 'Gentle Care', 'Elite', 'White River', 'Metro', 'Aspen', 'Downtown', 'Summit'],
    suffixes: ['Dental Care', 'Dentistry', 'Dental Spa', 'Orthodontics', 'Family Dental', 'Dental Group', 'Dental Associates']
  },
  Salons: {
    prefixes: ['Chic', 'Glamour', 'Velvet', 'Pure', 'Luxe', 'Glow', 'Bella Vita', 'Prism', 'The Mane', 'Bliss'],
    suffixes: ['Salon', 'Hair Studio', 'Spa & Beauty', 'Barber & Co', 'Beauty Lounge', 'Hair Lab', 'Aesthetics', 'Cut & Color']
  },
  Gyms: {
    prefixes: ['Ironclad', 'Apex', 'FitNation', 'Pulse', 'PowerHouse', 'Forge', 'Elevate', 'Titan', 'Vanguard', 'Velocity'],
    suffixes: ['Fitness', 'Gym', 'Athletics', 'Performance Center', 'Active Club', 'Strength Studio', 'Health & Wellness', 'CrossFit']
  },
  Hotels: {
    prefixes: ['Grand', 'Plaza', 'Royal', 'Serene', 'Vista', 'Pinecrest', 'The Regency', 'Ambassador', 'Heritage', 'Harbor'],
    suffixes: ['Hotel', 'Resort', 'Suites', 'Inn', 'Lodge & Spa', 'Manor', 'Palace', 'Boutique Hotel', 'Grand Inn']
  },
  'Real Estate Agencies': {
    prefixes: ['Vanguard', 'Apex', 'Blue Sky', 'Premier', 'Foundations', 'Summit', 'West Coast', 'Golden Gate', 'Centric', 'Prime'],
    suffixes: ['Real Estate', 'Properties', 'Realty Group', 'Brokers', 'Homes & Land', 'Partners', 'Realty Corp', 'Property Advisors']
  },
  'Car Dealers': {
    prefixes: ['Apex', 'Signature', 'Westside', 'Select', 'DriveTime', 'Prestige', 'Summit', 'Metro', 'Interstate', 'Gold Star'],
    suffixes: ['Motors', 'Auto Group', 'Car Sales', 'Dealership', 'Pre-Owned Vehicles', 'Automotive', 'Vehicles & Co']
  },
  Cafes: {
    prefixes: ['Corner', 'Daily Brew', 'Espresso', 'The Mug', 'Velvet Cream', 'Bean & Co', 'Roastery', 'Artisanal', 'Rustic', 'The Cozy'],
    suffixes: ['Cafe', 'Coffee House', 'Espresso Bar', 'Bakery', 'Coffee Lab', 'Roasters', 'Beanery', 'Lounge']
  },
  Doctors: {
    prefixes: ['Compassionate', 'Apex', 'Valley', 'Summit', 'Family First', 'Pinnacle', 'Millennium', 'Horizon', 'Guardian', 'Meridian'],
    suffixes: ['Medical Group', 'Clinic', 'Primary Care', 'Family Medicine', 'Healthcare Center', 'Pediatrics', 'Medical Associates']
  },
  'Interior Designers': {
    prefixes: ['Luxe Space', 'Chic Dwell', 'Vanguard', 'Moda', 'Velvet Touch', 'Elysian', 'Studio', 'Elements', 'Haven', 'Refined'],
    suffixes: ['Interiors', 'Designs', 'Studio', 'Living', 'Environments', 'Decor & Design', 'Creative', 'Atelier']
  },
  'Make up Artists': {
    prefixes: ['Face Forward', 'Glam', 'Luminous', 'Blush', 'Flawless', 'Royal', 'Elegance', 'Velvet', 'Artistry', 'Glow'],
    suffixes: ['MakeUp', 'Artistry', 'Glam Studio', 'Beauty', 'MUA', 'Cosmetics', 'Aesthetics', 'Makeup Lounge']
  },
  'Car wash': {
    prefixes: ['Squeaky Clean', 'Splash', 'Express', 'Super Shine', 'Eco Friendly', 'Tornado', 'Mirror Finish', 'Apex', 'Hydro', 'Sonic'],
    suffixes: ['Car Wash', 'Auto Spa', 'Detailing', 'Wash & Wax', 'Express Wash', 'Car Care', 'Wash Studio']
  },
  'Car Garage': {
    prefixes: ['Precision', 'Apex', 'Master Tech', 'Interstate', 'Reliable', 'Express', 'Summit', 'Pro Service', 'Gearhead', 'Bumper2Bumper'],
    suffixes: ['Auto Repair', 'Car Garage', 'Mechanics', 'Automotive Service', 'Transmission & Brake', 'Auto Clinic', 'Tire & Lube']
  },
  'Pest Control': {
    prefixes: ['EcoGuard', 'Terminator', 'Apex', 'PestShield', 'No Bugs', 'SafeHaven', 'Vanguard', 'Elite', 'GreenTech', 'Sentinel'],
    suffixes: ['Pest Control', 'Exterminators', 'Pest Management', 'Bug Busters', 'Termite Protection', 'Services']
  }
};

const STREET_NAMES = [
  'Grand Avenue',
  'Pine Boulevard',
  'Oak Lane',
  'Broadway Street',
  'Market Street',
  'Main Street',
  'Maple Road',
  'Washington Street',
  'Elm Street',
  'River Road',
  'Cedar Way',
  'Hilltop Terrace',
  'Lakeview Drive',
  'Second Street',
  'Forest Avenue',
  'Sunset Drive',
  'Spring Street',
  'Ridge Highway',
  'Cherry Road',
  'Park Avenue'
];

const USA_CITIES_STATES: Record<string, string> = {
  Seattle: 'WA',
  Denver: 'CO',
  Chicago: 'IL',
  Austin: 'TX',
  Boston: 'MA',
  Miami: 'FL',
  'New York': 'NY',
  'Los Angeles': 'CA',
  Houston: 'TX',
  Phoenix: 'AZ',
  Philadelphia: 'PA',
  'San Antonio': 'TX',
  'San Diego': 'CA',
  Dallas: 'TX',
  'San Jose': 'CA',
  Detroit: 'MI',
  Portland: 'OR',
  Atlanta: 'GA',
  Nashville: 'TN',
  San_Francisco: 'CA',
  Orlando: 'FL',
  Las_Vegas: 'NV'
};

export function generateMockLeads(
  city: string,
  category: string,
  filters: {
    minRating: number;
    maxRating: number;
    minReviews: number;
    maxReviews: number;
    hasWebsite: 'any' | 'yes' | 'no';
  }
): Business[] {
  const normCity = city.trim();
  const stateCode = USA_CITIES_STATES[normCity] || 'US';
  
  const temp = BUSINESS_TEMPLATES[category] || {
    prefixes: ['Apex', 'Elite', 'Summit', 'Premier', 'Vanguard'],
    suffixes: ['Services', 'Solutions', 'Partners', 'Co', 'Group']
  };

  const results: Business[] = [];
  
  // Seed based on city and category to keep generator stable for identical requests
  let seed = 0;
  for (let i = 0; i < normCity.length; i++) seed += normCity.charCodeAt(i);
  for (let i = 0; i < category.length; i++) seed += category.charCodeAt(i);

  // Pseudo-random helper
  function random(): number {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  }

  function randomRange(min: number, max: number): number {
    return min + random() * (max - min);
  }

  function pickRandom<T>(arr: T[]): T {
    const idx = Math.floor(random() * arr.length);
    return arr[idx];
  }

  // Generate 40 candidates, then filter them to present a custom results set
  for (let i = 0; i < 40; i++) {
    const prefix = pickRandom(temp.prefixes);
    const suffix = pickRandom(temp.suffixes);
    const name = `${prefix} ${suffix}`;
    
    // Generate rating (weighted to cluster around 3.2 to 4.8)
    const rawRating = random() < 0.3 ? randomRange(2.1, 3.8) : randomRange(3.9, 4.9);
    const rating = Math.round(rawRating * 10) / 10;
    
    // Review counts
    const reviewCount = Math.floor(random() < 0.4 ? randomRange(2, 25) : randomRange(26, 450));
    
    // Has website
    const hasWeb = random() > 0.4; // 60% have website, 40% don't (perfect target profile!)
    const cleanNameUrl = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const website = hasWeb ? `https://www.${cleanNameUrl}.com` : undefined;

    // Contact details
    const streetNum = Math.floor(randomRange(100, 9999));
    const street = pickRandom(STREET_NAMES);
    const address = `${streetNum} ${street}, ${normCity}, ${stateCode}`;
    const areaCode = 200 + (seed % 700);
    const phonePrefix = 100 + (seed % 899);
    const phoneLine = 1000 + (seed % 8999);
    const phone = `(${areaCode}) ${phonePrefix}-${phoneLine}`;

    const business: Business = {
      id: `lead_${category.toLowerCase().replace(/\s+/g, '_')}_${i}_${cleanNameUrl}`,
      name,
      address,
      phone,
      website,
      rating,
      reviewCount,
      category,
      city: normCity
    };

    // Filter checks
    const matchesRating = rating >= filters.minRating && rating <= filters.maxRating;
    const matchesReviews = reviewCount >= filters.minReviews && reviewCount <= filters.maxReviews;
    let matchesWebsite = true;
    if (filters.hasWebsite === 'yes') {
      matchesWebsite = !!website;
    } else if (filters.hasWebsite === 'no') {
      matchesWebsite = !website;
    }

    if (matchesRating && matchesReviews && matchesWebsite) {
      results.push(business);
    }
  }

  return results;
}
