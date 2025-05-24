'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Add from '@/components/Add';
import CustomizeProducts from '@/components/CustomizeProducts';
import ProductImages from '@/components/ProductImages';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useParams } from 'next/navigation';
import { getBookById } from '@/lib/admin/actions/book';
import { format } from 'date-fns';

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

const SinglePage = () => {
  const { id, slug, home } = useParams();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayPrice, setDisplayPrice] = useState<number>(0);

  useEffect(() => {
    const fetchBook = async () => {
      const bookId = id || slug;
      if (bookId) {
        try {
          setLoading(true);
          setError(null);
          const response = await getBookById(Number(bookId));
          if (response.success && response.data) {
            setBook(response.data);
            setDisplayPrice(
              response.data.hasColorSale
                ? response.data.colorPrice - response.data.colorSaleAmount
                : response.data.colorPrice
            );
          } else {
            setBook(null);
            setError(response.message || 'Không tìm thấy sách');
          }
        } catch (error) {
          console.error('Error fetching book:', error);
          setError('Lỗi khi tải dữ liệu sách');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        setError('Không có ID sách');
      }
    };

    fetchBook();
  }, [id, slug]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <p>Đang tải...</p>
        <p className="text-sm text-gray-500 mt-2">ID: {id || slug}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
        <p className="text-sm text-gray-500 mt-2">Params: {JSON.stringify({ id, slug, home })}</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="text-center py-8">
        <p>Không tìm thấy sách.</p>
        <p className="text-sm text-gray-500 mt-2">ID: {id || slug}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col px-4 py-8 md:px-8 lg:px-16 xl:px-32 2xl:px-64">
      {/* BREADCRUMB */}
      <div className="mb-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Tất cả</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/books/${book.primarySpecialty}`}>
                {getSpecialtyLabel(book.primarySpecialty)}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{book.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="relative flex flex-col lg:flex-row gap-16">
        {/* IMG */}
        <div className="w-full lg:w-1/2 top-20 h-max">
          <ProductImages previewImages={book.previewImages} pdfUrl={book.pdfUrl} />
        </div>
        {/* TEXT */}
        <div className="w-full lg:w-1/2 flex flex-col gap-6">
          <h1 className="text-4xl font-medium capitalize text-blue-900">{book.title}</h1>
          <h2 className="text-xl font-semibold text-blue-700">Tác giả: {book.author}</h2>
          <p className="font-sans text-justify text-gray-800">{book.description}</p>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/books/${book.primarySpecialty}`}
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors"
            >
              {getSpecialtyLabel(book.primarySpecialty)}
            </Link>
            {book.relatedSpecialties.map((specialty) => (
              <Link
                key={specialty}
                href={`/books/${specialty}`}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors"
              >
                {getSpecialtyLabel(specialty)}
              </Link>
            ))}
          </div>
          <div className="h-[2px] bg-gray-100" />

          {/* Pricing */}
          {(book.isCompleted || book.preorder) && (
            <div className="flex items-center gap-4">
              {book.hasColorSale && (
                <h3 className="text-xl text-gray-500 line-through">
                  {book.colorPrice.toLocaleString()} VNĐ
                </h3>
              )}
              <h2 className="font-medium text-2xl">
                {displayPrice.toLocaleString()} VNĐ
              </h2>
            </div>
          )}
          <div className="h-[2px] bg-gray-100" />

          {/* Preorder Info */}
          {!book.isCompleted && book.preorder && book.predictDate && (
            <div className="text-sm text-gray-600">
              <p>Đặt trước - Dự kiến ra mắt: {format(new Date(book.predictDate), 'dd/MM/yyyy')}</p>
            </div>
          )}

          {/* Customize Products */}
          {(book.isCompleted || book.preorder) && (
            <CustomizeProducts
              colorPrice={book.colorPrice}
              photoPrice={book.photoPrice}
              hasColorSale={book.hasColorSale}
              colorSaleAmount={book.colorSaleAmount}
              onPriceChange={setDisplayPrice}
            />
          )}
          <Add
            availableCopies={book.availableCopies}
            isCompleted={book.isCompleted}
            preorder={book.preorder}
          />

          <div className="h-[2px] bg-gray-100" />
          {/* Details */}
          <div>
            <h4 className="font-medium mb-4">CHI TIẾT</h4>
            <p>{book.detail}</p>
            {book.isbn && <p>ISBN: {book.isbn}</p>}
            {book.relatedBooks.length > 0 && (
              <p>
                Sách liên quan:{' '}
                {book.relatedBooks.join(', ')}
              </p>
            )}
          </div>
          <div className="h-[2px] bg-gray-100" />
          {/* Table of Contents */}
          {book.content && (
            <div className="font-semibold">
              <h4 className="font-medium mb-4">MỤC LỤC</h4>
              <div
                className="list-decimal pl-5 space-y-2"
                dangerouslySetInnerHTML={{ __html: book.content }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SinglePage;