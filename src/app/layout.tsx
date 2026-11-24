import type { Metadata, Viewport } from "next";
import { Charmonman, IBM_Plex_Sans_Thai_Looped } from "next/font/google";
import "./globals.css";

const display = Charmonman({
  variable: "--font-display",
  weight: ["400", "700"],
  subsets: ["thai", "latin"],
});

const body = IBM_Plex_Sans_Thai_Looped({
  variable: "--font-body",
  weight: ["400", "500", "600"],
  subsets: ["thai", "latin"],
});

export const metadata: Metadata = {
  title: "ลอยกระทงออนไลน์",
  description: "ลอยกระทงและปล่อยโคมลอยออนไลน์ ฝากคำอธิษฐานส่วนตัวไว้กับสายน้ำในคืนวันเพ็ญเดือนสิบสอง",
};

export const viewport: Viewport = {
  themeColor: "#121836",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
