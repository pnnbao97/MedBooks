import Link from 'next/link'
import React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

const ProductList = () => {
  return (
    <div className='flex gap-x-8 gap-y-16 justify-between flex-wrap'>
        <Link href="/book" className='w-full flex flex-col gap-4 sm:w-[45%] lg:w-[22%]'>
            <div className='relative w-full h-80'>
            <Image 
            src="https://m.media-amazon.com/images/I/61nMEa4x6LL._SL1500_.jpg" 
            alt=""
            fill 
            sizes="25vw"
            className='absolute object-cover rounded-md z-10 hover:opacity-0 transition-opacity easy duration-500'
            />
            <Image 
            src="https://m.media-amazon.com/images/I/61nMEa4x6LL._SL1500_.jpg" 
            alt=""
            fill 
            sizes="25vw"
            />
            </div>
            <div className='flex justify-between'>
                <span className='font-medium'>Sản khoa Williams</span>
                <span className='font-semibold'>1.300.000</span>
            </div>
            <div className='text-sm text-gray-500'>
                Miêu tả
            </div>
            <Button className='bg-white ring-blue-950 ring-1 text-blue-950 hover:text-white hover:bg-blue-900 w-max'>Thêm vào giỏ sách</Button>
        </Link>
                <Link href="/book" className='w-full flex flex-col gap-4 sm:w-[45%] lg:w-[22%]'>
            <div className='relative w-full h-80'>
            <Image 
            src="https://m.media-amazon.com/images/I/61nMEa4x6LL._SL1500_.jpg" 
            alt=""
            fill 
            sizes="25vw"
            className='absolute object-cover rounded-md z-10 hover:opacity-0 transition-opacity easy duration-500'
            />
            <Image 
            src="https://m.media-amazon.com/images/I/61nMEa4x6LL._SL1500_.jpg" 
            alt=""
            fill 
            sizes="25vw"
            />
            </div>
            <div className='flex justify-between'>
                <span className='font-medium'>Sản khoa Williams</span>
                <span className='font-semibold'>1.300.000</span>
            </div>
            <div className='text-sm text-gray-500'>
                Miêu tả
            </div>
            <Button className='bg-white ring-blue-950 ring-1 text-blue-950 hover:text-white hover:bg-blue-900 w-max'>Thêm vào giỏ sách</Button>
        </Link>
                <Link href="/book" className='w-full flex flex-col gap-4 sm:w-[45%] lg:w-[22%]'>
            <div className='relative w-full h-80'>
            <Image 
            src="https://m.media-amazon.com/images/I/61nMEa4x6LL._SL1500_.jpg" 
            alt=""
            fill 
            sizes="25vw"
            className='absolute object-cover rounded-md z-10 hover:opacity-0 transition-opacity easy duration-500'
            />
            <Image 
            src="https://m.media-amazon.com/images/I/61nMEa4x6LL._SL1500_.jpg" 
            alt=""
            fill 
            sizes="25vw"
            />
            </div>
            <div className='flex justify-between'>
                <span className='font-medium'>Sản khoa Williams</span>
                <span className='font-semibold'>1.300.000</span>
            </div>
            <div className='text-sm text-gray-500'>
                Miêu tả
            </div>
            <Button className='bg-white ring-blue-950 ring-1 text-blue-950 hover:text-white hover:bg-blue-900 w-max'>Thêm vào giỏ sách</Button>
        </Link>
    </div>
  )
}

export default ProductList