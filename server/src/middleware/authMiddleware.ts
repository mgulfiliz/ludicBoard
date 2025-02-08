import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient, Prisma, User } from '@prisma/client';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

const prisma = new PrismaClient();

// Generate JWT Token
function generateToken(userId: number) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'defaultSecret', {
    expiresIn: '30d'
  });
}

// Middleware to protect routes
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  // Check if token exists in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(
        token, 
        process.env.JWT_SECRET || 'defaultSecret'
      ) as { id: number };

      // Get user from the token
      const user = await prisma.user.findUnique({
        where: { userId: decoded.id },
        select: {
          userId: true,
          username: true,
          email: true,
          profilePictureUrl: true
        }
      });

      if (!user) {
        return res.status(401).json({ message: 'Not authorized' });
      }

      // Attach user to request object
      req.user = user;
      next();
    } catch (error) {
      // Silently handle token verification errors
      res.status(401).json({ message: 'Not authorized' });
    }
  }

  // If no token
  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Register User
export const registerUser = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  try {
    // Check if user already exists
    const userExists = await prisma.user.findUnique({
      where: { 
        email: email,
        // OR username: username 
      }
    });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword
      },
      select: {
        userId: true,
        username: true,
        email: true
      }
    });

    // Generate token
    const token = generateToken(user.userId);

    res.status(201).json({
      ...user,
      token
    });
  } catch (error) {
    // Minimal error logging
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Login User
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // Check for user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user.userId);

    res.json({
      userId: user.userId,
      username: user.username,
      email: user.email,
      token
    });
  } catch (error) {
    // Minimal error logging
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Get Current User
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    // req.user is set by the protect middleware
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(req.user);
  } catch (error) {
    // Minimal error logging
    res.status(500).json({ message: 'Server error retrieving user' });
  }
};
