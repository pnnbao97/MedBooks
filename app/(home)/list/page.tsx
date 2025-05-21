import React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import Filter from '@/components/Filter'
import ProductList from '@/components/ProductList'
import BookCover from '@/components/BookCover'

const page = () => {
    const color =  "#2f89d8"
   const cover =  "https://m.media-amazon.com/images/I/61nMEa4x6LL._SL1500_.jpg"
  return (
    <div className='px-4 md:px-8 lg:px-16 xl:32 2xl:px-64 relative'>
        {/* CAMPAIGN */}
        <div className='hidden bg-gradient-to-r from-blue-50 to-blue-300 p-4 sm:flex justify-between '>
          <div className='w-2/3 flex flex-col items-center justify-center gap-8'>
            <h1 className='text-4xl font-semibold font-ibm-plex-sans text-blue-950
            leading-[48px]'>Sản khoa Williams 
            <br/>đã hoàn thiện 90%
            </h1>
            <Button className='rounded-3xl bg-blue-900 text-white w-max py-3 px-5 '>Đặt sách ngay</Button>
          </div>
          <div className='relative w-1/2'>
              {/* <Image 
              src="https://m.media-amazon.com/images/I/61nMEa4x6LL._SL1500_.jpg" 
              alt="" 
              fill 
              className="object-contain"
              /> */}
        {/* <div className='relative flex flex-1 justify-center'> */}
          {/* <div className='relative'> */}
            <BookCover
              variant="wide"
              className="z-10"
              coverColor={color}
              coverImage={cover}
            />

            <div className='absolute hidden left-16 top-10 rotate-12 opacity-40
            xl:flex'>
              <BookCover
              variant="wide"
              className="z-10"
              coverColor={color}
              coverImage={cover}
              />
            {/* </div> */}
          </div>
          </div>
          </div>
        {/* </div> */}
        {/* FILTER */}
        <Filter/>
        {/* BOOKS */}
        <h1 className='mt-12 text-lg text-blue-900 font-semibold'>Tất cả</h1>
        <ProductList />
    </div>
  )
}

export default page