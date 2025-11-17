export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 pt-20 pb-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white mb-6">About FlightHub</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 pb-12">
        <div className="bg-white rounded-lg shadow-xl p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">About FlightHub</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 mb-4">
              FlightHub is a comprehensive flight data management system built to explore and analyze global aviation data. 
              This platform provides easy access to information about airports, airlines, and flight routes from around the world.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Features</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
              <li>Search and browse thousands of airports worldwide</li>
              <li>Explore airline networks and route information</li>
              <li>Find optimal flight connections with the route finder</li>
              <li>View detailed statistics and relationships between entities</li>
              <li>Create, update, and manage aviation data</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Technology Stack</h2>
            <p className="text-gray-700 mb-4">
              This application is built with modern web technologies:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
              <li><strong>Backend:</strong> C++17 with Crow web framework</li>
              <li><strong>Frontend:</strong> React with Vite and Tailwind CSS</li>
              <li><strong>Data Source:</strong> OpenFlights.org dataset</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">About the Creator</h2>
            <p className="text-gray-700 mb-4">
              This project was created as a demonstration of full-stack development capabilities, 
              combining efficient C++ backend processing with a modern, responsive React frontend.
            </p>
            <p className="text-gray-700 italic">
              {/* Add your personal information here */}
              Created by [Your Name] - [Your School/Organization] - [Current Year]
            </p>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Data sourced from <a href="https://www.openflights.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">OpenFlights.org</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}