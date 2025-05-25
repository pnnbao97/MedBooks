// page.tsx - Server Component for SEO (Optimized)
import React from 'react';
import { Metadata } from 'next';
import { getBookBySlug } from '@/lib/actions/get-books';
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

// Generate metadata dynamically - Server Component only
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  try {
    // Await params before accessing its properties
    const resolvedParams = await params;
    const response = await getBookBySlug(resolvedParams.slug);
    
    if (!response.success || !response.data) {
      return {
        title: 'Không tìm thấy sách',
        description: 'Sách y khoa không tồn tại hoặc đã bị xóa.',
        robots: { index: false, follow: false }
      };
    }

    const book = response.data;
    const displayPrice = book.hasColorSale 
      ? book.colorPrice - book.colorSaleAmount 
      : book.colorPrice;

    // Tối ưu meta description (150-160 ký tự)
    const metaDescription = book.description.length > 155 
      ? `${book.description.substring(0, 152)}...`
      : book.description;

    // Title ngắn gọn hơn để tránh bị cắt trên SERP
    const pageTitle = `${book.title} - ${book.author}`;

    return {
      title: pageTitle,
      description: metaDescription,
      keywords: [
        book.title,
        book.author,
        getSpecialtyLabel(book.primarySpecialty),
        'sách y khoa',
        'dịch thuật y khoa',
        'y học',
        'bác sĩ',
        'sinh viên y',
        'VMedBook',
        ...book.relatedSpecialties.map(getSpecialtyLabel)
      ].join(', '),
      
      authors: [{ name: book.author }],
      category: 'Medical Books',
      
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
        siteName: 'VMedBook',
        title: pageTitle,
        description: metaDescription,
        url: `https://www.vmedbook.com/books/${book.slug}`,
        images: [
          {
            url: book.previewImages[0] || '/default-book-cover.jpg',
            width: 1200,
            height: 630,
            alt: `Bìa sách ${book.title} của ${book.author}`,
          },
        ],
        locale: 'vi_VN',
      },

      twitter: {
        card: 'summary_large_image',
        site: '@VMedBook',
        creator: '@VMedBook',
        title: pageTitle,
        description: metaDescription,
        images: [book.previewImages[0] || '/default-book-cover.jpg'],
      },

      alternates: {
        canonical: `https://www.vmedbook.com/books/${book.slug}`,
      },

      // Thêm các meta tags cho sản phẩm
      other: {
        'product:price:amount': displayPrice.toString(),
        'product:price:currency': 'VND',
        'product:availability': book.availableCopies > 0 ? 'in stock' : 'out of stock',
        'product:brand': 'VMedBook',
        'product:category': getSpecialtyLabel(book.primarySpecialty),
        'article:author': book.author,
        'article:published_time': book.createdAt || new Date().toISOString(),
        'og:price:amount': displayPrice.toString(),
        'og:price:currency': 'VND',
        // Messenger specific tags
        'og:image:secure_url': book.previewImages[0] || '/default-book-cover.jpg',
        'og:image:type': 'image/jpeg',
        'fb:app_id': 'YOUR_FACEBOOK_APP_ID', // Thêm Facebook App ID
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Lỗi tải trang',
      description: 'Đã xảy ra lỗi khi tải thông tin sách.',
      robots: { index: false, follow: false }
    };
  }
}

// Tạo structured data JSON-LD
const generateStructuredData = (book: any) => {
  const displayPrice = book.hasColorSale 
    ? book.colorPrice - book.colorSaleAmount 
    : book.colorPrice;

  return {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: book.title,
    author: {
      '@type': 'Person',
      name: book.author
    },
    description: book.description,
    image: book.previewImages[0] || '/default-book-cover.jpg',
    url: `https://www.vmedbook.com/books/${book.slug}`,
    publisher: {
      '@type': 'Organization',
      name: 'VMedBook'
    },
    genre: getSpecialtyLabel(book.primarySpecialty),
    inLanguage: 'vi',
    offers: {
      '@type': 'Offer',
      price: displayPrice,
      priceCurrency: 'VND',
      availability: book.availableCopies > 0 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'VMedBook'
      }
    },
    aggregateRating: book.rating ? {
      '@type': 'AggregateRating',
      ratingValue: book.rating,
      bestRating: 5,
      reviewCount: book.reviewCount || 1
    } : undefined
  };
};

// Breadcrumb structured data
const generateBreadcrumbData = (book: any) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Trang chủ',
        item: 'https://www.vmedbook.com'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Sách y khoa',
        item: 'https://www.vmedbook.com/books'
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: getSpecialtyLabel(book.primarySpecialty),
        item: `https://www.vmedbook.com/books?specialty=${book.primarySpecialty}`
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: book.title,
        item: `https://www.vmedbook.com/books/${book.slug}`
      }
    ]
  };
};

// Server Component
const SinglePage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  try {
    // Await params before accessing its properties
    const resolvedParams = await params;
    const response = await getBookBySlug(resolvedParams.slug);
    
    if (!response.success || !response.data) {
      return (
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Không tìm thấy sách</h1>
          <p className="text-red-500">{response.message || 'Sách y khoa không tồn tại hoặc đã bị xóa'}</p>
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
    const bookStructuredData = generateStructuredData(book);
    const breadcrumbData = generateBreadcrumbData(book);

    return (
      <>
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(bookStructuredData)
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbData)
          }}
        />
        
        {/* Main Content */}
        <BookDetailClient 
          initialBook={book} 
          medicalSpecialties={medicalSpecialties} 
        />
      </>
    );
  } catch (error) {
    console.error('Error fetching book:', error);
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Lỗi hệ thống</h1>
        <p className="text-red-500">Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.</p>
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