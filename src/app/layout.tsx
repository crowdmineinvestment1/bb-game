import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { LayoutShell } from '@/components/layout/LayoutShell';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Bb.GAME | The Premier Crypto Casino Clone',
  description: 'Experience the ultimate full-stack crypto casino clone. Play Crash, Plinko, Dice, Wheel, Mines, and Limbo with provably fair RNG.',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'Bb.GAME | The Premier Crypto Casino Clone',
    description: 'Play with Bitcoin, Ethereum, and USDT with 100% transparent provably fair RNG.',
    type: 'website',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${inter.variable} font-sans bg-[#0f1923] text-white overflow-x-hidden antialiased custom-scrollbar`}>
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
