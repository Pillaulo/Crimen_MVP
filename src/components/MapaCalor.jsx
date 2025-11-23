import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

/**
 * Componente que agrega el heatmap al mapa
 */
function HeatmapLayer({ reportes }) {
  const map = useMap();
  const heatLayerRef = useRef(null);

  useEffect(() => {
    let timeoutId = null;

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
          radius: 35,        // Radio aumentado para mejor visibilidad
          blur: 25,          // Desenfoque aumentado
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
  }, [map, reportes]);

  return null;
}

/**
 * Componente de mapa de calor que muestra la distribución de incidentes
 * 
 * @param {Object} props
 * @param {Array} props.reportes - Array de reportes con latitud y longitud
 */
export default function MapaCalor({ reportes = [] }) {
  // Coordenadas de Viña del Mar, Chile
  const mapCenter = [-33.0245, -71.5520];
  const mapZoom = 13;

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
        <HeatmapLayer reportes={reportes} />
      </MapContainer>
    </div>
  );
}

