"use client";
import Link from "next/link";
import Image from "next/image";
import SearchBar from "@/components/SearchBar";
import NavIcons from "./NavIcons";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import * as React from "react";
import { cn } from "@/lib/utils";

const bookCategories: { title: string; href: string; description: string }[] = [
  {
    title: "Y học cơ sở",
    href: "/books?specialty=co-so",
    description: "Giải phẫu học, sinh lý học, sinh lý bệnh, miễn dịch học, vi sinh, hóa sinh y học, dược lý học",
  },
  {
    title: "Sản phụ khoa",
    href: "/books?specialty=san-phu-khoa",  
    description: "Sản phụ khoa, nội tiết học sinh sản, vô sinh, ung thư học phụ khoa",
  },
  {
    title: "Nội khoa",
    href: "/books?specialty=noi-khoa",
    description: "Nội tổng quát, nội tiết, truyền nhiễm, tim mạch học, hô hấp, thần kinh học, tiêu hóa",
  },
  {
    title: "Ngoại khoa", 
    href: "/books?specialty=ngoai-khoa",
    description: "Ngoại khoa, ung bướu, chẩn đoán hình ảnh, chấn thương chỉnh hình, tiết niệu",
  },
  {
    title: "Cấp cứu",
    href: "/books?specialty=cap-cuu",
    description: "Cấp cứu, hồi sức tích cực, ngộ độc, các thủ thuật trong cấp cứu",
  },
  {
    title: "Ôn tập - Lượng giá",
    href: "/books?specialty=mcq",
    description: "USMLE, series Case Files, PreTest, BRS,...",
  },
];

// ListItem component cho menu
const ListItem = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<typeof Link> & { title: string }
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-blue-100">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

const Navbar = () => {
  return (
    <div className="font-semibold bg-blue-950 h-20 px-4 md:px-8 relative md:z-10">
      {/* MOBILE */}
      <div className="h-full flex items-center justify-between sticky md:hidden z-50">
        <div className="flex items-center gap-6">
          <SidebarTrigger className="text-blue-200 hover:text-white p-2 h-10 w-10 flex items-center justify-center rounded-md hover:bg-blue-800 transition-colors"/>
          <Link href="/" className="flex items-center">
            <Image src="/icons/VMedBook-blue.png" alt="" width={150} height={60} />
          </Link>
        </div>
        <div className="flex items-center gap-4 relative z-50">
          <NavIcons />
        </div>
      </div>
      {/* BIGGER SCREENS */}
      <div className="hidden md:flex items-center justify-between gap-8 h-full">
        {/* LEFT */}
        <div className="w-1/3 xl:w-1/2 flex items-center gap-6">
          <SidebarTrigger className="text-blue-200 hover:text-white p-2 h-10 w-10 flex items-center justify-center rounded-md hover:bg-blue-800 transition-colors"/>
          <Link href="/" className="flex items-center">
            <Image src="/icons/VMedBook-blue.png" alt="" width={150} height={60} />
          </Link>
          {/* Navigation Menu mới từ shadcn/ui */}
          <div className="hidden xl:block">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild className="bg-blue-950 text-slate-300">
                    <Link href="/" className={navigationMenuTriggerStyle()}>
                      Trang chủ
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-blue-950 text-slate-300">
                      <Link href="/books">
                      Danh mục sách
                    </Link>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      {bookCategories.map((category) => (
                        <ListItem
                          key={category.title}
                          title={category.title}
                          href={category.href}
                        >
                          {category.description}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild className="bg-blue-950 text-slate-300">
                    <Link href="/contact" className={navigationMenuTriggerStyle()}>
                      Liên hệ
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
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