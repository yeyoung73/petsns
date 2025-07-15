// config/db.js
import dotenv from "dotenv";
dotenv.config();

import pkg from "pg";
const { Pool } = pkg;

// 날짜 파싱 (1082: date 타입)
pkg.types.setTypeParser(1082, (val) => val);

// 로그로 환경 변수 확인 (디버그용)
console.log("✅ PGHOST:", process.env.PGHOST);
console.log("✅ PGDATABASE:", process.env.PGDATABASE);
console.log("✅ PGUSER:", process.env.PGUSER);
// 비밀번호는 보통 출력 X

// 연결 풀 생성
const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT || 5432,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  max: 10, // maximum number of clients in the pool
});
// 연결 테스트
// Add to db.js after successful connection
pool
  .connect()
  .then(async (client) => {
    console.log("🎉 PostgreSQL 연결 성공!");

    // Create schema if it doesn't exist
    try {
      await client.query("CREATE SCHEMA IF NOT EXISTS petsns");
      console.log("✅ Schema petsns ready");
    } catch (err) {
      console.error("Schema creation error:", err.message);
    }

    client.release();
  })
  .catch((err) => {
    console.error("❌ PostgreSQL 연결 실패:", err.message);
    process.exit(1);
  });

export default pool;
