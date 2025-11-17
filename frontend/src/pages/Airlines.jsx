import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAllAirlines, getAirportsByAirline, deleteAirline, createAirline } from '../utils/api';

export default function Airlines() {
  const [airlines, setAirlines] = useState([]);
  const [filteredAirlines, setFilteredAirlines] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAirline, setSelectedAirline] = useState(null);
  const [airlineAirports, setAirlineAirports] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

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
      setFilteredAirlines(
        airlines.filter(a =>
          a.iata?.toLowerCase().includes(query) ||
          a.name?.toLowerCase().includes(query) ||
          a.country?.toLowerCase().includes(query)
        )
      );
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 pt-20 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading airlines...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white mb-4">Airlines</h1>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search airlines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/70 focus:ring-2 focus:ring-white focus:border-transparent backdrop-blur-sm"
            />
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-semibold shadow-lg"
            >
              + New Airline
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 pb-12">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IATA</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Country</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAirlines.map((airline) => (
                    <tr
                      key={airline.id}
                      onClick={() => handleSelectAirline(airline)}
                      className="hover:bg-purple-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{airline.iata}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{airline.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{airline.country}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            {selectedAirline ? (
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedAirline.name}</h2>
                    <p className="text-gray-600">{selectedAirline.iata} - {selectedAirline.country}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(selectedAirline.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    Delete
                  </button>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-semibold text-gray-700">ICAO:</span> {selectedAirline.icao}
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Callsign:</span> {selectedAirline.callsign}
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Active:</span> {selectedAirline.active}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Airports Served</h3>
                  {airlineAirports.length === 0 ? (
                    <p className="text-gray-500 text-sm">No airports found</p>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {airlineAirports.map((item) => {
                        if (!item?.airport) return null;
                        return (
                          <div key={item.airport.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div>
                              <div className="font-semibold text-gray-900">
                                {item.airport.iata || 'N/A'} - {item.airport.name || 'Unknown'}
                              </div>
                              <div className="text-sm text-gray-600">
                                {item.airport.city || 'Unknown'}, {item.airport.country || 'Unknown'}
                              </div>
                            </div>
                            <div className="text-sm font-semibold text-purple-600">{item.route_count || 0} routes</div>
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
            <button type="submit" className="flex-1 bg-purple-600 text-white py-2 rounded hover:bg-purple-700">Create</button>
            <button type="button" onClick={onClose} className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}