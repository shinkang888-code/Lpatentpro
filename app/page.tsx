import Link from "next/link";
import Image from "next/image";
import Nav from "./components/Nav";

const FEATURES = [
  {
    icon: "⚡",
    title: "KIPO · USPTO 동시 생성",
    desc: "특허법 제42조 + 37 CFR 1.77 양식을 동시에 준수. 두 나라 명세서를 한 번에.",
    color: "from-yellow-500/20 to-orange-500/10",
    border: "border-yellow-500/20",
  },
  {
    icon: "🤖",
    title: "AI 섹션 자동 작성",
    desc: "Claude · GPT-4 연동으로 배경기술·실시예·청구항을 변리사 수준으로 자동 생성.",
    color: "from-indigo-500/20 to-violet-500/10",
    border: "border-indigo-500/20",
  },
  {
    icon: "🖼",
    title: "기술 도면 자동 생성",
    desc: "블록 다이어그램, 흐름도, 시퀀스 다이어그램을 한국어/영문 두 버전으로 자동 제작.",
    color: "from-blue-500/20 to-cyan-500/10",
    border: "border-blue-500/20",
  },
  {
    icon: "✅",
    title: "43개 항목 자동 검증",
    desc: "필수 섹션 누락, 단락번호 오류, 도면-명세서 불일치를 제출 전 자동 검출.",
    color: "from-emerald-500/20 to-teal-500/10",
    border: "border-emerald-500/20",
  },
  {
    icon: "📄",
    title: "Word 완성본 즉시 출력",
    desc: "특허청에 즉시 제출 가능한 .docx 파일을 다운로드. 포맷 걱정 제로.",
    color: "from-pink-500/20 to-rose-500/10",
    border: "border-pink-500/20",
  },
  {
    icon: "🗄",
    title: "프로젝트 이력 관리",
    desc: "모든 특허 프로젝트를 클라우드 DB에 저장. 언제 어디서든 수정·재생성.",
    color: "from-violet-500/20 to-purple-500/10",
    border: "border-violet-500/20",
  },
];

const PROCESS = [
  { num: "01", title: "발명 내용 입력", desc: "직관적인 폼으로 제목, 구성요소, 청구항, 도면 정보를 단계별 입력" },
  { num: "02", title: "AI 명세서 생성", desc: "AI가 각 섹션을 전문 변리사 수준의 법적 문체로 자동 작성" },
  { num: "03", title: "도면 자동 생성", desc: "기술 다이어그램을 한국어/영문 버전으로 프로그래밍 방식으로 제작" },
  { num: "04", title: "검증 & 다운로드", desc: "43개 양식 항목 자동 검증 완료 후 Word 파일 즉시 다운로드" },
];

