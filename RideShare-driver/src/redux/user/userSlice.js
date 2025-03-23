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