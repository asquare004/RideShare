import React, { useEffect, useRef, useState } from 'react';
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

function MapController({ center }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView([center.lat, center.lng], 13);
    }
  }, [center, map]);

  return null;
}

function LocationButton({ currentLocation, onLocationRequest }) {
  const map = useMap();

  const handleCenterClick = async (e) => {
    e.stopPropagation();
    if (!currentLocation) {
      // Request location if we don't have it
      if (onLocationRequest) {
        await onLocationRequest();
      }
    } else {
      // Center map on current location
      map.setView([currentLocation.lat, currentLocation.lng], 13);
    }
  };

  return (
    <div 
      className="leaflet-control" 
      style={{ 
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: 1000
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={handleCenterClick}
        className="bg-white p-2 rounded-lg shadow-md hover:bg-gray-100 flex items-center gap-2"
        style={{ 
          cursor: 'pointer',
          pointerEvents: 'auto'
        }}
      >
        <span>Current Location</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" className="text-black" viewBox="0 0 16 16">
          <circle cx="8" cy="4" r="3" fill="#ef4444"/>
          <line x1="8" y1="7" x2="8" y2="14" stroke="black" strokeWidth="1.5"/>
        </svg>
      </button>
    </div>
  );
}

function RouteLayer({ source, destination }) {
  const [routeCoordinates, setRouteCoordinates] = useState([]);

  useEffect(() => {
    const fetchRoute = async () => {
      if (source && destination) {
        try {
          const response = await fetch(
            `https://router.project-osrm.org/route/v1/driving/${source.lng},${source.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`
          );
          const data = await response.json();
          
          if (data.routes && data.routes[0]) {
            setRouteCoordinates(
              data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]])
            );
          }
        } catch (error) {
          console.error('Error fetching route:', error);
        }
      }
    };

    fetchRoute();
  }, [source, destination]);

  return routeCoordinates.length > 0 ? (
    <Polyline
      positions={routeCoordinates}
      color="blue"
      weight={4}
      opacity={0.6}
    />
  ) : null;
}

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e);
    },
  });
  return null;
}

function Map({ markers, handleMapClick, currentLocation, onLocationRequest }) {
  const defaultCenter = [51.505, -0.09];
  
  return (
    <div style={{ height: '400px', width: '100%', position: 'relative' }}>
      <MapContainer 
        center={defaultCenter}
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        doubleClickZoom={false}
      >
        <MapClickHandler onMapClick={handleMapClick} />
        
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {currentLocation && (
          <Marker 
            position={[currentLocation.lat, currentLocation.lng]}
            icon={new L.Icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
            })}
          >
            <Popup>You are here</Popup>
          </Marker>
        )}

        {markers.sourceCord && (
          <Marker 
            position={[markers.sourceCord.lat, markers.sourceCord.lng]}
            icon={new L.Icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
            })}
          >
            <Popup>Source</Popup>
          </Marker>
        )}

        {markers.destinationCord && (
          <Marker 
            position={[markers.destinationCord.lat, markers.destinationCord.lng]}
            icon={new L.Icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
            })}
          >
            <Popup>Destination</Popup>
          </Marker>
        )}

        {markers.sourceCord && markers.destinationCord && (
          <RouteLayer 
            source={markers.sourceCord}
            destination={markers.destinationCord}
          />
        )}

        <LocationButton 
          currentLocation={currentLocation} 
          onLocationRequest={onLocationRequest}
        />
      </MapContainer>
    </div>
  );
}

export default Map; 