
type Row = Record<string, any>;

export function userFromRow(row: Row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    avatarUrl: row.avatar_url || undefined,
    homeCity: row.home_city || undefined,
    currency: row.currency || 'USD',
    bio: row.bio || undefined,
    savedDestinations: JSON.parse(row.saved_destinations || '[]'),
    role: row.role || (row.email?.toLowerCase().includes('admin') ? 'admin' : 'traveler'),
  };
}

export function tripFromRow(row: Row) {
  return {
    id: row.id,
    createdAt: row.created_at,
    title: row.title,
    description: row.description,
    coverImage: row.cover_image,
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status,
    totalBudget: Number(row.total_budget),
    currency: row.currency,
    travelVibe: row.travel_vibe || undefined,
    boardingFrom: row.boarding_from || undefined,
    aiTransportEstimates: JSON.parse(row.ai_transport_estimates || '[]'),
    destinationTheme: JSON.parse(row.destination_theme || 'null'),
    stops: JSON.parse(row.stops || '[]'),
    budgetItems: JSON.parse(row.budget_items || '[]'),
  };
}
