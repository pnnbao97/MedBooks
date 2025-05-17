import { Button } from '@/components/ui/button'
import { signOut } from '@/auth';
import React from 'react'
import { sampleBooks } from '@/constants';
import BookList from '@/components/BookList';

const page = () => {
  return <>
  <form action={async () => {
    'use server';
    await signOut();
  }}
  className='mb-10'
  >
    <Button>Logout</Button>
  </form>
  <BookList title="Borrowed Boooks" books={sampleBooks} />
  </>
}

export default page