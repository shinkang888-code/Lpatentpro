"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "../components/Nav";

const OFFICES = ["KIPO", "USPTO", "both"] as const;
const STEPS = [
  { id: "meta", label: "출원 정보", icon: "🏢" },
  { id: "invention", label: "발명 개요", icon: "💡" },
  { id: "components", label: "구성요소", icon: "⚙️" },
  { id: "claims", label: "청구항", icon: "📋" },
  { id: "drawings", label: "도면", icon: "🖼" },
  { id: "abstract", label: "요약서", icon: "📝" },
];

const DEFAULT_FORM = {
  applicant_ko: "", applicant_en: "", inventor: "",
  ipc_codes: "G06F 3/00", target_offices: "both" as typeof OFFICES[number],
  title_ko: "", title_en: "",
  technical_field_ko: "", technical_field_en: "",
  problem_statement: "", effects: "",
  abstract_ko: "", abstract_en: "",
  components: [{ ref_num: "110", name_ko: "", name_en: "", description_ko: "", description_en: "", key_feature: "" }],
  claims: [{ claim_no: 1, type: "independent_system", preamble_ko: "", preamble_en: "", elements_ko: "", elements_en: "", closing_ko: "을 포함하는 통합 시스템.", closing_en: "the system." }],
  drawings: [{ fig_no: 1, title_ko: "", title_en: "", type: "block_diagram", description_ko: "", description_en: "" }],
};

type F = typeof DEFAULT_FORM;
const inp = "input-glass w-full rounded-xl px-4 py-3 text-sm";
const ta = "input-glass w-full rounded-xl px-4 py-3 text-sm resize-none";
const lab = "block text-xs font-semibold text-slate-400 mb-2 tracking-wide uppercase";

