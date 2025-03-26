export const RIDE_CONSTANTS = {
  MAX_PASSENGERS: 6,
  MIN_FARE_MULTIPLIER: 30,
  MAX_FARE_MULTIPLIER: 60,
  GEOCODING_API: 'https://nominatim.openstreetmap.org/reverse',
  ROUTING_API: 'https://router.project-osrm.org/route/v1/driving'
};

export const INITIAL_FORM_STATE = {
  source: '',
  destination: '',
  sourceCord: '',
  destinationCord: '',
  date: '',
  departureTime: '',
  availableSeats: '',
  price: '',
};

export const INITIAL_MARKERS_STATE = {
  sourceCord: null,
  destinationCord: null,
  currentLocation: null
};

export const DEFAULT_CENTER = {
  lat: 20.5937,
  lng: 78.9629
}; 