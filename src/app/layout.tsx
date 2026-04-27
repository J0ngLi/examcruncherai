import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://examcrunch.ai"),
  title: {
    default: "ExamCrunch AI | Revision in Minutes",
    template: "%s | ExamCrunch AI",
  },
  description:
    "Turn GCSE, A-Level, and university notes into summaries, flashcards, quizzes, and 7-day revision plans in seconds.",
  openGraph: {
    title: "ExamCrunch AI",
    description:
      "Turn GCSE, A-Level, and university notes into summaries, flashcards, quizzes, and revision plans.",
    url: "https://examcrunch.ai",
    siteName: "ExamCrunch AI",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full bg-slate-50 text-slate-900`}>{children}</body>
    </html>
  );
}
