import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const pastedText = formData.get("text") as string | null;

    // 직접 입력 텍스트
    if (pastedText && pastedText.trim()) {
      return NextResponse.json({ text: pastedText.trim(), filename: "직접입력" });
    }

    if (!file) {
      return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
    }

    const filename = file.name.toLowerCase();
    const ext = filename.split(".").pop() ?? "";

    // ── TXT / Markdown ──────────────────────────────────────────
    if (["txt", "md", "markdown"].includes(ext)) {
      const text = await file.text();
      return NextResponse.json({ text, filename: file.name });
    }

    // ── DOCX ────────────────────────────────────────────────────
    if (ext === "docx") {
      const mammoth = (await import("mammoth")).default;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const result = await mammoth.extractRawText({ buffer });
      const text = result.value;
      return NextResponse.json({ text, filename: file.name });
    }

    // ── PDF (기본 텍스트 추출 시도) ──────────────────────────────
    if (ext === "pdf") {
      return NextResponse.json({
        error: "PDF는 현재 지원되지 않습니다. TXT, MD, DOCX 파일을 사용해 주세요.",
      }, { status: 400 });
    }

    return NextResponse.json({ error: `지원하지 않는 형식: .${ext}` }, { status: 400 });
  } catch (e: unknown) {
    console.error("Upload error:", e);
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
