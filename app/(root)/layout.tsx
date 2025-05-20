import React, { ReactNode } from 'react'
import Header from '@/components/Header'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'

const layout = async ({ children } : { children : ReactNode }) => {
  const session = await auth();

  if (!session) redirect("login");
  return (
    <main className='root-container'>
        <div className='mx-auto max-w-8xl'>
            <Header session = {session} />

            <div className='mt-10 pb-5'>
            {children}
            </div>
        </div>
    </main>
  )
}

export default layout