const STATS = [
  { value: "43+", label: "자동 검증 항목", sub: "KIPO + USPTO 양식" },
  { value: "2", label: "동시 출원 국가", sub: "한국 + 미국" },
  { value: "< 5분", label: "명세서 생성 시간", sub: "수작업 대비 98% 단축" },
  { value: "100%", label: "양식 준수율", sub: "법적 제출 가능 품질" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#04071a]">
      <Nav />

      {/* ── 히어로 섹션 ──────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16">
        {/* 배경 그라디언트 오브 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 sm:w-96 sm:h-96 bg-indigo-600/20 rounded-full blur-3xl animate-orb-drift" />
          <div className="absolute top-1/3 right-1/4 w-56 h-56 sm:w-80 sm:h-80 bg-blue-500/15 rounded-full blur-3xl animate-orb-drift-2" />
          <div className="absolute bottom-1/4 left-1/3 w-48 h-48 sm:w-64 sm:h-64 bg-violet-600/15 rounded-full blur-3xl animate-orb-drift-3" />
          <div className="grid-pattern absolute inset-0 opacity-40" />
        </div>

        {/* 히어로 이미지 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <Image
            src="/hero.png"
            alt="AI Patent Visualization"
            fill
            className="object-cover object-center opacity-[0.18] mix-blend-lighten"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#04071a]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#04071a]/60 via-transparent to-[#04071a]/60" />
        </div>

        {/* 히어로 콘텐츠 */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="animate-fade-up">
            <div className="badge mb-8 mx-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              KIPO · USPTO 특허 자동화 플랫폼
            </div>
          </div>

          <h1 className="animate-fade-up delay-100 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-[1.05]">
            <span className="text-white block">특허 명세서를</span>
            <span className="gradient-text-white block">AI가 자동으로</span>
            <span className="text-white block">작성합니다</span>
          </h1>

          <p className="animate-fade-up delay-200 text-slate-400 text-base sm:text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            발명 내용을 입력하면 <span className="text-indigo-400 font-medium">한국 특허청(KIPO)</span>과{" "}
            <span className="text-blue-400 font-medium">미국 특허청(USPTO)</span>에<br className="hidden sm:block" />
            즉시 제출 가능한 Word 완성본을 자동으로 생성합니다.
          </p>

          <div className="animate-fade-up delay-300 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/new"
              className="btn-glow w-full sm:w-auto text-white font-bold px-8 py-4 rounded-2xl text-base inline-flex items-center justify-center gap-3"
            >
              <span className="text-lg">⚡</span>
              지금 무료로 시작하기
              <span className="text-indigo-300 text-sm">→</span>
            </Link>
            <Link
              href="/dashboard"
              className="btn-outline w-full sm:w-auto font-semibold px-8 py-4 rounded-2xl text-base inline-flex items-center justify-center gap-2"
            >
              <span>◫</span> 대시보드 보기
            </Link>
          </div>

          {/* 신뢰 지표 */}
          <div className="animate-fade-up delay-400 flex items-center justify-center gap-6 mt-10 text-sm text-slate-500">
            {["변리사 감수 완료", "특허법 제42조 준수", "37 CFR 1.77 준수"].map((t, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <span className="text-emerald-500 text-xs">✓</span>
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* 스크롤 인디케이터 */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-600 animate-float">
          <span className="text-xs tracking-widest uppercase">scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-slate-600 to-transparent" />
        </div>
      </section>

      {/* ── 통계 섹션 ────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="glass rounded-3xl p-6 sm:p-10 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-black gradient-text mb-1">{s.value}</div>
                <div className="font-semibold text-white text-sm mb-1">{s.label}</div>
                <div className="text-slate-500 text-xs">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI 이미지 + 소개 섹션 ────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="badge mb-6">AI 핵심 기술</div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
                변리사 수준의<br />
                <span className="gradient-text">AI 명세서 생성</span>
              </h2>
              <p className="text-slate-400 leading-relaxed mb-8 text-base sm:text-lg">
                Claude · GPT-4 AI가 발명의 기술분야, 배경기술, 과제 해결 수단, 청구항까지
                전문 변리사 문체로 자동 작성합니다. 수작업 대비 98% 시간을 절약합니다.
              </p>
              <div className="space-y-3">
                {[
                  "선행특허 침해 방지 청구항 자동 설계",
                  "단락번호 [0001] 형식 자동 적용",
                  "도면 참조번호 자동 연결",
                  "한국어·영문 동시 생성",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center flex-shrink-0">
                      <span className="text-indigo-400 text-xs">✓</span>
                    </div>
                    <span className="text-slate-300 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="glass rounded-3xl overflow-hidden aspect-square sm:aspect-[4/3] max-w-md mx-auto lg:max-w-none">
                <Image
                  src="/ai-icon.png"
                  alt="AI Patent Brain"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#04071a]/60 via-transparent to-transparent" />
              </div>
              {/* 플로팅 카드 */}
              <div className="absolute -bottom-4 -left-4 glass rounded-2xl p-4 max-w-[180px]">
                <div className="text-2xl font-black gradient-text mb-0.5">43+</div>
                <div className="text-white text-xs font-semibold">자동 검증 항목</div>
                <div className="text-slate-500 text-xs">KIPO + USPTO</div>
              </div>
              <div className="absolute -top-4 -right-4 glass rounded-2xl p-4 max-w-[160px]">
                <div className="text-2xl font-black gradient-text mb-0.5">2개국</div>
                <div className="text-white text-xs font-semibold">동시 출원 지원</div>
                <div className="text-slate-500 text-xs">한국 + 미국</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 기능 카드 섹션 ───────────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <div className="badge mx-auto mb-6">핵심 기능</div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
              필요한 모든 것이<br />
              <span className="gradient-text">하나에 담겨 있습니다</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-base sm:text-lg">
              특허 출원 프로세스의 모든 단계를 자동화합니다.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className={`card-hover glass rounded-2xl p-6 ${f.border} bg-gradient-to-br ${f.color}`}
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-white mb-2 text-base">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 프로세스 섹션 ────────────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="section-divider mb-16 sm:mb-20" />
          <div className="text-center mb-12">
            <div className="badge mx-auto mb-6">작동 방식</div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
              4단계로 <span className="gradient-text">완성됩니다</span>
            </h2>
          </div>
          <div className="relative">
            {/* 연결선 (데스크탑) */}
            <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-indigo-600/40 to-transparent" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {PROCESS.map((s, i) => (
                <div key={s.num} className="relative text-center group">
                  <div className="w-20 h-20 mx-auto mb-5 rounded-2xl glass border border-indigo-600/30 flex items-center justify-center transition-all group-hover:border-indigo-500/60 group-hover:shadow-lg group-hover:shadow-indigo-900/30">
                    <span className="text-2xl font-black gradient-text">{s.num}</span>
                  </div>
                  <h3 className="font-bold text-white mb-2 text-sm sm:text-base">{s.title}</h3>
                  <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA 섹션 ─────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative glass rounded-3xl sm:rounded-[2.5rem] overflow-hidden">
            {/* 배경 오브 */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 text-center px-6 sm:px-12 py-14 sm:py-20">
              <div className="badge mx-auto mb-8">지금 바로 시작</div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
                발명 내용을 입력하면<br />
                <span className="gradient-text">수 분 안에 완성됩니다</span>
              </h2>
              <p className="text-slate-400 mb-10 max-w-xl mx-auto text-base sm:text-lg">
                변리사에게 의뢰하던 수백만 원의 비용과 수 주의 시간을<br className="hidden sm:block" />
                AI가 수 분으로 줄여드립니다.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/new"
                  className="btn-glow w-full sm:w-auto text-white font-bold px-10 py-4 rounded-2xl text-base inline-flex items-center justify-center gap-2"
                >
                  ⚡ 새 특허 프로젝트 시작 →
                </Link>
                <Link
                  href="/dashboard"
                  className="btn-outline w-full sm:w-auto font-semibold px-8 py-4 rounded-2xl text-base inline-flex items-center justify-center"
                >
                  기존 프로젝트 보기
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 푸터 ─────────────────────────────────────────────── */}
      <footer className="border-t border-indigo-950/80 py-10 px-4 mb-16 md:mb-0">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">LP</span>
            </div>
            <div>
              <span className="font-bold text-white text-sm">LPatentPro</span>
              <span className="text-slate-600 text-xs ml-2">AI Patent Platform</span>
            </div>
          </div>
          <p className="text-slate-600 text-xs text-center sm:text-right">
            KIPO · USPTO 특허 명세서 자동화 · 특허법 제42조 · 37 CFR 1.77 준수
          </p>
        </div>
      </footer>
    </div>
  );
}
