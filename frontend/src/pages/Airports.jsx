import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAllAirports, getAirlinesByAirport, deleteAirport, createAirport, updateAirport } from '../utils/api';
import { exportToCSV } from '../utils/csvExport';

export default function Airports() {
  const [airports, setAirports] = useState([]);
  const [filteredAirports, setFilteredAirports] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAirport, setSelectedAirport] = useState(null);
  const [airportAirlines, setAirportAirlines] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    loadAirports();
  }, []);

  useEffect(() => {
    const selected = searchParams.get('selected');
    if (selected && airports.length > 0) {
      const airport = airports.find(a => a.iata === selected);
      if (airport) handleSelectAirport(airport);
    }
  }, [searchParams, airports]);

  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const upperQuery = searchQuery.toUpperCase();

      const filtered = airports.filter(a =>
        a.iata?.toLowerCase().includes(query) ||
        a.name?.toLowerCase().includes(query) ||
        a.city?.toLowerCase().includes(query)
      );

      // Sort by exact IATA match first
      const sorted = filtered.sort((a, b) => {
        const aExactMatch = a.iata === upperQuery;
        const bExactMatch = b.iata === upperQuery;
        if (aExactMatch && !bExactMatch) return -1;
        if (!aExactMatch && bExactMatch) return 1;
        return 0;
      });

      setFilteredAirports(sorted);
    } else {
      setFilteredAirports(airports);
    }
  }, [searchQuery, airports]);

  async function loadAirports() {
    try {
      const data = await getAllAirports();
      setAirports(data.airports || []);
      setFilteredAirports(data.airports || []);
    } catch (error) {
      console.error('Failed to load airports:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectAirport(airport) {
    setSelectedAirport(airport);
    try {
      const data = await getAirlinesByAirport(airport.iata);
      setAirportAirlines(data.airlines || []);
    } catch (error) {
      console.error('Failed to load airlines:', error);
      setAirportAirlines([]);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this airport?')) return;
    try {
      await deleteAirport(id);
      setSelectedAirport(null);
      loadAirports();
    } catch (error) {
      alert('Failed to delete airport: ' + error.message);
    }
  }

  async function handleCreate(formData) {
    try {
      await createAirport(formData);
      setShowCreateModal(false);
      loadAirports();
    } catch (error) {
      alert('Failed to create airport: ' + error.message);
    }
  }

  async function handleUpdate(updates) {
    try {
      await updateAirport(selectedAirport.id, updates);
      setShowEditModal(false);
      await loadAirports();
      const refreshed = await getAllAirports();
      const updated = refreshed.airports.find(a => a.id === selectedAirport.id);
      if (updated) {
        setSelectedAirport(updated);
        handleSelectAirport(updated);
      }
    } catch (error) {
      alert('Failed to update airport: ' + error.message);
    }
  }

  if (loading) {
    return (
      <div className="flex-1 bg-secondary pt-16 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading airports...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-secondary">
      <div className="max-w-[1600px] mx-auto px-4 py-12 pt-24">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Airports</h1>
          <p className="text-lg text-gray-600">Explore and manage airport data worldwide</p>
        </div>

        <div className="flex gap-4 mb-8">
          <input
            type="text"
            placeholder="Search by IATA code, name, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-6 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={() => exportToCSV(filteredAirports, 'airports.csv')}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-base font-medium border border-gray-300"
          >
            Export CSV
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-base font-medium"
          >
            New Airport
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] gap-6">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">All Airports ({filteredAirports.length})</h2>
            </div>
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IATA</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">City</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Country</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAirports.map((airport) => (
                    <tr
                      key={airport.id}
                      onClick={() => handleSelectAirport(airport)}
                      className="hover:bg-gray-50 cursor-pointer transition-base"
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{airport.iata}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{airport.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{airport.city}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{airport.country}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 min-h-[600px]">
            {selectedAirport ? (
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedAirport.name}</h2>
                    <p className="text-gray-600">{selectedAirport.iata} - {selectedAirport.city}, {selectedAirport.country}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowEditModal(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-base text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(selectedAirport.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-base text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-semibold text-gray-700">ICAO:</span> {selectedAirport.icao || 'N/A'}
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Altitude:</span> {selectedAirport.altitude} ft
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Latitude:</span> {selectedAirport.latitude}
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Longitude:</span> {selectedAirport.longitude}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Airlines at this Airport <span className="text-blue-600">({airportAirlines.length})</span>
                    </h3>
                    {airportAirlines.length > 0 && (
                      <button
                        onClick={() => {
                          const exportData = airportAirlines.map(item => ({
                            iata: item?.airline?.iata || 'N/A',
                            name: item?.airline?.name || 'Unknown',
                            country: item?.airline?.country || 'Unknown',
                            route_count: item.route_count || 0
                          }));
                          exportToCSV(exportData, `airlines_at_${selectedAirport.iata}.csv`);
                        }}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-base border border-gray-300"
                      >
                        Export CSV
                      </button>
                    )}
                  </div>
                  {airportAirlines.length === 0 ? (
                    <p className="text-gray-500 text-sm">No airlines found</p>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {airportAirlines.map((item, index) => {
                        const airline = item?.airline;
                        if (!airline) return null;

                        const airlineId = airline.id || `airline-${index}`;
                        const airlineIata = airline.iata && String(airline.iata).trim() !== '' ? airline.iata : 'N/A';
                        const airlineName = airline.name && String(airline.name).trim() !== '' ? airline.name : 'Unknown Airline';
                        const airlineCountry = airline.country && String(airline.country).trim() !== '' ? airline.country : 'Unknown Country';
                        const routeCount = item.route_count || 0;

                        return (
                          <div key={airlineId} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div>
                              <div className="font-semibold text-gray-900">
                                {airlineIata} - {airlineName}
                              </div>
                              <div className="text-sm text-gray-600">{airlineCountry}</div>
                            </div>
                            <div className="text-sm font-semibold text-blue-600">{routeCount} routes</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                Select an airport to view details
              </div>
            )}
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreateAirportModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreate}
        />
      )}

      {showEditModal && selectedAirport && (
        <EditAirportModal
          airport={selectedAirport}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}

function EditAirportModal({ airport, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    name: airport.name || '',
    city: airport.city || '',
    country: airport.country || '',
    iata: airport.iata || '',
    icao: airport.icao || '',
    latitude: airport.latitude || '',
    longitude: airport.longitude || '',
    altitude: airport.altitude || '',
  });

  function handleSubmit(e) {
    e.preventDefault();
    const updates = {};
    if (formData.name !== airport.name) updates.name = formData.name;
    if (formData.city !== airport.city) updates.city = formData.city;
    if (formData.country !== airport.country) updates.country = formData.country;
    if (formData.iata !== airport.iata) updates.iata = formData.iata;
    if (formData.icao !== airport.icao) updates.icao = formData.icao;
    if (parseFloat(formData.latitude) !== airport.latitude) updates.latitude = parseFloat(formData.latitude);
    if (parseFloat(formData.longitude) !== airport.longitude) updates.longitude = parseFloat(formData.longitude);
    if (parseInt(formData.altitude || 0) !== airport.altitude) updates.altitude = parseInt(formData.altitude || 0);

    onUpdate(updates);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Edit Airport</h2>
        <div className="text-sm text-gray-600 mb-4 p-2 bg-gray-100 rounded">ID: {airport.id} (cannot be changed)</div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Name *" required className="w-full px-3 py-2 border rounded" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          <input type="text" placeholder="City *" required className="w-full px-3 py-2 border rounded" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
          <input type="text" placeholder="Country *" required className="w-full px-3 py-2 border rounded" value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value})} />
          <input type="text" placeholder="IATA *" required className="w-full px-3 py-2 border rounded" value={formData.iata} onChange={(e) => setFormData({...formData, iata: e.target.value})} />
          <input type="text" placeholder="ICAO" className="w-full px-3 py-2 border rounded" value={formData.icao} onChange={(e) => setFormData({...formData, icao: e.target.value})} />
          <input type="number" step="any" placeholder="Latitude *" required className="w-full px-3 py-2 border rounded" value={formData.latitude} onChange={(e) => setFormData({...formData, latitude: e.target.value})} />
          <input type="number" step="any" placeholder="Longitude *" required className="w-full px-3 py-2 border rounded" value={formData.longitude} onChange={(e) => setFormData({...formData, longitude: e.target.value})} />
          <input type="number" placeholder="Altitude (feet)" className="w-full px-3 py-2 border rounded" value={formData.altitude} onChange={(e) => setFormData({...formData, altitude: e.target.value})} />

          <div className="flex gap-3">
            <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold">Update</button>
            <button type="button" onClick={onClose} className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CreateAirportModal({ onClose, onCreate }) {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    city: '',
    country: '',
    iata: '',
    icao: '',
    latitude: '',
    longitude: '',
    altitude: '',
  });

  function handleSubmit(e) {
    e.preventDefault();
    onCreate({
      ...formData,
      id: parseInt(formData.id),
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      altitude: formData.altitude ? parseInt(formData.altitude) : 0,
    });
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Create New Airport</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="number" placeholder="ID *" required className="w-full px-3 py-2 border rounded" value={formData.id} onChange={(e) => setFormData({...formData, id: e.target.value})} />
          <input type="text" placeholder="Name *" required className="w-full px-3 py-2 border rounded" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          <input type="text" placeholder="City *" required className="w-full px-3 py-2 border rounded" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
          <input type="text" placeholder="Country *" required className="w-full px-3 py-2 border rounded" value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value})} />
          <input type="text" placeholder="IATA *" required className="w-full px-3 py-2 border rounded" value={formData.iata} onChange={(e) => setFormData({...formData, iata: e.target.value})} />
          <input type="text" placeholder="ICAO" className="w-full px-3 py-2 border rounded" value={formData.icao} onChange={(e) => setFormData({...formData, icao: e.target.value})} />
          <input type="number" step="any" placeholder="Latitude *" required className="w-full px-3 py-2 border rounded" value={formData.latitude} onChange={(e) => setFormData({...formData, latitude: e.target.value})} />
          <input type="number" step="any" placeholder="Longitude *" required className="w-full px-3 py-2 border rounded" value={formData.longitude} onChange={(e) => setFormData({...formData, longitude: e.target.value})} />
          <input type="number" placeholder="Altitude (feet)" className="w-full px-3 py-2 border rounded" value={formData.altitude} onChange={(e) => setFormData({...formData, altitude: e.target.value})} />

          <div className="flex gap-3">
            <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Create</button>
            <button type="button" onClick={onClose} className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
