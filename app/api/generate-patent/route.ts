import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

// ─── SSE 이벤트 헬퍼 ──────────────────────────────────────────
function sse(type: string, data: unknown): string {
  return `data: ${JSON.stringify({ type, data })}\n\n`;
}

// ─── 공통 프롬프트 빌더 ───────────────────────────────────────
function buildPatentPrompt(text: string, office: string): string {
  const officeDesc = office === "KIPO" ? "한국 특허청(KIPO) 전용"
    : office === "USPTO" ? "미국 특허청(USPTO) 전용"
    : "한국(KIPO) + 미국(USPTO) 동시 출원";

  return `당신은 20년 경력의 한국/미국 전문 변리사입니다.
아래 발명 문서를 읽고 ${officeDesc} 특허 명세서에 필요한 정보를 JSON 형식으로 추출/생성해주세요.

[발명 문서]
${text.slice(0, 8000)}

반드시 아래 JSON 형식으로만 응답하세요. 코드블록(\`\`\`)이나 다른 설명 없이 순수 JSON만:
{
  "title_ko": "발명의 한국어 명칭 (간결하고 기술적으로)",
  "title_en": "TITLE IN ENGLISH ALL CAPS",
  "applicant_ko": "출원인 (문서에서 추출, 없으면 빈 문자열)",
  "applicant_en": "Applicant in English",
  "inventor": "발명자 이름",
  "ipc_codes": ["G06F 3/00"],
  "technical_field_ko": "[0001] 본 발명은 [기술분야]에 관한 것이다.",
  "technical_field_en": "[0002] The present invention relates to [field].",
  "problem_statement": ["기존 기술의 첫 번째 문제점", "두 번째 문제점", "세 번째 문제점"],
  "prior_art": [
    { "patent_no": "관련 특허번호 또는 N/A", "assignee": "회사명", "differentiation": "차별화 포인트" }
  ],
  "components": [
    { "ref_num": "100", "name_ko": "구성요소 한국어 명칭", "name_en": "Component English Name", "description_ko": "상세한 기능 설명", "description_en": "Detailed description", "key_feature": "핵심 기술 특징" }
  ],
  "algorithms": [
    { "name": "핵심 알고리즘 명칭", "pseudocode": ["1. 단계 설명", "2. 단계 설명"], "figure_ref": "도 2" }
  ],
  "effects": ["발명의 첫 번째 효과", "두 번째 효과"],
  "claims": [
    { "claim_no": 1, "type": "independent_system", "preamble_ko": "청구항 전문", "preamble_en": "Preamble in English", "elements_ko": ["구성요소 1 청구항 문구", "구성요소 2 청구항 문구"], "elements_en": ["Element 1 claim language", "Element 2 claim language"], "closing_ko": "을 포함하는 시스템.", "closing_en": "the system." }
  ],
  "drawings": [
    { "fig_no": 1, "title_ko": "도면 제목", "title_en": "Drawing Title", "type": "block_diagram", "description_ko": "도 1은 ...", "description_en": "FIG. 1 is ..." }
  ],
  "abstract_ko": "요약 한국어 (2-3문장)",
  "abstract_en": "Abstract in English (2-3 sentences)"
}`;
}

function parseAiJson(raw: string): Record<string, unknown> {
  // 코드블록 제거 후 JSON 파싱
  const cleaned = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("AI 응답에서 JSON을 찾을 수 없습니다.");
  return JSON.parse(match[0]);
}

// ─── Gemini AI 생성 ───────────────────────────────────────────
async function generateWithGemini(text: string, office: string): Promise<Record<string, unknown>> {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const result = await model.generateContent(buildPatentPrompt(text, office));
  const raw = result.response.text();
  return parseAiJson(raw);
}

