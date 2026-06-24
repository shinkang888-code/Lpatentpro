import Link from "next/link";
import Image from "next/image";
import Nav from "./components/Nav";

const STEPS = [
  { icon: "📂", step: "01", title: "문서 업로드", desc: "발명 설명서, 기획서, 논문 등 어떤 문서든 그대로 업로드하거나 텍스트를 붙여넣으세요." },
  { icon: "🤖", step: "02", title: "AI 자동 분석", desc: "AI가 문서를 이해하고 기술분야, 문제점, 구성요소, 청구항을 자동으로 구조화합니다." },
  { icon: "💬", step: "03", title: "실시간 생성", desc: "채팅 형식으로 각 섹션이 생성되는 과정을 실시간으로 확인합니다." },
  { icon: "📄", step: "04", title: "즉시 다운로드", desc: "KIPO · USPTO 양식이 완벽히 준수된 파일을 즉시 다운로드합니다." },
];

const FEATURES = [
  { icon: "🤖", title: "Claude · GPT-4 연동", desc: "세계 최고 AI가 변리사 수준의 법적 문체로 각 섹션을 자동 작성합니다." },
  { icon: "🌏", title: "한국 + 미국 동시 출원", desc: "KIPO 특허법 제42조 + 37 CFR 1.77 양식을 동시에 준수합니다." },
  { icon: "⚡", title: "수 분 만에 완성", desc: "수주 걸리던 명세서 작성을 수 분으로 단축합니다." },
  { icon: "✅", title: "43개 항목 자동 검증", desc: "필수 섹션 누락, 단락번호 오류, 도면 불일치를 사전 자동 검출합니다." },
  { icon: "📑", title: "Word 완성본 출력", desc: "특허청에 즉시 제출 가능한 .docx 파일을 다운로드합니다." },
  { icon: "🗄", title: "프로젝트 이력 관리", desc: "모든 프로젝트가 클라우드에 저장되어 언제든 수정·재생성할 수 있습니다." },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#04071a]">
      <Nav />

      {/* ── 히어로 섹션 ─────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16 px-4">
        {/* 배경 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/5 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl animate-orb-drift" />
          <div className="absolute top-1/3 right-1/5 w-64 h-64 bg-blue-500/12 rounded-full blur-3xl animate-orb-drift-2" />
          <div className="absolute bottom-1/3 left-1/3 w-56 h-56 bg-violet-600/10 rounded-full blur-3xl animate-orb-drift-3" />
          <div className="grid-pattern absolute inset-0 opacity-30" />
          <Image src="/hero.png" alt="AI Patent" fill className="object-cover opacity-[0.12] mix-blend-lighten" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#04071a]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="animate-fade-up badge mx-auto mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            문서 업로드 → AI 분석 → 즉시 다운로드
          </div>

          <h1 className="animate-fade-up delay-100 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-[1.05]">
            <span className="text-white block">발명 문서만 올리면</span>
            <span className="gradient-text block">특허 명세서가 완성됩니다</span>
          </h1>

          <p className="animate-fade-up delay-200 text-slate-400 text-base sm:text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
            Markdown, TXT, Word 파일을 업로드하면<br className="hidden sm:block" />
            AI가 <span className="text-indigo-400 font-medium">KIPO</span> ·{" "}
            <span className="text-blue-400 font-medium">USPTO</span> 양식에 맞는
            명세서를 자동으로 생성합니다.
          </p>

          {/* 미니 업로드 CTA */}
          <div className="animate-fade-up delay-300 max-w-xl mx-auto">
            <Link
              href="/generate"
              className="group block glass rounded-3xl border border-dashed border-indigo-700/50 hover:border-indigo-500/70 transition-all overflow-hidden"
            >
              <div className="relative bg-gradient-to-br from-indigo-600/5 to-blue-600/5 py-10 sm:py-14 px-6">
                <div className="w-16 h-16 mx-auto bg-indigo-900/40 border border-indigo-800/40 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-105 transition-transform">
                  ⬆
                </div>
                <p className="text-white font-bold text-lg mb-1">파일을 드롭하거나 클릭하여 시작</p>
                <p className="text-slate-500 text-sm">
                  지원 형식: <span className="font-mono text-indigo-400">.txt  .md  .docx</span>
                  <span className="mx-2 text-slate-700">|</span>
                  또는 텍스트 직접 입력
                </p>
                <div className="mt-5 btn-glow inline-flex items-center gap-2 text-white font-bold px-8 py-3 rounded-xl text-sm">
                  ⚡ AI 명세서 생성 시작 →
                </div>
              </div>
            </Link>

            <div className="flex items-center justify-center gap-5 mt-5 text-xs text-slate-600">
              {["무료 사용", "API 키 선택 사항", "즉시 다운로드"].map(t => (
                <span key={t} className="flex items-center gap-1"><span className="text-emerald-600">✓</span>{t}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-600 animate-float">
          <span className="text-xs tracking-widest uppercase">scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-slate-600 to-transparent" />
        </div>
      </section>

      {/* ── 작동 방식 ─────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="badge mx-auto mb-5">작동 방식</div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
              4단계로 <span className="gradient-text">끝납니다</span>
            </h2>
            <p className="text-slate-500 max-w-lg mx-auto text-sm sm:text-base">매뉴얼 입력 없이, 기존 발명 문서를 그대로 활용합니다.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {STEPS.map((s, i) => (
              <div key={s.step} className="card-hover glass rounded-2xl p-6 border border-indigo-900/20 group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-2xl">{s.icon}</div>
                  <span className="text-sm font-black gradient-text">{s.step}</span>
                </div>
                <h3 className="font-bold text-white mb-2 text-base">{s.title}</h3>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">{s.desc}</p>
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute -right-2.5 top-1/2 -translate-y-1/2 text-indigo-800 text-lg">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI 이미지 + 설명 ──────────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4 bg-gradient-to-b from-transparent to-slate-900/20">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="order-2 lg:order-1">
              <div className="badge mb-6">실시간 채팅형 생성</div>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-6 leading-tight">
                작성 과정을<br />
                <span className="gradient-text">실시간으로 확인</span>
              </h2>
              <p className="text-slate-400 leading-relaxed mb-6 text-sm sm:text-base">
                각 섹션이 생성될 때마다 채팅 형식으로 실시간 표시됩니다.
                발명 제목 → 기술분야 → 구성요소 → 청구항 → 요약까지
                단계별로 확인하고 최종 파일을 다운로드하세요.
              </p>
              <div className="space-y-2.5">
                {[
                  "📂 파일 업로드 후 버튼 클릭",
                  "💬 AI가 섹션별로 실시간 생성",
                  "✅ 43개 양식 항목 자동 검증",
                  "📄 JSON / Word 즉시 다운로드",
                ].map(t => (
                  <div key={t} className="flex items-center gap-3 text-sm text-slate-300">
                    <span>{t}</span>
                  </div>
                ))}
              </div>
              <Link href="/generate" className="mt-8 btn-glow inline-flex items-center gap-2 text-white font-bold px-8 py-3.5 rounded-xl text-sm">
                ⚡ 지금 바로 시작 →
              </Link>
            </div>
            <div className="order-1 lg:order-2 relative">
              {/* 모의 채팅 UI */}
              <div className="glass rounded-3xl p-5 border border-indigo-900/30 space-y-3">
                <div className="flex items-center gap-2 pb-3 border-b border-indigo-900/20">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">AI</div>
                  <span className="text-white text-sm font-semibold">특허 명세서 생성 중...</span>
                  <div className="ml-auto flex gap-1">
                    {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
                  </div>
                </div>
                {[
                  { label: "💡 발명의 명칭", done: true, content: "AI 기반 통합 워크스페이스 시스템" },
                  { label: "🔬 기술분야", done: true, content: "본 발명은 분산 컴퓨팅 환경에서 동작하는..." },
                  { label: "⚙️ 구성요소 (3종)", done: true, content: "(110) 크로스플랫폼 렌더링부, (200) AI 커널..." },
                  { label: "📋 청구항", done: false, content: "" },
                ].map((item, i) => (
                  <div key={i} className={`rounded-xl p-3.5 border text-xs transition-all ${item.done ? "glass-strong border-emerald-900/30" : "glass border-indigo-900/20 opacity-50"}`}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${item.done ? "bg-emerald-600/30 border border-emerald-600/40 text-emerald-400" : "bg-indigo-900/40 border border-indigo-800/40"}`}>
                        {item.done ? "✓" : "⟳"}
                      </span>
                      <span className={`font-semibold ${item.done ? "text-white" : "text-slate-500"}`}>{item.label}</span>
                    </div>
                    {item.done && <p className="text-slate-400 leading-relaxed pl-6">{item.content}</p>}
                    {!item.done && <div className="pl-6 flex gap-1">{[0,1,2].map(j => <div key={j} className="w-1 h-1 rounded-full bg-slate-600 animate-bounce" style={{ animationDelay: `${j * 0.1}s` }} />)}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 기능 그리드 ───────────────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="badge mx-auto mb-5">핵심 기능</div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              필요한 모든 것이 <span className="gradient-text">담겨 있습니다</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(f => (
              <div key={f.title} className="card-hover glass rounded-2xl p-6 border border-indigo-900/20">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-white mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 최종 CTA ─────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="relative glass rounded-3xl sm:rounded-[2.5rem] overflow-hidden p-10 sm:p-16 text-center border border-indigo-900/30">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
                지금 바로 시작하세요
              </h2>
              <p className="text-slate-400 mb-8 text-sm sm:text-base">
                발명 문서 파일 하나만 있으면 됩니다.<br />나머지는 AI가 알아서 합니다.
              </p>
              <Link href="/generate" className="btn-glow inline-flex items-center gap-3 text-white font-black px-10 py-4 rounded-2xl text-base">
                <span className="text-xl">⚡</span> 문서 업로드하고 시작하기 →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 푸터 ─────────────────────────────────────────────── */}
      <footer className="border-t border-slate-800/50 py-10 px-4 mb-16 md:mb-0">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs">LP</div>
            <span className="font-bold text-white text-sm">LPatentPro</span>
            <span className="text-slate-600 text-xs">AI Patent Platform</span>
          </div>
          <p className="text-slate-700 text-xs text-center">KIPO · USPTO 특허 명세서 자동화 · 특허법 제42조 · 37 CFR 1.77</p>
        </div>
      </footer>
    </div>
  );
}
