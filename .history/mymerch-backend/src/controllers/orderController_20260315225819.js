import { pool } from '../../config/db.js';

// GET /api/orders/my  — logged-in user's orders
export const getUserOrders = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.id, o.quantity, o.purchased_at AS "purchasedAt", o.product_id AS "productId",
              p.name, p.price, p.image, p.category, p.description,
              json_build_object(
                'id', p.id, 'name', p.name, 'price', p.price,
                'image', p.image, 'category', p.category, 'description', p.description
              ) AS product
       FROM orders o
       JOIN products p ON o.product_id = p.id
       WHERE o.user_id = $1
       ORDER BY o.purchased_at DESC`,
      [req.user.id]
    );
    return res.json(result.rows);
  } catch (err) {
    console.error('Get orders error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/orders/all  — admin only
export const getAllOrders = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.id, o.quantity, o.purchased_at AS "purchasedAt",
              u.username, u.email,
              p.name AS product_name, p.price, p.category
       FROM orders o
       JOIN users    u ON o.user_id    = u.id
       JOIN products p ON o.product_id = p.id
       ORDER BY o.purchased_at DESC`
    );
    return res.json(result.rows);
  } catch (err) {
    console.error('Get all orders error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/orders  — create order and decrement stock
export const createOrder = async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  if (!productId)
    return res.status(400).json({ message: 'productId is required' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const productRes = await client.query(
      'SELECT * FROM products WHERE id = $1 FOR UPDATE',
      [productId]
    );
    const product = productRes.rows[0];

    if (!product)
      return res.status(404).json({ message: 'Product not found' });

    if (product.stock < quantity)
      return res.status(400).json({ message: 'Insufficient stock' });

    if (product.status !== 'available')
      return res.status(400).json({ message: 'Product is not available' });

    await client.query(
      'UPDATE products SET stock = stock - $1 WHERE id = $2',
      [quantity, productId]
    );

    const orderRes = await client.query(
      `INSERT INTO orders (user_id, product_id, quantity)
       VALUES ($1, $2, $3) RETURNING *`,
      [req.user.id, productId, quantity]
    );

    await client.query('COMMIT');

    const order = orderRes.rows[0];
    return res.status(201).json({
      id:           order.id,
      productId:    order.product_id,
      quantity:     order.quantity,
      purchasedAt:  order.purchased_at,
      product: {
        id:          product.id,
        name:        product.name,
        price:       product.price,
        image:       product.image,
        category:    product.category,
        description: product.description,
      },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Create order error:', err);
    return res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
};

// DELETE /api/orders/:id  — cancel order, restore stock
export const deleteOrder = async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const orderRes = await client.query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );
    const order = orderRes.rows[0];

    if (!order)
      return res.status(404).json({ message: 'Order not found' });

    await client.query(
      'UPDATE products SET stock = stock + $1 WHERE id = $2',
      [order.quantity, order.product_id]
    );

    await client.query('DELETE FROM orders WHERE id = $1', [id]);
    await client.query('COMMIT');

    return res.json({ message: 'Order cancelled and stock restored' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Delete order error:', err);
    return res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
};
