import { Destination, Trip } from '../types';

export const POPULAR_DESTINATIONS: Destination[] = [
  {
    id: 'dest-jaipur',
    name: 'Jaipur',
    country: 'India',
    region: 'Rajasthan',
    tagline: 'The Pink City of majestic royal forts, mirror palaces, and spice bazaars',
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1600&q=85',
    dominantAccent: '#C85A32',
    heroGradient: 'from-[#2A140E]/95 via-[#3D1E14]/85 to-[#1E0D08]/90',
    bgTint: 'rgba(200, 90, 50, 0.08)',
    averageDailyCost: 65,
    costIndex: 1,
    popularSeason: 'October – March',
    highlights: ['Amber Fort & Sheesh Mahal', 'Hawa Mahal Palace', 'City Palace Museum', 'Johari Bazaar Gems'],
    vibe: 'Royal Heritage & Art',
    description: 'Immerse yourself in Rajasthan’s opulent capital, where terracotta-hued sandstone facades line storied streets and hilltop fortresses overlook desert landscapes.',
    curatedStops: ['Jaipur', 'Jodhpur', 'Udaipur'],
    curatedActivities: [
      { id: 'act-jpr-1', title: 'Amber Fort Morning Jeep Ascent & Sheesh Mahal', category: 'sightseeing', duration: '3 hrs', cost: 20, time: '08:30', description: 'Explore the grand 16th-century fortress and intricate mirror mosaics before crowds arrive.' },
      { id: 'act-jpr-2', title: 'Hawa Mahal Photo Walk & Rooftop Chai', category: 'dining', duration: '1.5 hrs', cost: 8, time: '11:30', description: 'Marvel at 953 honeycomb windows while sipping cardamom spiced tea overlooking the street.' },
      { id: 'act-jpr-3', title: 'Traditional Sanganer Block Printing Workshop', category: 'leisure', duration: '2 hrs', cost: 35, time: '14:30', description: 'Hand-stamp your own organic cotton scarf with artisan master craftsmen.' },
      { id: 'act-jpr-4', title: 'Royal Thali Dinner at 1130 AD', category: 'dining', duration: '2 hrs', cost: 30, time: '19:30', description: 'Feast on Dal Baati Churma, Ker Sangri, and Laal Maas under courtyard lanterns.' }
    ]
  },
  {
    id: 'dest-shimla',
    name: 'Shimla',
    country: 'India',
    region: 'Himachal Pradesh',
    tagline: 'Queen of the Hills with colonial charm, pine forests, and Himalayan panoramas',
    image: 'https://images.unsplash.com/photo-1562979314-bee7453e911c?auto=format&fit=crop&w=1600&q=85',
    dominantAccent: '#4A6B70',
    heroGradient: 'from-[#0F1D21]/95 via-[#1E2E33]/85 to-[#0D181B]/90',
    bgTint: 'rgba(74, 107, 112, 0.08)',
    averageDailyCost: 75,
    costIndex: 2,
    popularSeason: 'April – June & Dec – Feb',
    highlights: ['Kalka-Shimla Toy Train', 'The Ridge & Christ Church', 'Jakhoo Hill & Temple', 'Mall Road Evening Walk'],
    vibe: 'Pine Whispers & Colonial Heritage',
    description: 'Perched high in the Western Himalayas, Shimla offers crisp mountain breezes, British-era neo-Gothic landmarks, and endless ridge trails bordered by towering deodars.',
    curatedStops: ['Shimla', 'Kullu', 'Manali'],
    curatedActivities: [
      { id: 'act-shm-1', title: 'UNESCO Heritage Toy Train from Kalka', category: 'transport', duration: '5 hrs', cost: 15, time: '06:00', description: 'Winding through 102 mountain tunnels with breathtaking valley vistas.' },
      { id: 'act-shm-2', title: 'Heritage Ridge Stroll & Christ Church', category: 'sightseeing', duration: '2 hrs', cost: 0, time: '15:00', description: 'Walk along the pedestrian-only historic promenade and inspect stained-glass windows.' },
      { id: 'act-shm-3', title: 'Jakhoo Temple Ropeway & Pine Forest Hike', category: 'leisure', duration: '2.5 hrs', cost: 12, time: '10:00', description: 'Glide across the valley in a cable car to Shimla’s highest peak at 2,455m.' },
      { id: 'act-shm-4', title: 'High Tea & Bakery Treats at Cecil Hotel', category: 'dining', duration: '1.5 hrs', cost: 25, time: '17:30', description: 'Delight in artisanal scones and Darjeeling first flush beside open log fires.' }
    ]
  },
  {
    id: 'dest-goa',
    name: 'Goa',
    country: 'India',
    region: 'Konkan Coast',
    tagline: 'Golden sun-drenched shores, Portuguese villas, and lush spice plantations',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1600&q=85',
    dominantAccent: '#D97706',
    heroGradient: 'from-[#261808]/95 via-[#38230D]/85 to-[#1A0E04]/90',
    bgTint: 'rgba(217, 119, 6, 0.08)',
    averageDailyCost: 80,
    costIndex: 2,
    popularSeason: 'November – March',
    highlights: ['Palolem & Anjuna Beaches', 'Fontainhas Latin Quarter', 'Dudhsagar Waterfalls', 'Spice Plantation Feast'],
    vibe: 'Coastal Bliss & Bohemian Spirit',
    description: 'Where Arabian Sea waves lap against golden sands, century-old Portuguese manors glow in pastel ochre, and fresh seafood curries simmer under swaying coconut palms.',
    curatedStops: ['North Goa', 'South Goa', 'Gokarna'],
    curatedActivities: [
      { id: 'act-goa-1', title: 'Fontainhas Pastel Heritage Architecture Walk', category: 'sightseeing', duration: '2 hrs', cost: 15, time: '09:00', description: 'Discover Panaji’s vibrant Latin Quarter, azulejo tilework, and heritage cafes.' },
      { id: 'act-goa-2', title: 'Sunset Kayaking in the Sal Backwaters', category: 'leisure', duration: '2.5 hrs', cost: 30, time: '16:30', description: 'Paddle peacefully through lush mangrove channels as kingfishers dart overhead.' },
      { id: 'act-goa-3', title: 'Sahakari Spice Farm Tour & Banana Leaf Lunch', category: 'dining', duration: '3 hrs', cost: 22, time: '12:00', description: 'Sample fresh cinnamon, vanilla, and traditional Konkani kingfish curry.' },
      { id: 'act-goa-4', title: 'Candlelight Seafood Shack Dinner at Ashvem', category: 'dining', duration: '2 hrs', cost: 35, time: '20:00', description: 'Dine with toes in the sand listening to acoustic guitar and crashing waves.' }
    ]
  },
  {
    id: 'dest-manali',
    name: 'Manali & Solang',
    country: 'India',
    region: 'Himachal Pradesh',
    tagline: 'Snowcapped peaks, roaring rivers, and high-altitude Himalayan passes',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1600&q=85',
    dominantAccent: '#3F6E54',
    heroGradient: 'from-[#0C1A13]/95 via-[#182C22]/85 to-[#08120D]/90',
    bgTint: 'rgba(63, 110, 84, 0.08)',
    averageDailyCost: 70,
    costIndex: 1,
    popularSeason: 'Oct – June (Snow in Dec–Feb)',
    highlights: ['Solang Valley Gliders', 'Rohtang Pass & Atal Tunnel', 'Old Manali Apple Orchards', 'Hadimba Wooden Temple'],
    vibe: 'Alpine Adventure & Serenity',
    description: 'Gateway to the high Himalayas, Manali charms travelers with cedar-scented trails, wooden pagoda shrines, and crystalline glacial streams.',
    curatedStops: ['Manali', 'Kasol', 'Spiti Valley'],
    curatedActivities: [
      { id: 'act-mnl-1', title: 'Ancient Hadimba Temple Wooden Forest Walk', category: 'sightseeing', duration: '2 hrs', cost: 5, time: '09:30', description: 'Wander through giant deodar groves surrounding the 1553 pagoda temple.' },
      { id: 'act-mnl-2', title: 'Solang Valley Paragliding Flight', category: 'leisure', duration: '3 hrs', cost: 45, time: '11:30', description: 'Soar with tandem pilots over snow-dusted meadows and deep green gorges.' },
      { id: 'act-mnl-3', title: 'Old Manali Riverside Cafe Hopping & Trout', category: 'dining', duration: '2 hrs', cost: 18, time: '18:00', description: 'Savor freshly grilled river trout and warm apple crumble with cinnamon.' }
    ]
  },
  {
    id: 'dest-kyoto',
    name: 'Kyoto',
    country: 'Japan',
    region: 'Kansai',
    tagline: 'Centuries-old wooden temples, meditative rock gardens, and bamboo paths',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1600&q=85',
    dominantAccent: '#9E3838',
    heroGradient: 'from-[#230F0F]/95 via-[#341616]/85 to-[#160808]/90',
    bgTint: 'rgba(158, 56, 56, 0.08)',
    averageDailyCost: 155,
    costIndex: 3,
    popularSeason: 'March – May & Oct – Nov',
    highlights: ['Fushimi Inari Torii Path', 'Arashiyama Bamboo Grove', 'Gion Geisha District', 'Kinkaku-ji Golden Pavilion'],
    vibe: 'Culture & Tranquility',
    description: 'Japan’s historic heart, where cobblestone streets, crimson torii gates, and matcha tea ceremonies preserve ancient traditions seamlessly.',
    curatedStops: ['Tokyo', 'Kyoto', 'Osaka', 'Nara'],
    curatedActivities: [
      { id: 'act-kyo-1', title: 'Fushimi Inari Dawn Torii Gate Hike', category: 'sightseeing', duration: '2.5 hrs', cost: 0, time: '06:30', description: 'Ascend Mount Inari before tourist crowds beneath 10,000 vivid vermilion gates.' },
      { id: 'act-kyo-2', title: 'Arashiyama Bamboo Grove & Tenryu-ji Zen Garden', category: 'sightseeing', duration: '3 hrs', cost: 8, time: '10:00', description: 'Listen to the rustle of giant bamboo stems and sit beside a 14th-century pond garden.' },
      { id: 'act-kyo-3', title: 'Traditional Chado Tea Ceremony in Machiya', category: 'leisure', duration: '1.5 hrs', cost: 45, time: '14:30', description: 'Learn the ritual art of whisking ceremonial Uji matcha with a tea master.' },
      { id: 'act-kyo-4', title: 'Kaiseki Multi-Course Dinner in Pontocho', category: 'dining', duration: '2 hrs', cost: 80, time: '19:00', description: 'Seasonal tasting menu alongside the Kamogawa river lantern reflections.' }
    ]
  },
  {
    id: 'dest-amalfi',
    name: 'Amalfi Coast',
    country: 'Italy',
    region: 'Campania',
    tagline: 'Pastel cliffside villages, azure Tyrrhenian waters, and fragrant lemon groves',
    image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1600&q=85',
    dominantAccent: '#1F6F8B',
    heroGradient: 'from-[#0B1E26]/95 via-[#132E3A]/85 to-[#071319]/90',
    bgTint: 'rgba(31, 111, 139, 0.08)',
    averageDailyCost: 220,
    costIndex: 4,
    popularSeason: 'May – September',
    highlights: ['Positano Cliff Walk', 'Ravello Villa Rufolo', 'Capri Private Boat Charter', 'Path of the Gods Trek'],
    vibe: 'Coastal Romance & Luxury',
    description: 'Dramatic limestone cliffs plunging into sparkling turquoise waters, dotted with terraced vineyards and iconic stacked pastel villas.',
    curatedStops: ['Naples', 'Sorrento', 'Positano', 'Amalfi', 'Capri'],
    curatedActivities: [
      { id: 'act-amf-1', title: 'Path of the Gods Panoramic Mountain Trail', category: 'leisure', duration: '3.5 hrs', cost: 0, time: '08:30', description: 'Hike cliffside trails high above the coastline with panoramic sea views.' },
      { id: 'act-amf-2', title: 'Capri Island Boat Cruise & Blue Grotto', category: 'transport', duration: '5 hrs', cost: 95, time: '11:00', description: 'Sail around Faraglioni rock formations and swim in crystal coves.' },
      { id: 'act-amf-3', title: 'Limoncello Tasting in Amalfi Lemon Orchard', category: 'dining', duration: '1.5 hrs', cost: 30, time: '16:30', description: 'Walk through terraced lemon groves and taste handmade artisanal liqueur.' },
      { id: 'act-amf-4', title: 'Sunset Seafood Pasta on Positano Terrace', category: 'dining', duration: '2 hrs', cost: 65, time: '20:00', description: 'Fresh scialatielli with clams and local Falanghina wine overlooking the lights.' }
    ]
  },
  {
    id: 'dest-zermatt',
    name: 'Zermatt & Matterhorn',
    country: 'Switzerland',
    region: 'Valais',
    tagline: 'Iconic pyramidal alpine peaks, car-free village trails, and glacier skiing',
    image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1600&q=85',
    dominantAccent: '#335C67',
    heroGradient: 'from-[#0C1A1E]/95 via-[#16292E]/85 to-[#081114]/90',
    bgTint: 'rgba(51, 92, 103, 0.08)',
    averageDailyCost: 260,
    costIndex: 4,
    popularSeason: 'June – September & Dec – April',
    highlights: ['Gornergrat Cogwheel Train', 'Matterhorn Glacier Paradise', 'Five Lakes Alpine Hike', 'Swiss Cheese Fondue'],
    vibe: 'Majestic Alps & Pure Luxury',
    description: 'A storybook car-free mountain haven sitting directly in the shadow of the world’s most photographed peak.',
    curatedStops: ['Zurich', 'Lucerne', 'Interlaken', 'Zermatt'],
    curatedActivities: [
      { id: 'act-zmt-1', title: 'Gornergrat Railway to 3,089m Ridge', category: 'transport', duration: '3 hrs', cost: 85, time: '09:00', description: 'Ride Europe’s highest open-air cogwheel railway across 29 four-thousander peaks.' },
      { id: 'act-zmt-2', title: 'Riffelsee Mirror Reflection Photo Walk', category: 'sightseeing', duration: '1.5 hrs', cost: 0, time: '12:00', description: 'Capture the immaculate reflection of the Matterhorn in the still glacial lake.' },
      { id: 'act-zmt-3', title: 'Authentic Swiss Gruyère Fondue in Old Village', category: 'dining', duration: '2 hrs', cost: 50, time: '19:00', description: 'Dip crusty rustic bread into bubbling aged cheeses in a 300-year-old chalet.' }
    ]
  },
  {
    id: 'dest-barcelona',
    name: 'Barcelona',
    country: 'Spain',
    region: 'Catalonia',
    tagline: 'Gaudí’s surrealist architecture, bustling tapas bars, and Mediterranean vibes',
    image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1600&q=85',
    dominantAccent: '#A84323',
    heroGradient: 'from-[#24110A]/95 via-[#37190E]/85 to-[#170904]/90',
    bgTint: 'rgba(168, 67, 35, 0.08)',
    averageDailyCost: 140,
    costIndex: 3,
    popularSeason: 'May – October',
    highlights: ['Sagrada Família', 'Park Güell Mosaics', 'Gothic Quarter Tapas', 'Barceloneta Beachfront'],
    vibe: 'Art, Food & Vibrant Sun',
    description: 'Dynamic Catalan metropolis blending avant-garde modernist architecture, sun-drenched urban beaches, and buzzing tapas culture.',
    curatedStops: ['Barcelona', 'Valencia', 'Madrid', 'Seville'],
    curatedActivities: [
      { id: 'act-bcn-1', title: 'Sagrada Família Interior Architecture Tour', category: 'sightseeing', duration: '2.5 hrs', cost: 32, time: '10:00', description: 'Gaze up at Gaudí’s stained-glass forest canopy of stone columns and colorful light.' },
      { id: 'act-bcn-2', title: 'El Born & Gothic Quarter Tapas Crawl', category: 'dining', duration: '3 hrs', cost: 45, time: '19:30', description: 'Taste Jamón Ibérico, Patatas Bravas, Pan con Tomate, and local Cava.' }
    ]
  },
  {
    id: 'dest-capetown',
    name: 'Cape Town',
    country: 'South Africa',
    region: 'Western Cape',
    tagline: 'Dramatic ocean cliffs, penguins on white sand, and world-class wine valleys',
    image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=1600&q=85',
    dominantAccent: '#2E6171',
    heroGradient: 'from-[#0C1A1E]/95 via-[#132A31]/85 to-[#071114]/90',
    bgTint: 'rgba(46, 97, 113, 0.08)',
    averageDailyCost: 110,
    costIndex: 2,
    popularSeason: 'November – March',
    highlights: ['Table Mountain Cableway', 'Boulders Beach Penguins', 'Cape of Good Hope', 'Stellenbosch Wine Tour'],
    vibe: 'Adventure, Ocean & Vineyards',
    description: 'Where dramatic ocean cliffs meet lush vineyards beneath the flat-topped silhouette of Table Mountain.',
    curatedStops: ['Cape Town', 'Stellenbosch', 'Hermanus', 'Garden Route'],
    curatedActivities: [
      { id: 'act-cpt-1', title: 'Table Mountain Rotating Cableway to Peak', category: 'sightseeing', duration: '2.5 hrs', cost: 25, time: '09:00', description: 'Ascend to 1,085m for panoramic views over Camps Bay and the Atlantic Ocean.' },
      { id: 'act-cpt-2', title: 'Boulders Beach African Penguin Colony Visit', category: 'leisure', duration: '2 hrs', cost: 12, time: '14:00', description: 'Walk wooden boardwalks right beside wild nesting African penguins.' }
    ]
  }
];

