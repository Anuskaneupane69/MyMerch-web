import { pool } from '../../config/db.js';
import fs from 'fs';

// GET /api/products/getall
export const getAllProducts = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM products ORDER BY created_at DESC'
    );
    return res.json(result.rows);
  } catch (err) {
    console.error('Get products error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/products/add  (admin only)
export const addProduct = async (req, res) => {
  const { name, description, price, stock, category, featured, status } = req.body;
  const image = req.file ? `src/uploads/${req.file.filename}` : null;

  if (!name || price == null)
    return res.status(400).json({ message: 'Name and price are required' });

  try {
    const result = await pool.query(
      `INSERT INTO products (name, description, price, stock, category, featured, status, image)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        name,
        description || '',
        parseFloat(price),
        parseInt(stock) || 0,
        category || 'T-Shirts',
        featured === 'true' || featured === true,
        status || 'available',
        image,
      ]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Add product error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/products/update/:id  (admin only)
export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, stock, category, featured, status } = req.body;

  try {
    const existing = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (existing.rows.length === 0)
      return res.status(404).json({ message: 'Product not found' });

    // If a new image was uploaded, delete the old one
    let image = existing.rows[0].image;
    if (req.file) {
      if (image && fs.existsSync(image)) fs.unlinkSync(image);
      image = `src/uploads/${req.file.filename}`;
    }

    const result = await pool.query(
      `UPDATE products
       SET name=$1, description=$2, price=$3, stock=$4, category=$5, featured=$6, status=$7, image=$8
       WHERE id=$9 RETURNING *`,
      [
        name        ?? existing.rows[0].name,
        description ?? existing.rows[0].description,
        price != null ? parseFloat(price) : existing.rows[0].price,
        stock != null ? parseInt(stock)   : existing.rows[0].stock,
        category    ?? existing.rows[0].category,
        featured === 'true' || featured === true,
        status      ?? existing.rows[0].status,
        image,
        id,
      ]
    );
    return res.json(result.rows[0]);
  } catch (err) {
    console.error('Update product error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/products/delete/:id  (admin only)
export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const existing = await pool.query('SELECT image FROM products WHERE id = $1', [id]);
    if (existing.rows.length === 0)
      return res.status(404).json({ message: 'Product not found' });

    const image = existing.rows[0].image;
    if (image && fs.existsSync(image)) fs.unlinkSync(image);

    await pool.query('DELETE FROM products WHERE id = $1', [id]);
    return res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('Delete product error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
