import { pool } from '../config/db.js';

// GET /api/wishlist
export const getWishlist = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT w.id, w.product_id AS "productId",
              json_build_object(
                'id', p.id, 'name', p.name, 'price', p.price,
                'image', p.image, 'category', p.category,
                'description', p.description, 'stock', p.stock
              ) AS product
       FROM wishlist w
       JOIN products p ON w.product_id = p.id
       WHERE w.user_id = $1
       ORDER BY w.id DESC`,
      [req.user.id]
    );
    return res.json(result.rows);
  } catch (err) {
    console.error('Get wishlist error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/wishlist/:productId  — toggle add/remove
export const toggleWishlist = async (req, res) => {
  const { productId } = req.params;
  try {
    const existing = await pool.query(
      'SELECT id FROM wishlist WHERE user_id = $1 AND product_id = $2',
      [req.user.id, productId]
    );

    if (existing.rows.length > 0) {
      await pool.query('DELETE FROM wishlist WHERE user_id = $1 AND product_id = $2', [req.user.id, productId]);
      return res.json({ message: 'Removed from wishlist', action: 'removed' });
    } else {
      await pool.query(
        'INSERT INTO wishlist (user_id, product_id) VALUES ($1, $2)',
        [req.user.id, productId]
      );
      return res.status(201).json({ message: 'Added to wishlist', action: 'added' });
    }
  } catch (err) {
    console.error('Toggle wishlist error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/wishlist/clear
export const clearWishlist = async (req, res) => {
  try {
    await pool.query('DELETE FROM wishlist WHERE user_id = $1', [req.user.id]);
    return res.json({ message: 'Wishlist cleared' });
  } catch (err) {
    console.error('Clear wishlist error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
