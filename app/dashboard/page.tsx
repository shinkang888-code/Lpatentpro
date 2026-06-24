"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Nav from "../components/Nav";

interface Patent {
  id: number; title_ko: string; title_en: string;
  applicant: string; ipc_codes: string[];
  status: string; office: string; created_at: string;
}

const STATUS = {
  draft:  { label: "초안", cls: "bg-slate-800/80 text-slate-400 border-slate-700/50" },
  ready:  { label: "제출 준비", cls: "bg-emerald-950/80 text-emerald-400 border-emerald-800/50" },
  filed:  { label: "출원 완료", cls: "bg-indigo-950/80 text-indigo-400 border-indigo-800/50" },
};

export default function DashboardPage() {
  const [patents, setPatents] = useState<Patent[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/patents").then(r=>r.json()).then(d=>setPatents(d.patents??[])).catch(()=>setPatents([])).finally(()=>setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("삭제하시겠습니까?")) return;
    setDeleting(id);
    await fetch(`/api/patents/${id}`, { method: "DELETE" });
    setPatents(p => p.filter(x => x.id !== id));
    setDeleting(null);
  };

  return (
    <div className="min-h-screen bg-[#04071a]">
      <Nav />

      {/* 배경 오브 */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-0">
        <div className="absolute top-20 right-20 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-24 pb-24 md:pb-8">
        {/* 페이지 헤더 */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mb-1">특허 프로젝트</h1>
            <p className="text-slate-500 text-sm">
              총 <span className="text-indigo-400 font-semibold">{patents.length}개</span> 프로젝트
            </p>
          </div>
          <Link href="/new" className="btn-glow text-white text-sm font-bold px-5 py-3 rounded-xl hidden sm:flex items-center gap-2">
            <span>+</span> 새 특허
          </Link>
        </div>

        {/* 로딩 */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="glass rounded-2xl p-6 border border-indigo-900/20">
                <div className="shimmer h-4 rounded-lg w-3/4 mb-3 bg-slate-800" />
                <div className="shimmer h-3 rounded-lg w-1/2 mb-5 bg-slate-800" />
                <div className="shimmer h-3 rounded-lg w-full bg-slate-800" />
              </div>
            ))}
          </div>
        )}

        {/* 빈 상태 */}
        {!loading && patents.length === 0 && (
          <div className="glass rounded-3xl p-12 sm:p-20 text-center border border-indigo-900/20">
            <div className="text-6xl mb-6">📄</div>
            <h3 className="text-xl font-bold text-white mb-2">아직 특허 프로젝트가 없습니다</h3>
            <p className="text-slate-500 mb-8 text-sm">첫 번째 특허 프로젝트를 시작해 보세요.</p>
            <Link href="/new" className="btn-glow text-white font-bold px-8 py-3.5 rounded-xl text-sm inline-flex items-center gap-2">
              ⚡ 첫 번째 특허 시작하기
            </Link>
          </div>
        )}

        {/* 특허 목록 */}
        {!loading && patents.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {patents.map(p => {
              const s = STATUS[p.status as keyof typeof STATUS] ?? STATUS.draft;
              return (
                <div key={p.id} className="card-hover glass rounded-2xl border border-indigo-900/20 overflow-hidden group">
                  <div className="p-5">
                    {/* 배지 행 */}
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className={`text-[11px] px-2.5 py-0.5 rounded-full border font-medium ${s.cls}`}>{s.label}</span>
                      <span className="text-[11px] text-indigo-400 bg-indigo-950/60 border border-indigo-900/40 px-2.5 py-0.5 rounded-full font-medium">
                        {p.office === "both" ? "KIPO + USPTO" : p.office}
                      </span>
                    </div>

                    {/* 제목 */}
                    <h3 className="font-bold text-white mb-0.5 leading-snug line-clamp-2">{p.title_ko}</h3>
                    <p className="text-slate-500 text-xs line-clamp-1 mb-3">{p.title_en}</p>

                    {/* IPC */}
                    <div className="flex items-center gap-2 flex-wrap mb-4">
                      {p.ipc_codes?.slice(0,3).map(c => (
                        <span key={c} className="text-[10px] font-mono text-slate-600 bg-slate-800/80 px-2 py-0.5 rounded">{c}</span>
                      ))}
                    </div>

                    {/* 메타 */}
                    <div className="flex items-center justify-between text-xs text-slate-600 pt-3 border-t border-slate-800/60">
                      <span>{p.applicant}</span>
                      <span>{new Date(p.created_at).toLocaleDateString("ko-KR")}</span>
                    </div>
                  </div>

                  {/* 액션 버튼 (호버 시 표시) */}
                  <div className="flex border-t border-slate-800/60 opacity-0 group-hover:opacity-100 transition-all">
                    <Link href={`/patent/${p.id}`} className="flex-1 py-3 text-xs font-semibold text-indigo-400 hover:bg-indigo-950/40 transition-colors text-center">
                      상세 보기 →
                    </Link>
                    <div className="w-px bg-slate-800/60" />
                    <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id} className="flex-1 py-3 text-xs font-semibold text-slate-600 hover:text-red-400 hover:bg-red-950/20 transition-colors disabled:opacity-50">
                      {deleting === p.id ? "삭제 중..." : "삭제"}
                    </button>
                  </div>
                </div>
              );
            })}

            {/* 새 프로젝트 카드 */}
            <Link href="/new" className="card-hover glass rounded-2xl border border-dashed border-indigo-900/40 p-8 flex flex-col items-center justify-center gap-3 text-center min-h-[160px] hover:border-indigo-700/60">
              <div className="w-12 h-12 rounded-2xl bg-indigo-900/40 border border-indigo-800/40 flex items-center justify-center text-2xl">+</div>
              <div>
                <div className="text-white font-semibold text-sm mb-1">새 특허 프로젝트</div>
                <div className="text-slate-600 text-xs">클릭하여 새 특허 작성 시작</div>
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
