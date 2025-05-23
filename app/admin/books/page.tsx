import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'

import { eq } from 'drizzle-orm'
import { db } from '@/database/drizzle'
import { books } from '@/database/schema'

const page = async () => {
  // Fetch all books from the database
  const bookList = await db.select({
    id: books.id,
    title: books.title,
    author: books.author,
    primarySpecialty: books.primarySpecialty,
    availableCopies: books.availableCopies,
    isbn: books.isbn,
    colorPrice: books.colorPrice,
    hasColorSale: books.hasColorSale,
    colorSaleAmount: books.colorSaleAmount,
  }).from(books)

  return (
    <section className='w-full rounded-2xl bg-white p-7'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <h2 className='text-xl font-semibold'>Tất cả sách hiện có</h2>
        <Button className='bg-primary-admin' asChild>
          <Link href="/admin/books/new" className='text-white'>
            + Thêm sách mới
          </Link>
        </Button>
      </div>

      <div className='mt-7 w-full overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Tiêu đề</th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Tác giả</th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Chuyên ngành</th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Số lượng</th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>ISBN</th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Giá bản màu</th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Hành động</th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {bookList.length > 0 ? (
              bookList.map((book) => (
                <tr key={book.id}>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>{book.title}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>{book.author}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>{book.primarySpecialty}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>{book.availableCopies}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>{book.isbn || '-'}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {book.hasColorSale ? (
                      <span>
                        <span className='line-through'>{book.colorPrice}</span>{' '}
                        {book.colorPrice - book.colorSaleAmount}
                      </span>
                    ) : (
                      book.colorPrice
                    )}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                    <Link href={`/admin/books/edit/${book.id}`} className='text-blue-600 hover:text-blue-900'>
                      Sửa
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className='px-6 py-4 text-center text-sm text-gray-500'>
                  Không có sách nào được tìm thấy.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default page