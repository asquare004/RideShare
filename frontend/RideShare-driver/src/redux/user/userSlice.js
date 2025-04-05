import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentUser: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    signInStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    signInSuccess: (state, action) => {
      // Log user data in development mode
      if (process.env.NODE_ENV === 'development') {
        console.log('Setting user data in Redux:', action.payload);
      }
      
      // Ensure profile picture is properly set if available
      if (action.payload) {
        // Use provided profile picture or preserve existing one
        const profilePicture = action.payload.profilePicture || 
                              (state.currentUser && state.currentUser.profilePicture);
        
        if (profilePicture) {
          action.payload.profilePicture = profilePicture;
        }
        
        // Ensure token is properly extracted and stored
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
    signOut: (state) => {
      state.currentUser = null;
      state.loading = false;
      state.error = null;
    },
    updateUserProfile: (state, action) => {
      if (state.currentUser) {
        state.currentUser = { ...state.currentUser, ...action.payload };
        
        if (process.env.NODE_ENV === 'development') {
          console.log('Updated user profile in Redux:', state.currentUser);
        }
      }
    },
  },
});

export const { 
  signInStart, 
  signInSuccess, 
  signInFailure, 
  signOut,
  updateUserProfile
} = userSlice.actions;

export default userSlice.reducer; 