// config/db.js
import pkg from "pg";
const { Pool } = pkg;

// 🔥 수정: dotenv를 조건부로 로드
try {
  if (process.env.NODE_ENV === "development") {
    const dotenv = await import("dotenv");
    dotenv.config();
  }
} catch (err) {
  console.log("⚠️ Using system environment variables");
}

console.log("🔍 데이터베이스 환경변수 확인:");
console.log(
  "DATABASE_URL:",
  process.env.DATABASE_URL ? "✅ 설정됨" : "❌ 누락"
);
console.log(
  "DATABASE_URL 시작:",
  process.env.DATABASE_URL
    ? process.env.DATABASE_URL.substring(0, 30) + "..."
    : "None"
);
console.log("NODE_ENV:", process.env.NODE_ENV);

// 🔥 수정: Railway 환경변수 직접 참조
let connectionString = process.env.DATABASE_URL;

// Railway 환경변수 패턴 확인
const railwayVars = Object.keys(process.env).filter(
  (key) =>
    key.startsWith("PGHOST") ||
    key.startsWith("PGDATABASE") ||
    key.startsWith("PGUSER") ||
    key.startsWith("PGPASSWORD")
);
console.log("🔧 Railway DB 환경변수:", railwayVars);

// 만약 DATABASE_URL이 없다면 개별 환경변수로 구성
if (!connectionString) {
  const PGHOST = process.env.PGHOST;
  const PGDATABASE = process.env.PGDATABASE;
  const PGUSER = process.env.PGUSER;
  const PGPASSWORD = process.env.PGPASSWORD;
  const PGPORT = process.env.PGPORT || 5432;

  if (PGHOST && PGDATABASE && PGUSER && PGPASSWORD) {
    connectionString = `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE}?sslmode=require`;
    console.log("🔧 개별 환경변수로 연결 문자열 구성");
  }
}

if (!connectionString) {
  console.error("❌ 데이터베이스 연결 정보가 없습니다!");
  process.exit(1);
}

// 데이터베이스 연결 설정
const pool = new Pool({
  connectionString: connectionString,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// 연결 이벤트 핸들러
pool.on("connect", (client) => {
  console.log("✅ 데이터베이스 연결 성공");

  // 연결 정보 확인
  client.query(
    "SELECT current_database(), current_user, current_schema()",
    (err, result) => {
      if (!err) {
        console.log("📍 연결된 데이터베이스:", result.rows[0]);
      }
    }
  );
});

pool.on("error", (err) => {
  console.error("❌ 데이터베이스 연결 에러:", err);
});

// 연결 테스트 함수
export async function testConnection() {
  try {
    const client = await pool.connect();

    // 기본 정보 확인
    const info = await client.query(
      "SELECT current_database(), current_user, current_schema()"
    );
    console.log("📊 데이터베이스 정보:", info.rows[0]);

    // 테이블 존재 확인
    const tables = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    console.log(
      "📋 존재하는 테이블:",
      tables.rows.map((row) => row.table_name)
    );

    client.release();
    return true;
  } catch (error) {
    console.error("❌ 데이터베이스 테스트 실패:", error.message);
    return false;
  }
}

export default pool;
