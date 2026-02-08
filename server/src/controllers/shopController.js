import User from '../models/User.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const ITEMS_CATALOG = require('../../../src/data/items.json');

// Build a lookup map for O(1) price verification
const itemsById = Object.fromEntries(ITEMS_CATALOG.map((item) => [item.id, item]));

export async function buyItem(req, res) {
  try {
    const { itemId } = req.body;

    // Look up the item in the server-side catalog — never trust client-sent price
    const catalogItem = itemsById[itemId];
    if (!catalogItem) {
      return res.status(400).json({ message: 'Unknown item' });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.inventory.includes(itemId)) {
      return res.status(400).json({ message: 'Item already owned' });
    }

    if (user.level < catalogItem.unlockLevel) {
      return res.status(400).json({ message: `Requires level ${catalogItem.unlockLevel}` });
    }

    if (user.dirhams < catalogItem.price) {
      return res.status(400).json({ message: 'Not enough dirhams' });
    }

    user.dirhams -= catalogItem.price;
    user.inventory.push(itemId);
    await user.save();

    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to buy item' });
  }
}
