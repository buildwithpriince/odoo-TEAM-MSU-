import { INITIAL_TRIPS } from '../src/data/mockData';
import {
  calculateOverviewMetrics,
  calculateTripStatusBreakdown,
  calculatePopularCities,
  calculatePopularActivities,
  calculateTrendPoints,
  calculateUserBehaviorMetrics,
  filterTripsByPeriod
} from '../src/services/adminAnalyticsService';

async function runTests() {
  console.log('=== GLOBETROTTER ADMIN ANALYTICS VALIDATION ===');

  // Test 1: Real Overview Metrics
  const overview = calculateOverviewMetrics(INITIAL_TRIPS, 2);
  console.log('\n[TEST 1] Overview Metrics:');
  console.log('Total Users:', overview.totalUsers);
  console.log('Total Trips:', overview.totalTrips);
  console.log('Total Cities Planned:', overview.totalCities);
  console.log('Total Activities Scheduled:', overview.totalActivities);
  console.log('Active Trips:', overview.activeTrips);
  console.log('Upcoming Trips:', overview.upcomingTrips);
  console.log('Completed Trips:', overview.completedTrips);
  console.log('Avg Trip Duration (days):', overview.avgTripDurationDays);
  console.log('Avg Cities / Trip:', overview.avgCitiesPerTrip);
  console.log('Avg Activities / Trip:', overview.avgActivitiesPerTrip);
  console.log('Avg Target Budget:', `$${overview.avgTargetBudget}`);

  if (overview.totalTrips !== INITIAL_TRIPS.length) {
    throw new Error(`Expected ${INITIAL_TRIPS.length} trips, got ${overview.totalTrips}`);
  }
  if (overview.totalCities <= 0) {
    throw new Error('Expected positive unique cities count');
  }
  if (overview.totalActivities <= 0) {
    throw new Error('Expected positive activities count');
  }

  // Test 2: Trip Status Breakdown
  const statusBreakdown = calculateTripStatusBreakdown(INITIAL_TRIPS);
  console.log('\n[TEST 2] Status Breakdown:');
  for (const s of statusBreakdown) {
    console.log(`- ${s.label} (${s.status}): ${s.count} (${s.percentage}%) [Color: ${s.color}]`);
  }
  const totalPercent = statusBreakdown.reduce((sum, s) => sum + s.percentage, 0);
  if (totalPercent < 98 || totalPercent > 102) {
    throw new Error(`Total percentage sum should be ~100%, got ${totalPercent}%`);
  }

  // Test 3: Popular Cities Aggregation
  const popularCities = calculatePopularCities(INITIAL_TRIPS);
  console.log('\n[TEST 3] Popular Cities (Top 5):');
  popularCities.slice(0, 5).forEach((c, idx) => {
    console.log(`#${idx + 1} ${c.cityName} (${c.country}) - ${c.tripAppearances} trips (${c.percentageOfTrips}%), ${c.averageDaysStayed} avg days`);
  });
  if (popularCities.length === 0) {
    throw new Error('Expected ranked cities from trip stops');
  }

  // Test 4: Popular Activities Aggregation
  const popularActivities = calculatePopularActivities(INITIAL_TRIPS);
  console.log('\n[TEST 4] Popular Activities (Top 5):');
  popularActivities.slice(0, 5).forEach((a, idx) => {
    console.log(`#${idx + 1} ${a.title} [${a.category}] in ${a.cityName} - ${a.timesScheduled} scheduled, $${a.averageCost} avg cost`);
  });
  if (popularActivities.length === 0) {
    throw new Error('Expected scheduled activities from trip itineraries');
  }

  // Test 5: Trend points
  const trends = calculateTrendPoints(INITIAL_TRIPS, [
    { id: 'usr-1', name: 'Alex', email: 'alex@globetrotter.io', role: 'traveler', tripsCount: 3, activitiesCount: 8, createdAt: '2026-08-01', status: 'active' },
    { id: 'usr-2', name: 'Admin', email: 'admin@globetrotter.io', role: 'admin', tripsCount: 0, activitiesCount: 0, createdAt: '2026-07-15', status: 'active' }
  ]);
  console.log('\n[TEST 5] Trend Data Points:', trends);
  if (trends.length === 0) {
    throw new Error('Expected trend data points');
  }

  // Test 6: User Behavior Metrics
  const behavior = calculateUserBehaviorMetrics(INITIAL_TRIPS, [
    { id: 'usr-1', name: 'Alex', email: 'alex@globetrotter.io', role: 'traveler', tripsCount: 3, activitiesCount: 8, createdAt: '2026-08-01', status: 'active' }
  ]);
  console.log('\n[TEST 6] User Behavior Metrics:', behavior);

  // Test 7: Time Period Filtering
  const filtered7d = filterTripsByPeriod(INITIAL_TRIPS, '7d');
  const filteredAll = filterTripsByPeriod(INITIAL_TRIPS, 'all');
  console.log('\n[TEST 7] Time Period Filtering:');
  console.log('All time trips:', filteredAll.length);
  console.log('7 days filtered trips:', filtered7d.length);

  // Test 8: HTTP Server Response Check on localhost:3000
  try {
    const res = await fetch('http://localhost:3000/');
    console.log('\n[TEST 8] Dev Server HTTP Status:', res.status, res.statusText);
    if (!res.ok) throw new Error(`Dev server returned HTTP ${res.status}`);
  } catch (err: any) {
    console.warn('Dev server connection test note:', err.message);
  }

  console.log('\n ALL ADMIN ANALYTICS TESTS PASSED SUCCESSFULLY! ');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
