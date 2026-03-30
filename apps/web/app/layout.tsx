import type { Metadata } from "next";

import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}
