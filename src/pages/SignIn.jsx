import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase/config';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isDriver, setIsDriver] = useState(false);
  const navigate = useNavigate();
  const db = getFirestore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Check user role
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if ((userData.role === 'driver' && !isDriver) || (userData.role === 'passenger' && isDriver)) {
          setError('Please select the correct role for your account');
          return;
        }
      }
      navigate('/');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    try {
      const result = await signInWithPopup(auth, provider);
      // Check if user exists and create/update role if needed
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', result.user.uid), {
          email: result.user.email,
          role: isDriver ? 'driver' : 'passenger',
          createdAt: new Date().toISOString()
        });
      } else {
        const userData = userDoc.data();
        if ((userData.role === 'driver' && !isDriver) || (userData.role === 'passenger' && isDriver)) {
          setError('Please select the correct role for your account');
          return;
        }
      }
      
      if (result.user) {
        navigate('/');
      }
    } catch (error) {
      if (error.code !== 'auth/popup-closed-by-user') {
        setError(error.message);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-md rounded-lg p-6 mt-24">
      <h2 className="text-2xl font-bold text-center mb-6">Sign In</h2>
      
      {/* Role Selection Buttons */}
      <div className="mb-6">
        <p className="text-gray-700 text-center mb-3">Sign in as:</p>
        <div className="flex gap-4 justify-center">
          <button
            type="button"
            onClick={() => setIsDriver(false)}
            className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all duration-200 ${
              !isDriver
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-gray-300 text-gray-600 hover:border-blue-400'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-medium">Passenger</span>
            </div>
          </button>
          
          <button
            type="button"
            onClick={() => setIsDriver(true)}
            className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all duration-200 ${
              isDriver
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-gray-300 text-gray-600 hover:border-blue-400'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <span className="font-medium">Driver</span>
            </div>
          </button>
        </div>
      </div>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-gray-700 mb-2">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-gray-700 mb-2">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Sign In
        </button>
        
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full bg-white text-gray-700 py-2 px-4 rounded-md border border-gray-300 flex items-center justify-center gap-3 transition-colors duration-200 hover:bg-red-600 hover:text-white hover:border-red-600"
        >
          <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          <span className="font-medium">Continue with Google</span>
        </button>
      </form>
      
      <div className="mt-4 text-center">
        <p className="text-gray-600">Don't have an account?</p>
        <Link
        to='/sign-up'
      >
         <button
          className="text-blue-600 hover:text-blue-800"
        >
          Sign Up
        </button>
          </Link>
      </div>
    </div>
  );
}

export default SignIn; 