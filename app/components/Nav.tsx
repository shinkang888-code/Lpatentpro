"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/", label: "홈" },
  { href: "/generate", label: "⚡ AI 생성" },
  { href: "/dashboard", label: "대시보드" },
];

export default function Nav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* ── 데스크탑 / 상단 네비 ─────────────────────────────── */}
      <header className="nav-glass fixed top-0 left-0 right-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* 로고 */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-900/40">
                  <span className="text-white font-bold text-xs tracking-tight">LP</span>
                </div>
                <div className="absolute inset-0 rounded-xl bg-indigo-400 blur-md opacity-0 group-hover:opacity-30 transition-opacity" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-bold text-white text-sm tracking-tight">LPatentPro</span>
                <span className="text-[10px] text-indigo-400 font-medium tracking-wider">AI PATENT</span>
              </div>
            </Link>

            {/* 데스크탑 메뉴 */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    pathname === l.href
                      ? "bg-indigo-600/20 text-indigo-300 border border-indigo-600/30"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            {/* CTA + 모바일 햄버거 */}
            <div className="flex items-center gap-3">
              <Link
                href="/generate"
                className="hidden sm:flex btn-glow text-white text-sm font-semibold px-5 py-2 rounded-xl items-center gap-2"
              >
                <span>⚡</span> AI 생성
              </Link>

              {/* 햄버거 */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-white/5 transition-colors"
              >
                <span className={`block w-5 h-0.5 bg-slate-400 transition-all ${mobileOpen ? "rotate-45 translate-y-2" : ""}`} />
                <span className={`block w-5 h-0.5 bg-slate-400 transition-all ${mobileOpen ? "opacity-0" : ""}`} />
                <span className={`block w-5 h-0.5 bg-slate-400 transition-all ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`} />
              </button>
            </div>
          </div>
        </div>

        {/* 모바일 드롭다운 메뉴 */}
        {mobileOpen && (
          <div className="md:hidden border-t border-indigo-900/30 bg-[#04071a]/95 backdrop-blur-xl">
            <div className="px-4 py-4 space-y-1">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    pathname === l.href
                      ? "bg-indigo-600/20 text-indigo-300"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
              <Link
                href="/generate"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 mt-3 btn-glow text-white text-sm font-semibold px-5 py-3 rounded-xl"
              >
                ⚡ AI 명세서 생성하기
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 모바일 하단 탭바 */}
      <nav className="mobile-tabbar md:hidden">
        <div className="flex items-center justify-around py-2">
          {[
            { href: "/", icon: "⌂", label: "홈" },
            { href: "/generate", icon: "⚡", label: "AI 생성", highlight: true },
            { href: "/dashboard", icon: "◫", label: "프로젝트" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-5 py-1.5 rounded-xl transition-all ${
                item.highlight
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/40"
                  : pathname === item.href
                  ? "text-indigo-400"
                  : "text-slate-500"
              }`}
            >
              <span className={`text-lg leading-none ${item.highlight ? "font-bold" : ""}`}>{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
