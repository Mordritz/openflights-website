import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  
  const links = [
    { to: '/', label: 'Home' },
    { to: '/airports', label: 'Airports' },
    { to: '/airlines', label: 'Airlines' },
    { to: '/routes', label: 'Routes' },
    { to: '/about', label: 'About' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold text-white text-shadow drop-shadow-lg">
            ✈️ FlightHub
          </Link>
          
          <div className="flex space-x-8">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all drop-shadow-md ${
                  location.pathname === link.to
                    ? 'text-white bg-white/20'
                    : 'text-white/95 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}