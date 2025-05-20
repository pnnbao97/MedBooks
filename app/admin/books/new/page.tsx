import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'
import BookForm from '@/app/admin/forms/BookForm'

const page = () => {
  return (
    <>
    <Button asChild className='back-btn'>
        <Link href="/admin/books">Quay lại kho sách</Link>
    </Button>

    <section className='w-full max-w-2xl'>
        <BookForm />
    </section>
    </>
  )
}

export default page