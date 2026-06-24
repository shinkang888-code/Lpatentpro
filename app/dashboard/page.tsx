"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Patent {
  id: number;
  title_ko: string;
  title_en: string;
  applicant: string;
  ipc_codes: string[];
  status: string;
  office: string;
  created_at: string;
}

const statusColor: Record<string, string> = {
  draft: "bg-slate-800 text-slate-400",
  ready: "bg-emerald-950 text-emerald-400",
  filed: "bg-indigo-950 text-indigo-400",
};

const statusLabel: Record<string, string> = {
  draft: "초안",
  ready: "제출 준비",
  filed: "출원 완료",
};

export default function DashboardPage() {
  const [patents, setPatents] = useState<Patent[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/patents")
      .then((r) => r.json())
      .then((d) => setPatents(d.patents ?? []))
      .catch(() => setPatents([]))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("이 특허 프로젝트를 삭제하시겠습니까?")) return;
    setDeleting(id);
    await fetch(`/api/patents/${id}`, { method: "DELETE" });
    setPatents((prev) => prev.filter((p) => p.id !== id));
    setDeleting(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e]">
      <nav className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">LP</div>
          <span className="font-semibold text-white">LPatentPro</span>
        </Link>
        <Link href="/new" className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-4 py-2 rounded-lg transition-colors font-medium">
          + 새 특허
        </Link>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">특허 프로젝트</h1>
            <p className="text-slate-500 text-sm">총 {patents.length}개 프로젝트</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-500">불러오는 중...</div>
        ) : patents.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-semibold text-white mb-2">특허 프로젝트가 없습니다</h3>
            <p className="text-slate-500 mb-6">첫 번째 특허 프로젝트를 시작해 보세요.</p>
            <Link href="/new" className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors">
              새 특허 시작 →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {patents.map((p) => (
              <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${statusColor[p.status] ?? statusColor.draft}`}>
                        {statusLabel[p.status] ?? p.status}
                      </span>
                      <span className="text-xs text-slate-600 bg-slate-800 px-2 py-0.5 rounded">
                        {p.office === "both" ? "KIPO + USPTO" : p.office}
                      </span>
                      {p.ipc_codes?.slice(0, 2).map((code) => (
                        <span key={code} className="text-xs text-slate-600 font-mono">{code}</span>
                      ))}
                    </div>
                    <h3 className="font-semibold text-white mb-0.5 truncate">{p.title_ko}</h3>
                    <p className="text-slate-500 text-xs truncate">{p.title_en}</p>
                    <p className="text-slate-600 text-xs mt-1">
                      {p.applicant} · {new Date(p.created_at).toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href={`/patent/${p.id}`} className="text-xs text-indigo-400 hover:text-indigo-300 px-3 py-1.5 border border-indigo-900 rounded-lg transition-colors">
                      상세 보기
                    </Link>
                    <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id} className="text-xs text-red-500 hover:text-red-400 px-3 py-1.5 border border-red-900/50 rounded-lg transition-colors disabled:opacity-50">
                      {deleting === p.id ? "삭제 중..." : "삭제"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
