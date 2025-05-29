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
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';


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
  const [selectedVersion, setSelectedVersion] = useState<'color' | 'photo'>('color');
  const [displayPrice, setDisplayPrice] = useState<number>(
    (initialBook.hasColorSale
      ? initialBook.colorPrice - initialBook.colorSaleAmount
      : initialBook.colorPrice) * 1000
  );
  const [showDetails, setShowDetails] = useState(false);
  const [showContent, setShowContent] = useState(false);

  const optimizedDescription = `${initialBook.description} Đây là sách y khoa chuyên về ${getSpecialtyLabel(initialBook.primarySpecialty, medicalSpecialties)}, phù hợp cho sinh viên, bác sĩ và chuyên gia y tế.`;

  const optimizedDetail = `${initialBook.detail} Cuốn sách này cung cấp kiến thức chuyên sâu về ${getSpecialtyLabel(initialBook.primarySpecialty, medicalSpecialties)}, hỗ trợ học tập và nghiên cứu y khoa.`;

  const handleVersionChange = (version: 'color' | 'photo') => {
    setSelectedVersion(version);
  };

  const handlePriceChange = (price: number) => {
    setDisplayPrice(price);
  };

  return (
    <>
      <StructuredData book={initialBook} medicalSpecialties={medicalSpecialties} />
      
      <div className="flex flex-col py-8 px-4 md:px-8 xl:px-16 2xl:px-32">
        <nav className="mb-4" aria-label="Breadcrumb">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/books">Tất cả</BreadcrumbLink>
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

        {/* Flexbox container with responsive ordering */}
        <article className="flex flex-col lg:flex-row lg:gap-8" itemScope itemType="https://schema.org/Book">
          
          {/* Left Column - Product Images + Details (Desktop) / Product Images only (Mobile) */}
          <div className="w-full lg:w-2/5 xl:w-1/2 lg:top-20 lg:h-max order-1 lg:order-1">
            <Suspense fallback={<ComponentSkeleton />}>
              <ProductImages 
                previewImages={initialBook.previewImages} 
                pdfUrl={initialBook.pdfUrl ?? ''}
                bookTitle={initialBook.title}
                bookAuthor={initialBook.author}
              />
            </Suspense>

            {/* Book Details Section - Hidden on mobile, shown on desktop */}
            <div className="hidden lg:block mt-6">
              <section>
                <Button
                  variant="ghost"
                  onClick={() => setShowDetails(!showDetails)}
                  className="w-full flex justify-between items-center text-sm font-medium text-blue-950 hover:bg-blue-50"
                >
                  <span>Chi Tiết Sách {initialBook.title}</span>
                  {showDetails ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </Button>
                {showDetails && (
                  <div className="mt-2 space-y-2 pl-5 text-sm">
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
                )}
              </section>

              {/* Table of Contents Section - Desktop */}
              {initialBook.content && (
                <section className="mt-4">
                  <Button
                    variant="ghost"
                    onClick={() => setShowContent(!showContent)}
                    className="w-full flex justify-between items-center text-sm font-medium text-blue-950 hover:bg-blue-50"
                  >
                    <span>Mục Lục Sách {initialBook.title}</span>
                    {showContent ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </Button>
                  {showContent && (
                    <div
                      className="mt-4 list-decimal pl-5 space-y-2 text-sm"
                      dangerouslySetInnerHTML={{ __html: initialBook.content }}
                    />
                  )}
                </section>
              )}
            </div>
          </div>

          {/* Main Content Container */}
          <div className="w-full lg:w-3/5 xl:w-1/2 flex flex-col gap-6 order-2 lg:order-2">
            
            {/* Book Title and Description - Order 2 on mobile */}
            <div className="order-2 lg:order-1">
              <header>
                <h1 
                  className="text-3xl mt-4 lg:mt-0 font-medium capitalize text-blue-950"
                  itemProp="name"
                >
                  {initialBook.title}
                </h1>
                <h2 
                  className="text-sm mt-2 font-semibold text-slate-800"
                  itemProp="author"
                >
                  Tác giả: {initialBook.author}
                </h2>
              </header>

              <p 
                className="font-sans text-justify text-gray-800 mt-4"
                itemProp="description"
              >
                {optimizedDescription}
              </p>

              <div className="flex flex-wrap gap-2 mt-4" role="list" aria-label="Chuyên khoa">
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

              <hr className="border-gray-200 mt-4" />

              {(initialBook.isCompleted || initialBook.preorder) && (
                <div className="flex items-center gap-4 mt-4" role="group" aria-label="Giá sản phẩm" itemProp="offers" itemScope itemType="https://schema.org/Offer">
                  <meta itemProp="priceCurrency" content="VND" />
                  <meta itemProp="availability" content={initialBook.availableCopies > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"} />
                  
                  {selectedVersion === 'color' && initialBook.hasColorSale && (
                    <span className="text-xl text-gray-500 line-through" aria-label="Giá gốc">
                      {(initialBook.colorPrice * 1000).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                    </span>
                  )}
                  <span 
                    className="font-medium text-2xl text-red-600" 
                    aria-label="Giá hiện tại"
                    itemProp="price"
                    content={(displayPrice).toString()}
                  >
                    {(displayPrice).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                  </span>
                </div>
              )}

              {!initialBook.isCompleted && initialBook.preorder && initialBook.predictDate && (
                <div className="text-sm text-gray-600 mt-4" role="status">
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
            </div>

            {/* Product Customization and Add to Cart - Order 3 on mobile */}
            {(initialBook.isCompleted || initialBook.preorder) && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 shadow-sm order-3 lg:order-2">
                <Suspense fallback={<ComponentSkeleton />}>
                  <CustomizeProducts
                    bookId={initialBook.id}
                    colorPrice={initialBook.colorPrice}
                    photoPrice={initialBook.photoPrice}
                    hasColorSale={initialBook.hasColorSale}
                    colorSaleAmount={initialBook.colorSaleAmount}
                    book={{
                      title: initialBook.title,
                      slug: initialBook.slug,
                      coverUrl: initialBook.previewImages[0] || '/default-book-cover.jpg',
                    }}
                    onPriceChange={handlePriceChange}
                    onVersionChange={handleVersionChange}
                  />
                </Suspense>

                <div className="mt-6 pt-6 border-t border-blue-200">
                  <Suspense fallback={<ComponentSkeleton />}>
                    <Add
                      bookId={initialBook.id}
                      availableCopies={initialBook.availableCopies}
                      isCompleted={initialBook.isCompleted}
                      preorder={initialBook.preorder}
                      selectedVersion={selectedVersion}
                      bookTitle={initialBook.title}
                    />
                  </Suspense>
                </div>
              </div>
            )}
          </div>

          {/* Book Details Section - Only shown on mobile, order 4 */}
          <div className="w-full order-4 lg:hidden mt-6">
            <section>
              <Button
                variant="ghost"
                onClick={() => setShowDetails(!showDetails)}
                className="w-full flex justify-between items-center text-sm font-medium text-blue-950 hover:bg-blue-50"
              >
                <span>Chi Tiết Sách {initialBook.title}</span>
                {showDetails ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </Button>
              {showDetails && (
                <div className="mt-2 space-y-2 pl-5 text-sm">
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
              )}
            </section>

            {/* Table of Contents Section - Mobile */}
            {initialBook.content && (
              <section className="mt-4">
                <Button
                  variant="ghost"
                  onClick={() => setShowContent(!showContent)}
                  className="w-full flex justify-between items-center text-sm font-medium text-blue-950 hover:bg-blue-50"
                >
                  <span>Mục Lục Sách {initialBook.title}</span>
                  {showContent ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </Button>
                {showContent && (
                  <div
                    className="mt-4 list-decimal pl-5 space-y-2 text-sm"
                    dangerouslySetInnerHTML={{ __html: initialBook.content }}
                  />
                )}
              </section>
            )}
          </div>

        </article>
      </div>
    </>
  );
};

export default BookDetailClient;