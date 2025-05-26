"use client";
import React, { useState } from "react";
import { BookOpen, Home, ShoppingCart, CircleUser, CircleHelp, User, LogOut, Settings, ChevronUp, ChevronDown } from "lucide-react"
import { 
  SignedIn, 
  SignedOut, 
  useUser,
  SignInButton,
  useClerk
} from "@clerk/nextjs";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
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
    url: "/",
    icon: Home,
  },
  {
    title: "Giỏ hàng",
    url: "#",
    icon: ShoppingCart
  },
  {
    title: "Danh mục sách",
    url: "/list",
    icon: BookOpen,
  },
  {
    title: "Theo dõi đơn hàng",
    url: "/profile",
    icon: CircleUser,
  },
  {
    title: "Hỗ trợ",
    url: "/contact",
    icon: CircleHelp,
  },
]

export function AppSidebar() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setIsUserMenuOpen(false);
  };

  const handleProfileClick = () => {
    window.location.href = '/profile';
    setIsUserMenuOpen(false);
  };

  return (
    <Sidebar className="bg-slate-50 z-30" style={{ '--sidebar-width': '24rem' } as React.CSSProperties}>
      <SidebarContent>
        {/* Header with close button */}
        <div className="flex justify-between items-center p-4 border-b">
          <Link href="/" className="flex items-center">
            <Image src="/icons/VMedBook.png" alt="" width={150} height={50} />
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
        <div className="mt-auto border-t">
          <SignedIn>
            <div className="relative">
              {/* User Info Button */}
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="w-full p-4 flex items-center gap-3 hover:bg-blue-50 transition-colors"
              >
                <div className="relative">
                  {user?.imageUrl ? (
                    <Image
                      src={user.imageUrl}
                      alt="User Avatar"
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="bg-blue-100 p-2 rounded-full">
                      <User className="text-blue-600" size={24} />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-blue-600 font-semibold truncate">
                    {user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Người dùng'}
                  </p>
                  <p className="text-blue-500 text-sm truncate">
                    {user?.primaryEmailAddress?.emailAddress || 'Email không có'}
                  </p>
                </div>
                <div className="text-blue-500">
                  {isUserMenuOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute bottom-full text-sm left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mb-2 py-2 z-50">
                  <button
                    onClick={handleProfileClick}
                    className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors text-gray-700"
                  >
                    <Settings size={18} />
                    <span>Quản lí tài khoản</span>
                  </button>
                  <hr className="my-1" />
                  <button
                    onClick={handleSignOut}
                    className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-red-50 transition-colors text-red-600"
                  >
                    <LogOut size={18} />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          </SignedIn>
          
          <SignedOut>
            <div className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <User className="text-blue-600" size={24} />
                </div>
                <div className="min-w-0 flex-1">
                  <SignInButton mode="modal">
                    <button className="text-blue-600 font-semibold hover:text-blue-800 transition-colors">
                      Đăng nhập
                    </button>
                  </SignInButton>
                  <p className="text-blue-500 text-sm">Để truy cập đầy đủ tính năng</p>
                </div>
              </div>
            </div>
          </SignedOut>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}