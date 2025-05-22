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

// Define a type for category items
type CategoryItem = {
  id: string
  title: string
  imageUrl: string
  link: string
}

const CategoryList: React.FC = () => {
  // Danh sách các chuyên ngành y khoa
  const categories: CategoryItem[] = [
    {
      id: "obstetrics-gynecology",
      title: "Sản phụ khoa",
      imageUrl: "/api/placeholder/400/320",
      link: "/list?cat=obstetrics-gynecology"
    },
    {
      id: "internal-medicine",
      title: "Nội khoa",
      imageUrl: "/api/placeholder/400/320",
      link: "/list?cat=internal-medicine"
    },
    {
      id: "surgery",
      title: "Ngoại khoa",
      imageUrl: "/api/placeholder/400/320",
      link: "/list?cat=surgery"
    },
    {
      id: "pediatrics",
      title: "Nhi khoa",
      imageUrl: "/api/placeholder/400/320",
      link: "/list?cat=pediatrics"
    },
    {
      id: "neurology",
      title: "Thần kinh",
      imageUrl: "/api/placeholder/400/320",
      link: "/list?cat=neurology"
    },
    {
      id: "cardiology",
      title: "Tim mạch",
      imageUrl: "/api/placeholder/400/320",
      link: "/list?cat=cardiology"
    },
    {
      id: "dermatology",
      title: "Da liễu",
      imageUrl: "/api/placeholder/400/320",
      link: "/list?cat=dermatology"
    },
    {
      id: "ophthalmology",
      title: "Mắt",
      imageUrl: "/api/placeholder/400/320",
      link: "/list?cat=ophthalmology"
    },
    {
      id: "otolaryngology",
      title: "Tai mũi họng",
      imageUrl: "/api/placeholder/400/320",
      link: "/list?cat=otolaryngology"
    },
    {
      id: "oncology",
      title: "Ung thư",
      imageUrl: "/api/placeholder/400/320",
      link: "/list?cat=oncology"
    },
    {
      id: "urology",
      title: "Tiết niệu",
      imageUrl: "/api/placeholder/400/320",
      link: "/list?cat=urology"
    },
    {
      id: "psychiatry",
      title: "Tâm thần",
      imageUrl: "/api/placeholder/400/320",
      link: "/list?cat=psychiatry"
    }
  ]

  return (
    <div className="px-30 relative">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {categories.map((category) => (
            <CarouselItem key={category.id} className="pl-4 md:basis-1/2 lg:basis-1/4">
              <Link href={category.link}>
                <div className="relative bg-slate-100 w-full h-96">
                  <Image
                    src={category.imageUrl}
                    alt={category.title}
                    fill
                    sizes="20vw"
                  />
                </div>
                <h1 className="mt-8 font-light text-xl tracking-wide">{category.title}</h1>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-amber-400 shadow-md" />
        <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-amber-400 shadow-md" />
      </Carousel>
    </div>
  )
}

export default CategoryList