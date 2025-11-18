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
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="glass-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center space-x-3 group">
              <span className="text-3xl group-hover:scale-110 transition-transform">✈️</span>
              <span className="text-2xl font-bold text-white tracking-tight">
                Flight<span className="text-blue-300">Hub</span>
              </span>
            </Link>
            
            <div className="flex space-x-2">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-smooth ${
                    location.pathname === link.to
                      ? 'bg-white/25 text-white shadow-lg'
                      : 'text-white/85 hover:text-white hover:bg-white/15'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}