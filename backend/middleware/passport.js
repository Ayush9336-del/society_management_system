import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import pool from '../db.js';

passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      const name = profile.displayName;

      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1 AND is_deleted = false',
        [email]
      );

      if (result.rows.length === 0) {
        return done(null, false, { message: 'Access denied. You are not registered in this society.' });
      }

      const user = result.rows[0];

      if (!user.name || user.name !== name) {
        await pool.query('UPDATE users SET name = $1 WHERE id = $2', [name, user.id]);
        user.name = name;
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, result.rows[0] || null);
  } catch (err) {
    done(err);
  }
});

export default passport;
