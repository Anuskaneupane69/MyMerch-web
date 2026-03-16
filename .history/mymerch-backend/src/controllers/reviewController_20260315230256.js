import { pool } from '../config/db.js';

// GET /api/reviews/:productId
export const getReviewsByProduct = async (req, res) => {
  const { productId } = req.params;
  try {
    const result = await pool.query(
      `SELECT r.id, r.rating, r.comment, r.created_at AS "createdAt",
              r.user_id AS "userId", u.username AS author
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = $1
       ORDER BY r.created_at DESC`,
      [productId]
    );
    return res.json(result.rows);
  } catch (err) {
    console.error('Get reviews error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/reviews/:productId  — only verified buyers
export const addReview = async (req, res) => {
  const { productId } = req.params;
  const { rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5)
    return res.status(400).json({ message: 'Rating must be between 1 and 5' });

  try {
    // Verify purchase
    const purchased = await pool.query(
      'SELECT id FROM orders WHERE user_id = $1 AND product_id = $2 LIMIT 1',
      [req.user.id, productId]
    );
    if (purchased.rows.length === 0)
      return res.status(403).json({ message: 'You can only review products you have purchased' });

    const result = await pool.query(
      `INSERT INTO reviews (user_id, product_id, rating, comment)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.user.id, productId, rating, comment || '']
    );

    const review = result.rows[0];
    return res.status(201).json({
      id:        review.id,
      rating:    review.rating,
      comment:   review.comment,
      createdAt: review.created_at,
      userId:    review.user_id,
      author:    req.user.username,
    });
  } catch (err) {
    if (err.code === '23505')
      return res.status(409).json({ message: 'You have already reviewed this product' });
    console.error('Add review error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/reviews/:id
export const deleteReview = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM reviews WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: 'Review not found' });

    return res.json({ message: 'Review deleted' });
  } catch (err) {
    console.error('Delete review error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
