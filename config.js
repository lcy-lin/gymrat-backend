import { createRequire } from "module";
import mysql2 from 'mysql2/promise';

const require = createRequire(import.meta.url);
require('dotenv').config();

const config = {
  version: process.env.APP_VERSION || '1.0.0',
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  db: mysql2.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  })
};

export default config;
