"use client"

import React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'


const CartModal = () => {

    const cartItems = false
  return (
    <div className='w-max absolute p-4 rounded-md shadow-[0_3px_10px_rgb(0,0,0,0.2)] bg-white top-12 right-0 flex flex-col gap-6 z-20'>
        {cartItems ? (
            <div className=''>Giỏ hàng trống</div>
        ) : (
            <>
            <h2 className='text-xl'>Sách của bạn</h2>
            <div className='flex flex-col gap-8'>
            {/* ITEM */}
            <div className='flex gap-4'>
                <Image 
                    src="https://m.media-amazon.com/images/I/71kBZqYm3yL._SL1345_.jpg" 
                    alt="" 
                    width={72} 
                    height={96} 
                    className='object-cover rounded-md'
                />
                <div className='flex flex-col justify-between w-full'>
                    <div className=''>
                        <div className='flex max-w-xs items-center justify-between gap-8'>
                            <div className='text-amber-700 font-semibold'>Giải phẫu học Gray</div>
                            <div className='font-normal text-amber-900'>700.000 VNĐ</div>
                        </div>
                        <div className='text-sm text-gray-500'>
                        </div>
                    </div>
                    <div className='flex justify-between text-sm'>
                        <span className="text-gray-500">Số lượng: 2</span>
                        <span className='text-blue-500'>Hủy bỏ</span>
                    </div>
                </div>
            </div>
            {/* ITEM */}
            <div className='flex gap-4'>
                <Image 
                    src="https://m.media-amazon.com/images/I/61nMEa4x6LL._SL1500_.jpg" 
                    alt="" 
                    width={72} 
                    height={96} 
                    className='object-cover rounded-md'
                />
                <div className='flex flex-col justify-between w-full'>
                    <div className=''>
                        <div className='flex max-w-xs items-center justify-between gap-8'>
                            <div className='text-amber-700 font-semibold'>Sản khoa Williams</div>
                            <div className='font-normal text-amber-900'>1.200.000 VNĐ</div>
                        </div>
                        <div className='text-sm text-gray-500'>
                        </div>
                    </div>
                    <div className='flex justify-between text-sm'>
                        <span className="text-gray-500">Số lượng: 1</span>
                        <span className='text-blue-500'>Hủy bỏ</span>
                    </div>
                </div>
            </div>
            </div>
            {/* BOTTOM */}
            <div className=''>
                <div className='flex items-center justify-between'>
                    <span className=''>Tổng tiền</span>
                    <span className=''>1.900.000 VNĐ</span>
                </div>
                <p className='text-gray-500 text-sm mt-2 mb-4'>
                    Thanh toán ngay để được hưởng ưu đãi
                </p>
                <div className='flex justify-between text-sm'>
                    <Button className='bg-blue-900 text-white hover:bg-white hover:text-blue-900'>Xem giỏ hàng</Button>
                    <Button className='text-lg bg-black text-white hover:bg-white hover:text-black'>Thanh toán</Button>
                </div>
            </div>
            </>

        )}
    </div>
  )
}

export default CartModal