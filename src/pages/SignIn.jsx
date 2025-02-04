import React, { useState } from 'react';
<<<<<<< HEAD
import { Link} from 'react-router-dom';

function SignIn({ setCurrentPage }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add sign in logic here
=======
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase/config';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/'); // Redirect to home page after successful sign in
    } catch (error) {
      setError(error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (error) {
      setError(error.message);
    }
>>>>>>> 7a3b527657ce141610d3424c358b0b9516ef5155
  };

  return (
    <div className="max-w-md mx-auto  bg-white shadow-md rounded-lg p-6 mt-24">
      <h2 className="text-2xl font-bold text-center mb-6">Sign In</h2>
<<<<<<< HEAD
=======
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
>>>>>>> 7a3b527657ce141610d3424c358b0b9516ef5155
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
<<<<<<< HEAD
=======
          onClick={handleGoogleSignIn}
>>>>>>> 7a3b527657ce141610d3424c358b0b9516ef5155
          className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition-colors"
        >
          Continue with Google
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