import { configureStore } from '@reduxjs/toolkit';
import rideReducer from './slices/rideSlice';
import locationReducer from './slices/locationSlice';

export const store = configureStore({
  reducer: {
    ride: rideReducer,
    location: locationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 