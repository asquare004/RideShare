import React, { useEffect, useRef } from 'react';
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

function Map({ markers, handleMapClick }) {
  const mapRef = useRef(null);
  const markerLayerRef = useRef(null);
  const routingControlRef = useRef(null);

  useEffect(() => {
    // Initialize map if it doesn't exist
    if (!mapRef.current) {
      mapRef.current = L.map('map').setView([20.5937, 78.9629], 5); // Center on India
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapRef.current);
      mapRef.current.on('click', handleMapClick);
    }

    // Clear existing markers and routing
    if (markerLayerRef.current) {
      markerLayerRef.current.clearLayers();
    }
    if (routingControlRef.current) {
      mapRef.current.removeControl(routingControlRef.current);
    }

    // Create a new feature group for markers
    markerLayerRef.current = L.featureGroup().addTo(mapRef.current);

    // Add markers if they exist
    if (markers.sourceCord) {
      L.marker([markers.sourceCord.lat, markers.sourceCord.lng])
        .bindPopup('Source')
        .addTo(markerLayerRef.current);
    }

    if (markers.destinationCord) {
      L.marker([markers.destinationCord.lat, markers.destinationCord.lng])
        .bindPopup('Destination')
        .addTo(markerLayerRef.current);
    }

    // Add routing if both markers exist
    if (markers.sourceCord && markers.destinationCord) {
      routingControlRef.current = L.Routing.control({
        waypoints: [
          L.latLng(markers.sourceCord.lat, markers.sourceCord.lng),
          L.latLng(markers.destinationCord.lat, markers.destinationCord.lng)
        ],
        routeWhileDragging: false,
        showAlternatives: false,
        addWaypoints: false,
        draggableWaypoints: false,
      }).addTo(mapRef.current);

      // Fit bounds to show both markers
      const bounds = markerLayerRef.current.getBounds();
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.off('click', handleMapClick);
      }
    };
  }, [markers, handleMapClick]); // Re-run effect when markers change

  return <div id="map" style={{ height: '400px', width: '100%' }} />;
}

export default Map; 