import Link from 'next/link'
import React from 'react'
import Image from 'next/image'

const CategoryList = () => {
  return (
    <div className='px-4 overflow-x-scroll hide-scrollbar'>
        <div className='flex gap-4 md:gap-8'>
            <Link href="/list?cat=cat" className='flex-shrink-0 w-full sm:w-1/2
            lg:w-1/4 xl:w-1/6'>
                <div className='relative bg-slate-100 w-full h-96'>
                    <Image
                    src="https://m.media-amazon.com/images/I/71-FYAnNvcL._SL1500_.jpg"
                    alt=""
                    fill
                    sizes="20vw"
                    />
                </div>
                <h1 className='mt-8 font-light text-xl tracking-wide'>Sản phụ khoa</h1>
            </Link>
                        <Link href="/list?cat=cat" className='flex-shrink-0 w-full sm:w-1/2
            lg:w-1/4 xl:w-1/6'>
                <div className='relative bg-slate-100 w-full h-96'>
                    <Image
                    src="https://m.media-amazon.com/images/I/71-FYAnNvcL._SL1500_.jpg"
                    alt=""
                    fill
                    sizes="20vw"
                    />
                </div>
                <h1 className='mt-8 font-light text-xl tracking-wide'>Sản phụ khoa</h1>
            </Link>
                        <Link href="/list?cat=cat" className='flex-shrink-0 w-full sm:w-1/2
            lg:w-1/4 xl:w-1/6'>
                <div className='relative bg-slate-100 w-full h-96'>
                    <Image
                    src="https://m.media-amazon.com/images/I/71-FYAnNvcL._SL1500_.jpg"
                    alt=""
                    fill
                    sizes="20vw"
                    />
                </div>
                <h1 className='mt-8 font-light text-xl tracking-wide'>Sản phụ khoa</h1>
            </Link>
                        <Link href="/list?cat=cat" className='flex-shrink-0 w-full sm:w-1/2
            lg:w-1/4 xl:w-1/6'>
                <div className='relative bg-slate-100 w-full h-96'>
                    <Image
                    src="https://m.media-amazon.com/images/I/71-FYAnNvcL._SL1500_.jpg"
                    alt=""
                    fill
                    sizes="20vw"
                    />
                </div>
                <h1 className='mt-8 font-light text-xl tracking-wide'>Sản phụ khoa</h1>
            </Link>
                        <Link href="/list?cat=cat" className='flex-shrink-0 w-full sm:w-1/2
            lg:w-1/4 xl:w-1/6'>
                <div className='relative bg-slate-100 w-full h-96'>
                    <Image
                    src="https://m.media-amazon.com/images/I/71-FYAnNvcL._SL1500_.jpg"
                    alt=""
                    fill
                    sizes="20vw"
                    />
                </div>
                <h1 className='mt-8 font-light text-xl tracking-wide'>Sản phụ khoa</h1>
            </Link>
                        <Link href="/list?cat=cat" className='flex-shrink-0 w-full sm:w-1/2
            lg:w-1/4 xl:w-1/6'>
                <div className='relative bg-slate-100 w-full h-96'>
                    <Image
                    src="https://m.media-amazon.com/images/I/71-FYAnNvcL._SL1500_.jpg"
                    alt=""
                    fill
                    sizes="20vw"
                    />
                </div>
                <h1 className='mt-8 font-light text-xl tracking-wide'>Sản phụ khoa</h1>
            </Link>
                                    <Link href="/list?cat=cat" className='flex-shrink-0 w-full sm:w-1/2
            lg:w-1/4 xl:w-1/6'>
                <div className='relative bg-slate-100 w-full h-96'>
                    <Image
                    src="https://m.media-amazon.com/images/I/71-FYAnNvcL._SL1500_.jpg"
                    alt=""
                    fill
                    sizes="20vw"
                    />
                </div>
                <h1 className='mt-8 font-light text-xl tracking-wide'>Sản phụ khoa</h1>
            </Link>
        </div>
    </div>
  )
}

export default CategoryList