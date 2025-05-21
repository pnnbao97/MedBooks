// app/layout.tsx
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import React, { ReactNode } from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { cookies } from "next/headers";

const Layout = async ({ children }: { children: ReactNode }) => {
  // const session = await auth();
  // if (!session?.user?.id) redirect("login");

  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <div className="min-h-screen w-full bg-slate-50">
        {/* Sidebar */}
        <AppSidebar />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;