import { useState } from 'react';
import { getOneHopRoutes, getDirectRoutes } from '../utils/api';
import { exportToCSV } from '../utils/csvExport';

export default function Routes() {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [routeType, setRouteType] = useState('one-hop'); // 'direct' or 'one-hop'

  async function handleSearch(e) {
    e.preventDefault();
    if (!source || !destination) return;

    setLoading(true);
    setSearched(true);
    try {
      const apiCall = routeType === 'direct' ? getDirectRoutes : getOneHopRoutes;
      const data = await apiCall(source.toUpperCase(), destination.toUpperCase());
      setRoutes(data.routes || []);
    } catch (error) {
      console.error('Failed to search routes:', error);
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleRouteTypeChange(newType) {
    setRouteType(newType);
    // Re-search with new route type if already searched
    if (searched && source && destination) {
      setLoading(true);
      try {
        const apiCall = newType === 'direct' ? getDirectRoutes : getOneHopRoutes;
        const data = await apiCall(source.toUpperCase(), destination.toUpperCase());
        setRoutes(data.routes || []);
      } catch (error) {
        console.error('Failed to search routes:', error);
        setRoutes([]);
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <div className="flex-1 bg-secondary">
      <div className="max-w-[1600px] mx-auto px-4 py-12 pt-24">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Route Finder</h1>
          <p className="text-lg text-gray-600">Find the best flight connections between airports</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Source Airport (IATA)
                </label>
                <input
                  type="text"
                  placeholder="e.g., SFO"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase font-medium"
                  maxLength={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Destination Airport (IATA)
                </label>
                <input
                  type="text"
                  placeholder="e.g., JFK"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase font-medium"
                  maxLength={3}
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-8 py-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Searching...' : 'Find Routes'}
            </button>
          </form>
        </div>

        {searched && !loading && (
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {routes.length === 0
                  ? 'No routes found'
                  : `Found ${routes.length} route${routes.length !== 1 ? 's' : ''}`}
              </h2>
              <div className="flex gap-4 items-center">
                {routes.length > 0 && (
                  <button
                    onClick={() => {
                      const exportData = routes.map(route => ({
                        source: route.first_leg.source_airport_iata,
                        intermediate: route.intermediate_airport,
                        destination: route.second_leg.dest_airport_iata,
                        total_distance_miles: route.total_distance_miles.toFixed(0),
                        first_leg_airline: route.first_leg.airline_iata,
                        first_leg_stops: route.first_leg.stops,
                        second_leg_airline: route.second_leg.airline_iata,
                        second_leg_stops: route.second_leg.stops
                      }));
                      exportToCSV(exportData, `routes_${source}_to_${destination}.csv`);
                    }}
                    className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-base border border-gray-300 font-medium"
                  >
                    Export CSV
                  </button>
                )}
                <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1 border border-gray-300">
                  <button
                    onClick={() => handleRouteTypeChange('direct')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-base ${
                      routeType === 'direct'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Direct (0-hop)
                  </button>
                  <button
                    onClick={() => handleRouteTypeChange('one-hop')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-base ${
                      routeType === 'one-hop'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    1-Hop
                  </button>
                </div>
              </div>
            </div>

            {routes.length > 0 ? (
              <div className="space-y-4">
                {routes.map((route, index) => {
                  const isDirect = routeType === 'direct';
                  return (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-gray-400 transition-base">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-semibold text-gray-900">
                            {route.first_leg.source_airport_iata}
                          </span>
                          {!isDirect && (
                            <>
                              <span className="text-gray-400">→</span>
                              <span className="text-lg font-semibold text-blue-600">
                                {route.intermediate_airport}
                              </span>
                            </>
                          )}
                          <span className="text-gray-400">→</span>
                          <span className="text-lg font-semibold text-gray-900">
                            {route.second_leg.dest_airport_iata}
                          </span>
                          {isDirect && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                              Direct Flight
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">Total Distance</div>
                          <div className="text-lg font-bold text-blue-600">
                            {route.total_distance_miles.toFixed(0)} mi
                          </div>
                        </div>
                      </div>

                      {isDirect ? (
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm">
                          <div className="font-semibold text-gray-700 mb-1">Flight Details</div>
                          <div className="text-gray-600">
                            Airline: {route.first_leg.airline_iata} (ID: {route.first_leg.airline_id})
                          </div>
                          <div className="text-gray-600">Stops: {route.first_leg.stops}</div>
                          {route.first_leg.equipment && (
                            <div className="text-gray-600">Equipment: {route.first_leg.equipment}</div>
                          )}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <div className="font-semibold text-gray-700 mb-1">First Leg</div>
                            <div className="text-gray-600">
                              Airline: {route.first_leg.airline_iata} (ID: {route.first_leg.airline_id})
                            </div>
                            <div className="text-gray-600">Stops: {route.first_leg.stops}</div>
                            {route.first_leg.equipment && (
                              <div className="text-gray-600">Equipment: {route.first_leg.equipment}</div>
                            )}
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
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
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-600">
                No {routeType === 'direct' ? 'direct' : '1-hop'} routes found between {source} and {destination}.
                Try different airports or switch to {routeType === 'direct' ? '1-hop' : 'direct'} routes.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
