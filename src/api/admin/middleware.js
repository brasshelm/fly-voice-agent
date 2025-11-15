/**
 * Admin API middleware
 * Protects admin endpoints with API key authentication
 */

import { logger } from '../../utils/logger.js';

const adminLogger = logger.child('ADMIN_AUTH');

/**
 * Middleware to verify admin API key
 */
export function requireAdminApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  const expectedKey = process.env.ADMIN_API_KEY;

  if (!expectedKey) {
    adminLogger.warn('ADMIN_API_KEY not configured');
    return res.status(503).json({
      error: 'Admin API not configured',
    });
  }

  if (!apiKey || apiKey !== expectedKey) {
    adminLogger.warn('Unauthorized admin API access attempt', {
      ip: req.ip,
      path: req.path,
    });
    return res.status(401).json({
      error: 'Unauthorized - Invalid API key',
    });
  }

  // API key valid
  next();
}
