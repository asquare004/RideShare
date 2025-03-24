import jwt from 'jsonwebtoken';
import { errorHandler } from './error.js';

// For regular user authentication
export const verifyToken = (req, res, next) => {
  // Get token from cookie or Authorization header
  const token = req.cookies.access_token;
  const authHeader = req.headers.authorization;
  let headerToken = null;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    headerToken = authHeader.substring(7);
  }
  
  // Use cookie token or header token
  const finalToken = token || headerToken;
  
  if (!finalToken) {
    return next(errorHandler(401, 'You are not authenticated'));
  }
  
  try {
    const decoded = jwt.verify(finalToken, process.env.JWT_SECRET);
    req.user = { ...decoded, _id: decoded.id }; // Ensure _id is set for compatibility
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    return next(errorHandler(403, 'Token is not valid'));
  }
};

// For driver authentication
export const verifyDriverToken = (req, res, next) => {
  console.log('verifyDriverToken middleware called');
  console.log('Request cookies:', req.cookies);
  
  // Get token from driver cookie
  const token = req.cookies.driver_access_token;
  
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
    console.log('No driver token found in cookies or headers');
    return next(errorHandler(401, 'You are not authenticated as a driver'));
  }
  
  try {
    const decoded = jwt.verify(finalToken, process.env.JWT_SECRET);
    console.log('Driver token verified successfully. Driver ID:', decoded.id);
    
    if (decoded.role !== 'driver') {
      return next(errorHandler(403, 'Access denied. Driver role required'));
    }
    
    req.user = decoded;
    next();
  } catch (err) {
    console.log('Driver token verification error:', err);
    return next(errorHandler(403, 'Driver token is not valid'));
  }
};

// Optional driver authentication (does not require auth)
export const checkDriverAuth = (req, res, next) => {
  console.log('checkDriverAuth middleware called');
  
  // Get token from driver cookie
  const token = req.cookies.driver_access_token;
  
  // Also check Authorization header as fallback
  const authHeader = req.headers.authorization;
  let headerToken = null;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    headerToken = authHeader.substring(7);
  }
  
  // Use cookie token or header token
  const finalToken = token || headerToken;
  
  if (!finalToken) {
    // Continue without setting req.user
    req.isDriverAuthenticated = false;
    return next();
  }
  
  try {
    const decoded = jwt.verify(finalToken, process.env.JWT_SECRET);
    
    if (decoded.role === 'driver') {
      req.user = decoded;
      req.isDriverAuthenticated = true;
    } else {
      req.isDriverAuthenticated = false;
    }
    
    next();
  } catch (err) {
    // Token invalid but we'll continue
    req.isDriverAuthenticated = false;
    next();
  }
};

// Middleware to check if user is a driver
export const verifyDriver = (req, res, next) => {
  console.log('verifyDriver middleware called');
  console.log('Request cookies:', req.cookies);
  
  // Get token from driver cookie
  const token = req.cookies.driver_access_token;
  
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
    console.log('No driver token found in cookies or headers');
    return next(errorHandler(401, 'You are not authenticated as a driver'));
  }
  
  try {
    const decoded = jwt.verify(finalToken, process.env.JWT_SECRET);
    console.log('Driver token verified successfully. Driver ID:', decoded.id);
    
    if (decoded.role !== 'driver') {
      return next(errorHandler(403, 'Access denied. Driver role required'));
    }
    
    req.driver = decoded;
    req.user = decoded; // Keep this for backward compatibility
    next();
  } catch (err) {
    console.log('Driver token verification error:', err);
    return next(errorHandler(403, 'Driver token is not valid'));
  }
};