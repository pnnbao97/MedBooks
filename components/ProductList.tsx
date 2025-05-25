'use client'

import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { getBooks } from '@/lib/actions/get-books'

// Danh sách chuyên ngành
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

// Hàm chuyển đổi value thành label
const getSpecialtyLabel = (value: string): string => {
  const specialty = medicalSpecialties.find(s => s.value === value);
  return specialty ? specialty.label : value; // Trả về value nếu không tìm thấy label
};

// Format giá tiền VND
function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN').format(price * 1000); // Nhân với 1000 trước khi format
}

// Component ProductCard
interface ProductCardProps {
  book: Book;
}

const ProductCard: React.FC<ProductCardProps> = ({ book }) => {
  // Tính giá hiển thị (ưu tiên bản màu, có sale thì hiển thị giá sale)
  const displayPrice = book.hasColorSale && book.colorSaleAmount > 0 
    ? (book.colorPrice - book.colorSaleAmount) * 1000 
    : book.colorPrice * 1000;
    
  const originalPrice = book.colorPrice * 1000;
  const hasDiscount = book.hasColorSale && book.colorSaleAmount > 0;

  return (
    <Link 
      href={`/books/${book.slug}`} // Updated to use slug
      className='w-full flex flex-col gap-4 sm:w-[45%] lg:w-[22%] group h-[480px]' // Fixed height for card
    >
      <div className='relative w-full h-80'>
        <Image 
          src={book.coverUrl || '/placeholder-book.jpg'} 
          alt={book.title}
          fill 
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 45vw, 22vw"
          className='absolute object-cover rounded-md z-10 group-hover:opacity-0 transition-opacity ease duration-500'
        />
        <Image 
          src={book.coverUrl || '/placeholder-book.jpg'} 
          alt={book.title}
          fill 
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 45vw, 22vw"
          className='object-cover rounded-md'
        />
        
        {/* Badge cho preorder */}
        {book.preorder && (
          <div className='absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-semibold z-20'>
            Đặt trước
          </div>
        )}
        
        {/* Badge cho sale */}
        {hasDiscount && (
          <div className='absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold z-20'>
            -{Math.round((book.colorSaleAmount / book.colorPrice) * 100)}%
          </div>
        )}
        
        {/* Badge hết hàng */}
        {book.availableCopies === 0 && !book.preorder && (
          <div className='absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20 rounded-md'>
            <span className='text-white font-semibold'>Hết hàng</span>
          </div>
        )}
      </div>
      
      <div className='flex flex-col flex-1 justify-between'>
        <div>
          <div className='flex justify-between items-start'>
            <div className='flex-1 pr-2'>
              <h3 className='font-medium text-sm line-clamp-2 leading-tight'>{book.title}</h3>
              <p className='text-xs text-gray-600 mt-1'>{book.author}</p>
            </div>
            <div className='flex flex-col items-end'>
              {hasDiscount ? (
                <>
                  <span className='font-semibold text-sm'>{formatPrice(book.colorPrice - book.colorSaleAmount)}đ</span>
                  <span className='text-xs text-gray-500 line-through'>{formatPrice(book.colorPrice)}đ</span>
                </>
              ) : (
                <span className='font-semibold text-sm'>{formatPrice(book.colorPrice)}đ</span>
              )}
            </div>
          </div>
          
          <div className='text-sm text-gray-500 line-clamp-2 mt-2'>
            {book.description || (book.detail ? book.detail.substring(0, 100) + '...' : '')}
          </div>
          
          <div className='text-xs text-blue-600 font-medium mt-2'>
            {getSpecialtyLabel(book.primarySpecialty)}
          </div>
        </div>
        
        <Button 
          className='bg-white ring-blue-950 ring-1 text-blue-950 hover:text-white hover:bg-blue-900 w-max mt-4'
          disabled={book.availableCopies === 0 && !book.preorder}
        >
          {book.preorder 
            ? 'Đặt trước' 
            : book.availableCopies === 0 
              ? 'Hết hàng' 
              : 'Thêm vào giỏ sách'
          }
        </Button>
      </div>
    </Link>
  );
};

// Loading Component
const ProductListSkeleton = () => {
  return (
    <div className='flex gap-x-8 gap-y-16 justify-between flex-wrap'>
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className='w-full sm:w-[45%] lg:w-[22%] animate-pulse'>
          <div className='bg-gray-300 w-full h-80 rounded-md mb-4'></div>
          <div className='bg-gray-300 h-4 rounded mb-2'></div>
          <div className='bg-gray-300 h-3 rounded mb-2 w-3/4'></div>
          <div className='bg-gray-300 h-3 rounded mb-4 w-1/2'></div>
          <div className='bg-gray-300 h-8 rounded w-32'></div>
        </div>
      ))}
    </div>
  );
};

// Main ProductList Component
const ProductList = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const booksList = await getBooks();
        setBooks(booksList);
      } catch (err) {
        setError('Không thể tải danh sách sách');
        console.error('Error fetching books:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  if (loading) {
    return <ProductListSkeleton />;
  }

  if (error) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-center'>
          <h3 className='text-lg font-medium text-gray-900 mb-2'>Có lỗi xảy ra</h3>
          <p className='text-gray-500'>{error}</p>
        </div>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-center'>
          <h3 className='text-lg font-medium text-gray-900 mb-2'>Chưa có sách nào</h3>
          <p className='text-gray-500'>Danh sách sách sẽ được cập nhật sớm.</p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex gap-x-8 gap-y-16 justify-between flex-wrap'>
      {books.map((book) => (
        <ProductCard key={book.id} book={book} />
      ))}
    </div>
  );
};

export default ProductList;