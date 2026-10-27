import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "LearnPilotAI",
  description: "Kişisel öğrenme asistanı — hackathon başlangıç uygulaması",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="tr"><body>{children}</body></html>;
}
