import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAllAirlines, getAirportsByAirline, deleteAirline, createAirline, updateAirline } from '../utils/api';
import { exportToCSV } from '../utils/csvExport';

export default function Airlines() {
  const [airlines, setAirlines] = useState([]);
  const [filteredAirlines, setFilteredAirlines] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAirline, setSelectedAirline] = useState(null);
  const [airlineAirports, setAirlineAirports] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [sortConfig, setSortConfig] = useState({ column: 'iata', direction: 'asc' });

  useEffect(() => {
    loadAirlines();
  }, []);

  useEffect(() => {
    const selected = searchParams.get('selected');
    if (selected && airlines.length > 0) {
      const airline = airlines.find(a => a.iata === selected);
      if (airline) handleSelectAirline(airline);
    }
  }, [searchParams, airlines]);

  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const upperQuery = searchQuery.toUpperCase();

      const filtered = airlines.filter(a =>
        a.iata?.toLowerCase().includes(query) ||
        a.name?.toLowerCase().includes(query) ||
        a.country?.toLowerCase().includes(query)
      );

      // Sort by exact IATA match first
      const sorted = filtered.sort((a, b) => {
        const aExactMatch = a.iata === upperQuery;
        const bExactMatch = b.iata === upperQuery;
        if (aExactMatch && !bExactMatch) return -1;
        if (!aExactMatch && bExactMatch) return 1;
        return 0;
      });

      setFilteredAirlines(sorted);
    } else {
      setFilteredAirlines(airlines);
    }
  }, [searchQuery, airlines]);

  async function loadAirlines() {
    try {
      const data = await getAllAirlines();
      setAirlines(data.airlines || []);
      setFilteredAirlines(data.airlines || []);
    } catch (error) {
      console.error('Failed to load airlines:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectAirline(airline) {
    setSelectedAirline(airline);
    try {
      const data = await getAirportsByAirline(airline.iata);
      setAirlineAirports(data.airports || []);
    } catch (error) {
      console.error('Failed to load airports:', error);
      setAirlineAirports([]);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this airline?')) return;
    try {
      await deleteAirline(id);
      setSelectedAirline(null);
      loadAirlines();
    } catch (error) {
      alert('Failed to delete airline: ' + error.message);
    }
  }

  async function handleCreate(formData) {
    try {
      await createAirline(formData);
      setShowCreateModal(false);
      loadAirlines();
    } catch (error) {
      alert('Failed to create airline: ' + error.message);
    }
  }

  async function handleUpdate(updates) {
    try {
      await updateAirline(selectedAirline.id, updates);
      setShowEditModal(false);
      await loadAirlines();
      const refreshed = await getAllAirlines();
      const updated = refreshed.airlines.find(a => a.id === selectedAirline.id);
      if (updated) {
        setSelectedAirline(updated);
        handleSelectAirline(updated);
      }
    } catch (error) {
      alert('Failed to update airline: ' + error.message);
    }
  }

  function handleSort(column) {
    setSortConfig(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }

  function getSortedAirlines() {
    const upperQuery = searchQuery.toUpperCase();
    const hasExactMatch = searchQuery && filteredAirlines.some(a => a.iata === upperQuery);

    if (hasExactMatch) {
      // Separate exact match from others
      const exactMatch = filteredAirlines.filter(a => a.iata === upperQuery);
      const others = filteredAirlines.filter(a => a.iata !== upperQuery);

      // Sort the non-exact matches
      const sortedOthers = others.sort((a, b) => {
        let aVal, bVal;

        if (sortConfig.column === 'status') {
          aVal = a.active === 'Y' ? 'active' : 'inactive';
          bVal = b.active === 'Y' ? 'active' : 'inactive';
        } else {
          aVal = (a[sortConfig.column] || '').toString().toLowerCase();
          bVal = (b[sortConfig.column] || '').toString().toLowerCase();
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });

      // Return exact match first, then sorted others
      return [...exactMatch, ...sortedOthers];
    }

    // Normal sort when no exact match
    const sorted = [...filteredAirlines].sort((a, b) => {
      let aVal, bVal;

      if (sortConfig.column === 'status') {
        aVal = a.active === 'Y' ? 'active' : 'inactive';
        bVal = b.active === 'Y' ? 'active' : 'inactive';
      } else {
        aVal = (a[sortConfig.column] || '').toString().toLowerCase();
        bVal = (b[sortConfig.column] || '').toString().toLowerCase();
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }

  if (loading) {
    return (
      <div className="flex-1 bg-secondary pt-16 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading airlines...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-secondary">
      <div className="max-w-[1600px] mx-auto px-4 py-12 pt-24">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Airlines</h1>
          <p className="text-lg text-gray-600">Explore and manage airline data from January 2012</p>
        </div>

        <div className="flex gap-4 mb-8">
          <input
            type="text"
            placeholder="Search by IATA code, name, or country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-6 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={() => exportToCSV(filteredAirlines, 'airlines.csv')}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-base font-medium border border-gray-300"
          >
            Export CSV
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-base font-medium"
          >
            New Airline
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] gap-6">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">All Airlines ({filteredAirlines.length})</h2>
            </div>
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th onClick={() => handleSort('iata')} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 select-none">
                      IATA {sortConfig.column === 'iata' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('name')} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 select-none">
                      Name {sortConfig.column === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('country')} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 select-none">
                      Country {sortConfig.column === 'country' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('status')} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 select-none">
                      Status {sortConfig.column === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getSortedAirlines().map((airline) => (
                    <tr
                      key={airline.id}
                      onClick={() => handleSelectAirline(airline)}
                      className="hover:bg-gray-50 cursor-pointer transition-base"
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{airline.iata}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{airline.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{airline.country}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{airline.active === 'Y' ? 'Active' : 'Inactive'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 min-h-[600px]">
            {selectedAirline ? (
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedAirline.name}</h2>
                    <p className="text-gray-600">{selectedAirline.iata} - {selectedAirline.country}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowEditModal(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-base text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(selectedAirline.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-base text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-semibold text-gray-700">ICAO:</span> {selectedAirline.icao || 'N/A'}
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Callsign:</span> {selectedAirline.callsign || 'N/A'}
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Status:</span> {selectedAirline.active === 'Y' ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Airports Served <span className="text-blue-600">({airlineAirports.length})</span>
                    </h3>
                    {airlineAirports.length > 0 && (
                      <button
                        onClick={() => {
                          const exportData = airlineAirports.map(item => ({
                            iata: item?.airport?.iata || 'N/A',
                            name: item?.airport?.name || 'Unknown',
                            city: item?.airport?.city || 'Unknown',
                            country: item?.airport?.country || 'Unknown',
                            route_count: item.route_count || 0
                          }));
                          exportToCSV(exportData, `airports_served_by_${selectedAirline.iata}.csv`);
                        }}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-base border border-gray-300"
                      >
                        Export CSV
                      </button>
                    )}
                  </div>
                  {airlineAirports.length === 0 ? (
                    <p className="text-gray-500 text-sm">No airports found</p>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {airlineAirports.map((item, index) => {
                        const airport = item?.airport;
                        if (!airport) return null;

                        const airportId = airport.id || `airport-${index}`;
                        const airportIata = airport.iata && String(airport.iata).trim() !== '' ? airport.iata : 'N/A';
                        const airportName = airport.name && String(airport.name).trim() !== '' ? airport.name : 'Unknown Airport';
                        const airportCity = airport.city && String(airport.city).trim() !== '' ? airport.city : 'Unknown City';
                        const airportCountry = airport.country && String(airport.country).trim() !== '' ? airport.country : 'Unknown Country';
                        const routeCount = item.route_count || 0;

                        return (
                          <div key={airportId} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div>
                              <div className="font-semibold text-gray-900">
                                {airportIata} - {airportName}
                              </div>
                              <div className="text-sm text-gray-600">
                                {airportCity}, {airportCountry}
                              </div>
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
                Select an airline to view details
              </div>
            )}
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreateAirlineModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreate}
        />
      )}

      {showEditModal && selectedAirline && (
        <EditAirlineModal
          airline={selectedAirline}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}

function EditAirlineModal({ airline, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    name: airline.name || '',
    iata: airline.iata || '',
    icao: airline.icao || '',
    callsign: airline.callsign || '',
    country: airline.country || '',
    active: airline.active || 'Y',
  });

  function handleSubmit(e) {
    e.preventDefault();
    const updates = {};
    if (formData.name !== airline.name) updates.name = formData.name;
    if (formData.iata !== airline.iata) updates.iata = formData.iata;
    if (formData.icao !== airline.icao) updates.icao = formData.icao;
    if (formData.callsign !== airline.callsign) updates.callsign = formData.callsign;
    if (formData.country !== airline.country) updates.country = formData.country;
    if (formData.active !== airline.active) updates.active = formData.active;

    onUpdate(updates);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Edit Airline</h2>
        <div className="text-sm text-gray-600 mb-4 p-2 bg-gray-100 rounded">ID: {airline.id} (cannot be changed)</div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Name *" required className="w-full px-3 py-2 border rounded" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          <input type="text" placeholder="IATA *" required className="w-full px-3 py-2 border rounded" value={formData.iata} onChange={(e) => setFormData({...formData, iata: e.target.value})} />
          <input type="text" placeholder="ICAO" className="w-full px-3 py-2 border rounded" value={formData.icao} onChange={(e) => setFormData({...formData, icao: e.target.value})} />
          <input type="text" placeholder="Callsign" className="w-full px-3 py-2 border rounded" value={formData.callsign} onChange={(e) => setFormData({...formData, callsign: e.target.value})} />
          <input type="text" placeholder="Country *" required className="w-full px-3 py-2 border rounded" value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value})} />
          <select className="w-full px-3 py-2 border rounded" value={formData.active} onChange={(e) => setFormData({...formData, active: e.target.value})}>
            <option value="Y">Active</option>
            <option value="N">Inactive</option>
          </select>

          <div className="flex gap-3">
            <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold">Update</button>
            <button type="button" onClick={onClose} className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CreateAirlineModal({ onClose, onCreate }) {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    iata: '',
    icao: '',
    callsign: '',
    country: '',
    active: 'Y',
  });

  function handleSubmit(e) {
    e.preventDefault();
    onCreate({
      ...formData,
      id: parseInt(formData.id),
    });
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Create New Airline</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="number" placeholder="ID *" required className="w-full px-3 py-2 border rounded" value={formData.id} onChange={(e) => setFormData({...formData, id: e.target.value})} />
          <input type="text" placeholder="Name *" required className="w-full px-3 py-2 border rounded" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          <input type="text" placeholder="IATA *" required className="w-full px-3 py-2 border rounded" value={formData.iata} onChange={(e) => setFormData({...formData, iata: e.target.value})} />
          <input type="text" placeholder="ICAO" className="w-full px-3 py-2 border rounded" value={formData.icao} onChange={(e) => setFormData({...formData, icao: e.target.value})} />
          <input type="text" placeholder="Callsign" className="w-full px-3 py-2 border rounded" value={formData.callsign} onChange={(e) => setFormData({...formData, callsign: e.target.value})} />
          <input type="text" placeholder="Country *" required className="w-full px-3 py-2 border rounded" value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value})} />
          <select className="w-full px-3 py-2 border rounded" value={formData.active} onChange={(e) => setFormData({...formData, active: e.target.value})}>
            <option value="Y">Active</option>
            <option value="N">Inactive</option>
          </select>

          <div className="flex gap-3">
            <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Create</button>
            <button type="button" onClick={onClose} className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
