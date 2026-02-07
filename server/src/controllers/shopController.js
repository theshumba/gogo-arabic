import User from '../models/User.js';

export async function buyItem(req, res) {
  try {
    const { itemId, price } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.dirhams < price) {
      return res.status(400).json({ message: 'Not enough dirhams' });
    }

    if (user.inventory.includes(itemId)) {
      return res.status(400).json({ message: 'Item already owned' });
    }

    user.dirhams -= price;
    user.inventory.push(itemId);
    await user.save();

    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to buy item' });
  }
}
