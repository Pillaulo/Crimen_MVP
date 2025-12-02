import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

// Fix para iconos de Leaflet en React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

/**
 * Componente que agrega el heatmap al mapa
 */
function HeatmapLayer({ reportes, visible }) {
  const map = useMap();
  const heatLayerRef = useRef(null);

  useEffect(() => {
    let timeoutId = null;

    // Si el heatmap no está visible, limpiar y salir
    if (!visible) {
      if (heatLayerRef.current) {
        try {
          if (map.hasLayer(heatLayerRef.current)) {
            map.removeLayer(heatLayerRef.current);
          }
        } catch (e) {
          // Ignorar errores
        }
        heatLayerRef.current = null;
      }
      return;
    }

    // Verificar que L.heatLayer esté disponible
    if (!L || typeof L.heatLayer !== 'function') {
      console.error('❌ L.heatLayer no está disponible. Asegúrate de que leaflet.heat esté instalado.');
      return;
    }

    // Limpiar capa anterior si existe
    const cleanup = () => {
      if (heatLayerRef.current) {
        try {
          if (map.hasLayer(heatLayerRef.current)) {
            map.removeLayer(heatLayerRef.current);
          }
        } catch (e) {
          // Ignorar errores
        }
        heatLayerRef.current = null;
      }
    };

    cleanup();

    // Si no hay reportes, no hacer nada
    if (!reportes || reportes.length === 0) {
      return;
    }

    // Función para inicializar el heatmap
    const initHeatmap = () => {
      try {
        // Preparar datos para el heatmap
        const heatData = reportes.map(reporte => {
          if (!reporte.latitud || !reporte.longitud) {
            return null;
          }
          return [
            parseFloat(reporte.latitud),
            parseFloat(reporte.longitud),
            1 // Intensidad base
          ];
        }).filter(Boolean); // Filtrar valores nulos

        if (heatData.length === 0) {
          return;
        }

        // Crear capa de heatmap usando L.heatLayer directamente
        const heatLayer = L.heatLayer(heatData, {
          radius: 35,
          blur: 25,
          maxZoom: 17,
          max: 1.0,
          gradient: {
            0.0: 'blue',
            0.2: 'cyan',
            0.4: 'lime',
            0.6: 'yellow',
            0.8: 'orange',
            1.0: 'red'
          }
        });

        // Guardar referencia
        heatLayerRef.current = heatLayer;

        // Agregar al mapa
        heatLayer.addTo(map);
        
        console.log(`✅ Heatmap actualizado con ${heatData.length} puntos`);
      } catch (error) {
        console.error('❌ Error al crear heatmap:', error);
      }
    };

    // Iniciar después de un pequeño delay para asegurar que el mapa esté listo
    timeoutId = setTimeout(initHeatmap, 100);

    // Limpiar al desmontar o cuando cambien los reportes
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      cleanup();
    };
  }, [map, reportes, visible]);

  return null;
}

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

/**
 * Componente de mapa completo que puede mostrar heatmap o marcadores individuales
 * 
 * @param {Object} props
 * @param {Array} props.reportes - Array de reportes con latitud y longitud
 * @param {string} props.modo - 'heatmap' o 'avisos'
 */
export default function MapaCompleto({ reportes = [], modo = 'heatmap' }) {
  // Coordenadas de Viña del Mar, Chile
  const mapCenter = [-33.0245, -71.5520];
  const mapZoom = 13;

  const mostrarHeatmap = modo === 'heatmap';
  const mostrarAvisos = modo === 'avisos';

  return (
    <div className="w-full h-full">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Capa de heatmap */}
        <HeatmapLayer reportes={reportes} visible={mostrarHeatmap} />
        
        {/* Marcadores individuales */}
        {mostrarAvisos && reportes.map((reporte) => {
          if (!reporte.latitud || !reporte.longitud) {
            return null;
          }
          
          return (
            <Marker
              key={reporte.id}
              position={[parseFloat(reporte.latitud), parseFloat(reporte.longitud)]}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {reporte.tipo_aviso}
                  </h3>
                  <p className="text-sm text-gray-700 mb-2">
                    {reporte.descripcion}
                  </p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>
                      <strong>ID:</strong> #{reporte.id}
                    </p>
                    <p>
                      <strong>Fecha:</strong> {formatFecha(reporte.fecha_reporte)}
                    </p>
                    <p>
                      <strong>Ubicación:</strong> {reporte.latitud.toFixed(4)}, {reporte.longitud.toFixed(4)}
                    </p>
                    {reporte.foto && (
                      <div className="mt-2">
                        <img
                          src={reporte.foto}
                          alt="Foto del reporte"
                          className="max-w-full h-24 object-cover rounded border border-gray-300"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

