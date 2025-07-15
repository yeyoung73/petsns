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
console.log("✅ NODE_ENV:", process.env.NODE_ENV);

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
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 10,
});

// 연결 테스트 - 더 견고하게
async function testConnection() {
  let retries = 3;

  while (retries > 0) {
    try {
      const client = await pool.connect();
      console.log("🎉 PostgreSQL 연결 성공!");

      // 스키마 생성 확인
      await client.query("CREATE SCHEMA IF NOT EXISTS petsns");
      await client.query("SET search_path TO petsns");
      console.log("✅ Schema petsns ready");

      client.release();
      return true;
    } catch (err) {
      console.error(`❌ PostgreSQL 연결 실패 (${4 - retries}/3):`, err.message);
      retries--;

      if (retries > 0) {
        console.log(`⏳ ${5}초 후 재시도...`);
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  }

  console.error(
    "❌ PostgreSQL 연결 최종 실패 - 서버를 계속 실행하지만 DB 기능 제한됨"
  );
  return false;
}

// 스키마 설정
pool.on("connect", (client) => {
  client.query("SET search_path TO petsns");
});

// 연결 테스트 실행 (서버 시작을 막지 않음)
testConnection().catch((err) => {
  console.error("DB 연결 테스트 실패:", err.message);
});

export default pool;
