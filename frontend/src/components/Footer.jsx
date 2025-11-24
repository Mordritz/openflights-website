import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-black text-white py-6 mt-auto">
      <div className="max-w-[1600px] mx-auto px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <div className="text-gray-400">
            Data sourced from{' '}
            <a
              href="https://openflights.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-blue-400 transition-base underline"
            >
              openflights.org
            </a>
          </div>
          <div>
            <Link
              to="/about"
              className="text-gray-400 hover:text-white transition-base"
            >
              About
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