export default function NewPatentPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<F>(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const up = (field: string, val: unknown) => setForm(p => ({ ...p, [field]: val }));
  const upC = (i: number, f: string, v: string) => { const a=[...form.components]; a[i]={...a[i],[f]:v}; up("components",a); };
  const upCl = (i: number, f: string, v: string) => { const a=[...form.claims]; a[i]={...a[i],[f]:v}; up("claims",a); };
  const upD = (i: number, f: string, v: string) => { const a=[...form.drawings]; a[i]={...a[i],[f]:v}; up("drawings",a); };

  const buildPayload = () => ({
    meta: { applicant_ko: form.applicant_ko, applicant_en: form.applicant_en, inventor: form.inventor, ipc_codes: form.ipc_codes.split(",").map(s=>s.trim()), filing_date: new Date().toISOString().slice(0,10), target_offices: form.target_offices==="both"?["KIPO","USPTO"]:[form.target_offices] },
    invention: { title_ko: form.title_ko, title_en: form.title_en, technical_field_ko: form.technical_field_ko, technical_field_en: form.technical_field_en, problem_statement: form.problem_statement.split("\n").filter(Boolean), prior_art: [], components: form.components, algorithms: [], mathematical_formulas: [], effects: form.effects.split("\n").filter(Boolean) },
    claims: form.claims.map(c=>({...c,elements_ko:c.elements_ko.split("\n").filter(Boolean),elements_en:c.elements_en.split("\n").filter(Boolean),depends_on:null})),
    drawings: form.drawings.map(d=>({...d,components_shown:[]})),
    abstract_ko: form.abstract_ko, abstract_en: form.abstract_en,
  });

  const handleSubmit = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/patents", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(buildPayload()) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "저장 실패");
      router.push("/dashboard");
    } catch(e) { setError(e instanceof Error ? e.message : "오류"); }
    finally { setLoading(false); }
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-[#04071a]">
      <Nav />

      <div className="pt-20 pb-24 md:pb-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* 헤더 */}
          <div className="text-center mb-10">
            <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">새 특허 프로젝트</h1>
            <p className="text-slate-500 text-sm">발명 정보를 입력하면 KIPO · USPTO 명세서를 자동 생성합니다</p>
          </div>

          {/* 프로그레스 바 */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-500 font-medium">{STEPS[step].icon} {STEPS[step].label}</span>
              <span className="text-xs text-slate-600">{step + 1} / {STEPS.length}</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-600 to-blue-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* 스텝 도트 (데스크탑) */}
          <div className="hidden sm:flex items-center justify-between mb-8 px-2">
            {STEPS.map((s, i) => (
              <button key={s.id} onClick={() => setStep(i)} className="flex flex-col items-center gap-1.5 group">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base transition-all ${i === step ? "bg-indigo-600 shadow-lg shadow-indigo-900/50" : i < step ? "bg-indigo-900/60 border border-indigo-700/40" : "bg-slate-800/60 border border-slate-700/40"}`}>
                  {i < step ? <span className="text-emerald-400 text-xs">✓</span> : <span>{s.icon}</span>}
                </div>
                <span className={`text-[10px] font-medium transition-colors whitespace-nowrap ${i === step ? "text-indigo-400" : "text-slate-600"}`}>{s.label}</span>
              </button>
            ))}
          </div>

          {/* 폼 카드 */}
          <div className="glass rounded-3xl p-6 sm:p-8 border border-indigo-900/30">
            {/* ── Step 0: 출원 정보 ─────────────────────────── */}
            {step === 0 && (
              <div className="space-y-5">
                <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">🏢 출원인 정보</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className={lab}>출원인 (한국어)</label><input className={inp} placeholder="주식회사 홍길동" value={form.applicant_ko} onChange={e=>up("applicant_ko",e.target.value)} /></div>
                  <div><label className={lab}>Applicant (English)</label><input className={inp} placeholder="Honggildong Inc." value={form.applicant_en} onChange={e=>up("applicant_en",e.target.value)} /></div>
                </div>
                <div><label className={lab}>발명자</label><input className={inp} placeholder="홍길동" value={form.inventor} onChange={e=>up("inventor",e.target.value)} /></div>
                <div><label className={lab}>IPC 분류 코드 (쉼표 구분)</label><input className={inp} placeholder="G06F 3/00, G06N 5/04" value={form.ipc_codes} onChange={e=>up("ipc_codes",e.target.value)} /></div>
                <div>
                  <label className={lab}>출원 대상 국가</label>
                  <div className="grid grid-cols-3 gap-3">
                    {OFFICES.map(o => (
                      <button key={o} onClick={() => up("target_offices", o)} className={`py-3 rounded-xl border text-sm font-semibold transition-all ${form.target_offices === o ? "btn-glow text-white" : "btn-outline"}`}>
                        {o === "both" ? "KR + US" : o}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 1: 발명 개요 ─────────────────────────── */}
            {step === 1 && (
              <div className="space-y-5">
                <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">💡 발명 개요</h2>
                <div><label className={lab}>발명의 명칭 (한국어)</label><input className={inp} placeholder="AI 기반 통합 워크스페이스 시스템" value={form.title_ko} onChange={e=>up("title_ko",e.target.value)} /></div>
                <div><label className={lab}>Title of Invention (English)</label><input className={inp} placeholder="AI-BASED INTEGRATED WORKSPACE SYSTEM" value={form.title_en} onChange={e=>up("title_en",e.target.value)} /></div>
                <div><label className={lab}>기술분야 (한국어)</label><textarea className={ta} rows={2} placeholder="본 발명은 클라우드 기반 AI 소프트웨어에 관한 것이다." value={form.technical_field_ko} onChange={e=>up("technical_field_ko",e.target.value)} /></div>
                <div><label className={lab}>Technical Field (English)</label><textarea className={ta} rows={2} placeholder="The present invention relates to cloud-based AI software." value={form.technical_field_en} onChange={e=>up("technical_field_en",e.target.value)} /></div>
                <div><label className={lab}>기존 기술의 문제점 (줄바꿈 구분)</label><textarea className={ta} rows={4} placeholder={"문제 1: 단일 소스코드로 여러 플랫폼 지원 불가\n문제 2: 창 전환 시 상태 오염 발생\n문제 3: AI 추론 연산 오버헤드가 큼"} value={form.problem_statement} onChange={e=>up("problem_statement",e.target.value)} /></div>
                <div><label className={lab}>발명의 효과 (줄바꿈 구분)</label><textarea className={ta} rows={3} placeholder={"효과 1: 4개 플랫폼 자동 분기\n효과 2: AI 연산 비용 절감\n효과 3: 인식 오류율 0% 달성"} value={form.effects} onChange={e=>up("effects",e.target.value)} /></div>
              </div>
            )}

            {/* ── Step 2: 구성요소 ─────────────────────────── */}
            {step === 2 && (
              <div>
                <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">⚙️ 구성요소</h2>
                <div className="space-y-4">
                  {form.components.map((c,i) => (
                    <div key={i} className="glass-strong rounded-2xl p-5 border border-indigo-900/30">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 text-xs font-bold">{i+1}</div>
                        <span className="text-indigo-300 text-sm font-semibold">구성요소 {i+1}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div><label className={lab}>참조번호</label><input className={inp} placeholder="110" value={c.ref_num} onChange={e=>upC(i,"ref_num",e.target.value)} /></div>
                        <div><label className={lab}>명칭 (한국어)</label><input className={inp} placeholder="크로스플랫폼 렌더링부" value={c.name_ko} onChange={e=>upC(i,"name_ko",e.target.value)} /></div>
                        <div><label className={lab}>Name (EN)</label><input className={inp} placeholder="Cross-Platform Unit" value={c.name_en} onChange={e=>upC(i,"name_en",e.target.value)} /></div>
                      </div>
                      <div className="mb-3"><label className={lab}>핵심 기술 특징</label><input className={inp} placeholder="전역 객체 순차 평가를 통한 4개 환경 분기" value={c.key_feature} onChange={e=>upC(i,"key_feature",e.target.value)} /></div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div><label className={lab}>상세 설명 (한국어)</label><textarea className={ta} rows={3} value={c.description_ko} onChange={e=>upC(i,"description_ko",e.target.value)} /></div>
                        <div><label className={lab}>Description (EN)</label><textarea className={ta} rows={3} value={c.description_en} onChange={e=>upC(i,"description_en",e.target.value)} /></div>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => up("components", [...form.components, {ref_num:"",name_ko:"",name_en:"",description_ko:"",description_en:"",key_feature:""}])} className="w-full mt-4 py-3 rounded-2xl border border-dashed border-indigo-800/50 text-indigo-500 hover:text-indigo-300 hover:border-indigo-600/60 text-sm font-medium transition-all">
                  + 구성요소 추가
                </button>
              </div>
            )}

            {/* ── Step 3: 청구항 ────────────────────────────── */}
            {step === 3 && (
              <div>
                <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">📋 청구항</h2>
                <div className="space-y-4">
                  {form.claims.map((c,i) => (
                    <div key={i} className="glass-strong rounded-2xl p-5 border border-indigo-900/30">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="badge">청구항 {c.claim_no}</div>
                        <select className="input-glass rounded-lg px-3 py-1.5 text-xs" value={c.type} onChange={e=>upCl(i,"type",e.target.value)}>
                          <option value="independent_system">독립항(시스템)</option>
                          <option value="independent_method">독립항(방법)</option>
                          <option value="dependent">종속항</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                        <div><label className={lab}>전문 (한국어)</label><input className={inp} placeholder="통합 시스템에 있어서," value={c.preamble_ko} onChange={e=>upCl(i,"preamble_ko",e.target.value)} /></div>
                        <div><label className={lab}>Preamble (English)</label><input className={inp} placeholder="An integrated system, comprising:" value={c.preamble_en} onChange={e=>upCl(i,"preamble_en",e.target.value)} /></div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div><label className={lab}>구성요소 (한국어, 줄바꿈)</label><textarea className={ta} rows={4} placeholder={"(a) 플랫폼 분기부(110): 설명\n(b) AI 커널(200): 설명"} value={c.elements_ko} onChange={e=>upCl(i,"elements_ko",e.target.value)} /></div>
                        <div><label className={lab}>Elements (English)</label><textarea className={ta} rows={4} placeholder={"(a) Platform unit (110): desc\n(b) AI kernel (200): desc"} value={c.elements_en} onChange={e=>upCl(i,"elements_en",e.target.value)} /></div>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => up("claims", [...form.claims, {claim_no:form.claims.length+1,type:"dependent",preamble_ko:`제${form.claims.length}항에 있어서,`,preamble_en:`The system of claim ${form.claims.length}, wherein`,elements_ko:"",elements_en:"",closing_ko:"을 특징으로 하는 시스템.",closing_en:"the system."}])} className="w-full mt-4 py-3 rounded-2xl border border-dashed border-indigo-800/50 text-indigo-500 hover:text-indigo-300 hover:border-indigo-600/60 text-sm font-medium transition-all">
                  + 청구항 추가
                </button>
              </div>
            )}

            {/* ── Step 4: 도면 ─────────────────────────────── */}
            {step === 4 && (
              <div>
                <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">🖼 도면 정보</h2>
                <div className="space-y-4">
                  {form.drawings.map((d,i) => (
                    <div key={i} className="glass-strong rounded-2xl p-5 border border-indigo-900/30">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 font-bold text-sm">{d.fig_no}</div>
                        <select className="input-glass rounded-lg px-3 py-1.5 text-xs" value={d.type} onChange={e=>upD(i,"type",e.target.value)}>
                          <option value="block_diagram">블록 다이어그램</option>
                          <option value="flowchart">흐름도</option>
                          <option value="sequence">시퀀스 다이어그램</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                        <div><label className={lab}>제목 (한국어)</label><input className={inp} placeholder="전체 시스템 구성도" value={d.title_ko} onChange={e=>upD(i,"title_ko",e.target.value)} /></div>
                        <div><label className={lab}>Title (English)</label><input className={inp} placeholder="Overall System Architecture" value={d.title_en} onChange={e=>upD(i,"title_en",e.target.value)} /></div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div><label className={lab}>설명 (한국어)</label><textarea className={ta} rows={2} value={d.description_ko} onChange={e=>upD(i,"description_ko",e.target.value)} /></div>
                        <div><label className={lab}>Description (EN)</label><textarea className={ta} rows={2} value={d.description_en} onChange={e=>upD(i,"description_en",e.target.value)} /></div>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => up("drawings", [...form.drawings, {fig_no:form.drawings.length+1,title_ko:"",title_en:"",type:"flowchart",description_ko:"",description_en:""}])} className="w-full mt-4 py-3 rounded-2xl border border-dashed border-indigo-800/50 text-indigo-500 hover:text-indigo-300 hover:border-indigo-600/60 text-sm font-medium transition-all">
                  + 도면 추가
                </button>
              </div>
            )}

            {/* ── Step 5: 요약서 ────────────────────────────── */}
            {step === 5 && (
              <div className="space-y-5">
                <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">📝 요약서</h2>
                <div><label className={lab}>요약 (한국어)</label><textarea className={ta} rows={5} placeholder="본 발명은 [핵심 기술]에 관한 것으로, [효과 1], [효과 2]를 제공한다." value={form.abstract_ko} onChange={e=>up("abstract_ko",e.target.value)} /></div>
                <div><label className={lab}>Abstract (English)</label><textarea className={ta} rows={5} placeholder="The present invention relates to [technology], providing [effect 1] and [effect 2]." value={form.abstract_en} onChange={e=>up("abstract_en",e.target.value)} /></div>
                {error && (
                  <div className="glass rounded-xl p-4 border border-red-800/50 text-red-400 text-sm flex items-center gap-2">
                    <span>⚠</span> {error}
                  </div>
                )}
              </div>
            )}

            {/* 버튼 영역 */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-indigo-900/30">
              <button onClick={() => setStep(s => Math.max(0, s-1))} disabled={step === 0} className="btn-outline px-6 py-3 rounded-xl text-sm font-semibold disabled:opacity-30">
                ← 이전
              </button>
              {step < STEPS.length - 1 ? (
                <button onClick={() => setStep(s => Math.min(STEPS.length-1, s+1))} className="btn-glow text-white px-8 py-3 rounded-xl text-sm font-bold">
                  다음 →
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={loading} className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-10 py-3 rounded-xl text-sm font-bold disabled:opacity-50 shadow-lg shadow-emerald-900/30 hover:shadow-emerald-900/50 transition-all">
                  {loading ? "저장 중..." : "✓ 프로젝트 저장"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
