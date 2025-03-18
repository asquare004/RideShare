import { createSlice } from '@reduxjs/toolkit';
import { INITIAL_MARKERS_STATE } from '../../constants/ride';

const initialState = {
  markers: INITIAL_MARKERS_STATE,
  mapCenter: null,
  currentLocation: null,
  isLoadingLocation: false,
  locationError: null,
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setMarkers: (state, action) => {
      state.markers = { ...state.markers, ...action.payload };
    },
    setMapCenter: (state, action) => {
      state.mapCenter = action.payload;
    },
    setCurrentLocation: (state, action) => {
      state.currentLocation = action.payload;
    },
    setLoadingLocation: (state, action) => {
      state.isLoadingLocation = action.payload;
    },
    setLocationError: (state, action) => {
      state.locationError = action.payload;
    },
    resetMarkers: (state) => {
      state.markers = INITIAL_MARKERS_STATE;
      state.mapCenter = null;
    },
  },
});

export const {
  setMarkers,
  setMapCenter,
  setCurrentLocation,
  setLoadingLocation,
  setLocationError,
  resetMarkers,
} = locationSlice.actions;

export default locationSlice.reducer; 