import { Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';

export default function Home() {
  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center px-4">
      <div className="text-center w-full max-w-6xl mx-auto">
        <h1 className="text-6xl font-bold text-white mb-4 text-shadow">
          Welcome to FlightHub
        </h1>
        <p className="text-xl text-white/90 mb-12 text-shadow">
          Search airports, airlines, and discover flight routes
        </p>
        
        <div className="flex justify-center mb-16">
          <SearchBar />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Link to="/airports" className="glass p-6 rounded-xl hover:bg-white/20 transition-all">
            <div className="text-4xl mb-3">✈️</div>
            <h3 className="text-lg font-semibold text-white mb-2">Airports</h3>
            <p className="text-white/80 text-sm">Browse thousands of airports worldwide</p>
          </Link>
          <Link to="/airlines" className="glass p-6 rounded-xl hover:bg-white/20 transition-all">
            <div className="text-4xl mb-3">🛫</div>
            <h3 className="text-lg font-semibold text-white mb-2">Airlines</h3>
            <p className="text-white/80 text-sm">Explore airline networks and routes</p>
          </Link>
          <Link to="/routes" className="glass p-6 rounded-xl hover:bg-white/20 transition-all">
            <div className="text-4xl mb-3">🗺️</div>
            <h3 className="text-lg font-semibold text-white mb-2">Routes</h3>
            <p className="text-white/80 text-sm">Find optimal flight connections</p>
          </Link>
        </div>
      </div>
    </div>
  );
}