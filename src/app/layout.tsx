import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { StagewiseToolbar } from "@stagewise/toolbar-next";
import { ReactPlugin } from "@stagewise-plugins/react";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BetNote",
  description: "あなたの馬券収支を管理・分析",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={inter.variable}>
      <body className="antialiased">
        {children}
        <Toaster />
        {process.env.NODE_ENV === "development" && (
          <StagewiseToolbar
            config={{
              plugins: [ReactPlugin],
            }}
          />
        )}
      </body>
    </html>
  );
}
