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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="gradient-bg-routes pt-24 pb-40 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-1/3 w-80 h-80 bg-cyan-200 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-1/3 w-80 h-80 bg-purple-300 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <h1 className="text-5xl font-bold text-white mb-6 text-shadow-strong">Route Finder</h1>
          <p className="text-xl text-white/90 mb-8">Find the best flight connections between airports</p>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 pb-16 relative">

        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8 card-elevated">
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Source Airport (IATA)
                </label>
                <input
                  type="text"
                  placeholder="e.g., SFO"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full px-6 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 uppercase font-semibold transition-smooth"
                  maxLength={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Destination Airport (IATA)
                </label>
                <input
                  type="text"
                  placeholder="e.g., JFK"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-6 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 uppercase font-semibold transition-smooth"
                  maxLength={3}
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl hover:from-cyan-600 hover:to-purple-700 transition-smooth font-bold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Searching...' : '🔍 Find Routes'}
            </button>
          </form>
        </div>

        {searched && !loading && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 card-elevated">
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