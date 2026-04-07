/**
 * healthController.js
 * GROW-025 — Health check and status API endpoint
 */
import mongoose from 'mongoose';
import { createRequire } from 'module';
import { getRequestCount } from '../utils/requestCounter.js';

const require = createRequire(import.meta.url);
const packageJson = require('../../../package.json');

/**
 * GET /health
 * Public — no auth required.
 * Returns: { status, uptime, version, database, timestamp }
 */
export async function getHealth(_req, res) {
  const start = Date.now();

  let database = 'disconnected';
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.db.admin().ping();
      database = 'connected';
    }
  } catch {
    database = 'disconnected';
  }

  res.json({
    status: database === 'connected' ? 'ok' : 'degraded',
    uptime: process.uptime(),
    version: packageJson.version,
    database,
    timestamp: new Date().toISOString(),
    responseMs: Date.now() - start,
  });
}

/**
 * GET /health/detailed
 * Auth required — returns extra diagnostics.
 * Returns: { ...healthFields, memory, requestCount }
 */
export async function getDetailedHealth(_req, res) {
  const start = Date.now();

  let database = 'disconnected';
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.db.admin().ping();
      database = 'connected';
    }
  } catch {
    database = 'disconnected';
  }

  const mem = process.memoryUsage();

  res.json({
    status: database === 'connected' ? 'ok' : 'degraded',
    uptime: process.uptime(),
    version: packageJson.version,
    database,
    timestamp: new Date().toISOString(),
    responseMs: Date.now() - start,
    memory: {
      heapUsedMB: Math.round(mem.heapUsed / 1024 / 1024),
      heapTotalMB: Math.round(mem.heapTotal / 1024 / 1024),
      rssMB: Math.round(mem.rss / 1024 / 1024),
    },
    requestCount: getRequestCount(),
  });
}
