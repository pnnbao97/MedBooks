'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import { Button } from './ui/button'
import BookCover from './BookCover'

const BookOverview = ({ 
  title, 
  author, 
  genre, 
  rating, 
  total_copies, 
  available_copies, 
  description, 
  color, 
  cover,
}: Book) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 300; // Character limit for truncated description

  const truncatedDescription =
    description.length > maxLength && !isExpanded
      ? `${description.slice(0, maxLength)}...`
      : description;

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };
  return (
    <section className='book-overview'>
        <div className='flex flex-1 flex-col gap-5'>
          <h1>{title}</h1>

          <div className='book-info'>
            <p>
              Tác giả <span className='font-semibold text-light-200'>{author}</span>
            </p>

            <p>
              Chuyên ngành{' '}
              <span className='font-semibold text-light-200'>{genre}</span>
            </p>

            <div className='flex flex-row gap-1'>
              <Image src='/icons/star.svg' alt='star' width={22} height={22} />
              <p>{rating}</p>
            </div>
          </div>
          <div className='book-copies'>
            <p>
              Tổng số sách: <span>{total_copies}</span>
            </p>

            <p>
              Số lượng có sẵn: <span>{available_copies}</span>
            </p>
          </div>
          <div className="book-description">
            <p id="book-description">{truncatedDescription}</p>
            {description.length > maxLength && (
              <Button
                variant="link"
                className="p-0 h-auto text-yellow-600 hover:underline"
                onClick={handleToggle}
                aria-expanded={isExpanded}
                aria-controls="book-description"
              >
                {isExpanded ? 'Thu gọn' : 'Xem thêm'}
              </Button>
            )}
          </div>

          <Button className="book-overview_btn">
            <Image src='/icons/book.svg' alt='book' width={20} height={20} />
            <p className='font-bebas-neue text-xl text-dark-100'>Mua sách</p>
          </Button>
        </div>

        <div className='relative flex flex-1 justify-center'>
          <div className='relative'>
            <BookCover
              variant="wide"
              className="z-10"
              coverColor={color}
              coverImage={cover}
            />

            <div className='absolute left-16 top-10 rotate-12 opacity-40
            max-sm:hidden'>
              <BookCover
              variant="wide"
              className="z-10"
              coverColor={color}
              coverImage={cover}
              />
            </div>
          </div>
        </div>
      </section>)
}

export default BookOverview