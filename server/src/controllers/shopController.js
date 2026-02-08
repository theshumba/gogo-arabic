import User from '../models/User.js';
import { createRequire } from 'module';
import { AppError } from '../utils/AppError.js';
import logger from '../utils/logger.js';

const require = createRequire(import.meta.url);
const ITEMS_CATALOG = require('../../../src/data/items.json');

// Build a lookup map for O(1) price verification
const itemsById = Object.fromEntries(ITEMS_CATALOG.map((item) => [item.id, item]));

/**
 * Purchase an item from the shop
 *
 * @route POST /api/v1/shop/buy
 * @body {Object} { itemId: string }
 * @auth Required - JWT token
 * @returns {Object} { success: true, data: User }
 * @description Validates price server-side, checks requirements, deducts dirhams, adds to inventory
 */
export async function buyItem(req, res, next) {
  try {
    const { itemId } = req.body;

    // Look up the item in the server-side catalog — never trust client-sent price
    const catalogItem = itemsById[itemId];
    if (!catalogItem) {
      return next(AppError.badRequest('Unknown item'));
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return next(AppError.notFound('User not found'));
    }

    // Check if already owned
    if (user.inventory.some(item => item.itemId === itemId)) {
      return next(AppError.badRequest('Item already owned'));
    }

    // Check level requirement
    if (user.level < catalogItem.unlockLevel) {
      return next(AppError.badRequest(`Requires level ${catalogItem.unlockLevel}`));
    }

    // Check if user has enough dirhams
    if (user.dirhams < catalogItem.price) {
      return next(AppError.badRequest('Not enough dirhams'));
    }

    // Process purchase
    user.dirhams -= catalogItem.price;
    user.inventory.push({ itemId, equipped: false });
    await user.save();

    logger.info('Item purchased', {
      userId: req.userId,
      itemId,
      price: catalogItem.price,
    });

    res.json({
      success: true,
      data: user,
    });
  } catch (err) {
    logger.error('buyItem error:', { error: err.message, userId: req.userId });
    next(err);
  }
}
