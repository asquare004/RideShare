import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentUser: null,
  error: null,
  loading: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    signInStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    signInSuccess: (state, action) => {
      // Log user data in development mode
      if (process.env.NODE_ENV === 'development' || import.meta.env.MODE === 'development') {
        console.log('Setting user data in Redux:', action.payload);
      }
      
      // Ensure token is properly extracted and stored
      if (action.payload) {
        // Ensure profile picture is properly set if available
        const profilePicture = action.payload.profilePicture || 
                             (state.currentUser && state.currentUser.profilePicture);
        
        if (profilePicture) {
          action.payload.profilePicture = profilePicture;
        }
        
        // Make sure token is properly extracted and stored
        if (!action.payload.token) {
          // Try to extract token from nested _doc object or other locations
          if (action.payload._doc && action.payload._doc.token) {
            action.payload.token = action.payload._doc.token;
            console.log('Extracted token from _doc object');
          } else if (action.payload.accessToken) {
            action.payload.token = action.payload.accessToken;
            console.log('Using accessToken as token');
          }
        }
        
        // Log token presence
        if (action.payload.token) {
          console.log('Token stored in Redux state (first 10 chars):', 
            action.payload.token.substring(0, 10) + '...');
          
          // Also store in localStorage as backup
          try {
            localStorage.setItem('userToken', action.payload.token);
          } catch (e) {
            console.error('Failed to store token in localStorage:', e);
          }
        } else {
          console.warn('No token found in user data to store in Redux');
        }
      }
      
      state.currentUser = action.payload;
      state.loading = false;
      state.error = null;
    },
    signInFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateSuccess: (state, action) => {
      state.currentUser = action.payload;
      state.loading = false;
      state.error = null;
    },
    updateFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteUserStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteUserSuccess: (state) => {
      state.currentUser = null;
      state.loading = false;
      state.error = null;
    },
    deleteUserFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    signOutSuccess: (state) => {
      state.currentUser = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  signInStart,
  signInSuccess,
  signInFailure,
  updateStart,
  updateSuccess,
  updateFailure,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
  signOutSuccess,
} = userSlice.actions;

export default userSlice.reducer;