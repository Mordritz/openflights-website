export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="gradient-bg-about pt-24 pb-40 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-96 h-96 bg-teal-200 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-pink-200 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <h1 className="text-5xl font-bold text-gray-800 mb-6">About FlightHub</h1>
          <p className="text-xl text-gray-700">Your gateway to global aviation data</p>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 pb-16 relative">
        <div className="bg-white rounded-2xl shadow-2xl p-12 card-elevated">
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