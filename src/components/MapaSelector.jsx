import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

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
 * Componente que actualiza el centro del mapa cuando cambia la posición
 */
function ChangeMapView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [map, center, zoom]);
  return null;
}

/**
 * Componente que escucha los clics en el mapa
 */
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e);
    }
  });
  return null;
}

/**
 * Componente de mapa interactivo para seleccionar ubicación
 * 
 * FUTURO BACKEND: Este componente puede enviar coordenadas al backend
 * para validación geográfica, geocodificación inversa, o análisis
 * de zonas de riesgo mediante modelos de IA entrenados en Python.
 * 
 * @param {Object} props
 * @param {Array} props.position - [lat, lng] posición actual seleccionada
 * @param {Function} props.onPositionChange - Callback cuando cambia la posición
 */
export default function MapaSelector({ position, onPositionChange }) {
  // Coordenadas de Viña del Mar, Chile
  const [mapCenter] = useState([-33.0245, -71.5520]);
  const [mapZoom] = useState(13);
  const [markerPosition, setMarkerPosition] = useState(position || null);

  // Actualizar marcador cuando cambia la prop position
  useEffect(() => {
    if (position) {
      setMarkerPosition(position);
    }
  }, [position]);

  /**
   * Maneja el clic en el mapa para colocar un marcador
   */
  const handleMapClick = (e) => {
    const newPosition = [e.latlng.lat, e.latlng.lng];
    setMarkerPosition(newPosition);
    if (onPositionChange) {
      onPositionChange(newPosition);
    }
  };

  /**
   * Obtiene la ubicación actual del usuario mediante GPS
   */
  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPosition = [position.coords.latitude, position.coords.longitude];
          setMarkerPosition(newPosition);
          onPositionChange(newPosition);
        },
        (error) => {
          alert('No se pudo obtener tu ubicación. Por favor, haz clic en el mapa para seleccionar la ubicación.');
          console.error('Error de geolocalización:', error);
        }
      );
    } else {
      alert('Tu navegador no soporta geolocalización. Por favor, haz clic en el mapa.');
    }
  };

  return (
    <div className="w-full h-full relative">
      <div className="absolute top-2 right-2 z-[1000]">
        <button
          onClick={handleUseMyLocation}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-colors"
        >
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
          Usar mi ubicación
        </button>
      </div>

      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onMapClick={handleMapClick} />
        {markerPosition && (
          <Marker position={markerPosition}>
            <Popup>
              Ubicación seleccionada<br />
              Lat: {markerPosition[0].toFixed(6)}<br />
              Lng: {markerPosition[1].toFixed(6)}
            </Popup>
          </Marker>
        )}
        <ChangeMapView center={markerPosition || mapCenter} zoom={mapZoom} />
      </MapContainer>
    </div>
  );
}

