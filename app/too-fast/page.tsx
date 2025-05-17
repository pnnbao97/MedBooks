import React from 'react'

const page = () => {
  return (
    <main className='root-container flex min-h-screen flex-col items-center justify-center'>
        <h1 className='font-sans text-5xl font-bold text-light-100'>
            Chúng tôi phát hiện lưu lượng bất thường từ IP của bạn!
        </h1>
        <p className='mt-3 max-w-xl text-center text-light-400'>
            Hãy thử lại sau vài phút.
        </p>
    </main>
  )
}

export default page