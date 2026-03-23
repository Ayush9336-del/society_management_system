import jwt from 'jsonwebtoken';
import passport from '../middleware/passport.js';

export const googleAuth = (req, res, next) => {
  const state = req.query.from === 'admin' ? 'admin' : 'user';
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
    state,
  })(req, res, next);
};

export const googleCallback = [
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL }/login?error=not_registered`,
  }),
  (req, res) => {
    const user = req.user;
    const fromAdmin = req.query.state === 'admin';
    const frontendURL = process.env.FRONTEND_URL ;

    if (fromAdmin && user.role !== 'admin') {
      return res.redirect(`${frontendURL}/admin/login?error=not_admin`);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userPayload = encodeURIComponent(JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      flat_id: user.flat_id,
    }));

    res.redirect(`${frontendURL}/auth/callback?token=${token}&user=${userPayload}`);
  },
];
