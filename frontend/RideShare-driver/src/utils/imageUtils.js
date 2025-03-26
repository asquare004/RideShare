/**
 * Utility functions for handling images in the application
 */

/**
 * Creates a proxy URL for images that may have CORS issues
 * @param {string} url - The original image URL
 * @returns {string} - The proxied image URL
 */
export const getProxiedImageUrl = (url) => {
  if (!url) return '';
  
  // If it's already proxied, return as is
  if (url.includes('images.weserv.nl')) {
    return url;
  }
  
  // If it's a Google profile picture or any external URL, use a proxy
  if (url.includes('googleusercontent.com') || 
      url.includes('http://') || 
      url.includes('https://')) {
    return `https://images.weserv.nl/?url=${encodeURIComponent(url)}`;
  }
  
  // If it's a local URL or data URL, return as is
  return url;
};

/**
 * Checks if an image URL is valid by attempting to load it
 * @param {string} url - The image URL to test
 * @returns {Promise<boolean>} - Promise resolving to true if valid, false otherwise
 */
export const isImageUrlValid = (url) => {
  return new Promise((resolve) => {
    if (!url) {
      resolve(false);
      return;
    }
    
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};

/**
 * Gets initials from a name for avatar placeholders
 * @param {string} firstName - First name
 * @param {string} lastName - Last name
 * @returns {string} - Initials (1-2 characters)
 */
export const getInitials = (firstName, lastName) => {
  let initials = '';
  
  if (firstName) {
    initials += firstName[0];
  }
  
  if (lastName) {
    initials += lastName[0];
  }
  
  return initials.toUpperCase();
};

/**
 * Fallback image URL for when profile pictures fail to load
 */
export const DEFAULT_PROFILE_IMAGE = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'; 