import Add from '@/components/Add'
import CustomizeProducts from '@/components/CustomizeProducts'
import ProductImages from '@/components/ProductImages'
import React from 'react'

const SinglePage = () => {
  return (
    <div className='px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64 relative flex flex-col lg:flex-row gap-16'>
        {/* IMG */}
        <div className='w-full lg:w-1/2 lg:sticky top-20 h-max'>
          <ProductImages/>
        </div>
        {/* TEXT */}
        <div className='w-full lg:w-1/2 flex flex-col gap-6'>
          <h1 className='text-4xl font-medium capitalize text-blue-900'>Y học cấp cứu của Tintinalli</h1>
          <h2 className='text-xl font-semibold text-blue-700'>Tác giả F. Gary Cunningham</h2>
          <p className='font-sans text-justify text-gray-800'>
            Qua 26 phiên bản, Williams Obstetrics đã hướng đến việc phục vụ các bác sĩ sản khoa và hộ sinh đang hành nghề trong việc chăm sóc bệnh nhân tại giường bệnh. Với các giải thích chi tiết về cơ chế bệnh lý và nguyên tắc điều trị, cuốn sách cung cấp một tài liệu nền tảng cho các bác sĩ nội trú đang đào tạo trong lĩnh vực Sản khoa hoặc các chuyên khoa Y học Gia đình. Các nghiên cứu sinh chuyên ngành Y học Bà mẹ - Thai nhi sẽ được hưởng lợi từ các thảo luận bổ sung về các bệnh lý phức tạp và cách quản lý. Cuối cùng, Williams Obstetrics có thể hỗ trợ các chuyên gia đóng vai trò tư vấn cho phụ nữ mang thai mắc các rối loạn không liên quan đến thai kỳ. Cụ thể, mỗi chương trong Phần 12 tập trung vào một hệ cơ quan cụ thể, các thay đổi sinh lý bình thường và các rối loạn thường gặp của hệ cơ quan đó trong thai kỳ, cùng với các lựa chọn điều trị phù hợp.
          </p>
          <div className='h-[2px] bg-gray-100'/>
          <div className='flex items-center gap-4'>
            <h3 className='text-xl text-gray-500 line-through'>1.500.000 VNĐ</h3>
            <h2 className='font-medium text-2xl'>1.000.000 VNĐ</h2>
          </div>
          <div className='h-[2px] bg-gray-100'/>
          <CustomizeProducts/>
          <Add/>
          <div className='h-[2px] bg-gray-100'/>
          <div className=''>
            <h4 className='font-medium mb-4'>CHI TIẾT</h4>
            <p>Nhà xuất bản: McGraw Hill
              <br/> Ấn bản lần 9
              <br/> Ngôn ngữ: Tiếng Việt
              <br/> Số trang: 2160
            </p>
          </div>
        </div>
    </div>
  )
}

export default SinglePage