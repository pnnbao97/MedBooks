// page.tsx - Books listing page with filters
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Filter from '@/components/Filter'
import ProductList from '@/components/ProductList'
import BookCover from '@/components/BookCover'
import { getBooks, getBooksBySpecialty } from '@/lib/actions/get-books'
import { Metadata } from 'next'


// Medical specialties mapping
const medicalSpecialties = [
  { value: "noi-khoa", label: "Nội khoa" },
  { value: "ngoai-khoa", label: "Ngoại khoa" },
  { value: "san-phu-khoa", label: "Sản phụ khoa" },
  { value: "nhi-khoa", label: "Nhi khoa" },
  { value: "nhan-khoa", label: "Nhãn khoa" },
  { value: "tai-mui-hong", label: "Tai mũi họng" },
  { value: "da-lieu", label: "Da liễu" },
  { value: "tinh-than", label: "Tâm thần" },
  { value: "than-kinh", label: "Thần kinh" },
  { value: "tim-mach", label: "Tim mạch" },
  { value: "ho-hap", label: "Hô hấp" },
  { value: "tieu-hoa", label: "Tiêu hóa" },
  { value: "noi-tiet", label: "Nội tiết" },
  { value: "than-tiet-nieu", label: "Thận - Tiết niệu" },
  { value: "co-xuong-khop", label: "Cơ xương khớp" },
  { value: "ung-buou", label: "Ung bướu" },
  { value: "gay-me-hoi-suc", label: "Gây mê hồi sức" },
  { value: "cap-cuu", label: "Cấp cứu" },
  { value: "truyen-nhiem", label: "Truyền nhiễm" },
  { value: "cdha", label: "Chẩn đoán hình ảnh" },
  { value: "huyet-hoc", label: "Huyết học" },
  { value: "co-so", label: "Y học cơ sở" },
  { value: "y-hoc-gia-dinh", label: "Y học gia đình" }
];

// SEO Metadata
export const metadata: Metadata = {
  title: 'Sách Y Khoa - VMedBook | Dịch Thuật Y Khoa Chuyên Nghiệp',
  description: 'Khám phá bộ sưu tập sách y khoa được dịch thuật chuyên nghiệp. Cập nhật kiến thức y khoa mới nhất từ các chuyên ngành: Nội khoa, Ngoại khoa, Sản phụ khoa, Nhi khoa và nhiều hơn nữa.',
  keywords: 'sách y khoa, dịch thuật y khoa, y học, bác sĩ, sinh viên y, VMedBook, nội khoa, ngoại khoa, sản phụ khoa',
  openGraph: {
    title: 'Sách Y Khoa - VMedBook',
    description: 'Bộ sưu tập sách y khoa chuyên nghiệp với dịch thuật chất lượng cao',
    url: 'https://www.vmedbook.com/books',
    siteName: 'VMedBook',
    images: [
      {
        url: '/og-books.jpg',
        width: 1200,
        height: 630,
        alt: 'Sách Y Khoa VMedBook',
      },
    ],
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sách Y Khoa - VMedBook',
    description: 'Bộ sưu tập sách y khoa chuyên nghiệp với dịch thuật chất lượng cao',
  },
  alternates: {
    canonical: 'https://www.vmedbook.com/books',
  },
}

interface SearchParams {
  specialty?: string;
  minPrice?: string;
  maxPrice?: string;
  availability?: string;
  sort?: string;
  search?: string;
}

