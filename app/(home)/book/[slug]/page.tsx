// page.tsx - Server Component for SEO
import React from 'react';
import { Metadata } from 'next';
import { getBookBySlug } from '@/lib/actions/get-books'; // Thay getBookById bằng getBookBySlug
import BookDetailClient from '@/components/BookDetailClient';

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

const getSpecialtyLabel = (value: string) => {
  const specialty = medicalSpecialties.find(s => s.value === value);
  return specialty ? specialty.label : value;
};

// Hàm tạo slug từ tiêu đề sách
const createSlug = (title: string) => {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// Generate metadata dynamically - Server Component only
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const response = await getBookBySlug(params.slug);
    if (!response.success || !response.data) {
      return {
        title: 'Không tìm thấy sách | VMedBook',
        description: 'Sách y khoa không tồn tại hoặc đã bị xóa.',
      };
    }

    const book = response.data;
    const displayPrice = book.hasColorSale 
      ? book.colorPrice - book.colorSaleAmount 
      : book.colorPrice;

    const metaDescription = book.description.length > 160 
      ? `${book.description.substring(0, 157)}...`
      : book.description;

    return {
      title: `${book.title} - ${book.author} | Sách Y Khoa VMedBook`,
      description: metaDescription,
      keywords: [
        book.title,
        book.author,
        getSpecialtyLabel(book.primarySpecialty),
        'sách y khoa',
        'dịch thuật y khoa',
        'y học',
        'VMedBook',
        ...book.relatedSpecialties.map(getSpecialtyLabel)
      ].join(', '),
      authors: [{ name: book.author }],
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      openGraph: {
        type: 'website',
        siteName: 'VMedBook - Chuyên Trang Dịch Thuật Ngành Y Lớn Nhất Việt Nam',
        title: `${book.title} - ${book.author}`,
        description: metaDescription,
        url: `https://www.vmedbook.com/books/${book.slug}`,
        images: [
          {
            url: book.previewImages[0] || '/default-book-cover.jpg',
            width: 800,
            height: 600,
            alt: `Bìa sách ${book.title} - ${book.author}`,
          },
        ],
        locale: 'vi_VN',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${book.title} - ${book.author}`,
        description: metaDescription,
        images: [book.previewImages[0] || '/default-book-cover.jpg'],
      },
      alternates: {
        canonical: `https://www.vmedbook.com/books/${book.slug}`,
      },
      other: {
        'product:price:amount': displayPrice.toString(),
        'product:price:currency': 'VND',
        'product:availability': book.availableCopies > 0 ? 'in stock' : 'out of stock',
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Lỗi | VMedBook',
      description: 'Đã xảy ra lỗi khi tải thông tin sách.',
    };
  }
}

// Server Component - handles initial data fetching
const SinglePage = async ({ params }: { params: { slug: string } }) => {
  try {
    const response = await getBookBySlug(params.slug);
    
    if (!response.success || !response.data) {
      return (
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Lỗi</h1>
          <p className="text-red-500">{response.message || 'Không tìm thấy sách'}</p>
          <a 
            href="/" 
            className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Về trang chủ
          </a>
        </div>
      );
    }

    const book = response.data;

    return <BookDetailClient initialBook={book} medicalSpecialties={medicalSpecialties} />;
  } catch (error) {
    console.error('Error fetching book:', error);
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Lỗi</h1>
        <p className="text-red-500">Đã xảy ra lỗi khi tải dữ liệu sách</p>
        <a 
          href="/" 
          className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Về trang chủ
        </a>
      </div>
    );
  }
};

export default SinglePage;