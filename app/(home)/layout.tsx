// app/layout.tsx
import React, { ReactNode } from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { cookies } from "next/headers";
import { ClerkProvider } from '@clerk/nextjs';
import { viVN } from '@clerk/localizations';

const Layout = async ({ children }: { children: ReactNode }) => {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <ClerkProvider
      localization={viVN}
      appearance={{
        elements: {
          formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
          card: 'shadow-lg',
          headerTitle: 'text-blue-950',
          headerSubtitle: 'text-gray-600'
        }
      }}
    >
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
    </ClerkProvider>
  );
};

export default Layout;