import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";
import { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

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

export const metadata: Metadata = {
  title: "VMedBook - Sách Y Khoa Chuyên Sâu & Uy Tín",
  description: "Khám phá bộ sưu tập sách y khoa chất lượng cao tại VMedBook. Tài liệu chuyên sâu, cập nhật dành cho bác sĩ, sinh viên y khoa và chuyên gia y tế Việt Nam.",
  keywords: ["sách y khoa", "tài liệu y học", "sách y tế Việt Nam", "học tập y khoa", "VMedBook"],
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
  twitter: {
    card: "summary_large_image",
    title: "VMedBook - Sách Y Khoa Chuyên Sâu",
    description: "Tài liệu y khoa chất lượng cao dành cho bác sĩ, sinh viên và chuyên gia y tế tại VMedBook.",
    images: ["/icons/VMedBook.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/favicon.ico",
  },
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  return (
  //   <ClerkProvider>
      <html lang="vi" className={`${ibmPlexSans.className} ${bebasNeue.variable}`}>
        <body className="antialiased">
          {/* <header className="flex justify-end items-center p-4 gap-4 h-16">
            <SignedOut>
              <SignInButton>Đăng nhập</SignInButton>
              <SignUpButton>Đăng ký</SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </header> */}
          <main>{children}</main>
          <Toaster />
        </body>
      </html>

  )
}