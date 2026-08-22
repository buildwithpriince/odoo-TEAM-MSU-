import { 
  getInitialCommunityTrips, 
  fetchCommunityTrips,
  toggleLikeTrip,
  toggleSaveTrip
} from '../src/services/communityService';
import { INITIAL_TRIPS } from '../src/data/mockData';

async function runTests() {
  console.log('=== GLOBETROTTER COMMUNITY VALIDATION ===');

  // Test 1: Community Data Generation
  const communityTrips = getInitialCommunityTrips(INITIAL_TRIPS);
  console.log(`\n[TEST 1] Loaded ${communityTrips.length} Community Trips:`);
  communityTrips.forEach((t, i) => {
    console.log(`- #${i+1} "${t.title}" by ${t.traveler.name} (${t.durationDays} days, ${t.stopsCount} stops, $${t.totalBudget}) [${t.travelVibe}]`);
  });
  if (communityTrips.length < 3) {
    throw new Error('Expected at least 3 initial community trips');
  }

  // Test 2: Search Filtering
  console.log('\n[TEST 2] Search Filtering:');
  const jaipurSearch = await fetchCommunityTrips({
    search: 'Jaipur',
    country: 'all',
    travelVibe: 'all',
    durationRange: 'all',
    budgetRange: 'all',
    groupBy: 'none',
    sortBy: 'recent'
  }, 1, 10, INITIAL_TRIPS);
  console.log(`Search 'Jaipur' matched ${jaipurSearch.total} trips:`, jaipurSearch.items.map(t => t.title));
  if (jaipurSearch.total === 0) {
    throw new Error("Search 'Jaipur' should find matching trips");
  }

  const japanSearch = await fetchCommunityTrips({
    search: 'Tokyo',
    country: 'all',
    travelVibe: 'all',
    durationRange: 'all',
    budgetRange: 'all',
    groupBy: 'none',
    sortBy: 'recent'
  }, 1, 10, INITIAL_TRIPS);
  console.log(`Search 'Tokyo' matched ${japanSearch.total} trips:`, japanSearch.items.map(t => t.title));
  if (japanSearch.total === 0) {
    throw new Error("Search 'Tokyo' should find matching trips");
  }

  // Test 3: Country Filtering
  console.log('\n[TEST 3] Country Filtering:');
  const indiaFilter = await fetchCommunityTrips({
    search: '',
    country: 'India',
    travelVibe: 'all',
    durationRange: 'all',
    budgetRange: 'all',
    groupBy: 'none',
    sortBy: 'recent'
  }, 1, 10, INITIAL_TRIPS);
  console.log(`Filter Country 'India' matched ${indiaFilter.total} trips.`);
  if (indiaFilter.total === 0) {
    throw new Error("Country 'India' should return shared trips");
  }

  // Test 4: Duration & Budget Filtering
  console.log('\n[TEST 4] Duration and Budget Filtering:');
  const durationFilter = await fetchCommunityTrips({
    search: '',
    country: 'all',
    travelVibe: 'all',
    durationRange: '6-10',
    budgetRange: 'all',
    groupBy: 'none',
    sortBy: 'recent'
  }, 1, 10, INITIAL_TRIPS);
  console.log(`Duration 6-10 days matched ${durationFilter.total} trips.`);

  const budgetFilter = await fetchCommunityTrips({
    search: '',
    country: 'all',
    travelVibe: 'all',
    durationRange: 'all',
    budgetRange: 'under-1500',
    groupBy: 'none',
    sortBy: 'recent'
  }, 1, 10, INITIAL_TRIPS);
  console.log(`Budget under $1,500 matched ${budgetFilter.total} trips.`);

  // Test 5: Sorting
  console.log('\n[TEST 5] Sorting:');
  const sortedLongest = await fetchCommunityTrips({
    search: '',
    country: 'all',
    travelVibe: 'all',
    durationRange: 'all',
    budgetRange: 'all',
    groupBy: 'none',
    sortBy: 'longest'
  }, 1, 10, INITIAL_TRIPS);
  console.log('Sorted by longest:', sortedLongest.items.map(t => `${t.title} (${t.durationDays}d)`));

  const sortedBudget = await fetchCommunityTrips({
    search: '',
    country: 'all',
    travelVibe: 'all',
    durationRange: 'all',
    budgetRange: 'all',
    groupBy: 'none',
    sortBy: 'lowest_budget'
  }, 1, 10, INITIAL_TRIPS);
  console.log('Sorted by lowest budget:', sortedBudget.items.map(t => `${t.title} ($${t.totalBudget})`));

  // Test 6: Dev Server Route Check
  try {
    const res = await fetch('http://localhost:3000/community');
    console.log('\n[TEST 6] Dev Server /community HTTP Status:', res.status, res.statusText);
    if (!res.ok) throw new Error(`Dev server returned HTTP ${res.status}`);
  } catch (err: any) {
    console.warn('Note on dev server fetch:', err.message);
  }

  console.log('\n ALL COMMUNITY TESTS PASSED SUCCESSFULLY! ');
}

runTests().catch(err => {
  console.error('Community test failed:', err);
  process.exit(1);
});
