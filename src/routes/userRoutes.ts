import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { UserService } from '../services/userService';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

/**
 * POST /api/users/register
 * Register a new user
 */
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('phone').optional().trim(),
    body('role').optional().isIn(['user', 'host']).withMessage('Role must be either user or host'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: errors.array().map(e => e.msg || e.type || String(e)).join(', '),
          errors: errors.array() 
        });
      }

      const { email, password, firstName, lastName, phone, role } = req.body;

      const result = await UserService.register({
        email,
        password,
        firstName,
        lastName,
        phone,
        role: role || 'user',
      });

      res.status(201).json({
        message: 'User registered successfully',
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Registration failed' });
    }
  }
);

/**
 * POST /api/users/login
 * Login user
 */
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: errors.array().map(e => e.msg || e.type || String(e)).join(', '),
          errors: errors.array() 
        });
      }

      const { email, password } = req.body;

      const result = await UserService.login({ email, password });

      res.json({
        message: 'Login successful',
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
    } catch (error: any) {
      res.status(401).json({ error: error.message || 'Login failed' });
    }
  }
);

/**
 * GET /api/users/profile
 * Get user profile (protected)
 */
router.get('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await UserService.getProfile(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch profile' });
  }
});

/**
 * PUT /api/users/profile
 * Update user profile (protected)
 */
router.put(
  '/profile',
  authenticate,
  [
    body('firstName').optional().trim().notEmpty(),
    body('lastName').optional().trim().notEmpty(),
    body('phone').optional().trim(),
    body('avatarUrl').optional().isURL(),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: errors.array().map(e => e.msg || e.type || String(e)).join(', '),
          errors: errors.array() 
        });
      }

      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { firstName, lastName, phone, avatarUrl } = req.body;

      const user = await UserService.updateProfile(req.user.userId, {
        firstName,
        lastName,
        phone,
        avatarUrl,
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        message: 'Profile updated successfully',
        user,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to update profile' });
    }
  }
);

export default router;



