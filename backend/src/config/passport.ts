const passport = require('passport');
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/auth/oauth/google/callback`
  }, async (accessToken: string, refreshToken: string, profile: any, done: any) => {
    try {
      // Check if user exists
      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: profile.emails?.[0]?.value },
            { oauthId: profile.id, oauthProvider: 'GOOGLE' }
          ]
        }
      });

      if (!user) {
        // Create new user
        user = await prisma.user.create({
          data: {
            email: profile.emails?.[0]?.value || '',
            name: profile.displayName || '',
            oauthId: profile.id,
            oauthProvider: 'GOOGLE',
            status: 'ACTIVE',
            preferences: {}
          }
        });
      } else {
        // Update existing user with OAuth info if needed
        if (!user.oauthId) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              oauthId: profile.id,
              oauthProvider: 'GOOGLE'
            }
          });
        }
      }

      return done(null, user);
    } catch (error) {
      return done(error as Error);
    }
  }));
}

// GitHub OAuth Strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    callbackURL: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/auth/oauth/github/callback`
  }, async (accessToken: string, refreshToken: string, profile: any, done: any) => {
    try {
      // Check if user exists
      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: profile.emails?.[0]?.value },
            { oauthId: profile.id, oauthProvider: 'GITHUB' }
          ]
        }
      });

      if (!user) {
        // Create new user
        user = await prisma.user.create({
          data: {
            email: profile.emails?.[0]?.value || '',
            name: profile.displayName || profile.username || '',
            oauthId: profile.id,
            oauthProvider: 'GITHUB',
            status: 'ACTIVE',
            preferences: {}
          }
        });
      } else {
        // Update existing user with OAuth info if needed
        if (!user.oauthId) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              oauthId: profile.id,
              oauthProvider: 'GITHUB'
            }
          });
        }
      }

      return done(null, user);
    } catch (error) {
      return done(error as Error);
    }
  }));
}

// LinkedIn OAuth Strategy
if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
  passport.use(new LinkedInStrategy({
    clientID: process.env.LINKEDIN_CLIENT_ID!,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
    callbackURL: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/auth/oauth/linkedin/callback`,
    scope: ['r_emailaddress', 'r_liteprofile']
  }, async (accessToken: string, refreshToken: string, profile: any, done: any) => {
    try {
      // Check if user exists
      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: profile.emails?.[0]?.value },
            { oauthId: profile.id, oauthProvider: 'LINKEDIN' }
          ]
        }
      });

      if (!user) {
        // Create new user
        user = await prisma.user.create({
          data: {
            email: profile.emails?.[0]?.value || '',
            name: profile.displayName || '',
            oauthId: profile.id,
            oauthProvider: 'LINKEDIN',
            status: 'ACTIVE',
            preferences: {}
          }
        });
      } else {
        // Update existing user with OAuth info if needed
        if (!user.oauthId) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              oauthId: profile.id,
              oauthProvider: 'LINKEDIN'
            }
          });
        }
      }

      return done(null, user);
    } catch (error) {
      return done(error as Error);
    }
  }));
}

// Serialize user for the session
passport.serializeUser((user: any, done: any) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id: string, done: any) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error);
  }
});

module.exports = passport; 