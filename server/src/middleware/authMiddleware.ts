import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Generate JWT Token
function generateToken(userId: number) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'defaultSecret', {
    expiresIn: '30d'
  });
}

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        username: string;
        email: string;
        name?: string | null;
        profilePictureUrl?: string | null;
      };
    }
  }
}

// Middleware to protect routes
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
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
          name: true,
          profilePictureUrl: true
        }
      });

      if (!user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // Attach user to request object
      req.user = {
        userId: user.userId,
        username: user.username,
        email: user.email,
        name: user.name,
        profilePictureUrl: user.profilePictureUrl
      };

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, invalid token' });
    }
  }

  // If no token
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Register User
export const registerUser = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  try {
    // Check if user already exists
    const userExists = await prisma.user.findFirst({
      where: { 
        OR: [
          { email: email },
          { username: username }
        ]
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
    console.error('Registration error:', error);
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
      profilePictureUrl: user.profilePictureUrl || undefined,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
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
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error retrieving user' });
  }
};

// Update Profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { username, email } = req.body;
    const userId = req.user.userId;

    // Validate input
    if (!username && !email) {
      return res.status(400).json({ message: 'No update data provided' });
    }

    // Check if username is already taken (if provided)
    if (username) {
      const existingUser = await prisma.user.findUnique({
        where: { username }
      });

      if (existingUser && existingUser.userId !== userId) {
        return res.status(400).json({ message: 'Username already taken' });
      }
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { userId },
      data: {
        ...(username && { username }),
        // Uncomment and modify email update logic as needed
        // ...(email && { email })
      },
      select: {
        userId: true,
        username: true,
        email: true
      }
    });

    // Generate new token
    const token = generateToken(userId);

    res.json({
      ...updatedUser,
      token
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

// Change Password
export const changePassword = async (req: Request, res: Response) => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new passwords are required' });
    }

    // Find user in database to verify current password
    const user = await prisma.user.findUnique({
      where: { userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters long' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Update password in database
    const updatedUser = await prisma.user.update({
      where: { userId },
      data: { password: hashedNewPassword },
      select: {
        userId: true,
        username: true,
        email: true
      }
    });

    // Generate new token
    const token = generateToken(userId);

    res.json({ 
      message: 'Password changed successfully',
      token,
      user: updatedUser
    });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: 'Server error changing password' });
  }
};