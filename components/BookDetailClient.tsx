'use client';
import React, { useState, Suspense, lazy } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

// Lazy load components
const Add = lazy(() => import('@/components/Add'));
const CustomizeProducts = lazy(() => import('@/components/CustomizeProducts'));
const ProductImages = lazy(() => import('@/components/ProductImages'));

// Loading components
const ComponentSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-gray-200 rounded mb-4"></div>
    <div className="h-32 bg-gray-200 rounded"></div>
  </div>
);

// Define types
interface MedicalSpecialty {
  value: string;
  label: string;
}

interface BookDetailClientProps {
  initialBook: Book;
  medicalSpecialties: MedicalSpecialty[];
}

const getSpecialtyLabel = (value: string, medicalSpecialties: MedicalSpecialty[]) => {
  const specialty = medicalSpecialties.find(s => s.value === value);
  return specialty ? specialty.label : value;
};

// JSON-LD Component
const StructuredData = ({ book, medicalSpecialties }: { book: Book; medicalSpecialties: MedicalSpecialty[] }) => {
  const displayPrice = (book.hasColorSale 
    ? book.colorPrice - book.colorSaleAmount 
    : book.colorPrice) * 1000;

  const bookStructuredData = {
    "@context": "https://schema.org/",
    "@type": "Book",
    "@id": `https://www.vmedbook.com/books/${book.slug}`,
    "name": book.title,
    "author": {
      "@type": "Person",
      "name": book.author
    },
    "description": book.description,
    "isbn": book.isbn,
    "image": book.previewImages,
    "url": `https://www.vmedbook.com/books/${book.slug}`,
    "publisher": {
      "@type": "Organization",
      "name": "VmedBook",
      "url": "https://www.vmedbook.com"
    },
    "genre": getSpecialtyLabel(book.primarySpecialty, medicalSpecialties),
    "inLanguage": "vi-VN",
    "offers": {
      "@type": "Offer",
      "price": displayPrice,
      "priceCurrency": "VND",
      "availability": book.availableCopies > 0 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      "seller": {
        "@type": "Organization",
        "name": "VmedBook"
      },
      "itemCondition": "https://schema.org/NewCondition"
    }
  };

  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Trang chủ",
        "item": "https://www.vmedbook.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": getSpecialtyLabel(book.primarySpecialty, medicalSpecialties),
        "item": `https://www.vmedbook.com/books?specialty=${book.primarySpecialty}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": book.title,
        "item": `https://www.vmedbook.com/books/${book.slug}`
      }
    ]
  };

  const organizationStructuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "VmedBook",
    "url": "https://www.vmedbook.com",
    "logo": "https://www.vmedbook.com/logo.png",
    "description": "Chuyên cung cấp sách y khoa chất lượng cao cho sinh viên, bác sĩ và chuyên gia y tế",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+84-xxx-xxx-xxx",
      "contactType": "customer service",
      "availableLanguage": "Vietnamese"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(bookStructuredData)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbStructuredData)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationStructuredData)
        }}
      />
    </>
  );
};

