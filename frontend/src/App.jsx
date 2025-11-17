import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Airports from './pages/Airports';
import Airlines from './pages/Airlines';
import RoutesFinder from './pages/Routes';
import About from './pages/About';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/airports" element={<Airports />} />
          <Route path="/airlines" element={<Airlines />} />
          <Route path="/routes" element={<RoutesFinder />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;