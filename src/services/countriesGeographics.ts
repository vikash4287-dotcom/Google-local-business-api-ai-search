export interface StateData {
  code: string;
  name: string;
  cities: string[];
}

export interface CountryData {
  code: string;
  name: string;
  flag: string;
  states: StateData[];
}

export const COUNTRIES_GEOGRAPHICS: CountryData[] = [
  {
    code: 'USA',
    name: 'USA',
    flag: '🇺🇸',
    states: [
      {
        code: 'WA',
        name: 'Washington',
        cities: ['Seattle', 'Spokane', 'Tacoma', 'Vancouver', 'Bellevue', 'Kent', 'Everett', 'Renton', 'Federal Way', 'Yakima', 'Olympia']
      },
      {
        code: 'CA',
        name: 'California',
        cities: [
          'Los Angeles', 'San Diego', 'San Jose', 'San Francisco', 'Fresno', 'Sacramento', 'Long Beach', 'Oakland', 
          'Bakersfield', 'Anaheim', 'Santa Ana', 'Riverside', 'Stockton', 'Chula Vista', 'Irvine', 'Fremont', 'Beverly Hills',
          'Palo Alto', 'Santa Monica', 'Pasadena', 'Santa Barbara', 'Monterey', 'Malibu', 'Napa'
        ]
      },
      {
        code: 'NY',
        name: 'New York',
        cities: ['New York', 'Buffalo', 'Rochester', 'Yonkers', 'Syracuse', 'Albany', 'New Rochelle', 'Mount Vernon', 'Schenectady', 'Utica']
      },
      {
        code: 'TX',
        name: 'Texas',
        cities: [
          'Houston', 'San Antonio', 'Dallas', 'Austin', 'Fort Worth', 'El Paso', 'Arlington', 'Corpus Christi', 
          'Plano', 'Lubbock', 'Laredo', 'Irving', 'Amarillo', 'Garland', 'Frisco', 'McKinney', 'Brownsville', 'Waco'
        ]
      },
      {
        code: 'FL',
        name: 'Florida',
        cities: [
          'Jacksonville', 'Miami', 'Tampa', 'Orlando', 'St. Petersburg', 'Hialeah', 'Tallahassee', 'Fort Lauderdale', 
          'Port St. Lucie', 'Cape Coral', 'Pembroke Pines', 'Hollywood', 'Gainesville', 'Key West', 'Sarasota', 'Naples'
        ]
      },
      {
        code: 'IL',
        name: 'Illinois',
        cities: ['Chicago', 'Aurora', 'Rockford', 'Joliet', 'Naperville', 'Springfield', 'Peoria', 'Elgin', 'Waukegan', 'Champaign']
      },
      {
        code: 'MA',
        name: 'Massachusetts',
        cities: ['Boston', 'Worcester', 'Springfield', 'Lowell', 'Cambridge', 'New Bedford', 'Brockton', 'Quincy', 'Lynn', 'Newton']
      },
      {
        code: 'CO',
        name: 'Colorado',
        cities: ['Denver', 'Colorado Springs', 'Aurora', 'Fort Collins', 'Lakewood', 'Thornton', 'Arvada', 'Westminster', 'Pueblo', 'Boulder', 'Aspen', 'Vail']
      },
      {
        code: 'GA',
        name: 'Georgia',
        cities: ['Atlanta', 'Columbus', 'Augusta', 'Macon', 'Savannah', 'Athens', 'Sandy Springs', 'Roswell', 'Johns Creek', 'Alpharetta']
      },
      {
        code: 'MI',
        name: 'Michigan',
        cities: ['Detroit', 'Grand Rapids', 'Warren', 'Sterling Heights', 'Ann Arbor', 'Lansing', 'Flint', 'Dearborn', 'Troy', 'Kalamazoo']
      },
      {
        code: 'PA',
        name: 'Pennsylvania',
        cities: ['Philadelphia', 'Pittsburgh', 'Allentown', 'Erie', 'Reading', 'Scranton', 'Bethlehem', 'Lancaster', 'Harrisburg']
      },
      {
        code: 'AZ',
        name: 'Arizona',
        cities: ['Phoenix', 'Tucson', 'Mesa', 'Chandler', 'Glendale', 'Scottsdale', 'Gilbert', 'Tempe', 'Peoria', 'Flagstaff', 'Yuma']
      },
      {
        code: 'TN',
        name: 'Tennessee',
        cities: ['Nashville', 'Memphis', 'Knoxville', 'Chattanooga', 'Clarksville', 'Murfreesboro', 'Franklin', 'Jackson', 'Johnson City']
      },
      {
        code: 'NV',
        name: 'Nevada',
        cities: ['Las Vegas', 'Henderson', 'Reno', 'North Las Vegas', 'Sparks', 'Carson City', 'Elko']
      },
      {
        code: 'OR',
        name: 'Oregon',
        cities: ['Portland', 'Salem', 'Eugene', 'Gresham', 'Hillsboro', 'Beaverton', 'Bend', 'Medford', 'Springfield', 'Corvallis']
      }
    ]
  },
  {
    code: 'Canada',
    name: 'Canada',
    flag: '🇨🇦',
    states: [
      {
        code: 'ON',
        name: 'Ontario',
        cities: ['Toronto', 'Ottawa', 'Mississauga', 'Brampton', 'Hamilton', 'London', 'Markham', 'Vaughan', 'Kitchener', 'Windsor']
      },
      {
        code: 'QC',
        name: 'Quebec',
        cities: ['Montreal', 'Quebec City', 'Laval', 'Gatineau', 'Longueuil', 'Sherbrooke', 'Saguenay', 'Levis']
      },
      {
        code: 'BC',
        name: 'British Columbia',
        cities: ['Vancouver', 'Surrey', 'Burnaby', 'Richmond', 'Anmore', 'Coquitlam', 'Kelowna', 'Victoria', 'Nanaimo', 'Kamloops']
      },
      {
        code: 'AB',
        name: 'Alberta',
        cities: ['Calgary', 'Edmonton', 'Red Deer', 'Lethbridge', 'St. Albert', 'Medicine Hat', 'Grande Prairie']
      },
      {
        code: 'MB',
        name: 'Manitoba',
        cities: ['Winnipeg', 'Brandon', 'Steinbach', 'Thompson', 'Portage la Prairie']
      },
      {
        code: 'SK',
        name: 'Saskatchewan',
        cities: ['Saskatoon', 'Regina', 'Prince Albert', 'Moose Jaw', 'Swift Current']
      },
      {
        code: 'NS',
        name: 'Nova Scotia',
        cities: ['Halifax', 'Sydney', 'Dartmouth', 'Truro', 'New Glasgow']
      }
    ]
  },
  {
    code: 'UK',
    name: 'United Kingdom',
    flag: '🇬🇧',
    states: [
      {
        code: 'ENG',
        name: 'England',
        cities: ['London', 'Birmingham', 'Manchester', 'Leeds', 'Liverpool', 'Newcastle', 'Bristol', 'Sheffield', 'Leicester', 'Coventry', 'Nottingham', 'Oxford', 'Cambridge']
      },
      {
        code: 'SCT',
        name: 'Scotland',
        cities: ['Glasgow', 'Edinburgh', 'Aberdeen', 'Dundee', 'Inverness', 'Perth', 'Stirling']
      },
      {
        code: 'WLS',
        name: 'Wales',
        cities: ['Cardiff', 'Swansea', 'Newport', 'Wrexham', 'Bangor', 'St Davids']
      },
      {
        code: 'NIR',
        name: 'Northern Ireland',
        cities: ['Belfast', 'Derry', 'Lisburn', 'Newry', 'Armagh']
      }
    ]
  },
  {
    code: 'India',
    name: 'India',
    flag: '🇮🇳',
    states: [
      {
        code: 'MH',
        name: 'Maharashtra',
        cities: ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad', 'Navi Mumbai', 'Solapur', 'Amravati']
      },
      {
        code: 'DL',
        name: 'Delhi',
        cities: ['New Delhi', 'Dwarka', 'Rohini', 'Vasant Kunj', 'Saket', 'Karol Bagh', 'Connaught Place']
      },
      {
        code: 'KA',
        name: 'Karnataka',
        cities: ['Bengaluru', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum', 'Davanagere', 'Bellary']
      },
      {
        code: 'TN',
        name: 'Tamil Nadu',
        cities: ['Chennai', 'Coimbatore', 'Madurai', 'Trichy', 'Salem', 'Tirunelveli', 'Vellore']
      },
      {
        code: 'TS',
        name: 'Telangana',
        cities: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Ramagundam']
      },
      {
        code: 'WB',
        name: 'West Bengal',
        cities: ['Kolkata', 'Howrah', 'Durgapur', 'Siliguri', 'Asansol', 'Kharagpur', 'Darjeeling']
      },
      {
        code: 'GJ',
        name: 'Gujarat',
        cities: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Gandhinagar']
      },
      {
        code: 'UP',
        name: 'Uttar Pradesh',
        cities: ['Lucknow', 'Kanpur', 'Noida', 'Ghaziabad', 'Agra', 'Varanasi', 'Allahabad', 'Meerut', 'Aligarh']
      }
    ]
  },
  {
    code: 'Australia',
    name: 'Australia',
    flag: '🇦🇺',
    states: [
      {
        code: 'NSW',
        name: 'New South Wales',
        cities: ['Sydney', 'Newcastle', 'Wollongong', 'Central Coast', 'Byron Bay', 'Tweed Heads', 'Maitland']
      },
      {
        code: 'VIC',
        name: 'Victoria',
        cities: ['Melbourne', 'Geelong', 'Ballarat', 'Bendigo', 'Mildura', 'Shepparton', 'Wodonga']
      },
      {
        code: 'QLD',
        name: 'Queensland',
        cities: ['Brisbane', 'Gold Coast', 'Sunshine Coast', 'Townsville', 'Cairns', 'Toowoomba', 'Mackay']
      },
      {
        code: 'WA',
        name: 'Western Australia',
        cities: ['Perth', 'Fremantle', 'Bunbury', 'Albany', 'Geraldton', 'Kalgoorlie']
      },
      {
        code: 'SA',
        name: 'South Australia',
        cities: ['Adelaide', 'Mount Gambier', 'Whyalla', 'Port Augusta', 'Port Pirie']
      },
      {
        code: 'TAS',
        name: 'Tasmania',
        cities: ['Hobart', 'Launceston', 'Devonport', 'Burnie']
      },
      {
        code: 'ACT',
        name: 'Australian Capital Territory',
        cities: ['Canberra']
      }
    ]
  }
];
