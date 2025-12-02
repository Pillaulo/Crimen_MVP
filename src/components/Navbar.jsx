import { Link, useLocation } from 'react-router-dom';

/**
 * Componente de navegación principal
 */
export default function Navbar() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="text-xl font-bold text-gray-900">
              Reportes de Seguridad
            </Link>
            <span className="ml-3 text-sm text-gray-500">Viña del Mar, Chile</span>
          </div>
          
          <div className="flex space-x-1">
            <Link
              to="/dashboard"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/dashboard')
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/map"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/map')
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Mapa
            </Link>
            <Link
              to="/reporte"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/reporte')
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Nuevo Reporte
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

