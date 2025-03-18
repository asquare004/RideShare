import { createSlice } from '@reduxjs/toolkit';
import { INITIAL_FORM_STATE } from '../../constants/ride';

const initialState = {
  formData: INITIAL_FORM_STATE,
  distance: null,
  fareRange: { min: 0, max: 0 },
  error: null,
};

const rideSlice = createSlice({
  name: 'ride',
  initialState,
  reducers: {
    updateFormData: (state, action) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    setDistance: (state, action) => {
      state.distance = action.payload;
    },
    setFareRange: (state, action) => {
      state.fareRange = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    resetRideForm: (state) => {
      state.formData = INITIAL_FORM_STATE;
      state.distance = null;
      state.fareRange = { min: 0, max: 0 };
      state.error = null;
    },
  },
});

export const {
  updateFormData,
  setDistance,
  setFareRange,
  setError,
  resetRideForm,
} = rideSlice.actions;

export default rideSlice.reducer; 