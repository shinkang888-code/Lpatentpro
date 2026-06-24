"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Nav from "../../components/Nav";

interface Patent {
  id: number; title_ko: string; title_en: string; applicant: string;
  ipc_codes: string[]; status: string; office: string; created_at: string;
  input_json: {
    meta?: { applicant_ko?: string; applicant_en?: string; inventor?: string; ipc_codes?: string[]; filing_date?: string };
    invention?: { title_ko?: string; technical_field_ko?: string; problem_statement?: string[]; effects?: string[]; components?: Array<{ ref_num: string; name_ko: string; name_en: string; description_ko: string; key_feature: string }> };
    claims?: Array<{ claim_no: number; type: string; preamble_ko: string; elements_ko: string[]; closing_ko: string }>;
    drawings?: Array<{ fig_no: number; title_ko: string; type: string }>;
    abstract_ko?: string; abstract_en?: string;
  };
}

const TABS = [
  { id: "overview", label: "개요", icon: "📋" },
  { id: "components", label: "구성요소", icon: "⚙️" },
  { id: "claims", label: "청구항", icon: "📜" },
  { id: "drawings", label: "도면", icon: "🖼" },
  { id: "abstract", label: "요약", icon: "📝" },
];

const TYPE_LABEL: Record<string, string> = {
  block_diagram: "블록 다이어그램",
  flowchart: "흐름도",
  sequence: "시퀀스 다이어그램",
};

