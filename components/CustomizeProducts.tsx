"use client";
import React, { useState } from 'react';

interface CustomizeProductsProps {
  bookId: number;
  colorPrice: number;
  photoPrice: number;
  hasColorSale: boolean;
  colorSaleAmount: number;
  book: {
    title: string;
    slug: string;
    coverUrl: string;
  };
  onPriceChange: (price: number) => void;
  onVersionChange: (version: 'color' | 'photo') => void;
}

const CustomizeProducts = ({
  bookId,
  colorPrice,
  photoPrice,
  hasColorSale,
  colorSaleAmount,
  book,
  onPriceChange,
  onVersionChange,
}: CustomizeProductsProps) => {
  const [selectedVersion, setSelectedVersion] = useState<'color' | 'photo'>('color');
  const displayColorPrice = hasColorSale ? colorPrice - colorSaleAmount : colorPrice;

  const handleVersionChange = (version: 'color' | 'photo') => {
    setSelectedVersion(version);
    const price = version === 'color' ? displayColorPrice : photoPrice;
    onPriceChange(price);
    onVersionChange(version);
  };

  return (
    <div className="flex flex-col gap-6">
      <h4 className="font-medium">Lựa chọn phiên bản</h4>
      <ul className="flex items-center gap-3">
        <li
          className={`ring-1 ring-blue-900 rounded-md py-1 px-4 text-sm cursor-pointer ${
            selectedVersion === 'color' ? 'bg-blue-900 text-white' : 'text-blue-900'
          }`}
          onClick={() => handleVersionChange('color')}
        >
          Bản gốc (bìa cứng, in màu) - {(displayColorPrice * 1000).toLocaleString()} VNĐ
          {hasColorSale && (
            <span className="ml-2 text-red-500">
              (Giảm {(colorSaleAmount * 1000).toLocaleString()} VNĐ)
            </span>
          )}
        </li>
        <li
          className={`ring-1 ring-blue-900 rounded-md py-1 px-4 text-sm cursor-pointer ${
            selectedVersion === 'photo' ? 'bg-blue-900 text-white' : 'text-blue-900'
          }`}
          onClick={() => handleVersionChange('photo')}
        >
          Bản photo (bìa mềm, in đen trắng) - {(photoPrice * 1000).toLocaleString()} VNĐ
        </li>
      </ul>
    </div>
  );
};

export default CustomizeProducts;