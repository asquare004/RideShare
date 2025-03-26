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
      // Add a slight delay to ensure proper centering
      setTimeout(() => {
        map.setView([center.lat, center.lng], 15, {
          animate: true,
          duration: 0.5,
          pan: {
            animate: true,
            duration: 0.5,
            easeLinearity: 0.5,
          }
        });
        
        // Force a map invalidation to ensure proper rendering
        map.invalidateSize();
      }, 100);
    }
  }, [center, map]);

  return null;
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

function MapClickHandler({ onMapClick, markers }) {
  useMapEvents({
    click(e) {
      // If source is not set, set source first, otherwise set destination
      if (!markers.sourceCord) {
        onMapClick(e, 'source');
      } else if (!markers.destinationCord) {
        onMapClick(e, 'destination');
      }
      // If both are set, clicking will update source location
      else {
        onMapClick(e, 'source');
      }
    },
  });
  return null;
}

function Map({ markers, handleMapClick, currentLocation, center, onReset }) {
  const defaultCenter = currentLocation || [20.5937, 78.9629]; // Default to center of India
  
  // Add handler for marker drag events
  const handleMarkerDrag = (e, type) => {
    const { lat, lng } = e.target.getLatLng();
    handleMapClick({ latlng: { lat, lng } }, type);
  };
  
  return (
    <div style={{ height: '500px', width: '100%', position: 'relative' }}>
      <div 
        className="absolute top-2 right-2 z-[1000] bg-white rounded-md shadow-md"
        style={{ zIndex: 1000 }}
      >
        <button
          onClick={onReset}
          className="px-4 py-2 text-base text-gray-700 hover:bg-gray-100 rounded-md flex items-center gap-2 font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reset Markers
        </button>
      </div>

      <MapContainer 
        center={defaultCenter}
        zoom={15}
        style={{ height: '100%', width: '100%', zIndex: 1 }}
        doubleClickZoom={false}
        // Add these options for better centering behavior
        zoomControl={false} // We'll add zoom control in a better position
      >
        {/* Add zoom control in top-right */}
        <div className="leaflet-top leaflet-right" style={{ marginTop: '60px' }}>
          <div className="leaflet-control-zoom leaflet-bar leaflet-control">
            <a className="leaflet-control-zoom-in" href="#" title="Zoom in">+</a>
            <a className="leaflet-control-zoom-out" href="#" title="Zoom out">-</a>
          </div>
        </div>
        
        <MapClickHandler onMapClick={handleMapClick} markers={markers} />
        <MapController center={center || currentLocation} />
        
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
            draggable={true}
            eventHandlers={{
              dragend: (e) => handleMarkerDrag(e, 'source')
            }}
          >
            <Popup>Source (Drag to move)</Popup>
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
            draggable={true}
            eventHandlers={{
              dragend: (e) => handleMarkerDrag(e, 'destination')
            }}
          >
            <Popup>Destination (Drag to move)</Popup>
          </Marker>
        )}

        {markers.sourceCord && markers.destinationCord && (
          <RouteLayer 
            source={markers.sourceCord}
            destination={markers.destinationCord}
          />
        )}
      </MapContainer>
    </div>
  );
}

export default Map; 