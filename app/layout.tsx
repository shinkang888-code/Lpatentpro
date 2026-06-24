import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LPatentPro — AI 특허 명세서 자동화 플랫폼",
  description: "KIPO · USPTO 특허 명세서를 AI가 자동 생성합니다. 변리사 수준의 명세서를 수 분 안에.",
  keywords: ["특허", "patent", "KIPO", "USPTO", "AI", "명세서", "자동화"],
  authors: [{ name: "LPatentPro" }],
  openGraph: {
    title: "LPatentPro — AI 특허 명세서 자동화",
    description: "KIPO · USPTO 특허 명세서를 AI가 자동 생성합니다.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#04071a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body
        style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif" }}
        className="min-h-screen overflow-x-hidden"
      >
        {children}
      </body>
    </html>
  );
}
