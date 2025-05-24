import { BookOpen, Home, ShoppingCart, CircleUser, CircleHelp, X, User } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger
} from "@/components/ui/sidebar"
import Link from "next/link"
import Image from "next/image"

// Menu items.
const items = [
  {
    title: "Trang chủ",
    url: "#",
    icon: Home,
  },
  {
    title: "Giỏ hàng",
    url: "#",
    icon: ShoppingCart
  },
  {
    title: "Danh mục sách",
    url: "#",
    icon: BookOpen,
  },
  {
    title: "Tài khoản",
    url: "#",
    icon: CircleUser,
  },
  {
    title: "Hỗ trợ",
    url: "#",
    icon: CircleHelp,
  },
]

export function AppSidebar() {
  return (
    <Sidebar className="bg-slate-50 --sidebar-width:24rem">
      <SidebarContent>
        {/* Header with close button */}
        <div className="flex justify-between items-center p-4 border-b">
              <Link href="/" className="flex items-center">
            <Image src="/icons/VMedBook-origin.png" alt="" width={150} height={50} />
           
          </Link>
          <SidebarTrigger className="p-1 hover:bg-gray-100 rounded" />
        </div>
        <SidebarGroup>

          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url} className="text-blue-950 font-semibold hover:bg-blue-50">
                      <item.icon className="text-blue-500" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* User profile section at bottom */}
        <div className="mt-auto border-t p-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <User className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-blue-600 font-semibold">Dr. Puma</p>
              <p className="text-blue-500 text-sm">scream3ktr6@gmail.com</p>
            </div>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}