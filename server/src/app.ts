// =============================================================================
// Express Application Configuration
// Central middleware stack and route registration.
// This file exports the configured Express app — it does NOT start the server.
// =============================================================================

import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { corsOptions } from './config/cors';
import { apiLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';

// Route imports
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/user/user.routes';
import categoryRoutes from './modules/category/category.routes';
import providerRoutes from './modules/provider/provider.routes';
import serviceRoutes from './modules/service/service.routes';
import bookingRoutes from './modules/booking/booking.routes';
import reviewRoutes from './modules/review/review.routes';
import favoriteRoutes from './modules/favorite/favorite.routes';
import notificationRoutes from './modules/notification/notification.routes';
import adminRoutes from './modules/admin/admin.routes';

const app = express();

// =============================================================================
// Global Middleware
// =============================================================================

// Security headers
app.use(helmet());

// CORS
app.use(cors(corsOptions));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser (for refresh token cookie)
app.use(cookieParser());

// Rate limiting for all API routes
app.use('/api/', apiLimiter);

// =============================================================================
// API Routes — v1
// =============================================================================

const API_PREFIX = '/api/v1';

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/categories`, categoryRoutes);
app.use(`${API_PREFIX}/providers`, providerRoutes);
app.use(`${API_PREFIX}/services`, serviceRoutes);
app.use(`${API_PREFIX}/bookings`, bookingRoutes);
app.use(`${API_PREFIX}/reviews`, reviewRoutes);
app.use(`${API_PREFIX}/favorites`, favoriteRoutes);
app.use(`${API_PREFIX}/notifications`, notificationRoutes);
app.use(`${API_PREFIX}/admin`, adminRoutes);

// =============================================================================
// Health Check
// =============================================================================

app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'LocalLink API is running',
    timestamp: new Date().toISOString(),
  });
});

// =============================================================================
// Production Static Serving — Serves Frontend React App
// =============================================================================

if (env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientBuildPath));
  app.get('*', (req, res, next) => {
    // Pass API requests to the API router/404 handlers
    if (req.path.startsWith('/api/')) {
      return next();
    }
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// =============================================================================
// 404 Handler — Must be after all routes
// =============================================================================

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// =============================================================================
// Global Error Handler — Must be last
// =============================================================================

app.use(errorHandler);

export default app;
