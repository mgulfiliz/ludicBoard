import express from 'express';
import { 
  registerUser, 
  loginUser, 
  protect,
  getCurrentUser,
  updateProfile,
  changePassword
} from '../middleware/authMiddleware';

const router = express.Router();

// Register new user
router.post('/register', registerUser);

// Login user
router.post('/login', loginUser);

// Logout Route
router.get('/logout', (req, res) => {
  try {
    // Clear any server-side session if needed
    // req.logout is typically used with passport.js
    // If you're using JWT, you might just want to clear the token on the client side
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Logout failed' });
  }
});

// Get current user (protected route)
router.get('/me', protect, getCurrentUser);

// Update profile route (protected)
router.patch('/update-profile', protect, updateProfile);

// Change password route (protected)
router.patch('/change-password', protect, changePassword);

export default router;
