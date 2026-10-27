import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "LearnPilotAI",
  description: "Konu ve seviyeni seç, üç adımlık mock öğrenme planını dene.",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="tr"><body>{children}</body></html>;
}