const BooksPage = async ({ 
  searchParams 
}: { 
  searchParams: Promise<SearchParams> 
}) => {
  // Await searchParams
  const params = await searchParams;
  
  // Get filter parameters
  const specialty = params.specialty;
  const minPrice = params.minPrice ? parseInt(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? parseInt(params.maxPrice) : undefined;
  const availability = params.availability;
  const sort = params.sort || 'newest';
  const search = params.search;

  // Fetch books based on filters
  let books: Book[];
  if (specialty) {
    books = await getBooksBySpecialty(specialty, {
      minPrice,
      maxPrice,
      availability,
      sort,
      search
    });
  } else {
    books = await getBooks({
      minPrice,
      maxPrice,
      availability,
      sort,
      search
    });
  }

  // Featured book for campaign banner
  const featuredBook = books.find(book => book.preorder) || books[0];
  const color = "#2f89d8";
  const cover = featuredBook?.coverUrl || "https://m.media-amazon.com/images/I/61nMEa4x6LL._SL1500_.jpg";

  // Get current specialty label
  const currentSpecialtyLabel = specialty 
    ? medicalSpecialties.find(s => s.value === specialty)?.label || specialty
    : 'Tất cả';

  return (
    <div className='px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64 relative'>
      {/* CAMPAIGN BANNER */}
      {featuredBook && (
        <div className='hidden bg-gradient-to-r from-blue-50 to-blue-300 p-4 sm:flex justify-between rounded-lg mb-8'>
          <div className='w-2/3 flex flex-col items-center justify-center gap-8'>
            <h1 className='text-4xl font-semibold font-ibm-plex-sans text-blue-950 leading-[48px]'>
              {featuredBook.title}
              <br/>
              {featuredBook.preorder ? 'Đặt trước ngay' : 'Sách mới nhất'}
            </h1>
            <p className='text-blue-800 text-lg max-w-md text-center'>
              {featuredBook.description}
            </p>
            <Link href={`/books/${featuredBook.slug}`}>
              <Button className='rounded-3xl bg-blue-900 text-white w-max py-3 px-5 hover:bg-blue-800'>
                {featuredBook.preorder ? 'Đặt sách ngay' : 'Xem chi tiết'}
              </Button>
            </Link>
          </div>
          <div className='relative w-1/2'>
            <BookCover
              variant="wide"
              className="z-10"
              coverColor={color}
              coverImage={cover}
            />
            <div className='absolute hidden left-16 top-10 rotate-12 opacity-40 xl:flex'>
              <BookCover
                variant="wide"
                className="z-10"
                coverColor={color}
                coverImage={cover}
              />
            </div>
          </div>
        </div>
      )}

      {/* FILTER SECTION */}
      <Filter 
        medicalSpecialties={medicalSpecialties}
        currentFilters={{
          specialty,
          minPrice,
          maxPrice,
          availability,
          sort,
          search
        }}
      />

      {/* RESULTS HEADER */}
      <div className='mt-12 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-blue-900'>
            {currentSpecialtyLabel}
          </h1>
          <p className='text-gray-600 mt-1'>
            Tìm thấy {books.length} cuốn sách
            {search && ` cho "${search}"`}
          </p>
        </div>
        
        {/* Quick stats */}
        <div className='flex gap-4 text-sm text-gray-500'>
          <span>Sách có sẵn: {books.filter(b => b.availableCopies > 0 && b.isCompleted).length}</span>
          <span>Đặt trước: {books.filter(b => b.preorder).length}</span>
        </div>
      </div>

      {/* BOOKS GRID */}
      <ProductList 
      />

      {/* EMPTY STATE */}
      {books.length === 0 && (
        <div className='text-center py-16'>
          <div className='text-gray-400 mb-4'>
            <svg className='w-16 h-16 mx-auto' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253zm0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253z' />
            </svg>
          </div>
          <h3 className='text-xl font-semibold text-gray-600 mb-2'>
            Không tìm thấy sách phù hợp
          </h3>
          <p className='text-gray-500 mb-6'>
            Thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác
          </p>
          <Link href='/books'>
            <Button className='bg-blue-600 hover:bg-blue-700'>
              Xem tất cả sách
            </Button>
          </Link>
        </div>
      )}

      {/* STRUCTURED DATA */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: `Sách Y Khoa - ${currentSpecialtyLabel}`,
            description: 'Bộ sưu tập sách y khoa chuyên nghiệp với dịch thuật chất lượng cao',
            url: 'https://www.vmedbook.com/books',
            publisher: {
              '@type': 'Organization',
              name: 'VMedBook'
            },
            mainEntity: {
              '@type': 'ItemList',
              numberOfItems: books.length,
              itemListElement: books.slice(0, 10).map((book, index) => ({
                '@type': 'Book',
                position: index + 1,
                name: book.title,
                author: {
                  '@type': 'Person',
                  name: book.author
                },
                url: `https://www.vmedbook.com/books/${book.slug}`,
                image: book.coverUrl,
                offers: {
                  '@type': 'Offer',
                  price: book.hasColorSale ? book.colorPrice - book.colorSaleAmount : book.colorPrice,
                  priceCurrency: 'VND',
                  availability: book.availableCopies > 0 && book.isCompleted ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
                }
              }))
            }
          })
        }}
      />
    </div>
  )
}

export default BooksPage