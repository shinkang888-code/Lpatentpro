"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface Patent {
  id: number;
  title_ko: string;
  title_en: string;
  applicant: string;
  ipc_codes: string[];
  status: string;
  office: string;
  input_json: {
    meta?: { applicant_ko?: string; applicant_en?: string; inventor?: string; ipc_codes?: string[]; filing_date?: string };
    invention?: { title_ko?: string; title_en?: string; technical_field_ko?: string; technical_field_en?: string; problem_statement?: string[]; effects?: string[]; components?: Array<{ ref_num: string; name_ko: string; name_en: string; description_ko: string; key_feature: string }> };
    claims?: Array<{ claim_no: number; type: string; preamble_ko: string; elements_ko: string[]; closing_ko: string }>;
    drawings?: Array<{ fig_no: number; title_ko: string; type: string }>;
    abstract_ko?: string;
    abstract_en?: string;
  };
  created_at: string;
}

export default function PatentDetailPage() {
  const { id } = useParams();
  const [patent, setPatent] = useState<Patent | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetch(`/api/patents/${id}`)
      .then((r) => r.json())
      .then((d) => setPatent(d.patent))
      .catch(() => setPatent(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDownloadJson = () => {
    if (!patent) return;
    const blob = new Blob([JSON.stringify(patent.input_json, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${patent.title_ko}_input.json`;
    a.click();
  };

  if (loading) return <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center text-slate-500">불러오는 중...</div>;
  if (!patent) return <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center text-slate-500">특허를 찾을 수 없습니다.</div>;

  const inv = patent.input_json?.invention;
  const meta = patent.input_json?.meta;
  const claims = patent.input_json?.claims ?? [];
  const drawings = patent.input_json?.drawings ?? [];

  const TABS = [
    { id: "overview", label: "개요" },
    { id: "components", label: "구성요소" },
    { id: "claims", label: "청구항" },
    { id: "drawings", label: "도면" },
    { id: "abstract", label: "요약" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1e]">
      <nav className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">LP</div>
          <span className="font-semibold text-white">LPatentPro</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-slate-400 hover:text-white text-sm">← 대시보드</Link>
          <button onClick={handleDownloadJson} className="bg-emerald-700 hover:bg-emerald-600 text-white text-sm px-4 py-2 rounded-lg transition-colors font-medium">
            JSON 다운로드
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* 헤더 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="bg-indigo-950 border border-indigo-800 text-indigo-300 text-xs px-3 py-1 rounded-full font-medium">
                  {patent.office === "both" ? "KIPO + USPTO" : patent.office}
                </span>
                {(meta?.ipc_codes ?? []).map((c) => (
                  <span key={c} className="text-xs text-slate-500 font-mono bg-slate-800 px-2 py-0.5 rounded">{c}</span>
                ))}
              </div>
              <h1 className="text-xl font-bold text-white mb-1">{patent.title_ko}</h1>
              <p className="text-slate-400 text-sm">{patent.title_en}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-slate-600 text-xs mb-0.5">출원인</div>
              <div className="text-slate-300">{meta?.applicant_ko ?? patent.applicant}</div>
            </div>
            <div>
              <div className="text-slate-600 text-xs mb-0.5">발명자</div>
              <div className="text-slate-300">{meta?.inventor ?? "-"}</div>
            </div>
            <div>
              <div className="text-slate-600 text-xs mb-0.5">저장일</div>
              <div className="text-slate-300">{new Date(patent.created_at).toLocaleDateString("ko-KR")}</div>
            </div>
          </div>
        </div>

        {/* 탭 */}
        <div className="flex gap-2 mb-6 border-b border-slate-800 pb-0">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === t.id ? "border-indigo-500 text-indigo-400" : "border-transparent text-slate-500 hover:text-slate-300"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* 탭 콘텐츠 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">기술분야</h3>
                <p className="text-slate-300 text-sm leading-relaxed">{inv?.technical_field_ko}</p>
              </div>
              <div>
                <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">기존 기술의 문제점</h3>
                <ul className="space-y-1">
                  {(inv?.problem_statement ?? []).map((p, i) => (
                    <li key={i} className="flex gap-2 text-sm text-slate-300">
                      <span className="text-slate-600 mt-0.5">•</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">발명의 효과</h3>
                <ul className="space-y-1">
                  {(inv?.effects ?? []).map((e, i) => (
                    <li key={i} className="flex gap-2 text-sm text-slate-300">
                      <span className="text-emerald-600 mt-0.5">✓</span>
                      <span>{e}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === "components" && (
            <div className="space-y-4">
              {(inv?.components ?? []).map((c) => (
                <div key={c.ref_num} className="border border-slate-700 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="font-mono text-indigo-400 text-sm bg-indigo-950 px-2 py-0.5 rounded">({c.ref_num})</span>
                    <span className="font-semibold text-white text-sm">{c.name_ko}</span>
                    <span className="text-slate-500 text-xs">{c.name_en}</span>
                  </div>
                  {c.key_feature && (
                    <div className="bg-slate-800 rounded-lg p-3 mb-3">
                      <span className="text-xs text-slate-500">핵심 기술: </span>
                      <span className="text-xs text-slate-300">{c.key_feature}</span>
                    </div>
                  )}
                  <p className="text-sm text-slate-400 leading-relaxed">{c.description_ko}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "claims" && (
            <div className="space-y-4">
              {claims.map((c) => (
                <div key={c.claim_no} className="border border-slate-700 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-indigo-900 text-indigo-300 text-xs px-2 py-0.5 rounded font-medium">청구항 {c.claim_no}</span>
                    <span className="text-slate-600 text-xs">{c.type === "independent_system" ? "독립항(시스템)" : c.type === "independent_method" ? "독립항(방법)" : "종속항"}</span>
                  </div>
                  <p className="text-sm text-slate-400 mb-2">{c.preamble_ko}</p>
                  <ul className="space-y-1 mb-2">
                    {c.elements_ko.map((el, i) => (
                      <li key={i} className="text-sm text-slate-300 pl-4 border-l border-slate-700">{el}</li>
                    ))}
                  </ul>
                  <p className="text-sm text-slate-500">{c.closing_ko}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "drawings" && (
            <div className="space-y-3">
              {drawings.map((d) => (
                <div key={d.fig_no} className="flex items-center gap-4 border border-slate-700 rounded-xl p-4">
                  <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 text-sm font-bold">
                    {d.fig_no}
                  </div>
                  <div>
                    <div className="font-medium text-white text-sm mb-0.5">도 {d.fig_no} — {d.title_ko}</div>
                    <div className="text-slate-500 text-xs">{d.type === "block_diagram" ? "블록 다이어그램" : d.type === "flowchart" ? "흐름도" : "시퀀스 다이어그램"}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "abstract" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">요약 (한국어)</h3>
                <p className="text-slate-300 text-sm leading-relaxed bg-slate-800 rounded-xl p-4">{patent.input_json.abstract_ko}</p>
              </div>
              <div>
                <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Abstract (English)</h3>
                <p className="text-slate-300 text-sm leading-relaxed bg-slate-800 rounded-xl p-4">{patent.input_json.abstract_en}</p>
              </div>
            </div>
          )}
        </div>

        {/* 다운로드 안내 */}
        <div className="mt-6 bg-indigo-950/50 border border-indigo-900 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-indigo-300 mb-2">Word 파일 생성 방법</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-3">
            JSON 다운로드 후 로컬 Python 자동화 스크립트로 KIPO/USPTO Word 완성본을 생성합니다.
          </p>
          <code className="block bg-slate-900 rounded-lg px-4 py-3 text-xs text-emerald-400 font-mono">
            python main.py --input [다운로드한_JSON파일.json]
          </code>
        </div>
      </div>
    </div>
  );
}
