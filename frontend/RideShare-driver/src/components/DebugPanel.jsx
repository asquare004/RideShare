import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateUserProfile } from '../redux/user/userSlice';
import { getProxiedImageUrl, isImageUrlValid, DEFAULT_PROFILE_IMAGE } from '../utils/imageUtils';

const DebugPanel = () => {
  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser } = useSelector(state => state.user);
  const dispatch = useDispatch();
  const [testImageResults, setTestImageResults] = useState(null);
  const [isTestingImage, setIsTestingImage] = useState(false);
  
  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  // Test if the Google URL needs a CORS proxy
  useEffect(() => {
    if (isTestingImage && currentUser?.profilePicture) {
      testImageWithProxy();
    }
  }, [isTestingImage, currentUser]);
  
  const checkRedirectSession = async () => {
    try {
      const res = await fetch(`${baseURL}/api/driver/session-info`, {
        method: 'GET',
        credentials: 'include'
      });
      
      const data = await res.json();
      console.log('Session info:', data);
      
      return data;
    } catch (error) {
      console.error('Error checking session:', error);
      return { error: error.message };
    }
  };
  
  const fetchGoogleUserInfo = async () => {
    try {
      // This is just for debugging - normally you'd call your backend
      console.log('Current user in Redux:', currentUser);
      
      // Try to fetch profile data directly
      if (currentUser?._id) {
        const res = await fetch(`${baseURL}/api/driver/profile/${currentUser._id}`, {
          credentials: 'include'
        });
        
        if (res.ok) {
          const data = await res.json();
          console.log('Fetched profile data:', data);
          
          // Update Redux with any new profile data
          if (data && data.profilePicture) {
            // Apply proxy if needed
            const profilePicture = getProxiedImageUrl(data.profilePicture);
            
            dispatch(updateUserProfile({
              profilePicture: profilePicture
            }));
          }
          
          return data;
        } else {
          console.error('Error fetching profile');
          return { error: 'Failed to fetch profile' };
        }
      }
    } catch (error) {
      console.error('Error:', error);
      return { error: error.message };
    }
  };
  
  const testProfileImage = async () => {
    setIsTestingImage(true);
    setTestImageResults(null);
    
    if (!currentUser?.profilePicture) {
      console.log('No profile picture URL found in user data');
      setTestImageResults({
        original: false,
        proxy: false,
        message: 'No profile picture URL found'
      });
      setIsTestingImage(false);
      return;
    }
    
    console.log('Testing image URL:', currentUser.profilePicture);
    
    // Test if the original URL works
    const isValid = await isImageUrlValid(currentUser.profilePicture);
    
    if (isValid) {
      console.log('Original profile image loaded successfully');
      setTestImageResults({
        original: true,
        message: 'Image loaded successfully'
      });
      setIsTestingImage(false);
    } else {
      console.error('Original profile image failed to load, will try with proxy');
      setTestImageResults({
        original: false,
        message: 'Original image failed - trying proxy'
      });
      // Will trigger the useEffect to try with proxy
    }
  };
  
  const testImageWithProxy = async () => {
    // If we already have results from the original test and it succeeded, don't test proxy
    if (testImageResults?.original) {
      setIsTestingImage(false);
      return;
    }
    
    if (!currentUser?.profilePicture) {
      setIsTestingImage(false);
      return;
    }
    
    // Try with proxy
    const proxyUrl = getProxiedImageUrl(currentUser.profilePicture);
    console.log('Testing with proxy URL:', proxyUrl);
    
    // Skip if the URL is already proxied
    if (proxyUrl === currentUser.profilePicture) {
      console.log('URL is already proxied');
      setTestImageResults(prev => ({
        ...prev,
        proxy: true,
        proxyUrl: proxyUrl,
        message: 'URL is already using a proxy'
      }));
      setIsTestingImage(false);
      return;
    }
    
    const isProxyValid = await isImageUrlValid(proxyUrl);
    
    if (isProxyValid) {
      console.log('Proxy image loaded successfully');
      setTestImageResults(prev => ({
        ...prev,
        proxy: true,
        proxyUrl: proxyUrl,
        message: 'Proxy image loaded successfully'
      }));
      
      // Update Redux with the proxy URL
      dispatch(updateUserProfile({
        profilePicture: proxyUrl
      }));
      
      setIsTestingImage(false);
    } else {
      console.error('Proxy image also failed to load');
      setTestImageResults(prev => ({
        ...prev,
        proxy: false,
        message: 'Both original and proxy failed'
      }));
      setIsTestingImage(false);
    }
  };
  
  const applyProxyToImage = () => {
    if (!currentUser?.profilePicture) return;
    
    const proxyUrl = getProxiedImageUrl(currentUser.profilePicture);
    console.log('Applying proxy URL to profile picture:', proxyUrl);
    
    dispatch(updateUserProfile({
      profilePicture: proxyUrl
    }));
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-800 text-white p-2 rounded-full"
      >
        {isOpen ? '✕' : '🐞'}
      </button>
      
      {isOpen && (
        <div className="absolute bottom-12 right-0 bg-white p-4 rounded-lg shadow-lg w-80 border border-gray-200">
          <h3 className="text-lg font-semibold mb-2">Debug Tools</h3>
          
          <div className="space-y-2">
            <button 
              onClick={() => console.log('Current user:', currentUser)}
              className="w-full py-1 px-2 bg-gray-100 hover:bg-gray-200 rounded text-sm"
            >
              Log Current User
            </button>
            
            <button 
              onClick={checkRedirectSession}
              className="w-full py-1 px-2 bg-gray-100 hover:bg-gray-200 rounded text-sm"
            >
              Check Session
            </button>
            
            <button 
              onClick={fetchGoogleUserInfo}
              className="w-full py-1 px-2 bg-gray-100 hover:bg-gray-200 rounded text-sm"
            >
              Fetch Profile Data
            </button>
            
            <button 
              onClick={testProfileImage}
              className={`w-full py-1 px-2 ${isTestingImage ? 'bg-blue-100' : 'bg-gray-100 hover:bg-gray-200'} rounded text-sm`}
              disabled={isTestingImage}
            >
              {isTestingImage ? 'Testing...' : 'Test Profile Image'}
            </button>
            
            <button 
              onClick={applyProxyToImage}
              className="w-full py-1 px-2 bg-gray-100 hover:bg-gray-200 rounded text-sm"
            >
              Apply Image Proxy
            </button>
            
            {testImageResults && (
              <div className="mt-2 p-2 text-xs bg-gray-50 rounded">
                <p className={testImageResults.original ? 'text-green-600' : 'text-red-600'}>
                  Original: {testImageResults.original ? '✓' : '✗'}
                </p>
                {testImageResults.hasOwnProperty('proxy') && (
                  <p className={testImageResults.proxy ? 'text-green-600' : 'text-red-600'}>
                    Proxy: {testImageResults.proxy ? '✓' : '✗'}
                  </p>
                )}
                <p className="mt-1">{testImageResults.message}</p>
                {testImageResults.proxyUrl && (
                  <p className="mt-1 break-all">
                    Proxy URL: {testImageResults.proxyUrl}
                  </p>
                )}
              </div>
            )}
            
            <div className="mt-3 pt-3 border-t border-gray-200">
              <h4 className="text-sm font-medium mb-1">Profile Picture:</h4>
              {currentUser?.profilePicture ? (
                <div className="flex flex-col items-center space-y-2">
                  <img 
                    src={currentUser.profilePicture} 
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = DEFAULT_PROFILE_IMAGE;
                    }}
                  />
                  <div className="text-xs text-gray-500 break-all">
                    {currentUser.profilePicture}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-red-500">No profile picture found</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugPanel; 