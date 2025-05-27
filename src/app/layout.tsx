import type {Metadata} from 'next';
import { Geist_Sans } from 'next/font/google'; // Correct import for Geist Sans
import './globals.css';
import { Toaster } from '@/components/ui/toaster'; // Import Toaster

const geistSans = Geist_Sans({ // Correct usage
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

// Geist Mono can be kept if needed, or removed if only Geist Sans is primary
// import { Geist_Mono } from 'next/font/google';
// const geistMono = Geist_Mono({
//   variable: '--font-geist-mono',
//   subsets: ['latin'],
// });

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
    <html lang="ja" className={geistSans.variable}> {/* Apply font variable to html tag */}
      <body className="antialiased"> {/* Removed font variables from body, they are on html */}
        {children}
        <Toaster /> {/* Add Toaster here for global notifications */}
      </body>
    </html>
  );
}
