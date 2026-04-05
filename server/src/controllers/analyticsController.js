import AnalyticsEvent from '../models/AnalyticsEvent.js';
import logger from '../utils/logger.js';

/**
 * Batch ingest analytics events (up to 50 per request)
 *
 * @route POST /api/v1/analytics/events
 * @auth Required
 */
export async function batchIngestEvents(req, res, next) {
  try {
    const { events } = req.body;
    const userId = req.userId;

    const docs = events.map((evt) => ({
      userId,
      event: evt.event,
      properties: evt.properties || {},
      sessionId: evt.sessionId || '',
      timestamp: evt.timestamp ? new Date(evt.timestamp) : new Date(),
    }));

    const inserted = await AnalyticsEvent.insertMany(docs);

    res.status(201).json({
      success: true,
      data: { ingested: inserted.length },
    });
  } catch (err) {
    logger.error('batchIngestEvents error:', { error: err.message, userId: req.userId });
    next(err);
  }
}
