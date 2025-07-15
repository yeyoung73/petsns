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
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: { rejectUnauthorized: false }, // Railway에서는 필요!
});

// 연결 테스트
pool
  .connect()
  .then(() => {
    console.log("🎉 PostgreSQL 연결 성공!");
  })
  .catch((err) => {
    console.error("❌ PostgreSQL 연결 실패:", err.message);
    process.exit(1); // 실패 시 컨테이너 종료
  });

// 스키마 설정
pool.on("connect", (client) => {
  client.query("SET search_path TO petsns");
});

export default pool;