// ─── OpenAI GPT-4o-mini 생성 ─────────────────────────────────
async function generateWithOpenAI(text: string, office: string): Promise<Record<string, unknown>> {
  const OpenAI = (await import("openai")).default;
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 4096,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: "당신은 20년 경력의 한국/미국 전문 변리사입니다. 반드시 순수 JSON만 응답하세요." },
      { role: "user", content: buildPatentPrompt(text, office) },
    ],
  });

  const raw = response.choices[0]?.message?.content ?? "";
  return parseAiJson(raw);
}

// ─── DeepSeek 생성 (OpenAI 호환 API) ─────────────────────────
async function generateWithDeepSeek(text: string, office: string): Promise<Record<string, unknown>> {
  const OpenAI = (await import("openai")).default;
  const client = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: "https://api.deepseek.com/v1",
  });

  const response = await client.chat.completions.create({
    model: "deepseek-chat",
    max_tokens: 4096,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: "당신은 20년 경력의 한국/미국 전문 변리사입니다. 반드시 순수 JSON만 응답하세요." },
      { role: "user", content: buildPatentPrompt(text, office) },
    ],
  });

  const raw = response.choices[0]?.message?.content ?? "";
  return parseAiJson(raw);
}

// ─── Claude AI 생성 ───────────────────────────────────────────
async function generateWithClaude(text: string, office: string): Promise<Record<string, unknown>> {
  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  const client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

  const response = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 4096,
    messages: [{ role: "user", content: buildPatentPrompt(text, office) }],
  });

  const raw = response.content[0].type === "text" ? response.content[0].text : "";
  return parseAiJson(raw);
}

