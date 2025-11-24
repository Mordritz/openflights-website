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

  const isHome = location.pathname === '/';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className={`${isHome ? 'bg-transparent' : 'bg-white/95 backdrop-blur-sm border-b border-gray-200'}`}>
        <div className="max-w-[1600px] mx-auto px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2 group">
              <span className={`text-lg font-semibold tracking-tight transition-base ${
                isHome ? 'text-white' : 'text-black'
              }`}>
                OpenFlights Data Explorer
              </span>
            </Link>

            <div className="flex space-x-1">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-base ${
                    location.pathname === link.to
                      ? isHome
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-100 text-black'
                      : isHome
                        ? 'text-white/90 hover:text-white hover:bg-white/10'
                        : 'text-gray-600 hover:text-black hover:bg-gray-50'
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