export default function PatentDetailPage() {
  const { id } = useParams();
  const [patent, setPatent] = useState<Patent | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    fetch(`/api/patents/${id}`).then(r=>r.json()).then(d=>setPatent(d.patent)).catch(()=>setPatent(null)).finally(()=>setLoading(false));
  }, [id]);

  const handleDownload = () => {
    if (!patent) return;
    const blob = new Blob([JSON.stringify(patent.input_json, null, 2)], { type: "application/json" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `${patent.title_ko}_input.json` });
    a.click();
  };

  if (loading) return (
    <div className="min-h-screen bg-[#04071a] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 text-sm">불러오는 중...</p>
      </div>
    </div>
  );

  if (!patent) return (
    <div className="min-h-screen bg-[#04071a] flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4">😕</div>
        <p className="text-white font-bold mb-2">특허를 찾을 수 없습니다</p>
        <Link href="/dashboard" className="text-indigo-400 text-sm hover:text-indigo-300">← 대시보드로 돌아가기</Link>
      </div>
    </div>
  );

  const inv = patent.input_json?.invention;
  const meta = patent.input_json?.meta;
  const claims = patent.input_json?.claims ?? [];
  const drawings = patent.input_json?.drawings ?? [];

  return (
    <div className="min-h-screen bg-[#04071a]">
      <Nav />

      {/* 배경 */}
      <div className="fixed inset-0 pointer-events-none -z-0 overflow-hidden">
        <div className="absolute top-32 right-10 w-80 h-80 bg-indigo-600/6 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-24 pb-24 md:pb-10">
        {/* 브레드크럼 */}
        <div className="flex items-center gap-2 text-sm text-slate-600 mb-6">
          <Link href="/dashboard" className="hover:text-slate-400 transition-colors">대시보드</Link>
          <span>/</span>
          <span className="text-slate-400 truncate max-w-[200px]">{patent.title_ko}</span>
        </div>

        {/* 헤더 카드 */}
        <div className="glass rounded-3xl p-6 sm:p-8 mb-6 border border-indigo-900/30">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="badge">{patent.office === "both" ? "KIPO + USPTO" : patent.office}</span>
                {(meta?.ipc_codes ?? []).map(c => (
                  <span key={c} className="text-[11px] font-mono text-slate-600 bg-slate-800/80 px-2 py-0.5 rounded">{c}</span>
                ))}
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white mb-1 leading-tight">{patent.title_ko}</h1>
              <p className="text-slate-500 text-sm mb-5 leading-relaxed">{patent.title_en}</p>
              <div className="grid grid-cols-3 gap-4 text-xs">
                {[
                  { label: "출원인", val: meta?.applicant_ko ?? patent.applicant },
                  { label: "발명자", val: meta?.inventor ?? "-" },
                  { label: "저장일", val: new Date(patent.created_at).toLocaleDateString("ko-KR") },
                ].map(item => (
                  <div key={item.label}>
                    <div className="text-slate-600 mb-0.5">{item.label}</div>
                    <div className="text-slate-300 font-medium truncate">{item.val}</div>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={handleDownload} className="btn-glow text-white text-sm font-bold px-5 py-2.5 rounded-xl whitespace-nowrap flex items-center gap-2">
              <span>↓</span> JSON 다운로드
            </button>
          </div>
        </div>

        {/* 탭 */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-1 scrollbar-none">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${tab === t.id ? "bg-indigo-600/20 text-indigo-300 border border-indigo-600/30" : "text-slate-500 hover:text-slate-300 hover:bg-white/5"}`}>
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        {/* 탭 콘텐츠 */}
        <div className="glass rounded-3xl border border-indigo-900/30 overflow-hidden">
          {tab === "overview" && (
            <div className="p-6 sm:p-8 space-y-8">
              <Section title="기술분야">
                <p className="text-slate-300 text-sm leading-relaxed">{inv?.technical_field_ko || "—"}</p>
              </Section>
              <Section title="기존 기술의 문제점">
                <ul className="space-y-2">
                  {(inv?.problem_statement ?? []).map((item, i) => (
                    <li key={i} className="flex gap-3 text-sm text-slate-300">
                      <span className="text-indigo-500 mt-0.5 flex-shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Section>
              <Section title="발명의 효과">
                <ul className="space-y-2">
                  {(inv?.effects ?? []).map((item, i) => (
                    <li key={i} className="flex gap-3 text-sm text-slate-300">
                      <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            </div>
          )}

          {tab === "components" && (
            <div className="p-6 sm:p-8 space-y-4">
              {(inv?.components ?? []).map(c => (
                <div key={c.ref_num} className="glass-strong rounded-2xl p-5 border border-indigo-900/20">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="font-mono text-indigo-400 text-sm bg-indigo-950/60 px-2.5 py-0.5 rounded-lg border border-indigo-900/40">({c.ref_num})</span>
                    <span className="font-bold text-white text-sm">{c.name_ko}</span>
                    <span className="text-slate-500 text-xs hidden sm:block">{c.name_en}</span>
                  </div>
                  {c.key_feature && (
                    <div className="bg-indigo-950/30 border border-indigo-900/30 rounded-xl p-3 mb-3 flex gap-2">
                      <span className="text-indigo-500 text-xs font-semibold flex-shrink-0">핵심:</span>
                      <span className="text-indigo-300 text-xs">{c.key_feature}</span>
                    </div>
                  )}
                  <p className="text-sm text-slate-400 leading-relaxed">{c.description_ko}</p>
                </div>
              ))}
            </div>
          )}

          {tab === "claims" && (
            <div className="p-6 sm:p-8 space-y-4">
              {claims.map(c => (
                <div key={c.claim_no} className="glass-strong rounded-2xl p-5 border border-indigo-900/20">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="badge">청구항 {c.claim_no}</span>
                    <span className="text-slate-600 text-xs">{c.type === "independent_system" ? "독립항(시스템)" : c.type === "independent_method" ? "독립항(방법)" : "종속항"}</span>
                  </div>
                  <p className="text-slate-500 text-sm mb-3 italic">{c.preamble_ko}</p>
                  <ul className="space-y-2 mb-3 pl-1">
                    {c.elements_ko.map((el, i) => (
                      <li key={i} className="flex gap-2 text-sm text-slate-300">
                        <span className="text-indigo-600 flex-shrink-0 mt-0.5">▸</span>
                        <span>{el}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-slate-600 text-xs italic">{c.closing_ko}</p>
                </div>
              ))}
            </div>
          )}

          {tab === "drawings" && (
            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {drawings.map(d => (
                  <div key={d.fig_no} className="glass-strong rounded-2xl p-5 border border-indigo-900/20 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-950/60 border border-indigo-900/40 flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl font-black gradient-text">{d.fig_no}</span>
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm mb-0.5">도 {d.fig_no} — {d.title_ko}</div>
                      <div className="text-xs text-slate-500">{TYPE_LABEL[d.type] ?? d.type}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "abstract" && (
            <div className="p-6 sm:p-8 space-y-6">
              <Section title="요약 (한국어)">
                <div className="glass-strong rounded-2xl p-5 border border-indigo-900/20">
                  <p className="text-slate-300 text-sm leading-relaxed">{patent.input_json.abstract_ko || "—"}</p>
                </div>
              </Section>
              <Section title="Abstract (English)">
                <div className="glass-strong rounded-2xl p-5 border border-indigo-900/20">
                  <p className="text-slate-300 text-sm leading-relaxed">{patent.input_json.abstract_en || "—"}</p>
                </div>
              </Section>
            </div>
          )}
        </div>

        {/* Word 생성 가이드 */}
        <div className="mt-6 glass rounded-2xl p-5 border border-indigo-900/30">
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">⚡</span>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white text-sm mb-1">Word 완성본 생성</h3>
              <p className="text-slate-500 text-xs mb-3 leading-relaxed">JSON 다운로드 후 로컬 Python 스크립트로 KIPO/USPTO Word 파일을 생성합니다.</p>
              <div className="bg-[#04071a] rounded-xl px-4 py-3 font-mono text-xs text-emerald-400 overflow-x-auto">
                python patent_auto/main.py --input [JSON파일].json
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">{title}</h3>
      {children}
    </div>
  );
}
