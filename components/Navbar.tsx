// components/Navbar.tsx
'use client';
import Link from "next/link";
import Image from "next/image";
import SearchBar from "@/components/SearchBar";
import NavIcons from "./NavIcons";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Menu from "@/components/Menu";
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

// Các thành phần danh mục sách (có thể thay thế bằng dữ liệu thực tế của bạn)
const bookCategories: { title: string; href: string; description: string }[] = [
  {
    title: "Y học cơ bản",
    href: "/category/basic-medicine",
    description: "Sách về giải phẫu học, sinh lý học và các nguyên lý y học cơ bản.",
  },
  {
    title: "Dược học",
    href: "/category/pharmacy",
    description: "Sách về dược lý học, điều chế thuốc và dược phẩm.",
  },
  {
    title: "Nhi khoa",
    href: "/category/pediatrics",
    description: "Sách chuyên về chăm sóc và điều trị bệnh lý ở trẻ em.",
  },
  {
    title: "Nội khoa",
    href: "/category/internal-medicine",
    description: "Sách về các bệnh nội khoa và phương pháp điều trị.",
  },
  {
    title: "Ngoại khoa",
    href: "/category/surgery",
    description: "Sách về phẫu thuật và các kỹ thuật phẫu thuật.",
  },
  {
    title: "Y học cổ truyền",
    href: "/category/traditional-medicine",
    description: "Sách về các phương pháp điều trị y học cổ truyền và thảo dược.",
  },
];

// ListItem component cho menu
const ListItem = React.forwardRef<
  React.ElementRef<typeof Link>,
  React.ComponentPropsWithoutRef<typeof Link> & { title: string }
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-blue-700 hover:text-white focus:bg-blue-700 focus:text-white",
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
    <div className="font-semibold bg-blue-950 text-blue-200 h-20 px-4 md:px-8 relative">
      {/* MOBILE */}
      <div className="h-full flex items-center justify-between sticky md:hidden">
        <div className="flex items-center justify-between gap-6">
         <SidebarTrigger className="text-blue-200 hover:text-white p-2 h-10 w-10 flex items-center 
          justify-center rounded-md hover:bg-blue-800 transition-colors"/>
          <Link href="/" className="flex items-center">
            <Image src="/icons/VMedBook-blue.png" alt="" width={150} height={60} />
           
          </Link>
          </div>
     
      </div>
      {/* BIGGER SCREENS */}
      <div className="hidden md:flex items-center justify-between gap-8 h-full">
        {/* LEFT */}
        <div className="w-1/3 xl:w-1/2 flex items-center gap-6">
          <SidebarTrigger className="text-blue-200 hover:text-white p-2 h-10 w-10 flex items-center 
          justify-center rounded-md hover:bg-blue-800 transition-colors"/>
          <Link href="/" className="flex items-center">
            <Image src="/icons/VMedBook-blue.png" alt="" width={150} height={60} />
           
          </Link>
          
          {/* Navigation Menu mới từ shadcn/ui */}
          <div className="hidden xl:block">
            <NavigationMenu >
              <NavigationMenuList >
                <NavigationMenuItem >
                  <NavigationMenuLink asChild className="bg-blue-950">
                    <Link href="/" className={navigationMenuTriggerStyle()}>
                      Trang chủ
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-blue-950">Danh mục sách</NavigationMenuTrigger>
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
                  <NavigationMenuLink asChild className="bg-blue-950">
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