import { useState, useEffect } from 'react';
import MapaCompleto from '../components/MapaCompleto';
import { getReports, reloadReports } from '../data/reportsStore';

/**
 * Página del Mapa para visualizar la distribución de incidentes
 * Permite alternar entre vista de heatmap y vista de avisos individuales
 */
export default function Heatmap() {
  const [reportes, setReportes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modo, setModo] = useState('heatmap'); // 'heatmap' o 'avisos'

  // Cargar reportes al iniciar
  useEffect(() => {
    const loadData = async () => {
      try {
        await reloadReports();
        const reportesData = await getReports();
        setReportes(reportesData);
      } catch (error) {
        console.error('Error al cargar reportes:', error);
      } finally {
        setCargando(false);
      }
    };
    loadData();
  }, []);

  const toggleModo = () => {
    setModo(modo === 'heatmap' ? 'avisos' : 'heatmap');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Título y descripción */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Mapa de Incidentes
              </h1>
              <p className="text-gray-600">
                Visualización de la distribución geográfica de los reportes de seguridad
              </p>
            </div>
            <button
              onClick={toggleModo}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2 shadow-md"
            >
              {modo === 'heatmap' ? (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Ver Avisos Individuales
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Ver Mapa de Calor
                </>
              )}
            </button>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <span>
              <strong className="text-gray-900">{reportes.length}</strong> reportes totales
            </span>
            <span>•</span>
            <span>
              Modo actual: <strong className="text-blue-600">{modo === 'heatmap' ? 'Mapa de Calor' : 'Avisos Individuales'}</strong>
            </span>
            {modo === 'heatmap' && (
              <>
                <span>•</span>
                <span>
                  Las zonas <span className="text-red-600 font-semibold">rojas</span> indican mayor concentración
                </span>
              </>
            )}
            {modo === 'avisos' && (
              <>
                <span>•</span>
                <span>
                  Haz clic en los marcadores para ver detalles del reporte
                </span>
              </>
            )}
          </div>
        </div>

        {/* Mapa */}
        <div className="bg-white rounded-lg shadow-md p-4">
          {cargando ? (
            <div className="h-[600px] flex items-center justify-center">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Cargando mapa...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="h-[600px] rounded-lg overflow-hidden border border-gray-300">
                <MapaCompleto reportes={reportes} modo={modo} />
              </div>
              
              {modo === 'heatmap' && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-800 mb-2">
                    Leyenda del Mapa de Calor
                  </h3>
                  <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span>Baja concentración</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-cyan-500 rounded"></div>
                      <span>Concentración media-baja</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-lime-500 rounded"></div>
                      <span>Concentración media</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                      <span>Concentración media-alta</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-orange-500 rounded"></div>
                      <span>Alta concentración</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-500 rounded"></div>
                      <span>Muy alta concentración</span>
                    </div>
                  </div>
                </div>
              )}

              {modo === 'avisos' && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-800 mb-2">
                    Vista de Avisos Individuales
                  </h3>
                  <p className="text-xs text-gray-600">
                    Cada marcador representa un reporte individual. Haz clic en cualquier marcador para ver los detalles completos del reporte, incluyendo tipo de aviso, descripción, fecha y ubicación exacta.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Información adicional */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            {modo === 'heatmap' ? '¿Cómo interpretar el mapa de calor?' : '¿Cómo usar la vista de avisos?'}
          </h2>
          <ul className="space-y-2 text-sm text-gray-600">
            {modo === 'heatmap' ? (
              <>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    El mapa muestra la densidad de reportes en diferentes zonas de Viña del Mar
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    Las áreas con colores más cálidos (rojo, naranja) indican zonas con mayor número de incidentes reportados
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    Esta visualización ayuda a identificar patrones geográficos y zonas de mayor riesgo
                  </span>
                </li>
              </>
            ) : (
              <>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    Cada marcador en el mapa representa un reporte individual de seguridad
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    Haz clic en cualquier marcador para ver los detalles completos del reporte
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    Esta vista te permite identificar exactamente qué tipo de incidente ocurrió en cada ubicación
                  </span>
                </li>
              </>
            )}
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                El mapa se actualiza automáticamente cuando se agregan nuevos reportes
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                Usa el botón superior para alternar entre la vista de mapa de calor y la vista de avisos individuales
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

