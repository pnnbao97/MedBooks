'use client'
import CategoryList from '@/components/CategoryList'
import ProductList from '@/components/ProductList'
import Slider from '@/components/Slider'
import Skeleton from '@/components/Skeleton'
import { Suspense, useEffect } from "react"
import Link from 'next/link'
import Image from 'next/image'
import Head from 'next/head'
import { ArrowRight, BookOpen, FileMinus, Award, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Component thống kê
const StatsSection = () => {
  const stats = [
    { icon: BookOpen, number: '100+', label: 'Đầu sách y khoa' },
    { icon: FileMinus, number: '10,000+', label: 'Bản dịch đã được thực hiện' },
    { icon: Award, number: '50+', label: 'Chuyên gia thẩm định' },
    { icon: TrendingUp, number: '98%', label: 'Khách hàng hài lòng' }
  ]

  return (
    <section className="bg-gradient-to-r from-blue-400 to-dark-800 text-white py-16">
      <div className="px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Đội ngũ VMedBook</h2>
          <p className="text-blue-200 max-w-2xl mx-auto">
            Với bề dày kinh nghiệm trong giảng dạy và thực hành y khoa, đội ngũ VMedBook thấu hiểu tầm quan trọng của việc cung cấp tài liệu chuyên sâu và đáng tin cậy.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon
            return (
              <div key={index} className="text-center">
                <div className="bg-blue-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IconComponent size={24} />
                </div>
                <div className="text-3xl font-bold mb-2">{stat.number}</div>
                <div className="text-blue-200 text-sm">{stat.label}</div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// Component bài viết mới
const BlogSection = () => {
  const articles = [
    {
      id: 1,
      title: "Cập nhật các phương pháp điều trị mới trong nội khoa 2024",
      excerpt: "Khám phá những tiến bộ mới nhất trong điều trị các bệnh lý nội khoa, từ ứng dụng AI đến liệu pháp gen...",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop",
      author: "TS. BS Nguyễn Văn A",
      date: "2024-05-20",
      readTime: "5 phút đọc",
      category: "Nội khoa"
    },
    {
      id: 2,
      title: "Kỹ thuật phẫu thuật nội soi tiên tiến trong ngoại khoa",
      excerpt: "Tổng quan về các kỹ thuật phẫu thuật nội soi hiện đại và ứng dụng trong thực hành lâm sàng...",
      image: "https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=400&h=300&fit=crop",
      author: "PGS. TS Trần Thị B",
      date: "2024-05-18",
      readTime: "7 phút đọc",
      category: "Ngoại khoa"
    },
    {
      id: 3,
      title: "Chăm sóc thai kỳ trong thời đại số hóa",
      excerpt: "Ứng dụng công nghệ trong theo dõi và chăm sóc thai kỳ, từ app di động đến thiết bị giám sát từ xa...",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop",
      author: "BS. CKI Lê Văn C",
      date: "2024-05-15",
      readTime: "4 phút đọc",
      category: "Sản phụ khoa"
    }
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Bài viết mới nhất</h2>
            <p className="text-gray-600 max-w-2xl">
              Cập nhật những kiến thức y khoa mới nhất, nghiên cứu khoa học và kinh nghiệm lâm sàng từ các chuyên gia hàng đầu
            </p>
          </div>
          <Link href="/blog">
            <Button variant="outline" className="hidden md:flex items-center gap-2">
              Xem tất cả <ArrowRight size={16} />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <article key={article.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="relative h-48 w-full">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover rounded-t-lg"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                    {article.category}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-lg text-gray-900 mb-3 line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {article.excerpt}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    <span>{article.author}</span>
                    <span>{article.readTime}</span>
                  </div>
                  <span>{new Date(article.date).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="text-center mt-8 md:hidden">
          <Link href="/blog">
            <Button variant="outline" className="flex items-center gap-2 mx-auto">
              Xem tất cả bài viết <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

// Component chính
const HomePage = () => {
  // SEO optimization với useEffect
  useEffect(() => {
    // Set document title
    document.title = 'Sách Y Khoa Kinh Điển | Thư Viện Y Học Việt Nam'
    
    // Set meta description
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Khám phá bộ sưu tập sách y khoa kinh điển hàng đầu Việt Nam. Sách nội khoa, ngoại khoa, sản phụ khoa, nhi khoa và các chuyên ngành y học với giá ưu đãi.')
    } else {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = 'Khám phá bộ sưu tập sách y khoa kinh điển hàng đầu Việt Nam. Sách nội khoa, ngoại khoa, sản phụ khoa, nhi khoa và các chuyên ngành y học với giá ưu đãi.'
      document.head.appendChild(meta)
    }

    // Set meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]')
    if (metaKeywords) {
      metaKeywords.setAttribute('content', 'sách y khoa, sách nội khoa, sách ngoại khoa, sách sản phụ khoa, sách nhi khoa, sách y học, giáo trình y khoa, sách chuyên ngành y khoa')
    } else {
      const meta = document.createElement('meta')
      meta.name = 'keywords'
      meta.content = 'sách y khoa, sách nội khoa, sách ngoại khoa, sách sản phụ khoa, sách nhi khoa, sách y học, giáo trình y khoa, sách chuyên ngành y khoa'
      document.head.appendChild(meta)
    }
  }, [])

  return (
    <div>
      {/* Schema.org structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Thư Viện Y Học Việt Nam",
            "description": "Cửa hàng sách y khoa chuyên nghiệp hàng đầu Việt Nam",
            "url": "https://vmedbook.com",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://vmedbook.com/book?search={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })
        }}
      />

      {/* Hero Slider */}
      <Slider/>
      
      {/* Thống kê */}
      <StatsSection />
      
      {/* Sách nổi bật */}
      <section className='mt-20 px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64'>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className='text-2xl font-bold text-gray-900 mb-2'>Sách Y Khoa Kinh Điển</h1>
            <p className="text-gray-600">Những đầu sách được đội ngũ VMedBook chọn lọc kĩ lưỡng</p>
          </div>
          <Link href="/books">
            <Button variant="outline" className="hidden md:flex items-center gap-2 hover:bg-blue-50">
              Xem tất cả sách <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
        <Suspense fallback={<Skeleton />}>
          <ProductList/>
        </Suspense>
        <div className="text-center mt-8 md:hidden">
          <Link href="/books">
            <Button variant="outline" className="flex items-center gap-2 mx-auto">
              Xem tất cả sách <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </section>
      
      {/* Sách theo chuyên ngành */}
      <section className='mt-24 px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64'>
        <div className="mb-12">
          <div className="flex items-center  gap-3 mb-4">
            {/* <div className="bg-blue-100 p-3 rounded-full">
              <BookOpen className="text-blue-600" size={32} />
            </div> */}
            <h1 className='text-2xl font-bold text-gray-900 mb-2'>Sách Theo Chuyên Ngành</h1>
          </div>
          <p className="text-gray-600">
            Khám phá bộ sưu tập sách y khoa được phân loại theo từng chuyên ngành, 
            giúp bạn dễ dàng tìm kiếm kiến thức chuyên sâu
          </p>
        </div>
        <CategoryList/>
      </section>
      
      {/* Bài viết mới */}
      <BlogSection />
      

    </div>
  )
}

export default HomePage