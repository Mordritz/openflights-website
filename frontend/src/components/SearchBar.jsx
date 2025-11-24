import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchEntities } from '../utils/api';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ airlines: [], airports: [], airlineExactMatch: false, airportExactMatch: false });
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchDebounce = setTimeout(async () => {
      if (query.length >= 2) {
        setLoading(true);
        const data = await searchEntities(query);

        const upperQuery = query.toUpperCase();

        // API already returns sorted results with exact matches first
        setResults({
          airports: data.airports || [],
          airlines: data.airlines || [],
          airlineExactMatch: data.airlines?.length > 0 && data.airlines[0].iata === upperQuery,
          airportExactMatch: data.airports?.length > 0 && data.airports[0].iata === upperQuery
        });
        setShowDropdown(true);
        setLoading(false);
      } else {
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(searchDebounce);
  }, [query]);

  const handleAirportClick = (airport) => {
    navigate(`/airports?selected=${airport.iata}`);
    setShowDropdown(false);
    setQuery('');
  };

  const handleAirlineClick = (airline) => {
    navigate(`/airlines?selected=${airline.iata}`);
    setShowDropdown(false);
    setQuery('');
  };

  const hasResults = results.airlines.length > 0 || results.airports.length > 0;

  return (
    <div className="relative w-full z-50" ref={dropdownRef}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by IATA code or name..."
        className="w-full px-6 py-4 text-lg text-gray-900 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
      />

      {showDropdown && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-lg border border-gray-200 shadow-lg max-h-96 overflow-y-auto z-[100]">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Searching...</div>
          ) : !hasResults ? (
            <div className="p-4 text-center text-gray-500">No results found</div>
          ) : (
            <>
              {results.airlineExactMatch && !results.airportExactMatch ? (
                <>
                  {results.airlines.length > 0 && (
                    <div>
                      <div className="px-4 py-2 bg-gray-50 font-semibold text-xs text-gray-600 uppercase">
                        Airlines
                      </div>
                      {results.airlines.map((airline) => (
                        <button
                          key={airline.id}
                          onClick={() => handleAirlineClick(airline)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-base border-b border-gray-100"
                        >
                          <div className="font-semibold text-gray-900">
                            {airline.iata || 'N/A'} - {airline.name || 'Unknown'}
                          </div>
                          <div className="text-sm text-gray-600">
                            {airline.country || 'Unknown'}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {results.airports.length > 0 && (
                    <div>
                      <div className="px-4 py-2 bg-gray-50 font-semibold text-xs text-gray-600 uppercase">
                        Airports
                      </div>
                      {results.airports.map((airport) => (
                        <button
                          key={airport.id}
                          onClick={() => handleAirportClick(airport)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-base border-b border-gray-100"
                        >
                          <div className="font-semibold text-gray-900">
                            {airport.iata || 'N/A'} - {airport.name || 'Unknown'}
                          </div>
                          <div className="text-sm text-gray-600">
                            {airport.city || 'Unknown'}, {airport.country || 'Unknown'}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {results.airports.length > 0 && (
                    <div>
                      <div className="px-4 py-2 bg-gray-50 font-semibold text-xs text-gray-600 uppercase">
                        Airports
                      </div>
                      {results.airports.map((airport) => (
                        <button
                          key={airport.id}
                          onClick={() => handleAirportClick(airport)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-base border-b border-gray-100"
                        >
                          <div className="font-semibold text-gray-900">
                            {airport.iata || 'N/A'} - {airport.name || 'Unknown'}
                          </div>
                          <div className="text-sm text-gray-600">
                            {airport.city || 'Unknown'}, {airport.country || 'Unknown'}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {results.airlines.length > 0 && (
                    <div>
                      <div className="px-4 py-2 bg-gray-50 font-semibold text-xs text-gray-600 uppercase">
                        Airlines
                      </div>
                      {results.airlines.map((airline) => (
                        <button
                          key={airline.id}
                          onClick={() => handleAirlineClick(airline)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-base border-b border-gray-100"
                        >
                          <div className="font-semibold text-gray-900">
                            {airline.iata || 'N/A'} - {airline.name || 'Unknown'}
                          </div>
                          <div className="text-sm text-gray-600">
                            {airline.country || 'Unknown'}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}

              {hasResults && (
                <button
                  onClick={() => {
                    navigate('/routes');
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-3 text-center bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-base"
                >
                  Search Routes
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}