export const INITIAL_TRIPS: Trip[] = [
  {
    id: 'trip-royal-rajasthan',
    title: 'Royal Rajasthan: Jaipur, Jodhpur & Udaipur',
    description: 'A 10-day expedition through majestic forts, vibrant spice bazaars, and serene desert lake palaces.',
    coverImage: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=85',
    startDate: '2026-10-15',
    endDate: '2026-10-25',
    status: 'upcoming',
    travelVibe: 'Royal Heritage & Art',
    totalBudget: 2200,
    currency: 'USD',
    destinationTheme: {
      accentColor: '#C85A32',
      gradient: 'from-[#2A140E]/95 via-[#3D1E14]/85 to-[#1E0D08]/90',
      bgTint: 'rgba(200, 90, 50, 0.08)'
    },
    stops: [
      {
        id: 'stop-jpr',
        cityName: 'Jaipur',
        country: 'India',
        arrivalDate: '2026-10-15',
        departureDate: '2026-10-19',
        coverImage: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80',
        notes: 'Stay near the Old City for easy market walks and sunrise photography.',
        days: [
          {
            dayNumber: 1,
            date: '2026-10-15',
            title: 'Arrival & Amber Fort Exploration',
            activities: [
              { id: 'act-j-1', title: 'Check in at Samode Haveli Heritage Hotel', time: '14:00', duration: '1 hr', category: 'lodging', cost: 160 },
              { id: 'act-j-2', title: 'Amber Fort Morning Jeep Ascent & Sheesh Mahal', time: '16:00', duration: '3 hrs', category: 'sightseeing', cost: 20 },
              { id: 'act-j-3', title: 'Royal Thali Dinner at 1130 AD', time: '19:30', duration: '2 hrs', category: 'dining', cost: 30 }
            ]
          },
          {
            dayNumber: 2,
            date: '2026-10-16',
            title: 'Hawa Mahal & City Palace Treasures',
            activities: [
              { id: 'act-j-4', title: 'Hawa Mahal Photo Walk & Rooftop Chai', time: '09:00', duration: '1.5 hrs', category: 'dining', cost: 8 },
              { id: 'act-j-5', title: 'City Palace Museum & Peacock Courtyard', time: '11:00', duration: '2.5 hrs', category: 'sightseeing', cost: 15 },
              { id: 'act-j-6', title: 'Traditional Sanganer Block Printing Workshop', time: '15:00', duration: '2 hrs', category: 'leisure', cost: 35 }
            ]
          }
        ]
      },
      {
        id: 'stop-jdh',
        cityName: 'Jodhpur',
        country: 'India',
        arrivalDate: '2026-10-19',
        departureDate: '2026-10-22',
        coverImage: 'https://images.unsplash.com/photo-1588096344356-9b4974955745?auto=format&fit=crop&w=600&q=80',
        notes: 'The Blue City with towering Mehrangarh Fort.',
        days: [
          {
            dayNumber: 5,
            date: '2026-10-19',
            title: 'The Blue City & Mehrangarh Ramparts',
            activities: [
              { id: 'act-jd-1', title: 'Private scenic train/drive from Jaipur', time: '08:00', duration: '5 hrs', category: 'transport', cost: 45 },
              { id: 'act-jd-2', title: 'Sunset Zip-line over Mehrangarh Fort Battlements', time: '16:30', duration: '2 hrs', category: 'leisure', cost: 35 }
            ]
          }
        ]
      },
      {
        id: 'stop-udr',
        cityName: 'Udaipur',
        country: 'India',
        arrivalDate: '2026-10-22',
        departureDate: '2026-10-25',
        coverImage: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=600&q=80',
        notes: 'City of Lakes & romantic floating palaces.',
        days: [
          {
            dayNumber: 8,
            date: '2026-10-22',
            title: 'Lake Pichola Sunset Boat Cruise',
            activities: [
              { id: 'act-u-1', title: 'Lake Pichola Sunset Solar Boat Tour', time: '17:00', duration: '1.5 hrs', category: 'sightseeing', cost: 20 },
              { id: 'act-u-2', title: 'Lakeside Candlelight Dining with Taj Lake Palace View', time: '19:30', duration: '2 hrs', category: 'dining', cost: 45 }
            ]
          }
        ]
      }
    ],
    budgetItems: [
      { id: 'b-1', category: 'Flights', estimatedCost: 750, actualCost: 720, paid: true, notes: 'Delhi international return + domestic legs' },
      { id: 'b-2', category: 'Lodging', estimatedCost: 800, actualCost: 780, paid: true, notes: 'Heritage Havelis in Jaipur, Jodhpur & Udaipur' },
      { id: 'b-3', category: 'Food & Drinks', estimatedCost: 350, actualCost: 120, paid: false, notes: 'Rooftop dining, street food & high tea' },
      { id: 'b-4', category: 'Transit', estimatedCost: 150, actualCost: 130, paid: true, notes: 'Private chauffeured AC cab for intercity transit' },
      { id: 'b-5', category: 'Activities', estimatedCost: 200, actualCost: 90, paid: false, notes: 'Palace admissions, zip-line & craft workshops' }
    ]
  },
  {
    id: 'trip-himalayan-trail',
    title: 'Himalayan Ridge: Shimla to Manali',
    description: 'Pine-scented mountain air, UNESCO toy train rides, and alpine serenity in Himachal Pradesh.',
    coverImage: 'https://images.unsplash.com/photo-1562979314-bee7453e911c?auto=format&fit=crop&w=1200&q=85',
    startDate: '2026-11-05',
    endDate: '2026-11-14',
    status: 'planning',
    travelVibe: 'Pine Whispers & Mountain Peaks',
    totalBudget: 1600,
    currency: 'USD',
    destinationTheme: {
      accentColor: '#4A6B70',
      gradient: 'from-[#0F1D21]/95 via-[#1E2E33]/85 to-[#0D181B]/90',
      bgTint: 'rgba(74, 107, 112, 0.08)'
    },
    stops: [
      {
        id: 'stop-shm',
        cityName: 'Shimla',
        country: 'India',
        arrivalDate: '2026-11-05',
        departureDate: '2026-11-09',
        coverImage: 'https://images.unsplash.com/photo-1562979314-bee7453e911c?auto=format&fit=crop&w=600&q=80',
        days: [
          {
            dayNumber: 1,
            date: '2026-11-05',
            title: 'Arrival on Heritage Toy Train',
            activities: [
              { id: 'act-sh-1', title: 'UNESCO Heritage Toy Train from Kalka', time: '06:00', duration: '5 hrs', category: 'transport', cost: 15 },
              { id: 'act-sh-2', title: 'Heritage Ridge Stroll & Christ Church', time: '15:00', duration: '2 hrs', category: 'sightseeing', cost: 0 }
            ]
          }
        ]
      },
      {
        id: 'stop-mnl',
        cityName: 'Manali',
        country: 'India',
        arrivalDate: '2026-11-09',
        departureDate: '2026-11-14',
        coverImage: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=600&q=80',
        days: [
          {
            dayNumber: 5,
            date: '2026-11-09',
            title: 'Old Manali Pine Trails',
            activities: [
              { id: 'act-mn-1', title: 'Ancient Hadimba Temple Wooden Forest Walk', time: '10:00', duration: '2 hrs', category: 'sightseeing', cost: 5 },
              { id: 'act-mn-2', title: 'Solang Valley Paragliding Flight', time: '14:00', duration: '3 hrs', category: 'leisure', cost: 45 }
            ]
          }
        ]
      }
    ],
    budgetItems: [
      { id: 'b-h1', category: 'Flights', estimatedCost: 400, actualCost: 380, paid: true, notes: 'Chandigarh airport connection' },
      { id: 'b-h2', category: 'Lodging', estimatedCost: 650, actualCost: 600, paid: true, notes: 'Cozy pine wood mountain chalets' },
      { id: 'b-h3', category: 'Food & Drinks', estimatedCost: 280, actualCost: 80, paid: false, notes: 'Mountain cafes, local trout & teas' },
      { id: 'b-h4', category: 'Transit', estimatedCost: 150, actualCost: 120, paid: true, notes: 'Toy train ticket + private mountain driver' },
      { id: 'b-h5', category: 'Activities', estimatedCost: 120, actualCost: 50, paid: false, notes: 'Paragliding and temple passes' }
    ]
  },
  {
    id: 'trip-japan-autumn',
    title: 'Autumn in Japan: Tokyo & Kyoto',
    description: 'A fast bullet-train journey between neon metropolis avenues and serene autumn maple shrines.',
    coverImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=85',
    startDate: '2026-11-20',
    endDate: '2026-11-30',
    status: 'upcoming',
    travelVibe: 'Culture & Tranquility',
    totalBudget: 3400,
    currency: 'USD',
    destinationTheme: {
      accentColor: '#9E3838',
      gradient: 'from-[#230F0F]/95 via-[#341616]/85 to-[#160808]/90',
      bgTint: 'rgba(158, 56, 56, 0.08)'
    },
    stops: [
      {
        id: 'stop-tky',
        cityName: 'Tokyo',
        country: 'Japan',
        arrivalDate: '2026-11-20',
        departureDate: '2026-11-25',
        coverImage: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80',
        days: [
          {
            dayNumber: 1,
            date: '2026-11-20',
            title: 'Arrival in Shinjuku & Ramen Night',
            activities: [
              { id: 'act-tk-1', title: 'Check in at Hotel Gracery Shinjuku', time: '14:00', duration: '1 hr', category: 'lodging', cost: 180 },
              { id: 'act-tk-2', title: 'Ramen Tasting at Omoide Yokocho', time: '18:30', duration: '1.5 hrs', category: 'dining', cost: 25 }
            ]
          }
        ]
      },
      {
        id: 'stop-kyt',
        cityName: 'Kyoto',
        country: 'Japan',
        arrivalDate: '2026-11-25',
        departureDate: '2026-11-30',
        coverImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80',
        days: [
          {
            dayNumber: 6,
            date: '2026-11-25',
            title: 'Shinkansen & Gion Evening Walk',
            activities: [
              { id: 'act-ky-1', title: 'Shinkansen Bullet Train to Kyoto', time: '09:00', duration: '2.5 hrs', category: 'transport', cost: 130 },
              { id: 'act-ky-2', title: 'Fushimi Inari Dawn Torii Gate Hike', time: '15:30', duration: '2.5 hrs', category: 'sightseeing', cost: 0 }
            ]
          }
        ]
      }
    ],
    budgetItems: [
      { id: 'b-j1', category: 'Flights', estimatedCost: 1100, actualCost: 1050, paid: true, notes: 'SFO - NRT direct' },
      { id: 'b-j2', category: 'Lodging', estimatedCost: 1200, actualCost: 1180, paid: true, notes: 'Tokyo hotel + Kyoto Machiya' },
      { id: 'b-j3', category: 'Food & Drinks', estimatedCost: 600, actualCost: 210, paid: false, notes: 'Kaiseki, sushi & ramen' },
      { id: 'b-j4', category: 'Transit', estimatedCost: 320, actualCost: 290, paid: true, notes: 'JR Shinkansen tickets' },
      { id: 'b-j5', category: 'Activities', estimatedCost: 180, actualCost: 80, paid: false, notes: 'Tea ceremony and museum entry' }
    ]
  }
];
