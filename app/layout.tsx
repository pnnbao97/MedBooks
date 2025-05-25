import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";
import { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";

const ibmPlexSans = localFont({
  src: [
    { path: "./fonts/IBMPlexSans-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/IBMPlexSans-Medium.ttf", weight: "500", style: "normal" },
    { path: "./fonts/IBMPlexSans-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "./fonts/IBMPlexSans-Bold.ttf", weight: "700", style: "normal" },
  ],
});

const bebasNeue = localFont({
  src: [{ path: "./fonts/BebasNeue-Regular.ttf", weight: "400", style: "normal" }],
  variable: "--bebas-neue",
});

// Metadata mặc định chỉ cho trang chủ và các trang không có metadata riêng
export const metadata: Metadata = {
  title: {
    template: '%s | VMedBook', // Template cho các trang con
    default: 'VMedBook - Sách Y Khoa Chuyên Sâu & Uy Tín', // Default cho trang chủ
  },
  description: "Khám phá bộ sưu tập sách y khoa chất lượng cao tại VMedBook. Tài liệu chuyên sâu, cập nhật dành cho bác sĩ, sinh viên y khoa và chuyên gia y tế Việt Nam.",
  keywords: ["sách y khoa", "tài liệu y học", "sách y tế Việt Nam", "học tập y khoa", "VMedBook"],
  authors: [{ name: "VMedBook Team" }],
  creator: "VMedBook",
  publisher: "VMedBook",
  metadataBase: new URL('https://www.vmedbook.com'),
  
  // Open Graph mặc định
  openGraph: {
    title: "VMedBook - Nguồn Sách Y Khoa Hàng Đầu",
    description: "Nâng cao kiến thức y học với sách y khoa chuyên sâu từ VMedBook. Phù hợp cho bác sĩ, sinh viên và chuyên gia y tế.",
    url: "https://www.vmedbook.com",
    siteName: "VMedBook",
    images: [
      {
        url: "/icons/VMedBook.png",
        width: 1200,
        height: 630,
        alt: "VMedBook - Sách Y Khoa Chuyên Sâu",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
  
  // Twitter mặc định
  twitter: {
    card: "summary_large_image",
    site: "@VMedBook", // Thay bằng Twitter handle của bạn
    creator: "@VMedBook",
    title: "VMedBook - Sách Y Khoa Chuyên Sâu",
    description: "Tài liệu y khoa chất lượng cao dành cho bác sĩ, sinh viên và chuyên gia y tế tại VMedBook.",
    images: ["/icons/VMedBook.png"],
  },
  
  // Icons
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180" },
    ],
    other: [
      { rel: "mask-icon", url: "/icons/safari-pinned-tab.svg", color: "#2f89d8" },
    ],
  },
  
  // Manifest
  manifest: "/manifest.json",
  
  // Verification
  verification: {
    google: "your-google-site-verification", // Thay bằng mã verification của bạn
    // yandex: "your-yandex-verification",
    // yahoo: "your-yahoo-verification",
  },
  
  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Alternates
  alternates: {
    canonical: "https://www.vmedbook.com",
  },
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi" className={`${ibmPlexSans.className} ${bebasNeue.variable}`}>
      <head>
        {/* Additional meta tags */}
        <meta name="theme-color" content="#2f89d8" />
        <meta name="msapplication-TileColor" content="#2f89d8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS prefetch for better performance */}
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
      </head>
      <body className="antialiased">
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  );
}