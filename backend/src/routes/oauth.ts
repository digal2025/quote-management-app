import { Router, Request, Response } from 'express';
import passport from 'passport';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();

// Google OAuth routes
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get('/google/callback', 
  passport.authenticate('google', { session: false }),
  async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      
      if (!user) {
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/login?error=oauth_failed`);
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      // Redirect to frontend with token
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${token}`);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/login?error=oauth_failed`);
    }
  }
);

// GitHub OAuth routes
router.get('/github', passport.authenticate('github', {
  scope: ['user:email']
}));

router.get('/github/callback',
  passport.authenticate('github', { session: false }),
  async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      
      if (!user) {
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/login?error=oauth_failed`);
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      // Redirect to frontend with token
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${token}`);
    } catch (error) {
      console.error('GitHub OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/login?error=oauth_failed`);
    }
  }
);

// LinkedIn OAuth routes
router.get('/linkedin', passport.authenticate('linkedin', {
  scope: ['r_emailaddress', 'r_liteprofile']
}));

router.get('/linkedin/callback',
  passport.authenticate('linkedin', { session: false }),
  async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      
      if (!user) {
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/login?error=oauth_failed`);
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      // Redirect to frontend with token
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${token}`);
    } catch (error) {
      console.error('LinkedIn OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/login?error=oauth_failed`);
    }
  }
);

export default router; 