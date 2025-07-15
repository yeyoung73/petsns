// config/db.js
import dotenv from "dotenv";
dotenv.config();

import pkg from "pg";
const { Pool } = pkg;
pkg.types.setTypeParser(1082, (val) => val);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD); // 여기로 체크

const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
});
pool.on("connect", (client) => {
  client.query("SET search_path TO petsns");
});

export default pool;
