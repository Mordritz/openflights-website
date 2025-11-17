import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchEntities } from '../utils/api';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ airlines: [], airports: [] });
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
        setResults(data);
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
    <div className="relative w-full max-w-2xl z-50" ref={dropdownRef}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by IATA code or name..."
        className="w-full px-6 py-4 text-lg rounded-full bg-white/90 backdrop-blur-md shadow-xl focus:outline-none focus:ring-4 focus:ring-purple-400/50 transition-all relative z-50"
      />
      
      {showDropdown && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-2xl max-h-96 overflow-y-auto z-[100]">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Searching...</div>
          ) : !hasResults ? (
            <div className="p-4 text-center text-gray-500">No results found</div>
          ) : (
            <>
              {results.airports.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-gray-100 font-semibold text-sm text-gray-700">
                    Airports
                  </div>
                  {results.airports.map((airport) => (
                    <button
                      key={airport.id}
                      onClick={() => handleAirportClick(airport)}
                      className="w-full px-4 py-3 text-left hover:bg-purple-50 transition-colors border-b border-gray-100"
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
                  <div className="px-4 py-2 bg-gray-100 font-semibold text-sm text-gray-700">
                    Airlines
                  </div>
                  {results.airlines.map((airline) => (
                    <button
                      key={airline.id}
                      onClick={() => handleAirlineClick(airline)}
                      className="w-full px-4 py-3 text-left hover:bg-purple-50 transition-colors border-b border-gray-100"
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

              {hasResults && (
                <button
                  onClick={() => {
                    navigate('/routes');
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-3 text-center bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-colors"
                >
                  Search Routes →
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}