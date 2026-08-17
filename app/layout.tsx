import type { Metadata } from 'next';
import { Be_Vietnam_Pro, Inter } from 'next/font/google';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import ClientLayout from './client-layout';
import './globals.css';

const beVietnamPro = Be_Vietnam_Pro({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin', 'vietnamese'],
  variable: '--font-vietnam',
  display: 'swap',
});

const inter = Inter({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Artisan Bakery - Hệ Thống Quản Lý Đơn Hàng Tiệm Bánh',
  description: 'SaaS Quản lý đơn hàng, kho bánh, điểm bán hàng (POS) và doanh thu tiệm bánh',
  icons: {
    icon: [
      { url: '/emerald_bakery_logo.png', sizes: 'any' },
      { url: '/emerald_bakery_logo.png', type: 'image/png' },
    ],
    shortcut: '/emerald_bakery_logo.png',
    apple: '/emerald_bakery_logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${beVietnamPro.variable} ${inter.variable} h-full scroll-smooth`}>
      <body className="min-h-full flex flex-col font-sans bg-[#F8F9FA] text-[#111827]">
        <AntdRegistry>
          <ClientLayout>{children}</ClientLayout>
        </AntdRegistry>
      </body>
    </html>
  );
}
