import type { Metadata } from "next";
import { Gowun_Batang, Gowun_Dodum } from "next/font/google";

import "./globals.css";

const gowunBatang = Gowun_Batang({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-display",
});

const gowunDodum = Gowun_Dodum({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "스무디 제시 게임",
  description: "레시피를 맞춰 스무디를 제시하는 키보드 게임",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${gowunBatang.variable} ${gowunDodum.variable}`}>
        {children}
      </body>
    </html>
  );
}
