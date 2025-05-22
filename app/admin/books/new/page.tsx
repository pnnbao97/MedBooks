import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'
import BookForm from '@/components/admin/forms/BookForm'

const page = () => {
  return (
    <>
    <Button asChild className='rounded-3xl w-[140px] mb-3 text-sm bg-blue-900 text-white hover:bg-white hover:text-blue-900'>
        <Link href="/admin/books">Quay lại kho sách</Link>
    </Button>

    <section className='w-full max-w-2xl'>
        <BookForm />
    </section>
    </>
  )
}

export default page