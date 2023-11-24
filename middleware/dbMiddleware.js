import config from "../config.js";

const dbMiddleware = async (req, res, next) => {
  const db = config.db;
  try {
    const connection = await db.getConnection();
    console.log('Database connection established.');
    connection.release();
    next();
  } catch (err) {
    console.error('Database connection is not established.');
    res.status(500).json({ error: 'Database connection failed' });
  }
};

export default dbMiddleware;
