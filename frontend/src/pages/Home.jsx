import { Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import GlobeVisualization from '../components/GlobeVisualization';

const SAMPLE_ROUTES = [
  { source: [-74.006, 40.7128], destination: [-0.1276, 51.5074], offset: 0 }, // NYC to London
  { source: [-118.2437, 34.0522], destination: [139.6917, 35.6895], offset: 1 }, // LA to Tokyo
  { source: [-122.4194, 37.7749], destination: [2.3522, 48.8566], offset: 2 }, // SF to Paris
  { source: [151.2093, -33.8688], destination: [-43.1729, -22.9068], offset: 0.5 }, // Sydney to Rio
  { source: [103.8198, 1.3521], destination: [55.2708, 25.2048], offset: 1.5 }, // Singapore to Dubai
  { source: [-99.1332, 19.4326], destination: [116.4074, 39.9042], offset: 2.5 }, // Mexico City to Beijing
  { source: [18.4241, -33.9249], destination: [144.9631, -37.8136], offset: 0.8 }, // Cape Town to Melbourne
  { source: [-46.6333, -23.5505], destination: [28.0473, -26.2041], offset: 1.8 } // São Paulo to Johannesburg
];

export default function Home() {
  return (
    <div className="flex-1 bg-black text-white relative overflow-hidden">
      {/* Globe as background with radial gradient fade to black */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-50">
          <GlobeVisualization routes={SAMPLE_ROUTES} width={1400} height={1000} autoRotate={true} />
        </div>
        {/* Radial gradient overlay - fades globe to black at edges */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at center, transparent 0%, transparent 30%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.7) 70%, black 100%)'
          }}
        />
      </div>

      <div className="min-h-screen flex items-center justify-center px-8 py-24 relative z-10">
        <div className="w-full max-w-[1600px] mx-auto">
          <div className="mb-16 space-y-6">
            <h1 className="text-6xl md:text-7xl font-bold leading-tight">
              OpenFlights Data Explorer
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 font-light max-w-3xl">
              Explore historical aviation data: airports, airlines, and routes connecting the world
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
                  Browse airport data from January 2017
                </p>
              </div>
            </Link>

            <Link to="/airlines" className="group h-full">
              <div className="border border-gray-800 p-6 rounded-lg hover:border-gray-600 transition-base h-full flex flex-col">
                <h3 className="text-xl font-semibold mb-2">Airlines</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Browse airline data from January 2012
                </p>
              </div>
            </Link>

            <Link to="/routes" className="group h-full">
              <div className="border border-gray-800 p-6 rounded-lg hover:border-gray-600 transition-base h-full flex flex-col">
                <h3 className="text-xl font-semibold mb-2">Routes</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Discover flight routes from June 2014
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}