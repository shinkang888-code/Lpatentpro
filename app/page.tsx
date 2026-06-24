import Link from "next/link";

const features = [
  {
    icon: "⚡",
    title: "KIPO · USPTO 동시 생성",
    desc: "한국 특허법 제42조 + 37 CFR 1.77 양식을 자동 준수하여 두 나라 명세서를 동시에 생성합니다.",
  },
  {
    icon: "🤖",
    title: "AI 섹션 자동 작성",
    desc: "Claude · GPT-4 API를 연동하면 배경기술, 실시예, 청구항을 전문 변리사 문체로 자동 작성합니다.",
  },
  {
    icon: "🖼",
    title: "기술 도면 자동 생성",
    desc: "블록 다이어그램, 흐름도, 시퀀스 다이어그램을 한국어/영문 두 버전으로 자동 생성합니다.",
  },
  {
    icon: "✅",
    title: "43개 항목 자동 검증",
    desc: "필수 섹션 누락, 단락번호 오류, 도면-명세서 불일치를 제출 전에 자동으로 검출합니다.",
  },
  {
    icon: "📄",
    title: "Word 완성본 출력",
    desc: "특허청에 즉시 제출 가능한 .docx 파일을 다운로드합니다.",
  },
  {
    icon: "🗄",
    title: "프로젝트 이력 관리",
    desc: "모든 특허 프로젝트를 DB에 저장하여 언제든지 수정·재생성할 수 있습니다.",
  },
];

const steps = [
  { num: "01", title: "발명 내용 입력", desc: "제목, 구성요소, 청구항, 도면 정보를 UI 폼으로 입력합니다." },
  { num: "02", title: "AI 명세서 생성", desc: "각 섹션을 AI가 변리사 문체로 자동 작성합니다." },
  { num: "03", title: "도면 자동 생성", desc: "기술 다이어그램을 한국어/영문 버전으로 자동 제작합니다." },
  { num: "04", title: "양식 검증 & 다운로드", desc: "KIPO/USPTO 양식 검증 후 Word 파일을 다운로드합니다." },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0f1e]">
      {/* 네비게이션 */}
      <nav className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">LP</div>
          <span className="font-semibold text-white text-lg">LPatentPro</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-slate-400 hover:text-white text-sm transition-colors">대시보드</Link>
          <Link href="/new" className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-4 py-2 rounded-lg transition-colors font-medium">
            새 특허 시작
          </Link>
        </div>
      </nav>

      {/* 히어로 섹션 */}
      <section className="px-6 py-24 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-indigo-950 border border-indigo-800 rounded-full px-4 py-1.5 text-indigo-300 text-xs font-medium mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
          KIPO · USPTO 자동화 플랫폼
        </div>
        <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
          특허 명세서를<br />
          <span className="text-indigo-400">AI가 자동으로</span> 작성합니다
        </h1>
        <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
          발명 내용을 입력하면 한국 특허청(KIPO)과 미국 특허청(USPTO)에
          즉시 제출 가능한 Word 완성본을 자동으로 생성합니다.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/new" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-base shadow-lg shadow-indigo-900/50">
            지금 시작하기 →
          </Link>
          <Link href="/dashboard" className="border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-medium px-8 py-3.5 rounded-xl transition-colors text-base">
            기존 프로젝트 보기
          </Link>
        </div>
      </section>

      {/* 통계 */}
      <section className="border-y border-slate-800 px-6 py-10">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
          {[
            { num: "43+", label: "자동 검증 항목" },
            { num: "2", label: "동시 생성 국가 (KR/US)" },
            { num: "100%", label: "양식 준수율" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-bold text-white mb-1">{s.num}</div>
              <div className="text-slate-500 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 기능 */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-white text-center mb-12">핵심 기능</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div key={f.title} className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-indigo-800 transition-colors">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 프로세스 */}
      <section className="px-6 py-20 bg-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">작동 방식</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s) => (
              <div key={s.num} className="text-center">
                <div className="w-12 h-12 rounded-xl bg-indigo-900 border border-indigo-700 flex items-center justify-center text-indigo-400 font-bold text-lg mx-auto mb-4">
                  {s.num}
                </div>
                <h3 className="font-semibold text-white mb-2 text-sm">{s.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center">
        <div className="max-w-2xl mx-auto bg-gradient-to-br from-indigo-950 to-slate-900 border border-indigo-800 rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-white mb-4">지금 바로 시작하세요</h2>
          <p className="text-slate-400 mb-8">발명 내용을 입력하면 수 분 내에 제출 가능한 특허 명세서가 완성됩니다.</p>
          <Link href="/new" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-10 py-4 rounded-xl transition-colors text-base inline-block">
            새 특허 프로젝트 시작 →
          </Link>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="border-t border-slate-800 px-6 py-8 text-center text-slate-600 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-5 h-5 rounded bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">LP</div>
          <span className="text-slate-400 font-medium">LPatentPro</span>
        </div>
        <p>KIPO · USPTO 특허 명세서 자동화 플랫폼</p>
      </footer>
    </div>
  );
}