const BookDetailClient = ({ initialBook, medicalSpecialties }: BookDetailClientProps) => {
  const [displayPrice, setDisplayPrice] = useState<number>(
    (initialBook.hasColorSale
      ? initialBook.colorPrice - initialBook.colorSaleAmount
      : initialBook.colorPrice) * 1000
  );

  const optimizedDescription = `${initialBook.description} Đây là sách y khoa chuyên về ${getSpecialtyLabel(initialBook.primarySpecialty, medicalSpecialties)}, phù hợp cho sinh viên, bác sĩ và chuyên gia y tế.`;

  const optimizedDetail = `${initialBook.detail} Cuốn sách này cung cấp kiến thức chuyên sâu về ${getSpecialtyLabel(initialBook.primarySpecialty, medicalSpecialties)}, hỗ trợ học tập và nghiên cứu y khoa.`;

  return (
    <>
      <StructuredData book={initialBook} medicalSpecialties={medicalSpecialties} />
      
      <div className="flex flex-col px-4 py-8 md:px-8 lg:px-16 xl:px-32 2xl:px-64">
        <nav className="mb-4" aria-label="Breadcrumb">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Trang chủ</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/books?specialty=${initialBook.primarySpecialty}`}>
                  {getSpecialtyLabel(initialBook.primarySpecialty, medicalSpecialties)}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{initialBook.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </nav>

        <article className="relative flex flex-col lg:flex-row gap-16" itemScope itemType="https://schema.org/Book">
          <div className="w-full lg:w-1/2 top-20 h-max">
            <Suspense fallback={<ComponentSkeleton />}>
              <ProductImages 
                previewImages={initialBook.previewImages} 
                pdfUrl={initialBook.pdfUrl ?? ''}
                bookTitle={initialBook.title}
                bookAuthor={initialBook.author}
              />
            </Suspense>
          </div>

          <div className="w-full lg:w-1/2 flex flex-col gap-6">
            <header>
              <h1 
                className="text-4xl font-medium capitalize text-blue-900"
                itemProp="name"
              >
                {initialBook.title}
              </h1>
              <h2 
                className="text-xl font-semibold text-blue-700"
                itemProp="author"
              >
                Tác giả: {initialBook.author}
              </h2>
            </header>

            <p 
              className="font-sans text-justify text-gray-800"
              itemProp="description"
            >
              {optimizedDescription}
            </p>

            <div className="flex flex-wrap gap-2" role="list" aria-label="Chuyên khoa">
              <Link
                href={`/books?specialty=${initialBook.primarySpecialty}`}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors"
                role="listitem"
                itemProp="genre"
              >
                {getSpecialtyLabel(initialBook.primarySpecialty, medicalSpecialties)}
              </Link>
              {initialBook.relatedSpecialties.map((specialty) => (
                <Link
                  key={specialty}
                  href={`/books?specialty=${specialty}`}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors"
                  role="listitem"
                >
                  {getSpecialtyLabel(specialty, medicalSpecialties)}
                </Link>
              ))}
            </div>

            <hr className="border-gray-200" />

            {(initialBook.isCompleted || initialBook.preorder) && (
              <div className="flex items-center gap-4" role="group" aria-label="Giá sản phẩm" itemProp="offers" itemScope itemType="https://schema.org/Offer">
                <meta itemProp="priceCurrency" content="VND" />
                <meta itemProp="availability" content={initialBook.availableCopies > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"} />
                
                {initialBook.hasColorSale && (
                  <span className="text-xl text-gray-500 line-through" aria-label="Giá gốc">
                    {(initialBook.colorPrice * 1000).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                  </span>
                )}
                <span 
                  className="font-medium text-2xl" 
                  aria-label="Giá hiện tại"
                  itemProp="price"
                  content={(displayPrice).toString()}
                >
                  {(displayPrice).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                </span>
              </div>
            )}
            
            <hr className="border-gray-200" />

            {!initialBook.isCompleted && initialBook.preorder && initialBook.predictDate && (
              <div className="text-sm text-gray-600" role="status">
                <p>
                  Đặt trước - Dự kiến ra mắt: 
                  <time 
                    dateTime={initialBook.predictDate}
                    itemProp="datePublished"
                  >
                    {format(new Date(initialBook.predictDate), 'dd/MM/yyyy')}
                  </time>
                </p>
              </div>
            )}

            {(initialBook.isCompleted || initialBook.preorder) && (
              <Suspense fallback={<ComponentSkeleton />}>
                <CustomizeProducts
                  bookId={initialBook.id} // Ensure bookId is passed
                  colorPrice={initialBook.colorPrice}
                  photoPrice={initialBook.photoPrice}
                  hasColorSale={initialBook.hasColorSale}
                  colorSaleAmount={initialBook.colorSaleAmount}
                  book={{
                    title: initialBook.title,
                    slug: initialBook.slug,
                    coverUrl: initialBook.previewImages[0] || '/default-book-cover.jpg',
                  }}
                  onPriceChange={(price) => setDisplayPrice(price)} onVersionChange={function (version: 'color' | 'photo'): void {
                    throw new Error('Function not implemented.');
                  } }                />
              </Suspense>
            )}

            <Suspense fallback={<ComponentSkeleton />}>
              <Add
                bookId={initialBook.id} // Add bookId prop
                availableCopies={initialBook.availableCopies}
                isCompleted={initialBook.isCompleted}
                preorder={initialBook.preorder} selectedVersion={'color'}              />
            </Suspense>

            <hr className="border-gray-200" />

            <section>
              <h3 className="font-medium mb-4">Chi Tiết Sách Y Khoa {initialBook.title}</h3>
              <div className="space-y-2 text-sm">
                <p>{optimizedDetail}</p>
                {initialBook.isbn && (
                  <p>
                    <strong>ISBN:</strong> 
                    <span itemProp="isbn">{initialBook.isbn}</span>
                  </p>
                )}
                {initialBook.relatedBooks.length > 0 && (
                  <p>
                    <strong>Sách liên quan:</strong>{' '}
                    {initialBook.relatedBooks.map((relatedBook, index) => (
                      <span key={relatedBook.id}>
                        <Link
                          href={`/books/${relatedBook.slug}`}
                          className="text-blue-600 hover:underline"
                        >
                          {relatedBook.title}
                        </Link>
                        {index < initialBook.relatedBooks.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </p>
                )}
              </div>
            </section>

            <hr className="border-gray-200" />

            {initialBook.content && (
              <section>
                <h3 className="font-medium mb-4">Mục Lục Sách {initialBook.title}</h3>
                <div
                  className="list-decimal pl-5 space-y-2 text-sm"
                  dangerouslySetInnerHTML={{ __html: initialBook.content }}
                />
              </section>
            )}
          </div>
        </article>
      </div>
    </>
  );
};

export default BookDetailClient;