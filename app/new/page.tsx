"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const OFFICES = ["KIPO", "USPTO", "both"] as const;

const DEFAULT_FORM = {
  applicant_ko: "",
  applicant_en: "",
  inventor: "",
  ipc_codes: "G06F 3/00",
  target_offices: "both" as typeof OFFICES[number],
  title_ko: "",
  title_en: "",
  technical_field_ko: "",
  technical_field_en: "",
  problem_statement: "",
  effects: "",
  abstract_ko: "",
  abstract_en: "",
  components: [{ ref_num: "110", name_ko: "", name_en: "", description_ko: "", description_en: "", key_feature: "" }],
  claims: [{ claim_no: 1, type: "independent_system", preamble_ko: "", preamble_en: "", elements_ko: "", elements_en: "", closing_ko: "을 포함하는 통합 시스템.", closing_en: "the system." }],
  drawings: [{ fig_no: 1, title_ko: "", title_en: "", type: "block_diagram", description_ko: "", description_en: "" }],
};

type FormState = typeof DEFAULT_FORM;

const STEPS = ["출원인 정보", "발명 개요", "구성요소", "청구항", "도면 정보", "요약"];

export default function NewPatentPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (field: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const addComponent = () =>
    update("components", [...form.components, { ref_num: "", name_ko: "", name_en: "", description_ko: "", description_en: "", key_feature: "" }]);

  const updateComp = (i: number, field: string, val: string) => {
    const comps = [...form.components];
    comps[i] = { ...comps[i], [field]: val };
    update("components", comps);
  };

  const addClaim = () =>
    update("claims", [...form.claims, { claim_no: form.claims.length + 1, type: "dependent", preamble_ko: `제${form.claims.length}항에 있어서,`, preamble_en: `The system of claim ${form.claims.length}, wherein`, elements_ko: "", elements_en: "", closing_ko: "을 특징으로 하는 시스템.", closing_en: "the system." }]);

  const updateClaim = (i: number, field: string, val: string) => {
    const cls = [...form.claims];
    cls[i] = { ...cls[i], [field]: val };
    update("claims", cls);
  };

  const addDrawing = () =>
    update("drawings", [...form.drawings, { fig_no: form.drawings.length + 1, title_ko: "", title_en: "", type: "flowchart", description_ko: "", description_en: "" }]);

  const updateDrawing = (i: number, field: string, val: string) => {
    const dwgs = [...form.drawings];
    dwgs[i] = { ...dwgs[i], [field]: val };
    update("drawings", dwgs);
  };

  const buildPayload = () => ({
    meta: {
      applicant_ko: form.applicant_ko,
      applicant_en: form.applicant_en,
      inventor: form.inventor,
      ipc_codes: form.ipc_codes.split(",").map((s) => s.trim()),
      filing_date: new Date().toISOString().slice(0, 10),
      target_offices: form.target_offices === "both" ? ["KIPO", "USPTO"] : [form.target_offices],
    },
    invention: {
      title_ko: form.title_ko,
      title_en: form.title_en,
      technical_field_ko: form.technical_field_ko,
      technical_field_en: form.technical_field_en,
      problem_statement: form.problem_statement.split("\n").filter(Boolean),
      prior_art: [],
      components: form.components,
      algorithms: [],
      mathematical_formulas: [],
      effects: form.effects.split("\n").filter(Boolean),
    },
    claims: form.claims.map((c) => ({
      ...c,
      elements_ko: c.elements_ko.split("\n").filter(Boolean),
      elements_en: c.elements_en.split("\n").filter(Boolean),
      depends_on: null,
    })),
    drawings: form.drawings.map((d) => ({
      ...d,
      components_shown: [],
    })),
    abstract_ko: form.abstract_ko,
    abstract_en: form.abstract_en,
  });

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/patents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "저장 실패");
      router.push("/dashboard");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "오류 발생");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors";
  const labelCls = "block text-xs font-medium text-slate-400 mb-1.5";

  return (
    <div className="min-h-screen bg-[#0a0f1e]">
      <nav className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">LP</div>
          <span className="font-semibold text-white">LPatentPro</span>
        </Link>
        <Link href="/dashboard" className="text-slate-400 hover:text-white text-sm">대시보드</Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">새 특허 프로젝트</h1>
          <p className="text-slate-500 text-sm">발명 정보를 입력하면 KIPO · USPTO 명세서를 자동 생성합니다.</p>
        </div>

        {/* 스텝 인디케이터 */}
        <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-2">
          {STEPS.map((s, i) => (
            <button key={s} onClick={() => setStep(i)} className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap ${i === step ? "bg-indigo-600 border-indigo-500 text-white" : i < step ? "border-indigo-800 text-indigo-400 bg-indigo-950" : "border-slate-700 text-slate-500"}`}>
              <span>{i + 1}</span>
              <span>{s}</span>
            </button>
          ))}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          {/* Step 0: 출원인 정보 */}
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-white mb-6">출원인 정보</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>출원인 (한국어)</label>
                  <input className={inputCls} placeholder="주식회사 홍길동" value={form.applicant_ko} onChange={(e) => update("applicant_ko", e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Applicant (English)</label>
                  <input className={inputCls} placeholder="Honggildong Inc." value={form.applicant_en} onChange={(e) => update("applicant_en", e.target.value)} />
                </div>
              </div>
              <div>
                <label className={labelCls}>발명자</label>
                <input className={inputCls} placeholder="홍길동" value={form.inventor} onChange={(e) => update("inventor", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>IPC 분류 (쉼표로 구분)</label>
                <input className={inputCls} placeholder="G06F 3/00, G06N 5/04" value={form.ipc_codes} onChange={(e) => update("ipc_codes", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>출원 대상</label>
                <div className="flex gap-3">
                  {OFFICES.map((o) => (
                    <button key={o} onClick={() => update("target_offices", o)} className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors ${form.target_offices === o ? "bg-indigo-600 border-indigo-500 text-white" : "border-slate-700 text-slate-400 hover:border-slate-500"}`}>
                      {o === "both" ? "KIPO + USPTO" : o}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 1: 발명 개요 */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-white mb-6">발명 개요</h2>
              <div>
                <label className={labelCls}>발명의 명칭 (한국어)</label>
                <input className={inputCls} placeholder="AI 기반 통합 워크스페이스 시스템" value={form.title_ko} onChange={(e) => update("title_ko", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Title of Invention (English)</label>
                <input className={inputCls} placeholder="AI-BASED INTEGRATED WORKSPACE SYSTEM" value={form.title_en} onChange={(e) => update("title_en", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>기술분야 (한국어)</label>
                <textarea className={inputCls} rows={2} placeholder="본 발명은 클라우드 기반 AI 소프트웨어에 관한 것이다." value={form.technical_field_ko} onChange={(e) => update("technical_field_ko", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Technical Field (English)</label>
                <textarea className={inputCls} rows={2} placeholder="The present invention relates to cloud-based AI software." value={form.technical_field_en} onChange={(e) => update("technical_field_en", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>기존 기술의 문제점 (줄바꿈으로 구분)</label>
                <textarea className={inputCls} rows={4} placeholder={"단일 소스코드로 여러 플랫폼 지원 불가\n창 전환 시 상태 오염 발생\nAI 추론 연산 오버헤드가 큼"} value={form.problem_statement} onChange={(e) => update("problem_statement", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>발명의 효과 (줄바꿈으로 구분)</label>
                <textarea className={inputCls} rows={3} placeholder={"크로스플랫폼 실행 환경 자동 분기\nAI 연산 비용 절감\n인식 오류율 0% 달성"} value={form.effects} onChange={(e) => update("effects", e.target.value)} />
              </div>
            </div>
          )}

          {/* Step 2: 구성요소 */}
          {step === 2 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-6">구성요소</h2>
              {form.components.map((c, i) => (
                <div key={i} className="border border-slate-700 rounded-xl p-5 mb-4">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-indigo-900 text-indigo-300 text-xs px-2 py-0.5 rounded font-mono">구성요소 {i + 1}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div>
                      <label className={labelCls}>참조번호</label>
                      <input className={inputCls} placeholder="110" value={c.ref_num} onChange={(e) => updateComp(i, "ref_num", e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>명칭 (한국어)</label>
                      <input className={inputCls} placeholder="크로스플랫폼 렌더링부" value={c.name_ko} onChange={(e) => updateComp(i, "name_ko", e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>Name (English)</label>
                      <input className={inputCls} placeholder="Cross-Platform Unit" value={c.name_en} onChange={(e) => updateComp(i, "name_en", e.target.value)} />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className={labelCls}>핵심 기술 특징</label>
                    <input className={inputCls} placeholder="전역 객체 순차 평가를 통한 4개 환경 분기" value={c.key_feature} onChange={(e) => updateComp(i, "key_feature", e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>상세 설명 (한국어)</label>
                      <textarea className={inputCls} rows={3} value={c.description_ko} onChange={(e) => updateComp(i, "description_ko", e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>Description (English)</label>
                      <textarea className={inputCls} rows={3} value={c.description_en} onChange={(e) => updateComp(i, "description_en", e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={addComponent} className="w-full py-2.5 border border-dashed border-slate-600 rounded-xl text-slate-500 hover:text-slate-300 hover:border-slate-400 text-sm transition-colors">
                + 구성요소 추가
              </button>
            </div>
          )}

          {/* Step 3: 청구항 */}
          {step === 3 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-6">청구항</h2>
              {form.claims.map((c, i) => (
                <div key={i} className="border border-slate-700 rounded-xl p-5 mb-4">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-indigo-900 text-indigo-300 text-xs px-2 py-0.5 rounded">청구항 {c.claim_no}</span>
                    <span className="text-slate-600 text-xs">{c.type === "independent_system" ? "독립항(시스템)" : c.type === "independent_method" ? "독립항(방법)" : "종속항"}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className={labelCls}>전문 (한국어)</label>
                      <input className={inputCls} placeholder="통합 시스템에 있어서," value={c.preamble_ko} onChange={(e) => updateClaim(i, "preamble_ko", e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>Preamble (English)</label>
                      <input className={inputCls} placeholder="An integrated system, comprising:" value={c.preamble_en} onChange={(e) => updateClaim(i, "preamble_en", e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className={labelCls}>구성요소 (한국어, 줄바꿈 구분)</label>
                      <textarea className={inputCls} rows={4} placeholder={"(a) 플랫폼 분기부(110): 설명\n(b) AI 커널(200): 설명"} value={c.elements_ko} onChange={(e) => updateClaim(i, "elements_ko", e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>Elements (English, line-separated)</label>
                      <textarea className={inputCls} rows={4} placeholder={"(a) Platform unit (110): description\n(b) AI kernel (200): description"} value={c.elements_en} onChange={(e) => updateClaim(i, "elements_en", e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={addClaim} className="w-full py-2.5 border border-dashed border-slate-600 rounded-xl text-slate-500 hover:text-slate-300 hover:border-slate-400 text-sm transition-colors">
                + 청구항 추가
              </button>
            </div>
          )}

          {/* Step 4: 도면 */}
          {step === 4 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-6">도면 정보</h2>
              {form.drawings.map((d, i) => (
                <div key={i} className="border border-slate-700 rounded-xl p-5 mb-4">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded">도 {d.fig_no} / FIG. {d.fig_no}</span>
                    <select className="bg-slate-800 border border-slate-700 rounded px-2 py-0.5 text-xs text-slate-300 focus:outline-none" value={d.type} onChange={(e) => updateDrawing(i, "type", e.target.value)}>
                      <option value="block_diagram">블록 다이어그램</option>
                      <option value="flowchart">흐름도</option>
                      <option value="sequence">시퀀스 다이어그램</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className={labelCls}>제목 (한국어)</label>
                      <input className={inputCls} placeholder="전체 시스템 구성도" value={d.title_ko} onChange={(e) => updateDrawing(i, "title_ko", e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>Title (English)</label>
                      <input className={inputCls} placeholder="Overall System Architecture" value={d.title_en} onChange={(e) => updateDrawing(i, "title_en", e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>설명 (한국어)</label>
                      <textarea className={inputCls} rows={2} value={d.description_ko} onChange={(e) => updateDrawing(i, "description_ko", e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>Description (English)</label>
                      <textarea className={inputCls} rows={2} value={d.description_en} onChange={(e) => updateDrawing(i, "description_en", e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={addDrawing} className="w-full py-2.5 border border-dashed border-slate-600 rounded-xl text-slate-500 hover:text-slate-300 hover:border-slate-400 text-sm transition-colors">
                + 도면 추가
              </button>
            </div>
          )}

          {/* Step 5: 요약 */}
          {step === 5 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-white mb-6">요약서</h2>
              <div>
                <label className={labelCls}>요약 (한국어)</label>
                <textarea className={inputCls} rows={5} placeholder="본 발명은 [핵심 기술]에 관한 것으로, [효과 1], [효과 2]를 제공한다." value={form.abstract_ko} onChange={(e) => update("abstract_ko", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Abstract (English)</label>
                <textarea className={inputCls} rows={5} placeholder="The present invention relates to [technology], providing [effect 1] and [effect 2]." value={form.abstract_en} onChange={(e) => update("abstract_en", e.target.value)} />
              </div>
              {error && (
                <div className="bg-red-950 border border-red-800 rounded-lg p-3 text-red-300 text-sm">{error}</div>
              )}
            </div>
          )}

          {/* 네비게이션 버튼 */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-800">
            <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="px-5 py-2.5 text-sm text-slate-400 hover:text-white disabled:opacity-30 transition-colors">
              ← 이전
            </button>
            {step < STEPS.length - 1 ? (
              <button onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">
                다음 →
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading} className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-8 py-2.5 rounded-lg text-sm font-medium transition-colors">
                {loading ? "저장 중..." : "특허 프로젝트 저장"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
