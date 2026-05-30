import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'The Spot ERP',
  description: 'Панель управления платформой The Spot.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className="bg-muted/30 min-h-screen antialiased">{children}</body>
    </html>
  );
}
