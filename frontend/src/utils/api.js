const API_BASE = '/api';

// Generic fetch helper
async function fetchAPI(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `HTTP ${response.status}`);
  }

  // Handle non-JSON responses (like DELETE success messages)
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  } else {
    return response.text();
  }
}

// Airlines
export const getAirlineByIATA = (iata) => fetchAPI(`/airlines/${iata}`);
export const getAllAirlines = () => fetchAPI('/airlines');
export const getAirportsByAirline = (iata) => fetchAPI(`/airlines/${iata}/airports`);
export const createAirline = (data) => fetchAPI('/airlines', { method: 'POST', body: JSON.stringify(data) });
export const updateAirline = (id, data) => fetchAPI(`/airlines/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteAirline = (id) => fetchAPI(`/airlines/${id}`, { method: 'DELETE' });

// Airports
export const getAirportByIATA = (iata) => fetchAPI(`/airports/${iata}`);
export const getAllAirports = () => fetchAPI('/airports');
export const getAirlinesByAirport = (iata) => fetchAPI(`/airports/${iata}/airlines`);
export const createAirport = (data) => fetchAPI('/airports', { method: 'POST', body: JSON.stringify(data) });
export const updateAirport = (id, data) => fetchAPI(`/airports/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteAirport = (id) => fetchAPI(`/airports/${id}`, { method: 'DELETE' });

// Routes
export const getOneHopRoutes = (source, dest) => fetchAPI(`/routes/one-hop?source=${source}&dest=${dest}`);
export const getDirectRoutes = (source, dest) => fetchAPI(`/routes/direct?source=${source}&dest=${dest}`);
export const getStats = () => fetchAPI('/stats');

// Search (searches both airlines and airports)
export async function searchEntities(query) {
  if (!query || query.length < 2) return { airlines: [], airports: [] };

  try {
    const [airlines, airports] = await Promise.all([
      getAllAirlines(),
      getAllAirports()
    ]);

    const lowerQuery = query.toLowerCase();
    const upperQuery = query.toUpperCase();

    // Filter airlines
    const filteredAirlines = airlines.airlines?.filter(a =>
      a.iata?.toLowerCase().includes(lowerQuery) ||
      a.name?.toLowerCase().includes(lowerQuery)
    ) || [];

    // Sort by exact IATA match first, THEN slice
    const sortedAirlines = filteredAirlines.sort((a, b) => {
      const aExactMatch = a.iata === upperQuery;
      const bExactMatch = b.iata === upperQuery;
      if (aExactMatch && !bExactMatch) return -1;
      if (!aExactMatch && bExactMatch) return 1;
      return 0;
    }).slice(0, 5);

    // Filter airports
    const filteredAirports = airports.airports?.filter(a =>
      a.iata?.toLowerCase().includes(lowerQuery) ||
      a.name?.toLowerCase().includes(lowerQuery) ||
      a.city?.toLowerCase().includes(lowerQuery)
    ) || [];

    // Sort by exact IATA match first, THEN slice
    const sortedAirports = filteredAirports.sort((a, b) => {
      const aExactMatch = a.iata === upperQuery;
      const bExactMatch = b.iata === upperQuery;
      if (aExactMatch && !bExactMatch) return -1;
      if (!aExactMatch && bExactMatch) return 1;
      return 0;
    }).slice(0, 5);

    return { airlines: sortedAirlines, airports: sortedAirports };
  } catch (error) {
    console.error('Search error:', error);
    return { airlines: [], airports: [] };
  }
}