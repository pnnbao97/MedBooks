import React from 'react'

const CustomizeProducts = () => {
  return (
    <div className='flex flex-col gap-6'>
        <h4 className='font-medium'>Lựa chọn phiên bản</h4>
        <ul className='flex items-center gap-3'>
            <li className='ring-1 ring-blue-900 text-blue-900 rounded-md py-1 px-4 text-sm cursor-pointer'>
                Bản gốc (bìa cứng, in màu)
            </li>
            <li className='ring-1 ring-blue-900 text-white bg-blue-900 rounded-md py-1 px-4 text-sm cursor-pointer'>
                Bản photo (bìa mềm, in đen trắng)
            </li>                      
        </ul>
    </div>
  )
}

export default CustomizeProducts