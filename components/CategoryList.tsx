'use client'

import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { Heart, Brain, Baby, Eye, Stethoscope, Scissors, Activity, Shield } from 'lucide-react'

// Define a type for category items
type CategoryItem = {
  id: string
  title: string
  imageUrl: string
  link: string
  description: string
  icon: React.ElementType
  gradient: string
}

const CategoryList: React.FC = () => {
  // Danh sách các chuyên ngành y khoa với ảnh và mô tả
  const categories: CategoryItem[] = [
    {
      id: "noi-khoa",
      title: "Nội khoa",
      imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=320&fit=crop&crop=center",
      link: "/books?specialty=noi-khoa",
      description: "Chẩn đoán và điều trị bệnh lý nội khoa",
      icon: Stethoscope,
      gradient: "from-blue-400 to-blue-600"
    },
    {
      id: "ngoai-khoa",
      title: "Ngoại khoa",
      imageUrl: "https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=400&h=320&fit=crop&crop=center",
      link: "/books?specialty=ngoai-khoa",
      description: "Phẫu thuật và can thiệp ngoại khoa",
      icon: Scissors,
      gradient: "from-red-400 to-red-600"
    },
    {
      id: "san-phu-khoa",
      title: "Sản phụ khoa",
      imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=320&fit=crop&crop=center",
      link: "/books?specialty=san-phu-khoa",
      description: "Chăm sóc sức khỏe phụ nữ và thai kỳ",
      icon: Baby,
      gradient: "from-pink-400 to-rose-600"
    },
    {
      id: "nhi-khoa",
      title: "Nhi khoa",
      imageUrl: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=320&fit=crop&crop=center",
      link: "/books?specialty=nhi-khoa",
      description: "Chăm sóc sức khỏe trẻ em",
      icon: Heart,
      gradient: "from-green-400 to-green-600"
    },
    {
      id: "than-kinh",
      title: "Thần kinh",
      imageUrl: "https://images.unsplash.com/photo-1559757337-c7c6a7bed17d?w=400&h=320&fit=crop&crop=center",
      link: "/books?specialty=than-kinh",
      description: "Hệ thần kinh và các bệnh lý não bộ",
      icon: Brain,
      gradient: "from-purple-400 to-purple-600"
    },
    {
      id: "tim-mach",
      title: "Tim mạch",
      imageUrl: "https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=400&h=320&fit=crop&crop=center",
      link: "/books?specialty=tim-mach",
      description: "Bệnh lý tim mạch và huyết áp",
      icon: Activity,
      gradient: "from-red-500 to-pink-600"
    },
    {
      id: "ho-hap",
      title: "Hô hấp",
      imageUrl: "https://images.unsplash.com/photo-1559757175-c1db5ac6d4d2?w=400&h=320&fit=crop&crop=center",
      link: "/books?specialty=ho-hap",
      description: "Bệnh lý phổi và đường hô hấp",
      icon: Activity,
      gradient: "from-cyan-400 to-blue-500"
    },
    {
      id: "tieu-hoa",
      title: "Tiêu hóa",
      imageUrl: "https://images.unsplash.com/photo-1559757175-c1db5ac6d4d2?w=400&h=320&fit=crop&crop=center",
      link: "/books?specialty=tieu-hoa",
      description: "Bệnh lý dạ dày và đường tiêu hóa",
      icon: Stethoscope,
      gradient: "from-amber-400 to-orange-500"
    },
    {
      id: "noi-tiet",
      title: "Nội tiết",
      imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=320&fit=crop&crop=center",
      link: "/books?specialty=noi-tiet",
      description: "Rối loạn nội tiết và hormone",
      icon: Activity,
      gradient: "from-violet-400 to-purple-500"
    },
    {
      id: "than-tiet-nieu",
      title: "Thận - Tiết niệu",
      imageUrl: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=320&fit=crop&crop=center",
      link: "/books?specialty=than-tiet-nieu",
      description: "Bệnh lý thận và đường tiết niệu",
      icon: Activity,
      gradient: "from-yellow-400 to-yellow-600"
    },
    {
      id: "co-xuong-khop",
      title: "Cơ xương khớp",
      imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=320&fit=crop&crop=center",
      link: "/books?specialty=co-xuong-khop",
      description: "Bệnh lý cơ xương khớp và chấn thương",
      icon: Shield,
      gradient: "from-teal-400 to-green-500"
    },
    {
      id: "ung-buou",
      title: "Ung bướu",
      imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=320&fit=crop&crop=center",
      link: "/books?specialty=ung-buou",
      description: "Điều trị và phòng chống ung thư",
      icon: Shield,
      gradient: "from-indigo-400 to-indigo-600"
    },
    {
      id: "gay-me-hoi-suc",
      title: "Gây mê hồi sức",
      imageUrl: "https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=400&h=320&fit=crop&crop=center",
      link: "/books?specialty=gay-me-hoi-suc",
      description: "Gây mê và hồi sức cấp cứu",
      icon: Activity,
      gradient: "from-red-400 to-pink-500"
    },
    {
      id: "cap-cuu",
      title: "Cấp cứu",
      imageUrl: "https://images.unsplash.com/photo-1632833239869-a37e3a5806d2?w=400&h=320&fit=crop&crop=center",
      link: "/books?specialty=cap-cuu",
      description: "Xử lý các tình huống cấp cứu",
      icon: Activity,
      gradient: "from-red-500 to-red-700"
    },
    {
      id: "truyen-nhiem",
      title: "Truyền nhiễm",
      imageUrl: "https://images.unsplash.com/photo-1584118624012-df056829fbd0?w=400&h=320&fit=crop&crop=center",
      link: "/books?specialty=truyen-nhiem",
      description: "Bệnh truyền nhiễm và phòng chống",
      icon: Shield,
      gradient: "from-orange-400 to-red-500"
    },
    {
      id: "cdha",
      title: "Chẩn đoán hình ảnh",
      imageUrl: "https://images.unsplash.com/photo-1559757175-c7c6a7bed17d?w=400&h=320&fit=crop&crop=center",
      link: "/books?specialty=cdha",
      description: "X-quang, CT, MRI và siêu âm",
      icon: Eye,
      gradient: "from-slate-400 to-gray-600"
    },
    {
      id: "huyet-hoc",
      title: "Huyết học",
      imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=320&fit=crop&crop=center",
      link: "/books?specialty=huyet-hoc",
      description: "Bệnh lý máu và tạo huyết",
      icon: Activity,
      gradient: "from-rose-400 to-pink-600"
    },
    {
      id: "co-so",
      title: "Y học cơ sở",
      imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=320&fit=crop&crop=center",
      link: "/books?specialty=co-so",
      description: "Kiến thức y học cơ bản",
      icon: Stethoscope,
      gradient: "from-blue-300 to-blue-500"
    },
    {
      id: "y-hoc-gia-dinh",
      title: "Y học gia đình",
      imageUrl: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=320&fit=crop&crop=center",
      link: "/books?specialty=y-hoc-gia-dinh",
      description: "Chăm sóc sức khỏe toàn diện",
      icon: Heart,
      gradient: "from-emerald-400 to-green-600"
    }
  ]

  return (
    <div className="px-4 relative">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {categories.map((category) => {
            const IconComponent = category.icon
            return (
              <CarouselItem key={category.id} className="pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                <Link href={category.link} className="group block">
                  <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden">
                    {/* Image Container */}
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={category.imageUrl}
                        alt={category.title}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      {/* Gradient Overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-t ${category.gradient} opacity-60 group-hover:opacity-40 transition-opacity duration-300`}></div>
                      
                      {/* Icon */}
                      <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-3 group-hover:bg-white/30 transition-all duration-300">
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      
                      {/* Title Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                        <h3 className="text-white font-bold text-lg mb-1">{category.title}</h3>
                        <p className="text-white/90 text-sm line-clamp-2">{category.description}</p>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                            {category.title}
                          </h4>
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {category.description}
                          </p>
                        </div>
                        <div className="ml-4">
                          <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors duration-300">
                            <svg 
                              className="w-5 h-5 text-blue-600 transform group-hover:translate-x-1 transition-transform duration-300" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </CarouselItem>
            )
          })}
        </CarouselContent>
        
        {/* Navigation Buttons */}
        <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg border-0 w-12 h-12 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110" />
        <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg border-0 w-12 h-12 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110" />
      </Carousel>
    </div>
  )
}

export default CategoryList