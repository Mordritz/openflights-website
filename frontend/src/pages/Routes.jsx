import { useState } from 'react';
import { getOneHopRoutes } from '../utils/api';

export default function Routes() {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e) {
    e.preventDefault();
    if (!source || !destination) return;

    setLoading(true);
    setSearched(true);
    try {
      const data = await getOneHopRoutes(source.toUpperCase(), destination.toUpperCase());
      setRoutes(data.routes || []);
    } catch (error) {
      console.error('Failed to search routes:', error);
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-r from-green-600 to-teal-600 pt-20 pb-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white mb-8">Route Finder</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 pb-12">

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Source Airport (IATA)
                </label>
                <input
                  type="text"
                  placeholder="e.g., SFO"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent uppercase"
                  maxLength={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destination Airport (IATA)
                </label>
                <input
                  type="text"
                  placeholder="e.g., JFK"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent uppercase"
                  maxLength={3}
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:bg-gray-400"
            >
              {loading ? 'Searching...' : 'Find Routes'}
            </button>
          </form>
        </div>

        {searched && !loading && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {routes.length === 0
                ? 'No routes found'
                : `Found ${routes.length} route${routes.length !== 1 ? 's' : ''}`}
            </h2>

            {routes.length > 0 && (
              <div className="space-y-4">
                {routes.map((route, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-green-500 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-semibold text-gray-900">
                          {route.first_leg.source_airport_iata}
                        </span>
                        <span className="text-gray-400">→</span>
                        <span className="text-lg font-semibold text-green-600">
                          {route.intermediate_airport}
                        </span>
                        <span className="text-gray-400">→</span>
                        <span className="text-lg font-semibold text-gray-900">
                          {route.second_leg.dest_airport_iata}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Total Distance</div>
                        <div className="text-lg font-bold text-green-600">
                          {route.total_distance_miles.toFixed(0)} mi
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="font-semibold text-gray-700 mb-1">First Leg</div>
                        <div className="text-gray-600">
                          Airline: {route.first_leg.airline_iata} (ID: {route.first_leg.airline_id})
                        </div>
                        <div className="text-gray-600">Stops: {route.first_leg.stops}</div>
                        {route.first_leg.equipment && (
                          <div className="text-gray-600">Equipment: {route.first_leg.equipment}</div>
                        )}
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="font-semibold text-gray-700 mb-1">Second Leg</div>
                        <div className="text-gray-600">
                          Airline: {route.second_leg.airline_iata} (ID: {route.second_leg.airline_id})
                        </div>
                        <div className="text-gray-600">Stops: {route.second_leg.stops}</div>
                        {route.second_leg.equipment && (
                          <div className="text-gray-600">Equipment: {route.second_leg.equipment}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {routes.length === 0 && (
              <p className="text-gray-600">
                No routes with 0 or 1 stops found between {source} and {destination}.
                Try different airports or check if they exist in the database.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}