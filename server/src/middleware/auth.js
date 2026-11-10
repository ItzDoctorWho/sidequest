import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import User from '../models/User.js';

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      name: user.name,
      email: user.email
    },
    config.jwtSecret,
    { expiresIn: '7d' }
  );
};

/**
 * For public routes that behave better when the user is known (e.g. suggestions
 * skip activities the user already handled). A missing or invalid token just
 * means "anonymous"; it never rejects the request.
 */
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(authHeader.split(' ')[1], config.jwtSecret);
    } catch {
      // Treated as anonymous.
    }
  }
  next();
};

export const protect = async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      message: 'Access denied: Please log in to continue.'
    });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Attach user information to request
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Access denied: Invalid or expired token.'
    });
  }
};

