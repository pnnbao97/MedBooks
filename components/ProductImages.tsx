'use client';
import React, { useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

interface ProductImagesProps {
  previewImages: string[];
  pdfUrl: string;
  bookTitle: string;
  bookAuthor: string;
}

const ProductImages = ({ 
  previewImages, 
  pdfUrl, 
  bookTitle, 
  bookAuthor 
}: ProductImagesProps) => {
  const [index, setIndex] = useState(0);
  const [showPDF, setShowPDF] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  // Memoize alt text
  const altTexts = useMemo(() => ({
    main: `${bookTitle} - ${bookAuthor} - Ảnh bìa sách`,
    preview: (i: number) => `${bookTitle} - Ảnh xem trước ${i + 1}`,
  }), [bookTitle, bookAuthor]);

  const handleReadPreview = useCallback(() => {
    setShowPDF(true);
    setIsLoading(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowPDF(false);
    setIsLoading(false);
  }, []);

  const handleIframeLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleIframeError = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleImageError = useCallback((imageIndex: number) => {
    setImageErrors(prev => ({ ...prev, [imageIndex]: true }));
  }, []);

  const handleImageLoad = useCallback((imageIndex: number) => {
    setImageErrors(prev => ({ ...prev, [imageIndex]: false }));
  }, []);

  return (
    <div className="flex flex-col">
      {/* Main Image */}
      <div className="h-96 relative bg-gray-100 rounded-md overflow-hidden">
        {previewImages.length > 0 ? (
          <>
            {imageErrors[index] ? (
              <div className="h-full flex items-center justify-center text-gray-500 bg-gray-100">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-2 bg-gray-300 rounded-lg flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm">Không thể tải ảnh</p>
                </div>
              </div>
            ) : (
              <Image
                src={previewImages[index]}
                alt={altTexts.main}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-contain"
                priority={index === 0}
                loading={index === 0 ? 'eager' : 'lazy'}
                onError={() => handleImageError(index)}
                onLoad={() => handleImageLoad(index)}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              />
            )}
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 bg-gray-200 rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <p>Không có ảnh xem trước</p>
            </div>
          </div>
        )}
      </div>

      {/* Read Preview Button */}
      {pdfUrl && (
        <div className="flex justify-center mt-4">
          <Button
            onClick={handleReadPreview}
            className="bg-white border shadow-md border-gray-800 text-lg hover:bg-blue-950 hover:text-white transition-colors"
            aria-label={`Đọc thử sách ${bookTitle}`}
          >
            Đọc thử
          </Button>
        </div>
      )}

      {/* Thumbnail Images */}
      {previewImages.length > 1 && (
        <div 
          className="flex justify-between gap-4 mt-8" 
          role="group" 
          aria-label="Ảnh xem trước"
        >
          {previewImages.map((img, i) => (
            <button
              key={i}
              className={`w-1/4 h-32 relative cursor-pointer rounded-md overflow-hidden border-2 transition-all ${
                i === index 
                  ? 'border-blue-500 ring-2 ring-blue-200' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setIndex(i)}
              aria-label={`Xem ảnh ${i + 1}`}
              type="button"
            >
              {imageErrors[i] ? (
                <div className="h-full flex items-center justify-center bg-gray-100">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              ) : (
                <Image
                  src={img}
                  alt={altTexts.preview(i)}
                  fill
                  sizes="(max-width: 768px) 25vw, (max-width: 1200px) 15vw, 10vw"
                  className="object-contain"
                  loading="lazy"
                  onError={() => handleImageError(i)}
                  onLoad={() => handleImageLoad(i)}
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* PDF Modal */}
      {showPDF && pdfUrl && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          aria-label="Xem trước PDF"
        >
          <div className="bg-white rounded-lg p-4 max-w-4xl w-full h-5/6 max-h-screen relative">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded z-10 transition-colors"
              aria-label="Đóng xem trước"
              type="button"
            >
              ✕
            </button>
            
            {isLoading && (
              <div className="flex justify-center items-center h-64 absolute top-0 left-0 right-0 z-0">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="mt-2">Đang tải PDF...</p>
                </div>
              </div>
            )}
            
            <iframe
              src={pdfUrl}
              className="w-full h-full rounded-md"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              style={{ display: 'block' }}
              title={`Xem trước sách ${bookTitle}`}
              allow="fullscreen"
              loading="lazy"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductImages;