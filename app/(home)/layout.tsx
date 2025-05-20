import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import React, { ReactNode } from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";



const layout = async ({children}: {children: ReactNode}) => {
    // const session = await auth();

    // if(!session?.user?.id) redirect("login");

  return (
    <main className='flex min-h-screen w-full flex-col'>

        <div className=''>
 <Navbar />
            {children}
                 <Footer />
        </div>
    </main>
  )
}

export default layout