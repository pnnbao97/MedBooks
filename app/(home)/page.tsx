'use client'
import CategoryList from '@/components/CategoryList'
import ProductList from '@/components/ProductList'
import Slider from '@/components/Slider'
import Skeleton from '@/components/Skeleton';
import { Suspense, useContext, useEffect } from "react";

const page = () => {
  return (
    <div>
      <Slider/>
      <div className='mt-24 px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64'>
        <h1 className='text-xl text-dark-800 font-semibold mb-4'>Sách nổi bật</h1>
         <Suspense fallback={<Skeleton />}>
      <ProductList/>
      </Suspense>
      </div>
      <div className='mt-24 px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64'>
        <h1 className='text-xl text-dark-800 font-semibold mb-4'>Sách theo chuyên ngành</h1>
      <CategoryList/>
      </div>
      <div className='mt-24 px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64'>
        <h1 className='text-2xl'>Sách nổi bật</h1>
      <ProductList/>
      </div>
    </div>
  )
}

export default page