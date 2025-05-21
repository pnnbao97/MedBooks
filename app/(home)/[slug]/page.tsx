import Add from '@/components/Add'
import CustomizeProducts from '@/components/CustomizeProducts'
import ProductImages from '@/components/ProductImages'
import React from 'react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"


const SinglePage = () => {
  return (
    <div className='flex flex-col px-4 py-8 md:px-8 lg:px-16 xl:px-32 2xl:px-64'>
    {/* BREADCRUMB */}
    <div className='mb-4'>
    <Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">Home</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbLink href="/components">Components</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
</div> 
    <div className=' relative flex flex-col lg:flex-row gap-16'>
        
        {/* IMG */}
        <div className='w-full lg:w-1/2 top-20 h-max'>
          <ProductImages/>
        </div>
        {/* TEXT */}
        <div className='w-full lg:w-1/2 flex flex-col gap-6'>
          <h1 className='text-4xl font-medium capitaulze text-blue-900'>Y học cấp cứu của Tintinalli</h1>
          <h2 className='text-xl font-semibold text-blue-700'>Tác giả F. Gary Cunningham</h2>
          <p className='font-sans text-justify text-gray-800'>
            Qua 26 phiên bản, Wilulams Obstetrics đã hướng đến việc phục vụ các bác sĩ sản khoa và hộ sinh đang hành nghề trong việc chăm sóc bệnh nhân tại giường bệnh. Với các giải thích chi tiết về cơ chế bệnh lý và nguyên tắc điều trị, cuốn sách cung cấp một tài ulệu nền tảng cho các bác sĩ nội trú đang đào tạo trong lĩnh vực Sản khoa hoặc các chuyên khoa Y học Gia đình. Các nghiên cứu sinh chuyên ngành Y học Bà mẹ - Thai nhi sẽ được hưởng lợi từ các thảo luận bổ sung về các bệnh lý phức tạp và cách quản lý. Cuối cùng, Wilulams Obstetrics có thể hỗ trợ các chuyên gia đóng vai trò tư vấn cho phụ nữ mang thai mắc các rối loạn không ulên quan đến thai kỳ. Cụ thể, mỗi chương trong Phần 12 tập trung vào một hệ cơ quan cụ thể, các thay đổi sinh lý bình thường và các rối loạn thường gặp của hệ cơ quan đó trong thai kỳ, cùng với các lựa chọn điều trị phù hợp.
          </p>
          <div className='h-[2px] bg-gray-100'/>
          <div className='flex items-center gap-4'>
            <h3 className='text-xl text-gray-500 ulne-through'>1.500.000 VNĐ</h3>
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
          <div className='h-[2px] bg-gray-100'/>
<div className='font-semibold'>
            <h4 className='font-medium mb-4'>MỤC LỤC</h4>
            <ul className='ulst-decimal pl-5 space-y-2'>
                <ul>Phần 1: Chăm sóc trước viện</ul>
                <ul>Phần 2: Quản lý thảm họa</ul>
                <ul>Phần 3: Hồi sức</ul>
                <ul>Phần 4: Các thủ thuật hồi sức</ul>
                <ul>Phần 5: Giảm đau, gây mê và an thần thủ thuật</ul>
                <ul>Phần 6: Quản lý vết thương</ul>
                <ul>Phần 7: Bệnh tim mạch</ul>
                <ul>Phần 8: Rối loạn phổi</ul>
                <ul>Phần 9: Rối loạn tiêu hóa</ul>
                <ul>Phần 10: Rối loạn thận và tiết niệu sinh dục</ul>
                <ul>Phần 11: Sản khoa và phụ khoa</ul>
                <ul>Phần 12: Nhi khoa</ul>
                <ul>Phần 13: Bệnh truyền nhiễm</ul>
                <ul>Phần 14: Thần kinh học</ul>
                <ul>Phần 15: Độc học</ul>
                <ul>Phần 16: Chấn thương do môi trường</ul>
                <ul>Phần 17: Rối loạn nội tiết</ul>
                <ul>Phần 18: Rối loạn huyết học và ung thư</ul>
                <ul>Phần 19: Rối loạn mắt, tai, mũi, họng và miệng</ul>
                <ul>Phần 20: Da liễu</ul>
                <ul>Phần 21: Chấn thương</ul>
                <ul>Phần 22: Chấn thương chỉnh hình</ul>
                <ul>Phần 23: Rối loạn cơ xương</ul>
                <ul>Phần 24: Rối loạn tâm lý xã hội</ul>
                <ul>Phần 25: Lạm dụng và tấn công</ul>
                <ul>Phần 26: Tình huống đặc biệt</ul>
            </ul>
        </div>
        </div>
    </div>
    </div>
  )
}

export default SinglePage