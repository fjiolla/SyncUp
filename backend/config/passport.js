import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/User.js';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { env } from './env.js';
dotenv.config();

// Helper to find or create user upon OAuth verify
const findOrCreateOAuthUser = async (profile, done) => {
  try {
    let email = '';
    
    if (profile.emails && profile.emails.length > 0) {
      email = profile.emails[0].value;
    } else {
      // GitHub might not return public email without explicit fetch, fallback to username
      email = `${profile.username}@github.mock`; 
    }

    let user = await User.findOne({ email });

    if (user) {
      if (!user.isVerified) {
        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();
      }
      return done(null, user);
    }

    // Create a new verified user for SSO
    user = await User.create({
      name: profile.displayName || profile.username || 'User',
      email: email,
      password: crypto.randomBytes(20).toString('hex'), // Impossible random string
      age: 18,
      isVerified: true,
      profilePicture: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : '',
    });
    
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
};

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'dummy',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy',
      callbackURL: env.googleCallbackUrl,
    },
    (accessToken, refreshToken, profile, done) => findOrCreateOAuthUser(profile, done)
  )
);

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID || 'dummy',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || 'dummy',
      callbackURL: env.githubCallbackUrl,
      scope: ['user:email'],
    },
    (accessToken, refreshToken, profile, done) => findOrCreateOAuthUser(profile, done)
  )
);

export default passport;
