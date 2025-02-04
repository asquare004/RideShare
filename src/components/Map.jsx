import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import L from 'leaflet';

// Fix for the default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom blue icon for current location
const blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Routing Control Component
function RoutingControl({ markers }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !markers.source || !markers.destination) return;

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(markers.source.lat, markers.source.lng),
        L.latLng(markers.destination.lat, markers.destination.lng)
      ],
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      showAlternatives: false,
      lineOptions: {
        styles: [
          { color: '#6366F1', opacity: 0.8, weight: 6 }
        ]
      },
      createMarker: () => { return null; } // Disable default markers
    }).addTo(map);

    return () => map.removeControl(routingControl);
  }, [map, markers.source, markers.destination]);

  return null;
}

function LocationButton({ setCurrentLocation }) {
  const map = useMap();
  const [loading, setLoading] = useState(false);
  
  const handleClick = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude: lat, longitude: lng } = position.coords;
          setCurrentLocation({ lat, lng });
          map.flyTo([lat, lng], 13);
          setLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert("Location access denied or unavailable.");
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
      setLoading(false);
    }
  };

  return (
    <button
      className="bg-white p-2 rounded-md shadow-md hover:bg-gray-100"
      style={{ 
        position: 'absolute', 
        top: '20px', 
        right: '20px', 
        zIndex: 1000,
        cursor: 'pointer'
      }}
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? "Locating..." : "📍 My Location"}
    </button>
  );
}

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e);
    },
  });
  return null;
}

function Map({ markers, handleMapClick }) {
  const [currentLocation, setCurrentLocation] = useState(null);
  
  const positions = markers.source && markers.destination ? [
    [markers.source.lat, markers.source.lng],
    [markers.destination.lat, markers.destination.lng]
  ] : [];

  const onMapClick = (e) => {
    const { lat, lng } = e.latlng;
    handleMapClick({ latlng: { lat, lng } });
  };

  return (
    <MapContainer 
      center={[20.5937, 78.9629]} // Center of India
      zoom={5}
      style={{ height: '400px', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapClickHandler onMapClick={onMapClick} />
      <LocationButton setCurrentLocation={setCurrentLocation} />
      
      {currentLocation && (
        <Marker 
          position={[currentLocation.lat, currentLocation.lng]}
          icon={blueIcon}
        >
          <Popup>Your Current Location</Popup>
        </Marker>
      )}
      
      {markers.source && (
        <Marker position={[markers.source.lat, markers.source.lng]}>
          <Popup>Source Location</Popup>
        </Marker>
      )}
      
      {markers.destination && (
        <Marker position={[markers.destination.lat, markers.destination.lng]}>
          <Popup>Destination Location</Popup>
        </Marker>
      )}

      {positions.length > 0 && (
        <Polyline 
          positions={positions}
          color="blue"
          weight={3}
          opacity={0.7}
        />
      )}

      {markers.source && markers.destination && (
        <RoutingControl markers={markers} />
      )}
    </MapContainer>
  );
}

export default Map; 