// ─── 텍스트 분석 기반 폴백 ────────────────────────────────────
function extractFromText(text: string): Record<string, unknown> {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

  // 제목 추출: 첫 # 제목 또는 첫 줄
  let title_ko = "";
  for (const line of lines) {
    if (line.startsWith("# ")) { title_ko = line.replace(/^#+\s*/, ""); break; }
    if (line.startsWith("발명의 명칭") || line.startsWith("제목")) {
      title_ko = line.replace(/^.*[:：]\s*/, "").replace(/\*\*/g, ""); break;
    }
  }
  if (!title_ko) title_ko = lines[0]?.slice(0, 60) ?? "발명 제목";

  // 문제점 추출
  const problems: string[] = [];
  let inProblems = false;
  for (const line of lines) {
    if (/문제|기존 기술|과제|한계/.test(line)) { inProblems = true; continue; }
    if (inProblems && /효과|해결|구성|실시|청구/.test(line)) { inProblems = false; }
    if (inProblems && (line.startsWith("-") || line.startsWith("•") || /^\d+\./.test(line))) {
      problems.push(line.replace(/^[-•\d.]\s*/, ""));
    }
  }

  // 효과 추출
  const effects: string[] = [];
  let inEffects = false;
  for (const line of lines) {
    if (/효과|이점|장점/.test(line) && !inEffects) { inEffects = true; continue; }
    if (inEffects && /구성|실시|청구/.test(line)) { inEffects = false; }
    if (inEffects && (line.startsWith("-") || line.startsWith("•") || /^\d+\./.test(line))) {
      effects.push(line.replace(/^[-•\d.]\s*/, ""));
    }
  }

  // 구성요소 추출 (참조번호 패턴)
  const compMap = new Map<string, string>();
  const refPattern = /\((\d{2,3})\)\s*([^\n,;:]+)/g;
  for (const line of lines) {
    let m: RegExpExecArray | null;
    while ((m = refPattern.exec(line)) !== null) {
      if (!compMap.has(m[1])) compMap.set(m[1], m[2].trim());
    }
  }
  const components = Array.from(compMap.entries()).slice(0, 8).map(([ref, name]) => ({
    ref_num: ref, name_ko: name, name_en: name,
    description_ko: `${name}(${ref})는 본 발명의 핵심 구성요소로서 관련 기능을 수행한다.`,
    description_en: `The ${name} (${ref}) performs related functions as a key component of the present invention.`,
    key_feature: name,
  }));
  if (components.length === 0) {
    components.push({ ref_num: "100", name_ko: "메인 처리부", name_en: "Main Processing Unit", description_ko: "본 발명의 핵심 처리 기능을 담당한다.", description_en: "Responsible for the core processing function of the present invention.", key_feature: "핵심 처리 기능" });
  }

  const title_en = title_ko.toUpperCase().replace(/[^A-Z0-9\s]/g, "").trim() || "AI INTEGRATED SYSTEM";
  const tech_field = `본 발명은 ${title_ko}에 관한 것으로, 특히 ${components[0]?.name_ko ?? "핵심 기술 구성요소"}를 포함하는 시스템에 관한 것이다.`;

  return {
    title_ko,
    title_en,
    applicant_ko: "", applicant_en: "", inventor: "",
    ipc_codes: ["G06F 3/00"],
    technical_field_ko: `[0001] ${tech_field}`,
    technical_field_en: `[0002] The present invention relates to ${title_en.toLowerCase()}.`,
    problem_statement: problems.length > 0 ? problems : ["기존 기술의 문제점 1", "기존 기술의 문제점 2"],
    prior_art: [],
    components,
    algorithms: [],
    effects: effects.length > 0 ? effects : ["발명의 효과 1", "발명의 효과 2"],
    claims: [
      {
        claim_no: 1, type: "independent_system",
        preamble_ko: `${title_ko}에 있어서,`,
        preamble_en: `A system for ${title_en.toLowerCase()}, comprising:`,
        elements_ko: components.map(c => `${c.name_ko}(${c.ref_num}): ${c.description_ko}`),
        elements_en: components.map(c => `${c.name_en} (${c.ref_num}): ${c.description_en}`),
        closing_ko: "을 포함하는 것을 특징으로 하는 시스템.",
        closing_en: "the system.",
      }
    ],
    drawings: [
      { fig_no: 1, title_ko: "전체 시스템 구성도", title_en: "Overall System Architecture", type: "block_diagram", description_ko: "도 1은 본 발명의 일 실시예에 따른 전체 시스템 구성도이다.", description_en: "FIG. 1 is a block diagram illustrating the overall system architecture." },
      { fig_no: 2, title_ko: "핵심 알고리즘 흐름도", title_en: "Core Algorithm Flowchart", type: "flowchart", description_ko: "도 2는 본 발명의 핵심 알고리즘 흐름도이다.", description_en: "FIG. 2 is a flowchart illustrating the core algorithm." },
    ],
    abstract_ko: `본 발명은 ${tech_field} ${effects[0] ?? "관련 효과"}를 제공한다.`,
    abstract_en: `The present invention relates to ${title_en.toLowerCase()}, providing ${effects[0] ?? "improved functionality"}.`,
  };
}

// ─── 메인 라우트 핸들러 ────────────────────────────────────────
export async function POST(req: NextRequest) {
  const { text, office = "both", filename = "" } = await req.json();

  if (!text?.trim()) {
    return new Response(sse("error", "문서 내용이 없습니다."), {
      headers: { "Content-Type": "text/event-stream" },
      status: 400,
    });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const push = (type: string, data: unknown) =>
        controller.enqueue(new TextEncoder().encode(sse(type, data)));

      try {
        // 1. 시작
        push("status", { step: 0, message: `📄 "${filename}" 문서를 분석하는 중...`, progress: 5 });
        await sleep(400);

        // 2. AI 자동 폴백 체인: Gemini → ChatGPT → DeepSeek → Claude → 텍스트 분석
        let patentData: Record<string, unknown> | null = null;
        const hasGemini   = !!process.env.GEMINI_API_KEY;
        const hasOpenAI   = !!process.env.OPENAI_API_KEY;
        const hasDeepSeek = !!process.env.DEEPSEEK_API_KEY;
        const hasClaude   = !!process.env.CLAUDE_API_KEY;
        const hasAi       = hasGemini || hasOpenAI || hasDeepSeek || hasClaude;

        type AiProvider = { key: boolean; label: string; fn: () => Promise<Record<string, unknown>> };
        const providers: AiProvider[] = [
          { key: hasGemini,   label: "🟢 Gemini AI",   fn: () => generateWithGemini(text, office) },
          { key: hasOpenAI,   label: "⚡ ChatGPT",      fn: () => generateWithOpenAI(text, office) },
          { key: hasDeepSeek, label: "🔵 DeepSeek",     fn: () => generateWithDeepSeek(text, office) },
          { key: hasClaude,   label: "🟣 Claude AI",    fn: () => generateWithClaude(text, office) },
        ];

        for (const p of providers) {
          if (!p.key) continue;
          push("status", { step: 1, message: `${p.label}가 발명 내용을 분석하는 중...`, progress: 15 });
          try {
            patentData = await p.fn();
            push("status", { step: 1, message: `${p.label} 분석 완료 ✓`, progress: 20 });
            break;
          } catch (err) {
            console.warn(`${p.label} 실패:`, err);
            push("status", { step: 1, message: `${p.label} 실패 → 다음 AI로 전환 중...`, progress: 15 });
          }
        }

        if (!patentData) {
          push("status", { step: 1, message: "🔍 텍스트 분석으로 핵심 정보 추출 중...", progress: 15 });
          await sleep(600);
          patentData = extractFromText(text);
        }

        // 3. 섹션별로 스트리밍 방식으로 전달
        const sections = [
          { key: "title",     label: "💡 발명의 명칭",       progress: 25, data: { title_ko: patentData.title_ko, title_en: patentData.title_en } },
          { key: "meta",      label: "🏢 출원인 정보",       progress: 33, data: { applicant_ko: patentData.applicant_ko, applicant_en: patentData.applicant_en, inventor: patentData.inventor, ipc_codes: patentData.ipc_codes } },
          { key: "field",     label: "🔬 기술분야",          progress: 42, data: { technical_field_ko: patentData.technical_field_ko, technical_field_en: patentData.technical_field_en } },
          { key: "problems",  label: "⚠️ 해결 과제",         progress: 52, data: { problem_statement: patentData.problem_statement, effects: patentData.effects } },
          { key: "components",label: "⚙️ 구성요소",          progress: 63, data: { components: patentData.components } },
          { key: "claims",    label: "📋 특허청구범위",       progress: 76, data: { claims: patentData.claims } },
          { key: "drawings",  label: "🖼 도면 구성",         progress: 87, data: { drawings: patentData.drawings } },
          { key: "abstract",  label: "📝 요약서",            progress: 95, data: { abstract_ko: patentData.abstract_ko, abstract_en: patentData.abstract_en } },
        ];

        for (const section of sections) {
          push("status", { step: section.key, message: `${section.label} 생성 완료`, progress: section.progress });
          push("section", { key: section.key, label: section.label, data: section.data });
          await sleep(hasAi ? 200 : 350);
        }

        // 4. 완료 — 전체 JSON 전달
        push("status", { step: "done", message: "✅ 특허 명세서 생성 완료!", progress: 100 });
        push("complete", {
          patent: {
            meta: { applicant_ko: patentData.applicant_ko, applicant_en: patentData.applicant_en, inventor: patentData.inventor, ipc_codes: patentData.ipc_codes, filing_date: new Date().toISOString().slice(0, 10), target_offices: office === "both" ? ["KIPO", "USPTO"] : [office] },
            invention: { title_ko: patentData.title_ko, title_en: patentData.title_en, technical_field_ko: patentData.technical_field_ko, technical_field_en: patentData.technical_field_en, problem_statement: patentData.problem_statement, prior_art: patentData.prior_art ?? [], components: patentData.components, algorithms: patentData.algorithms ?? [], mathematical_formulas: [], effects: patentData.effects },
            claims: (patentData.claims as unknown[]),
            drawings: (patentData.drawings as unknown[]),
            abstract_ko: patentData.abstract_ko,
            abstract_en: patentData.abstract_en,
          }
        });

      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        push("error", msg);
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }
