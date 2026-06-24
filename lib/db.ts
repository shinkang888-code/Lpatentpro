import { neon } from "@neondatabase/serverless";

export function getDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL 환경 변수가 설정되지 않았습니다.");
  }
  return neon(connectionString);
}

export async function initDb() {
  const sql = getDb();
  await sql`
    CREATE TABLE IF NOT EXISTS patents (
      id          SERIAL PRIMARY KEY,
      title_ko    TEXT NOT NULL,
      title_en    TEXT NOT NULL,
      applicant   TEXT,
      ipc_codes   TEXT[],
      status      TEXT DEFAULT 'draft',
      office      TEXT DEFAULT 'both',
      input_json  JSONB NOT NULL,
      created_at  TIMESTAMPTZ DEFAULT NOW(),
      updated_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}
