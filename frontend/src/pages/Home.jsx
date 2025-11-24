import { Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';

export default function Home() {
  return (
    <div className="flex-1 bg-black text-white">
      <div className="min-h-screen flex items-center justify-center px-8 py-24">
        <div className="w-full max-w-[1600px] mx-auto">
          <div className="mb-16 space-y-6">
            <h1 className="text-6xl md:text-7xl font-bold leading-tight">
              OpenFlights Data Explorer
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 font-light max-w-3xl">
              Explore comprehensive aviation data: airports, airlines, and routes from around the world
            </p>
          </div>

          <div className="mb-24 max-w-3xl">
            <SearchBar />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link to="/airports" className="group h-full">
              <div className="border border-gray-800 p-6 rounded-lg hover:border-gray-600 transition-base h-full flex flex-col">
                <h3 className="text-xl font-semibold mb-2">Airports</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Browse and manage airport data worldwide
                </p>
              </div>
            </Link>

            <Link to="/airlines" className="group h-full">
              <div className="border border-gray-800 p-6 rounded-lg hover:border-gray-600 transition-base h-full flex flex-col">
                <h3 className="text-xl font-semibold mb-2">Airlines</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Discover airline networks and connections
                </p>
              </div>
            </Link>

            <Link to="/routes" className="group h-full">
              <div className="border border-gray-800 p-6 rounded-lg hover:border-gray-600 transition-base h-full flex flex-col">
                <h3 className="text-xl font-semibold mb-2">Routes</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Find optimal flight paths between airports
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}