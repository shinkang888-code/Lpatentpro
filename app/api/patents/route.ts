import { NextRequest, NextResponse } from "next/server";
import { getDb, initDb } from "@/lib/db";

export async function GET() {
  try {
    const sql = getDb();
    const rows = await sql`
      SELECT id, title_ko, title_en, applicant, ipc_codes, status, office, created_at
      FROM patents
      ORDER BY created_at DESC
      LIMIT 50
    `;
    return NextResponse.json({ patents: rows });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await initDb();
    const sql = getDb();
    const body = await req.json();

    const { meta, invention, claims, drawings, abstract_ko, abstract_en } = body;

    const row = await sql`
      INSERT INTO patents (title_ko, title_en, applicant, ipc_codes, status, office, input_json)
      VALUES (
        ${invention.title_ko},
        ${invention.title_en},
        ${meta.applicant_ko},
        ${meta.ipc_codes},
        'draft',
        ${meta.target_offices?.join(",") ?? "both"},
        ${JSON.stringify({ meta, invention, claims, drawings, abstract_ko, abstract_en })}
      )
      RETURNING *
    `;
    return NextResponse.json({ patent: row[0] }, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
