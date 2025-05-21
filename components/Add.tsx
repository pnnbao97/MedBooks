"use client"
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'

const Add = () => {
    const [quantity, setQuantity] = useState(1)
    const maxQuantity = 4

    const handleQuantity = (type: "i" | "d") => {
        if (type==="d" && quantity >1) {
            setQuantity((prev) => prev  - 1)
        }
        if (type==="i" && quantity <maxQuantity) {
            setQuantity((prev) => prev  + 1)
        }
    }

  return (
    <div className='flex flex-col gap-4'>
        
        <h4 className='font-medium'>Số lượng</h4>
        <div className='flex justify-between items-center'>
        <div className='flex items-center gap-4'>
            <div className='bg-gray-100 py-2 px-4 rounded-3xl flex items-center justify-between w-32'>
                <Button className='text-xl bg-gray-100 hover:bg-gray-100' onClick={() => handleQuantity("d")}>-</Button>
                {quantity}
                <Button className='text-xl bg-gray-100 hover:bg-gray-100' onClick={() => handleQuantity("i")}>+</Button>
            </div>
            <div>
                Còn lại <span className='text-orange-500'>4</span> cuốn
            </div>
        </div>
        <div>
                    <Button className='w-[180px] text-lg rounded-3xl bg-white text-red-700 border border-red-950 hover:bg-red-800 hover:text-white
        disabled:bg-blue-200 disabled:text-white disabled:cursor-not-allowed'>
            Mua sách
        </Button>
        </div>
        <div className=''></div>
    </div>
    </div>
  )
}

export default Add