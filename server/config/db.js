// config/db.js
console.log("📦 Loading database configuration...");

import dotenv from "dotenv";
dotenv.config();

import pkg from "pg";
const { Pool } = pkg;

console.log("📊 Database environment variables:");
console.log("  PGHOST:", process.env.DB_HOST ? "✅ Set" : "❌ Missing");
console.log("  PGDATABASE:", process.env.DB_DATABASE ? "✅ Set" : "❌ Missing");
console.log("  PGUSER:", process.env.DB_USER ? "✅ Set" : "❌ Missing");
console.log("  PGPASSWORD:", process.env.DB_PASSWORD ? "✅ Set" : "❌ Missing");
console.log("  PGPORT:", process.env.DB_PORT || 5432);

// 날짜 파싱 (1082: date 타입)
pkg.types.setTypeParser(1082, (val) => val);

let pool;

try {
  // 연결 풀 생성
  pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    max: 10,
  });

  console.log("✅ Database pool created successfully");

  // 스키마 설정
  pool.on("connect", (client) => {
    console.log("🔗 Client connected to database");
    client.query("SET search_path TO petsns").catch((err) => {
      console.warn("⚠️ Failed to set search_path:", err.message);
    });
  });

  pool.on("error", (err) => {
    console.error("❌ Database pool error:", err.message);
  });

  // 연결 테스트 (비동기, 실패해도 서버 시작은 계속)
  setTimeout(async () => {
    try {
      console.log("🔄 Testing database connection...");
      const client = await pool.connect();
      console.log("🎉 Database connection successful!");

      // 스키마 생성
      await client.query("CREATE SCHEMA IF NOT EXISTS petsns");
      console.log("✅ Schema petsns ready");

      client.release();
    } catch (err) {
      console.error("❌ Database connection test failed:", err.message);
      console.error(
        "⚠️ Server will continue but database features may not work"
      );
    }
  }, 1000);
} catch (err) {
  console.error("❌ Failed to create database pool:", err.message);
  console.error("⚠️ Creating mock pool for development");

  // Create a mock pool that won't crash the app
  pool = {
    connect: () => Promise.reject(new Error("Database not available")),
    query: () => Promise.reject(new Error("Database not available")),
    on: () => {},
  };
}

console.log("✅ Database configuration loaded");

export default pool;
