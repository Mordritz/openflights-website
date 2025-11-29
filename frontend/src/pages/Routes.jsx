import { useState, useEffect } from 'react';
import { getOneHopRoutes, getDirectRoutes, getAllAirports } from '../utils/api';
import { exportToCSV } from '../utils/csvExport';
import GlobeVisualization from '../components/GlobeVisualization';

export default function Routes() {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [routeType, setRouteType] = useState('one-hop'); // 'direct' or 'one-hop'
  const [airportCoords, setAirportCoords] = useState({});
  const [hoveredRouteIndex, setHoveredRouteIndex] = useState(null);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(null);

  useEffect(() => {
    // Load airport coordinates for globe visualization
    async function loadAirports() {
      try {
        const data = await getAllAirports();
        const coordMap = {};
        data.airports.forEach(airport => {
          if (airport.iata && airport.longitude && airport.latitude) {
            coordMap[airport.iata] = [airport.longitude, airport.latitude];
          }
        });
        setAirportCoords(coordMap);
      } catch (error) {
        console.error('Failed to load airport coordinates:', error);
      }
    }
    loadAirports();
  }, []);

  // Convert selected or hovered route to globe format
  function getRouteGlobeData() {
    if (routes.length === 0 || Object.keys(airportCoords).length === 0) {
      return [];
    }

    // Show selected route, or hovered route if no selection
    const indexToShow = selectedRouteIndex !== null ? selectedRouteIndex : hoveredRouteIndex;
    if (indexToShow === null) {
      return [];
    }

    const route = routes[indexToShow];
    if (!route) return [];

    const globeData = [];
    const sourceIata = route.first_leg.source_airport_iata;
    const destIata = route.second_leg.dest_airport_iata;
    const intermediateIata = route.intermediate_airport;

    if (routeType === 'direct') {
      // Direct route - single arc
      if (airportCoords[sourceIata] && airportCoords[destIata]) {
        globeData.push({
          source: airportCoords[sourceIata],
          destination: airportCoords[destIata],
          offset: 0
        });
      }
    } else {
      // 1-hop route - two arcs
      if (airportCoords[sourceIata] && airportCoords[intermediateIata]) {
        globeData.push({
          source: airportCoords[sourceIata],
          destination: airportCoords[intermediateIata],
          offset: 0
        });
      }
      if (airportCoords[intermediateIata] && airportCoords[destIata]) {
        globeData.push({
          source: airportCoords[intermediateIata],
          destination: airportCoords[destIata],
          offset: 0.15
        });
      }
    }

    return globeData;
  }

  async function handleSearch(e) {
    e.preventDefault();
    if (!source || !destination) return;

    setLoading(true);
    setSearched(true);
    setSelectedRouteIndex(null); // Clear selection on new search
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
    setSelectedRouteIndex(null); // Clear selection on route type change
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

  function handleRouteClick(index) {
    // Toggle selection: if clicking same route, deselect; otherwise select new route
    setSelectedRouteIndex(prev => prev === index ? null : index);
  }

  const globeRoutes = getRouteGlobeData();

  return (
    <div className="flex-1 bg-secondary relative overflow-hidden">
      {/* Globe centered vertically, shifted right */}
      <div className={`fixed top-1/2 -translate-y-1/2 right-0 z-0 ${selectedRouteIndex === null ? 'pointer-events-none' : ''}`} style={{ marginRight: '-200px' }}>
        <GlobeVisualization
          routes={globeRoutes}
          width={1300}
          height={1300}
          autoRotate={selectedRouteIndex === null}
          backgroundColor="rgba(247, 248, 250, 0)"
          focusOnRoute={hoveredRouteIndex !== null || selectedRouteIndex !== null}
        />
      </div>

      <div className="max-w-[900px] px-4 pt-24 pb-12 ml-12 relative z-10">
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2">Route Finder</h1>
          <p className="text-lg text-gray-600">Find flight connections between airports</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-5">
          <form onSubmit={handleSearch} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Source Airport (IATA)
                </label>
                <input
                  type="text"
                  placeholder="e.g., SFO"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase font-medium text-sm"
                  maxLength={3}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Destination Airport (IATA)
                </label>
                <input
                  type="text"
                  placeholder="e.g., JFK"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase font-medium text-sm"
                  maxLength={3}
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? 'Searching...' : 'Find Routes'}
            </button>
          </form>
        </div>

        {searched && !loading && (
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {routes.length === 0
                  ? 'No routes found'
                  : `Found ${routes.length} route${routes.length !== 1 ? 's' : ''}`}
              </h2>
              <div className="flex gap-2 items-center flex-wrap">
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
                    Direct
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
              <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-2">
                {routes.map((route, index) => {
                  const isDirect = routeType === 'direct';
                  const isHovered = hoveredRouteIndex === index;
                  const isSelected = selectedRouteIndex === index;
                  return (
                    <div
                      key={index}
                      onMouseEnter={() => setHoveredRouteIndex(index)}
                      onMouseLeave={() => setHoveredRouteIndex(null)}
                      onClick={() => handleRouteClick(index)}
                      className={`border rounded-lg p-4 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-green-500 shadow-md bg-green-50'
                          : isHovered
                          ? 'border-blue-500 shadow-lg bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-base font-semibold text-gray-900">
                            {route.first_leg.source_airport_iata}
                          </span>
                          {!isDirect && (
                            <>
                              <span className="text-gray-400">→</span>
                              <span className="text-base font-semibold text-blue-600">
                                {route.intermediate_airport}
                              </span>
                            </>
                          )}
                          <span className="text-gray-400">→</span>
                          <span className="text-base font-semibold text-gray-900">
                            {route.second_leg.dest_airport_iata}
                          </span>
                          {isDirect && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                              Direct
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">Distance</div>
                          <div className="text-base font-bold text-blue-600">
                            {route.total_distance_miles.toFixed(0)} mi
                          </div>
                        </div>
                      </div>

                      {isDirect ? (
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm">
                          <div className="font-semibold text-gray-700 mb-1">Flight Details</div>
                          <div className="text-gray-600">
                            Airline: {route.first_leg.airline_iata} | Stops: {route.first_leg.stops}
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <div className="font-semibold text-gray-700 mb-1">First Leg</div>
                            <div className="text-gray-600">
                              Airline: {route.first_leg.airline_iata}
                            </div>
                            <div className="text-gray-600">Stops: {route.first_leg.stops}</div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <div className="font-semibold text-gray-700 mb-1">Second Leg</div>
                            <div className="text-gray-600">
                              Airline: {route.second_leg.airline_iata}
                            </div>
                            <div className="text-gray-600">Stops: {route.second_leg.stops}</div>
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
