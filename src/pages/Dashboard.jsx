import { useState, useEffect } from 'react';
import { getReports, deleteReport, reloadReports } from '../data/reportsStore';

/**
 * Página de Dashboard para visualizar reportes con conteo total, por tipo y filtros
 */
export default function Dashboard() {
  const [reportes, setReportes] = useState([]);
  const [reportesFiltrados, setReportesFiltrados] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroBusqueda, setFiltroBusqueda] = useState('');
  const [tiposAviso, setTiposAviso] = useState([]);

  // Cargar reportes al iniciar
  useEffect(() => {
    const loadData = async () => {
      await reloadReports();
      const reportesData = await getReports();
      setReportes(reportesData);
      
      // Extraer tipos únicos de aviso
      const tiposUnicos = [...new Set(reportesData.map(r => r.tipo_aviso))].sort();
      setTiposAviso(tiposUnicos);
    };
    loadData();
  }, []);

  // Aplicar filtros cuando cambian los reportes o los filtros
  useEffect(() => {
    let filtrados = [...reportes];

    // Filtrar por tipo
    if (filtroTipo) {
      filtrados = filtrados.filter(r => r.tipo_aviso === filtroTipo);
    }

    // Filtrar por búsqueda (descripción o tipo)
    if (filtroBusqueda) {
      const busqueda = filtroBusqueda.toLowerCase();
      filtrados = filtrados.filter(r => 
        r.descripcion.toLowerCase().includes(busqueda) ||
        r.tipo_aviso.toLowerCase().includes(busqueda)
      );
    }

    setReportesFiltrados(filtrados);
  }, [reportes, filtroTipo, filtroBusqueda]);

  /**
   * Calcula el conteo de reportes por tipo
   */
  const getConteoPorTipo = () => {
    const conteo = {};
    reportes.forEach(reporte => {
      conteo[reporte.tipo_aviso] = (conteo[reporte.tipo_aviso] || 0) + 1;
    });
    return conteo;
  };

  /**
   * Maneja la eliminación de un reporte
   */
  const handleDeleteReporte = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este reporte?')) {
      return;
    }

    try {
      const eliminado = await deleteReport(id);
      
      if (eliminado) {
        const reportesData = await getReports();
        setReportes(reportesData);
        alert('Reporte eliminado exitosamente');
      } else {
        alert('No se pudo encontrar el reporte para eliminar');
      }
    } catch (error) {
      console.error('Error al eliminar reporte:', error);
      alert('Error al eliminar el reporte. Por favor, intenta nuevamente.');
    }
  };

  /**
   * Formatea la fecha para mostrar
   */
  const formatFecha = (fechaISO) => {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const conteoPorTipo = getConteoPorTipo();
  const totalReportes = reportes.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Título y estadísticas principales */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard de Reportes
          </h1>
          <p className="text-gray-600">
            Visualización y gestión de reportes de seguridad ciudadana
          </p>
        </div>

        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Reportes</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalReportes}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tipos de Aviso</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{tiposAviso.length}</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Reportes Filtrados</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{reportesFiltrados.length}</p>
              </div>
              <div className="bg-yellow-100 rounded-full p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-yellow-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Con Foto</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {reportes.filter(r => r.foto).length}
                </p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Conteo por tipo */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Conteo por Tipo de Aviso
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(conteoPorTipo)
              .sort((a, b) => b[1] - a[1])
              .map(([tipo, cantidad]) => (
                <div
                  key={tipo}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <p className="text-sm font-medium text-gray-700 mb-1">{tipo}</p>
                  <p className="text-2xl font-bold text-blue-600">{cantidad}</p>
                </div>
              ))}
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Filtros
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="filtro-tipo" className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por Tipo
              </label>
              <select
                id="filtro-tipo"
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los tipos</option>
                {tiposAviso.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo} ({conteoPorTipo[tipo] || 0})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="filtro-busqueda" className="block text-sm font-medium text-gray-700 mb-2">
                Buscar en Descripción
              </label>
              <input
                id="filtro-busqueda"
                type="text"
                value={filtroBusqueda}
                onChange={(e) => setFiltroBusqueda(e.target.value)}
                placeholder="Buscar por descripción o tipo..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          {(filtroTipo || filtroBusqueda) && (
            <button
              onClick={() => {
                setFiltroTipo('');
                setFiltroBusqueda('');
              }}
              className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors text-sm"
            >
              Limpiar Filtros
            </button>
          )}
        </div>

        {/* Lista de Reportes */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Reportes ({reportesFiltrados.length})
          </h2>
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {reportesFiltrados.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                {reportes.length === 0
                  ? 'No hay reportes aún. ¡Sé el primero en reportar!'
                  : 'No hay reportes que coincidan con los filtros seleccionados.'}
              </p>
            ) : (
              reportesFiltrados
                .slice()
                .reverse()
                .map((reporte) => (
                  <div
                    key={reporte.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {reporte.tipo_aviso}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          #{reporte.id}
                        </span>
                        <button
                          onClick={() => handleDeleteReporte(reporte.id)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded transition-colors"
                          title="Eliminar reporte"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      {reporte.descripcion}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                      <span>
                        📅 {formatFecha(reporte.fecha_reporte)}
                      </span>
                      <span>•</span>
                      <span>
                        📍 {reporte.latitud.toFixed(4)}, {reporte.longitud.toFixed(4)}
                      </span>
                      {reporte.foto && (
                        <>
                          <span>•</span>
                          <span>📷 Con foto</span>
                        </>
                      )}
                    </div>
                    {reporte.foto && (
                      <div className="mt-2">
                        <img
                          src={reporte.foto}
                          alt="Foto del reporte"
                          className="max-w-full h-32 object-cover rounded border border-gray-300"
                        />
                      </div>
                    )}
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

