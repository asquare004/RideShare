import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useDispatch } from 'react-redux';
import { auth } from '../firebase/config';
import { signInStart, signInSuccess, signInFailure } from '../redux/user/userSlice';
import { useNavigate } from 'react-router-dom';
import { getProxiedImageUrl } from '../utils/imageUtils';

export default function OAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isDebugMode = process.env.NODE_ENV === 'development';
  
  const handleGoogleClick = async () => {
    try {
      dispatch(signInStart());
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Debug log in development mode
      if (isDebugMode) {
        console.log('Google sign-in result:', {
          displayName: result.user.displayName,
          email: result.user.email,
          photoURL: result.user.photoURL
        });
      }
      
      // Send data to backend
      const res = await fetch('/api/driver/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: result.user.displayName,
          email: result.user.email,
          googlePhotoUrl: result.user.photoURL,
        }),
      });
      
      const data = await res.json();
      
      // Debug log in development mode
      if (isDebugMode) {
        console.log('Backend response:', data);
      }
      
      if (res.ok) {
        // Make sure profile picture from Google is included in user data
        if (result.user.photoURL && (!data.profilePicture || data.profilePicture === 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png')) {
          // Use a proxy for Google images to avoid CORS issues
          const photoUrl = getProxiedImageUrl(result.user.photoURL);
          
          if (isDebugMode) {
            console.log('Using profile picture:', photoUrl);
          }
          
          data.profilePicture = photoUrl;
        }
        
        dispatch(signInSuccess(data));
        navigate('/');
      } else {
        dispatch(signInFailure(data.message || 'Failed to authenticate with Google'));
        if (data.message && data.message.includes('No driver account exists')) {
          // Show alert and redirect to signup
          alert('No driver account exists with this email. Please sign up with full driver details.');
          navigate('/sign-up');
        }
      }
    } catch (error) {
      console.error('Could not sign in with Google', error);
      dispatch(signInFailure('Could not sign in with Google. Please try regular sign up.'));
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleClick}
      className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
      Continue with Google
    </button>
  );
} 