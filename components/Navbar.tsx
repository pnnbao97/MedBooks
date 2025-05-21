// components/Navbar.tsx
'use client';
import Link from "next/link";
import Menu from "@/components/Menu";
import Image from "next/image";
import SearchBar from "@/components/SearchBar";
import NavIcons from "./NavIcons";
import { SidebarTrigger } from "@/components/ui/sidebar";

const Navbar = () => {
  return (
    <div className="font-semibold bg-blue-950 text-blue-200 h-20 px-4 md:px-8 relative">
      {/* MOBILE */}
      <div className="h-full flex items-center justify-between md:hidden">
        <Link href="/">
          <div className="tracking-wide">MedBooks</div>
        </Link>
        <Menu />
      </div>
      {/* BIGGER SCREENS */}
      <div className="hidden md:flex items-center justify-between gap-8 h-full">
        {/* LEFT */}
        <div className="w-1/3 xl:w-1/2 flex items-center gap-10">
          <SidebarTrigger className="text-blue-200 hover:text-white p-2 h-10 w-10 flex items-center 
          justify-center rounded-md hover:bg-blue-800 transition-colors"/>
          <Link href="/" className="flex items-center gap-3">
            <Image src="/icons/admin/logo.svg" alt="" width={37} height={37} />
            <div className="tracking-wide">MedBooks</div>
          </Link>
          <div className="hidden xl:flex gap-12">
            <Link href="/">Trang chủ</Link>
            <Link href="/">Danh mục sách</Link>
            <Link href="/">Liên hệ</Link>
          </div>
        </div>
        {/* RIGHT */}
        <div className="w-2/3 xl:w-1/2 flex items-center justify-between gap-8">
          <SearchBar />
          <NavIcons />
        </div>
      </div>
    </div>
  );
};

export default Navbar;