import jwt from 'jsonwebtoken';
import { errorHandler } from './error.js';

export const verifyToken = (req, res, next) => {
  console.log('verifyToken middleware called');
  console.log('Request cookies:', req.cookies);
  
  // Get token from cookie only
  const token = req.cookies.access_token;
  
  // Also check Authorization header as fallback
  const authHeader = req.headers.authorization;
  let headerToken = null;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    headerToken = authHeader.substring(7);
    console.log('Found token in Authorization header');
  }
  
  // Use cookie token or header token
  const finalToken = token || headerToken;
  
  if (!finalToken) {
    console.log('No token found in cookies or headers');
    // Don't return error - just don't set req.user
    // The controller might have other ways to authenticate
    return next();
  }
  
  try {
    const decoded = jwt.verify(finalToken, process.env.JWT_SECRET);
    console.log('Token verified successfully. User ID:', decoded.id);
    req.user = decoded;
    next();
  } catch (err) {
    console.log('Token verification error:', err);
    // Don't return error - just don't set req.user
    // The controller might have other ways to authenticate
    next();
  }
};