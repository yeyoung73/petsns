// config/db.js
import dotenv from "dotenv";
dotenv.config();

import pkg from "pg";
const { Pool } = pkg;
pkg.types.setTypeParser(1082, (val) => val);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD); // 여기로 체크

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, // 이게 string이어야 함
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
});
pool.on("connect", (client) => {
  client.query("SET search_path TO petsns");
});

export default pool;
