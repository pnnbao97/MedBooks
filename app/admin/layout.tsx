import { redirect } from 'next/navigation';
import React, { ReactNode } from 'react';
import "@/styles/admin.css"
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';

const layout = async ({children}: {children: ReactNode}) => {


  return (
    <main className='flex min-h-screen w-full flex-row'>
        <Sidebar />
        <div className='admin-container'>
            <Header />
            {children}
        </div>
    </main>
  )
}

export default layout