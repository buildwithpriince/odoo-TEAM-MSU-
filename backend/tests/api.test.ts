
import test from 'node:test';
import assert from 'node:assert/strict';

const base = process.env.TEST_API_BASE_URL || 'http://localhost:5000/api';
let token = '';

async function request(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const res = await fetch(`${base}${path}`, { ...options, headers });
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  return { res, body };
}

test('health endpoint', async () => {
  const { res, body } = await request('/health');
  assert.equal(res.status, 200);
  assert.equal(body.ok, true);
});

test('demo authentication returns JWT', async () => {
  const { res, body } = await request('/auth/demo', { method: 'POST' });
  assert.equal(res.status, 200);
  assert.ok(body.token);
  assert.equal(body.user.email, 'alex.morgan@globetrotter.io');
  token = body.token;
});

test('invalid authentication is rejected', async () => {
  const res = await fetch(`${base}/trips`, { headers: { Authorization: 'Bearer invalid' } });
  assert.equal(res.status, 401);
});

test('trip CRUD persists through API', async () => {
  const trip = {
    id: `test-trip-${Date.now()}`,
    title: 'API Test Journey',
    description: 'Created by integration test',
    coverImage: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828',
    startDate: '2026-12-01',
    endDate: '2026-12-05',
    status: 'planning',
    totalBudget: 1000,
    currency: 'USD',
    travelVibe: 'Testing',
    stops: [{
      id: 'test-stop',
      cityName: 'Ahmedabad',
      country: 'India',
      arrivalDate: '2026-12-01',
      departureDate: '2026-12-05',
      days: [{ dayNumber: 1, date: '2026-12-01', title: 'Day 1', activities: [] }]
    }],
    budgetItems: []
  };

  let result = await request('/trips', { method: 'POST', body: JSON.stringify(trip) });
  assert.equal(result.res.status, 201);
  assert.equal(result.body.trip.id, trip.id);

  result = await request(`/trips/${trip.id}`);
  assert.equal(result.res.status, 200);
  assert.equal(result.body.trip.title, trip.title);

  result = await request(`/trips/${trip.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ ...result.body.trip, title: 'API Test Journey Updated' })
  });
  assert.equal(result.res.status, 200);
  assert.equal(result.body.trip.title, 'API Test Journey Updated');

  result = await request(`/trips/${trip.id}`, { method: 'DELETE' });
  assert.equal(result.res.status, 204);

  result = await request(`/trips/${trip.id}`);
  assert.equal(result.res.status, 404);
});

test('profile update persists', async () => {
  const { res, body } = await request('/users/me', {
    method: 'PATCH',
    body: JSON.stringify({ bio: 'Integration test profile' })
  });
  assert.equal(res.status, 200);
  assert.equal(body.user.bio, 'Integration test profile');
  await request('/users/me', { method: 'PATCH', body: JSON.stringify({ bio: 'Passionate wanderer, coffee enthusiast, seeking authentic food stalls and hidden mountain trails.' }) });
});
