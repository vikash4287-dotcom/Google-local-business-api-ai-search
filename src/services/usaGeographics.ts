export interface StateData {
  code: string;
  name: string;
  cities: string[];
}

export const USA_STATES_AND_CITIES: StateData[] = [
  {
    code: 'AL',
    name: 'Alabama',
    cities: ['Birmingham', 'Montgomery', 'Mobile', 'Huntsville', 'Tuscaloosa', 'Auburn', 'Decatur', 'Dothan', 'Florence']
  },
  {
    code: 'AK',
    name: 'Alaska',
    cities: ['Anchorage', 'Fairbanks', 'Juneau', 'Sitka', 'Ketchikan', 'Wasilla', 'Kenai']
  },
  {
    code: 'AZ',
    name: 'Arizona',
    cities: ['Phoenix', 'Tucson', 'Mesa', 'Chandler', 'Glendale', 'Scottsdale', 'Gilbert', 'Tempe', 'Peoria', 'Flagstaff', 'Yuma']
  },
  {
    code: 'AR',
    name: 'Arkansas',
    cities: ['Little Rock', 'Fort Smith', 'Fayetteville', 'Springdale', 'Jonesboro', 'Rogers', 'Pine Bluff', 'Hot Springs']
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
    code: 'CO',
    name: 'Colorado',
    cities: ['Denver', 'Colorado Springs', 'Aurora', 'Fort Collins', 'Lakewood', 'Thornton', 'Arvada', 'Westminster', 'Pueblo', 'Boulder', 'Aspen', 'Vail']
  },
  {
    code: 'CT',
    name: 'Connecticut',
    cities: ['Bridgeport', 'New Haven', 'Hartford', 'Stamford', 'Waterbury', 'Norwalk', 'Danbury', 'New Britain']
  },
  {
    code: 'DE',
    name: 'Delaware',
    cities: ['Wilmington', 'Dover', 'Newark', 'Middletown', 'Milford', 'Seaford']
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
    code: 'GA',
    name: 'Georgia',
    cities: ['Atlanta', 'Columbus', 'Augusta', 'Macon', 'Savannah', 'Athens', 'Sandy Springs', 'Roswell', 'Johns Creek', 'Alpharetta']
  },
  {
    code: 'HI',
    name: 'Hawaii',
    cities: ['Honolulu', 'Hilo', 'Kahului', 'Kailua', 'Kapolei', 'Lihue']
  },
  {
    code: 'ID',
    name: 'Idaho',
    cities: ['Boise', 'Meridian', 'Nampa', 'Idaho Falls', 'Pocatello', 'Caldwell', 'Twin Falls', 'Coeur d\'Alene']
  },
  {
    code: 'IL',
    name: 'Illinois',
    cities: ['Chicago', 'Aurora', 'Rockford', 'Joliet', 'Naperville', 'Springfield', 'Peoria', 'Elgin', 'Waukegan', 'Champaign']
  },
  {
    code: 'IN',
    name: 'Indiana',
    cities: ['Indianapolis', 'Fort Wayne', 'Evansville', 'South Bend', 'Carmel', 'Fishers', 'Bloomington', 'Hammond', 'Lafayette']
  },
  {
    code: 'IA',
    name: 'Iowa',
    cities: ['Des Moines', 'Cedar Rapids', 'Davenport', 'Sioux City', 'Waterloo', 'Iowa City', 'Council Bluffs', 'Ames']
  },
  {
    code: 'KS',
    name: 'Kansas',
    cities: ['Wichita', 'Overland Park', 'Kansas City', 'Olathe', 'Topeka', 'Lawrence', 'Shawnee', 'Manhattan', 'Salina']
  },
  {
    code: 'KY',
    name: 'Kentucky',
    cities: ['Louisville', 'Lexington', 'Bowling Green', 'Owensboro', 'Covington', 'Hopkinsville', 'Frankfort', 'Paducah']
  },
  {
    code: 'LA',
    name: 'Louisiana',
    cities: ['New Orleans', 'Baton Rouge', 'Shreveport', 'Lafayette', 'Lake Charles', 'Kenner', 'Bossier City', 'Monroe']
  },
  {
    code: 'ME',
    name: 'Maine',
    cities: ['Portland', 'Lewiston', 'Bangor', 'South Portland', 'Auburn', 'Biddeford', 'Augusta', 'Saco']
  },
  {
    code: 'MD',
    name: 'Maryland',
    cities: ['Baltimore', 'Frederick', 'Rockville', 'Gaithersburg', 'Bowie', 'Annapolis', 'Salisbury', 'College Park']
  },
  {
    code: 'MA',
    name: 'Massachusetts',
    cities: ['Boston', 'Worcester', 'Springfield', 'Lowell', 'Cambridge', 'New Bedford', 'Brockton', 'Quincy', 'Lynn', 'Newton']
  },
  {
    code: 'MI',
    name: 'Michigan',
    cities: ['Detroit', 'Grand Rapids', 'Warren', 'Sterling Heights', 'Ann Arbor', 'Lansing', 'Flint', 'Dearborn', 'Troy', 'Kalamazoo']
  },
  {
    code: 'MN',
    name: 'Minnesota',
    cities: ['Minneapolis', 'St. Paul', 'Rochester', 'Duluth', 'Bloomington', 'Brooklyn Park', 'Plymouth', 'Woodbury', 'Eagan']
  },
  {
    code: 'MS',
    name: 'Mississippi',
    cities: ['Jackson', 'Gulfport', 'Southaven', 'Biloxi', 'Hattiesburg', 'Meridian', 'Tupelo', 'Greenville']
  },
  {
    code: 'MO',
    name: 'Missouri',
    cities: ['Kansas City', 'St. Louis', 'Springfield', 'Independence', 'Columbia', 'Lee\'s Summit', 'O\'Fallon', 'St. Joseph']
  },
  {
    code: 'MT',
    name: 'Montana',
    cities: ['Billings', 'Missoula', 'Great Falls', 'Bozeman', 'Helena', 'Butte', 'Kalispell']
  },
  {
    code: 'NE',
    name: 'Nebraska',
    cities: ['Omaha', 'Lincoln', 'Bellevue', 'Grand Island', 'Kearney', 'Fremont', 'Hastings']
  },
  {
    code: 'NV',
    name: 'Nevada',
    cities: ['Las Vegas', 'Henderson', 'Reno', 'North Las Vegas', 'Sparks', 'Carson City', 'Elko']
  },
  {
    code: 'NH',
    name: 'New Hampshire',
    cities: ['Manchester', 'Nashua', 'Concord', 'Derry', 'Dover', 'Rochester', 'Portsmouth']
  },
  {
    code: 'NJ',
    name: 'New Jersey',
    cities: ['Newark', 'Jersey City', 'Paterson', 'Elizabeth', 'Clifton', 'Trenton', 'Camden', 'Hoboken', 'Atlantic City', 'Princeton']
  },
  {
    code: 'NM',
    name: 'New Mexico',
    cities: ['Albuquerque', 'Las Cruces', 'Rio Rancho', 'Santa Fe', 'Roswell', 'Farmington', 'Clovis']
  },
  {
    code: 'NY',
    name: 'New York',
    cities: ['New York', 'Buffalo', 'Rochester', 'Yonkers', 'Syracuse', 'Albany', 'New Rochelle', 'Mount Vernon', 'Schenectady', 'Utica']
  },
  {
    code: 'NC',
    name: 'North Carolina',
    cities: ['Charlotte', 'Raleigh', 'Greensboro', 'Durham', 'Winston-Salem', 'Fayetteville', 'Cary', 'Wilmington', 'High Point', 'Asheville']
  },
  {
    code: 'ND',
    name: 'North Dakota',
    cities: ['Fargo', 'Bismarck', 'Grand Forks', 'Minot', 'West Fargo', 'Williston', 'Dickinson']
  },
  {
    code: 'OH',
    name: 'Ohio',
    cities: ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo', 'Akron', 'Dayton', 'Parma', 'Canton', 'Youngstown', 'Hamilton']
  },
  {
    code: 'OK',
    name: 'Oklahoma',
    cities: ['Oklahoma City', 'Tulsa', 'Norman', 'Broken Arrow', 'Lawton', 'Edmond', 'Moore', 'Midwest City']
  },
  {
    code: 'OR',
    name: 'Oregon',
    cities: ['Portland', 'Salem', 'Eugene', 'Gresham', 'Hillsboro', 'Beaverton', 'Bend', 'Medford', 'Springfield', 'Corvallis']
  },
  {
    code: 'PA',
    name: 'Pennsylvania',
    cities: ['Philadelphia', 'Pittsburgh', 'Allentown', 'Erie', 'Reading', 'Scranton', 'Bethlehem', 'Lancaster', 'Harrisburg']
  },
  {
    code: 'RI',
    name: 'Rhode Island',
    cities: ['Providence', 'Warwick', 'Cranston', 'Pawtucket', 'East Providence', 'Woonsocket', 'Newport']
  },
  {
    code: 'SC',
    name: 'South Carolina',
    cities: ['Charleston', 'Columbia', 'North Charleston', 'Mount Pleasant', 'Rock Hill', 'Greenville', 'Sumter', 'Myrtle Beach']
  },
  {
    code: 'SD',
    name: 'South Dakota',
    cities: ['Sioux Falls', 'Rapid City', 'Aberdeen', 'Brookings', 'Watertown', 'Mitchell', 'Pierre']
  },
  {
    code: 'TN',
    name: 'Tennessee',
    cities: ['Nashville', 'Memphis', 'Knoxville', 'Chattanooga', 'Clarksville', 'Murfreesboro', 'Franklin', 'Jackson', 'Johnson City']
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
    code: 'UT',
    name: 'Utah',
    cities: ['Salt Lake City', 'West Valley City', 'Provo', 'West Jordan', 'Orem', 'Sandy', 'Ogden', 'St. George', 'Layton']
  },
  {
    code: 'VT',
    name: 'Vermont',
    cities: ['Burlington', 'South Burlington', 'Rutland', 'Barre', 'Montpelier', 'Winooski', 'St. Albans']
  },
  {
    code: 'VA',
    name: 'Virginia',
    cities: ['Virginia Beach', 'Norfolk', 'Chesapeake', 'Richmond', 'Newport News', 'Alexandria', 'Hampton', 'Roanoke', 'Arlington']
  },
  {
    code: 'WA',
    name: 'Washington',
    cities: ['Seattle', 'Spokane', 'Tacoma', 'Vancouver', 'Bellevue', 'Kent', 'Everett', 'Renton', 'Federal Way', 'Yakima', 'Olympia']
  },
  {
    code: 'WV',
    name: 'West Virginia',
    cities: ['Charleston', 'Huntington', 'Morgantown', 'Parkersburg', 'Wheeling', 'Weirton', 'Martinsburg']
  },
  {
    code: 'WI',
    name: 'Wisconsin',
    cities: ['Milwaukee', 'Madison', 'Green Bay', 'Kenosha', 'Racine', 'Appleton', 'Waukesha', 'Oshkosh', 'Eau Claire']
  },
  {
    code: 'WY',
    name: 'Wyoming',
    cities: ['Cheyenne', 'Casper', 'Laramie', 'Gillette', 'Rock Springs', 'Sheridan', 'Green River']
  }
];
