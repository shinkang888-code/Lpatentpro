"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import Nav from "../components/Nav";

// ── 타입 ──────────────────────────────────────────────────────
type Office = "KIPO" | "USPTO" | "both";
type Phase = "upload" | "generating" | "done";

interface StatusMsg { step: string | number; message: string; progress: number; }
interface SectionMsg { key: string; label: string; data: Record<string, unknown>; }
interface PatentJson { meta: unknown; invention: Record<string, unknown>; claims: unknown[]; drawings: unknown[]; abstract_ko: string; abstract_en: string; }

// ── 섹션 렌더러 ───────────────────────────────────────────────
function SectionCard({ label, sectionKey, data }: { label: string; sectionKey: string; data: Record<string, unknown> }) {
  const [open, setOpen] = useState(true);

  const renderContent = () => {
    switch (sectionKey) {
      case "title":
        return (
          <div className="space-y-2">
            <div><span className="text-xs text-slate-500 uppercase tracking-wider">한국어</span><p className="text-white font-semibold mt-1">{String(data.title_ko ?? "")}</p></div>
            <div><span className="text-xs text-slate-500 uppercase tracking-wider">English</span><p className="text-slate-300 font-mono text-sm mt-1">{String(data.title_en ?? "")}</p></div>
          </div>
        );
      case "meta":
        return (
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[["출원인", String(data.applicant_ko || "미입력")], ["Applicant", String(data.applicant_en || "—")], ["발명자", String(data.inventor || "미입력")], ["IPC 분류", (data.ipc_codes as string[] ?? []).join(", ")]].map(([k, v]) => (
              <div key={k}><span className="text-slate-500 text-xs">{k}</span><p className="text-slate-300 mt-0.5">{v}</p></div>
            ))}
          </div>
        );
      case "field":
        return <p className="text-slate-300 text-sm leading-relaxed">{String(data.technical_field_ko ?? "")}</p>;
      case "problems":
        return (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">해결 과제</p>
              <ul className="space-y-1">{(data.problem_statement as string[] ?? []).map((p, i) => <li key={i} className="flex gap-2 text-sm text-slate-300"><span className="text-red-500 flex-shrink-0">•</span>{p}</li>)}</ul>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">발명의 효과</p>
              <ul className="space-y-1">{(data.effects as string[] ?? []).map((e, i) => <li key={i} className="flex gap-2 text-sm text-slate-300"><span className="text-emerald-500 flex-shrink-0">✓</span>{e}</li>)}</ul>
            </div>
          </div>
        );
      case "components":
        return (
          <div className="space-y-3">
            {(data.components as Array<Record<string,string>> ?? []).map((c) => (
              <div key={c.ref_num} className="bg-[#04071a]/60 rounded-xl p-3 border border-indigo-900/20">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-mono text-indigo-400 text-xs bg-indigo-950/60 px-1.5 py-0.5 rounded">({c.ref_num})</span>
                  <span className="font-semibold text-white text-sm">{c.name_ko}</span>
                </div>
                {c.key_feature && <div className="text-xs text-indigo-300/70 mb-1">핵심: {c.key_feature}</div>}
                <p className="text-xs text-slate-400 leading-relaxed">{c.description_ko}</p>
              </div>
            ))}
          </div>
        );
      case "claims":
        return (
          <div className="space-y-3">
            {(data.claims as Array<Record<string, unknown>> ?? []).map((c) => (
              <div key={String(c.claim_no)} className="bg-[#04071a]/60 rounded-xl p-3 border border-indigo-900/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="badge text-[10px]">청구항 {String(c.claim_no)}</span>
                  <span className="text-slate-600 text-xs">{String(c.type) === "independent_system" ? "독립항(시스템)" : "종속항"}</span>
                </div>
                <p className="text-slate-500 text-xs mb-2 italic">{String(c.preamble_ko)}</p>
                <ul className="space-y-1">
                  {(c.elements_ko as string[] ?? []).map((el, i) => (
                    <li key={i} className="flex gap-2 text-xs text-slate-300"><span className="text-indigo-600 flex-shrink-0">▸</span>{el}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        );
      case "drawings":
        return (
          <div className="grid grid-cols-2 gap-2">
            {(data.drawings as Array<Record<string,unknown>> ?? []).map((d) => (
              <div key={String(d.fig_no)} className="bg-[#04071a]/60 rounded-xl p-3 border border-indigo-900/20 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-950/60 border border-indigo-900/40 flex items-center justify-center text-indigo-400 font-black text-sm">{String(d.fig_no)}</div>
                <div><div className="text-white text-xs font-semibold">도 {String(d.fig_no)}</div><div className="text-slate-500 text-[10px]">{String(d.title_ko)}</div></div>
              </div>
            ))}
          </div>
        );
      case "abstract":
        return (
          <div className="space-y-3">
            <div className="bg-[#04071a]/60 rounded-xl p-3 border border-indigo-900/20"><p className="text-xs text-slate-500 mb-1">한국어</p><p className="text-sm text-slate-300 leading-relaxed">{String(data.abstract_ko ?? "")}</p></div>
            <div className="bg-[#04071a]/60 rounded-xl p-3 border border-indigo-900/20"><p className="text-xs text-slate-500 mb-1">English</p><p className="text-sm text-slate-300 leading-relaxed">{String(data.abstract_en ?? "")}</p></div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="animate-fade-up glass rounded-2xl border border-indigo-900/30 overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/2 transition-colors text-left">
        <span className="font-semibold text-white text-sm flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-emerald-600/30 border border-emerald-600/40 flex items-center justify-center text-emerald-400 text-[10px]">✓</span>
          {label}
        </span>
        <span className="text-slate-600 text-xs">{open ? "▲" : "▼"}</span>
      </button>
      {open && <div className="px-5 pb-5 border-t border-indigo-900/20 pt-4">{renderContent()}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
export default function GeneratePage() {
  const [phase, setPhase] = useState<Phase>("upload");
  const [office, setOffice] = useState<Office>("both");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [inputMode, setInputMode] = useState<"file" | "text">("file");
  const [extractedText, setExtractedText] = useState("");
  const [filename, setFilename] = useState("");
  const [statusLog, setStatusLog] = useState<StatusMsg[]>([]);
  const [sections, setSections] = useState<SectionMsg[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentMsg, setCurrentMsg] = useState("");
  const [finalPatent, setFinalPatent] = useState<PatentJson | null>(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

  // ── 파일 업로드 처리 ──────────────────────────────────────
  const handleFileSelect = useCallback(async (file: File) => {
    setUploadedFile(file);
    setFilename(file.name);
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setExtractedText(data.text);
    } catch (e) {
      setError(e instanceof Error ? e.message : "업로드 실패");
      setUploadedFile(null);
    } finally {
      setUploading(false);
    }
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  // ── AI 생성 시작 ──────────────────────────────────────────
  const startGeneration = async () => {
    const sourceText = inputMode === "text" ? pastedText : extractedText;
    if (!sourceText.trim()) { setError("발명 내용을 입력하거나 파일을 업로드하세요."); return; }

    setPhase("generating");
    setStatusLog([]); setSections([]); setProgress(0);
    setCurrentMsg("🔄 시작하는 중...");
    scrollToBottom();

    try {
      const res = await fetch("/api/generate-patent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: sourceText, office, filename: filename || "직접입력" }),
      });

      if (!res.body) throw new Error("스트림 없음");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          const line = part.replace(/^data: /, "").trim();
          if (!line) continue;
          try {
            const msg = JSON.parse(line);
            if (msg.type === "status") {
              const s = msg.data as StatusMsg;
              setCurrentMsg(s.message);
              setProgress(s.progress);
              setStatusLog(prev => [...prev, s]);
              scrollToBottom();
            } else if (msg.type === "section") {
              setSections(prev => [...prev, msg.data as SectionMsg]);
              scrollToBottom();
            } else if (msg.type === "complete") {
              setFinalPatent(msg.data.patent as PatentJson);
              setPhase("done");
              scrollToBottom();
            } else if (msg.type === "error") {
              setError(String(msg.data));
              setPhase("upload");
            }
          } catch { /* 파싱 오류 무시 */ }
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "생성 오류");
      setPhase("upload");
    }
  };

  // ── JSON 다운로드 ─────────────────────────────────────────
  const downloadJson = () => {
    if (!finalPatent) return;
    const blob = new Blob([JSON.stringify(finalPatent, null, 2)], { type: "application/json" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `${String((finalPatent.invention as Record<string, unknown>)?.title_ko ?? "patent")}_input.json` });
    a.click();
  };

  // ── 다시 시작 ────────────────────────────────────────────
  const reset = () => {
    setPhase("upload"); setUploadedFile(null); setExtractedText(""); setPastedText("");
    setFilename(""); setSections([]); setStatusLog([]); setFinalPatent(null); setError(""); setProgress(0);
  };

  const ACCEPT = ".txt,.md,.markdown,.docx";
  const canGenerate = (inputMode === "file" && extractedText) || (inputMode === "text" && pastedText.trim().length > 50);

  return (
    <div className="min-h-screen bg-[#04071a]">
      <Nav />

      {/* 배경 오브 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-0">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-indigo-600/8 rounded-full blur-3xl animate-orb-drift" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/6 rounded-full blur-3xl animate-orb-drift-2" />
        <div className="grid-pattern absolute inset-0 opacity-20" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 pt-20 pb-24 md:pb-10">

        {/* ══ PHASE: UPLOAD ══════════════════════════════════════ */}
        {phase === "upload" && (
          <div className="space-y-6">
            {/* 헤더 */}
            <div className="text-center pt-8 pb-2">
              <div className="badge mx-auto mb-6">AI 특허 명세서 생성</div>
              <h1 className="text-3xl sm:text-4xl font-black text-white mb-3 leading-tight">
                발명 문서를 업로드하면<br />
                <span className="gradient-text">AI가 특허 명세서를 완성합니다</span>
              </h1>
              <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
                Markdown, TXT, Word(.docx) 파일을 업로드하거나 발명 내용을 텍스트로 붙여넣으세요.
                AI가 KIPO · USPTO 양식에 맞는 명세서를 자동으로 생성합니다.
              </p>
            </div>

            {/* 입력 모드 토글 */}
            <div className="flex bg-slate-900/80 rounded-2xl p-1 gap-1 border border-indigo-900/30">
              <button onClick={() => setInputMode("file")} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${inputMode === "file" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/40" : "text-slate-500 hover:text-slate-300"}`}>
                📂 파일 업로드
              </button>
              <button onClick={() => setInputMode("text")} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${inputMode === "text" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/40" : "text-slate-500 hover:text-slate-300"}`}>
                ✏️ 텍스트 직접 입력
              </button>
            </div>

            {/* 파일 업로드 영역 */}
            {inputMode === "file" && (
              <div
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative glass rounded-3xl border-2 border-dashed transition-all cursor-pointer group overflow-hidden ${isDragging ? "border-indigo-500 bg-indigo-950/20" : "border-indigo-900/40 hover:border-indigo-700/60"}`}
              >
                <input ref={fileInputRef} type="file" accept={ACCEPT} className="sr-only" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }} />

                {/* 배경 그라디언트 */}
                <div className={`absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-blue-600/5 transition-opacity ${isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`} />

                <div className="relative z-10 py-14 sm:py-20 text-center px-6">
                  {uploading ? (
                    <div className="space-y-4">
                      <div className="w-16 h-16 mx-auto border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-indigo-300 font-semibold">파일 분석 중...</p>
                    </div>
                  ) : uploadedFile ? (
                    <div className="space-y-3">
                      <div className="w-16 h-16 mx-auto bg-emerald-900/40 border border-emerald-700/40 rounded-2xl flex items-center justify-center text-3xl">📄</div>
                      <p className="text-emerald-400 font-bold">{uploadedFile.name}</p>
                      <p className="text-slate-500 text-sm">{Math.round(extractedText.length / 100) / 10}K 글자 추출 완료</p>
                      <button onClick={e => { e.stopPropagation(); reset(); }} className="text-xs text-slate-600 hover:text-slate-400 underline transition-colors">다른 파일 선택</button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-16 h-16 mx-auto bg-indigo-900/30 border border-indigo-800/40 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-105 transition-transform">
                        {isDragging ? "📂" : "⬆"}
                      </div>
                      <div>
                        <p className="text-white font-bold text-lg mb-1">{isDragging ? "파일을 여기에 놓으세요" : "파일을 드래그하거나 클릭하여 선택"}</p>
                        <p className="text-slate-500 text-sm">지원 형식: <span className="font-mono text-indigo-400">.txt  .md  .docx</span></p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 텍스트 직접 입력 */}
            {inputMode === "text" && (
              <div className="glass rounded-3xl border border-indigo-900/30 overflow-hidden">
                <div className="px-4 py-3 border-b border-indigo-900/20 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                  <span className="text-slate-600 text-xs ml-2">발명 내용 입력</span>
                </div>
                <textarea
                  className="w-full bg-transparent text-slate-300 text-sm leading-relaxed px-5 py-4 focus:outline-none resize-none placeholder-slate-600 font-mono"
                  rows={14}
                  placeholder={`# 발명의 명칭: AI 기반 통합 워크스페이스 시스템\n\n## 기술분야\n본 발명은 클라우드 기반 AI 소프트웨어에 관한 것으로...\n\n## 기존 기술의 문제점\n- 단일 소스코드로 여러 플랫폼 지원 불가\n- AI 추론 연산 오버헤드가 너무 큼\n\n## 발명의 효과\n- 4개 플랫폼 자동 분기 가능\n- AI 연산 비용 절감\n\n## 구성요소\n(110) 크로스플랫폼 렌더링부: 전역 객체를 평가하여 환경 분기...\n(200) AI 커널: 온톨로지 기반 하이브리드 검색...`}
                  value={pastedText}
                  onChange={e => setPastedText(e.target.value)}
                />
                <div className="px-5 py-2 border-t border-indigo-900/20 text-xs text-slate-600 text-right">
                  {pastedText.length}자 {pastedText.length < 50 && <span className="text-yellow-600">(최소 50자 이상 입력하세요)</span>}
                </div>
              </div>
            )}

            {error && (
              <div className="glass rounded-2xl p-4 border border-red-800/40 text-red-400 text-sm flex items-center gap-2">
                <span className="text-lg">⚠</span> {error}
              </div>
            )}

            {/* 출원 대상 선택 */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">출원 대상 국가</p>
              <div className="grid grid-cols-3 gap-3">
                {(["KIPO", "USPTO", "both"] as Office[]).map(o => (
                  <button key={o} onClick={() => setOffice(o)} className={`py-3 rounded-xl border text-sm font-bold transition-all ${office === o ? "btn-glow text-white" : "btn-outline"}`}>
                    {o === "both" ? "🌏 KR + US" : o === "KIPO" ? "🇰🇷 KIPO" : "🇺🇸 USPTO"}
                  </button>
                ))}
              </div>
            </div>

            {/* 생성 버튼 */}
            <button
              onClick={startGeneration}
              disabled={!canGenerate}
              className="w-full btn-glow text-white font-black text-lg py-5 rounded-2xl disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
            >
              <span className="text-xl">⚡</span>
              AI 특허 명세서 생성하기
              <span className="text-indigo-300 text-sm">→</span>
            </button>

            <div className="flex items-center justify-center gap-4 text-xs text-slate-600">
              {["KIPO 특허법 제42조 준수", "37 CFR 1.77 준수", "Word 다운로드 제공"].map(t => (
                <span key={t} className="flex items-center gap-1"><span className="text-emerald-600">✓</span>{t}</span>
              ))}
            </div>
          </div>
        )}

        {/* ══ PHASE: GENERATING ══════════════════════════════════ */}
        {phase === "generating" && (
          <div className="space-y-4 pt-8">
            {/* 상태 헤더 */}
            <div className="glass rounded-3xl p-6 border border-indigo-900/30 sticky top-20 z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <div>
                    <p className="text-white font-semibold text-sm">AI 특허 명세서 생성 중</p>
                    <p className="text-slate-500 text-xs mt-0.5">{currentMsg}</p>
                  </div>
                </div>
                <span className="text-2xl font-black gradient-text">{progress}%</span>
              </div>
              <div className="h-2 bg-slate-800/80 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-600 to-blue-500 rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {/* 채팅 메시지 스트림 */}
            <div className="space-y-3">
              {/* 상태 로그 */}
              {statusLog.map((s, i) => (
                <div key={i} className="flex items-center gap-3 px-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600/30 border border-emerald-600/40 flex items-center justify-center text-emerald-400 text-[10px] flex-shrink-0">✓</span>
                  <span className="text-slate-400 text-sm">{s.message}</span>
                </div>
              ))}

              {/* 생성된 섹션 카드들 */}
              {sections.map(sec => (
                <SectionCard key={sec.key} label={sec.label} sectionKey={sec.key} data={sec.data} />
              ))}

              {/* 타이핑 인디케이터 */}
              {sections.length < 8 && (
                <div className="flex items-center gap-3 px-2">
                  <div className="w-5 h-5 rounded-full bg-indigo-600/30 border border-indigo-600/40 flex items-center justify-center flex-shrink-0">
                    <div className="flex gap-0.5">
                      {[0,1,2].map(i => <div key={i} className="w-1 h-1 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
                    </div>
                  </div>
                  <span className="text-slate-600 text-sm italic">AI가 작성 중...</span>
                </div>
              )}
            </div>
            <div ref={chatEndRef} />
          </div>
        )}

        {/* ══ PHASE: DONE ════════════════════════════════════════ */}
        {phase === "done" && finalPatent && (
          <div className="space-y-5 pt-8">
            {/* 완료 배너 */}
            <div className="glass rounded-3xl p-6 border border-emerald-900/40 bg-emerald-950/10 text-center">
              <div className="text-5xl mb-3">✅</div>
              <h2 className="text-2xl font-black text-white mb-1">특허 명세서 생성 완료!</h2>
              <p className="text-slate-400 text-sm">KIPO · USPTO 양식에 맞는 명세서가 생성되었습니다.</p>
            </div>

            {/* 다운로드 버튼 */}
            <div className="glass rounded-3xl p-5 border border-indigo-900/30">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">다운로드</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button onClick={downloadJson} className="btn-glow text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2">
                  <span>↓</span> JSON 다운로드
                </button>
                <div className="glass-strong rounded-xl py-3.5 border border-slate-700/30 text-center flex items-center justify-center gap-2 text-slate-500 text-sm">
                  <span>📄</span>
                  <div className="text-left">
                    <div className="text-xs font-semibold text-slate-400">KIPO Word</div>
                    <div className="text-[10px]">로컬 스크립트 사용</div>
                  </div>
                </div>
                <div className="glass-strong rounded-xl py-3.5 border border-slate-700/30 text-center flex items-center justify-center gap-2 text-slate-500 text-sm">
                  <span>📄</span>
                  <div className="text-left">
                    <div className="text-xs font-semibold text-slate-400">USPTO Word</div>
                    <div className="text-[10px]">로컬 스크립트 사용</div>
                  </div>
                </div>
              </div>
              <div className="mt-4 bg-[#04071a]/60 rounded-xl px-4 py-3 font-mono text-xs text-emerald-400">
                python patent_auto/main.py --input [다운로드한_JSON].json
              </div>
            </div>

            {/* 생성된 섹션 전체 */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">생성된 명세서 섹션</p>
              {sections.map(sec => (
                <SectionCard key={sec.key} label={sec.label} sectionKey={sec.key} data={sec.data} />
              ))}
            </div>

            {/* 액션 버튼 */}
            <div className="flex gap-3">
              <button onClick={reset} className="btn-outline flex-1 py-3.5 rounded-xl text-sm font-bold">
                ← 다시 생성
              </button>
              <Link href="/dashboard" className="btn-glow flex-1 py-3.5 rounded-xl text-sm font-bold text-white text-center">
                대시보드 보기
              </Link>
            </div>
            <div ref={chatEndRef} />
          </div>
        )}
      </div>
    </div>
  );
}
