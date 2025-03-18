import { RIDE_CONSTANTS } from '../constants/ride';

export const locationService = {
  async reverseGeocode(lat, lng) {
    try {
      const response = await fetch(
        `${RIDE_CONSTANTS.GEOCODING_API}?format=json&lat=${lat}&lon=${lng}`
      );
      return await response.json();
    } catch (error) {
      console.error('Error in reverse geocoding:', error);
      throw error;
    }
  },

  async calculateDistance(sourceCord, destinationCord) {
    if (!sourceCord || !destinationCord) return null;

    try {
      const [sourceLat, sourceLng] = sourceCord.split(',');
      const [destLat, destLng] = destinationCord.split(',');
      
      const response = await fetch(
        `${RIDE_CONSTANTS.ROUTING_API}/${sourceLng},${sourceLat};${destLng},${destLat}?overview=false`
      );
      const data = await response.json();
      
      if (data.routes?.[0]) {
        return (data.routes[0].distance / 1000).toFixed(2);
      }
      return null;
    } catch (error) {
      console.error('Error calculating distance:', error);
      throw error;
    }
  }
}; 