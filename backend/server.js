import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import passport from './middleware/passport.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import userRoutes from './routes/userRoutes.js';
import flatRoutes from './routes/flatRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

const app = express();
const PORT = process.env.PORT ;

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

app.get('/health', (req, res) => res.json({ status: 'ok', message: 'Server is running' }));

app.use('/api/auth',          authRoutes);
app.use('/api/admin',         adminRoutes);
app.use('/api/user',          userRoutes);
app.use('/api/flats',         flatRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/payments',      paymentRoutes);
app.use('/api/reports',       reportRoutes);
 

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
