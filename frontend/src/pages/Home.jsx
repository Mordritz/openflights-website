import { Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';

export default function Home() {
  return (
    <div className="min-h-screen gradient-bg-home relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center px-4 py-24">
        <div className="text-center w-full max-w-6xl mx-auto">
          <div className="mb-8 space-y-4">
            <h1 className="text-7xl font-extrabold text-white text-shadow-strong leading-tight">
              Welcome to FlightHub
            </h1>
            <p className="text-2xl text-white/90 font-light tracking-wide">
              Explore the world of aviation data
            </p>
          </div>
          
          <div className="flex justify-center mb-20">
            <SearchBar />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Link to="/airports" className="group">
              <div className="glass p-8 rounded-2xl hover:bg-white/25 transition-smooth transform hover:-translate-y-2 hover:shadow-2xl">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">✈️</div>
                <h3 className="text-2xl font-bold text-white mb-3">Airports</h3>
                <p className="text-white/80 text-base leading-relaxed">
                  Browse and manage thousands of airports from around the globe
                </p>
              </div>
            </Link>

            <Link to="/airlines" className="group">
              <div className="glass p-8 rounded-2xl hover:bg-white/25 transition-smooth transform hover:-translate-y-2 hover:shadow-2xl">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🛫</div>
                <h3 className="text-2xl font-bold text-white mb-3">Airlines</h3>
                <p className="text-white/80 text-base leading-relaxed">
                  Discover airline networks and their global route connections
                </p>
              </div>
            </Link>

            <Link to="/routes" className="group">
              <div className="glass p-8 rounded-2xl hover:bg-white/25 transition-smooth transform hover:-translate-y-2 hover:shadow-2xl">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🗺️</div>
                <h3 className="text-2xl font-bold text-white mb-3">Routes</h3>
                <p className="text-white/80 text-base leading-relaxed">
                  Find optimal flight paths with intelligent route planning
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}