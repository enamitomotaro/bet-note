import type {Metadata} from 'next';
import { Inter } from 'next/font/google'; // Geist_Sans から Inter に変更
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ // geistSans から inter に変更し、Inter を使用
  variable: '--font-geist-sans', // CSS変数はそのまま利用
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: '競馬エース',
  description: 'あなたの競馬収支を管理・分析',
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
      </body>
    </html>
  );
}
