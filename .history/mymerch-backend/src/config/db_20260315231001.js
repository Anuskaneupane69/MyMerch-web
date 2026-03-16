import pg from 'pg';



const { Pool } = pg;

export const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

export const initDB = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id         SERIAL PRIMARY KEY,
      username   VARCHAR(100) NOT NULL,
      email      VARCHAR(255) UNIQUE NOT NULL,
      password   VARCHAR(255) NOT NULL,
      role       VARCHAR(20) NOT NULL DEFAULT 'user',
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS products (
      id          SERIAL PRIMARY KEY,
      name        VARCHAR(255) NOT NULL,
      description TEXT,
      price       NUMERIC(10,2) NOT NULL,
      stock       INTEGER NOT NULL DEFAULT 0,
      category    VARCHAR(100),
      featured    BOOLEAN DEFAULT false,
      status      VARCHAR(50) DEFAULT 'available',
      image       VARCHAR(500),
      created_at  TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS orders (
      id           SERIAL PRIMARY KEY,
      user_id      INTEGER REFERENCES users(id) ON DELETE CASCADE,
      product_id   INTEGER REFERENCES products(id) ON DELETE CASCADE,
      quantity     INTEGER NOT NULL DEFAULT 1,
      purchased_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id         SERIAL PRIMARY KEY,
      user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      rating     INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comment    TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, product_id)
    );

    CREATE TABLE IF NOT EXISTS wishlist (
      id         SERIAL PRIMARY KEY,
      user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      UNIQUE(user_id, product_id)
    );
  `);

  console.log('✅  Database tables ready');
};
