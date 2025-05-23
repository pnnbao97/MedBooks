'use client';
import React, { useState } from 'react';

interface CustomizeProductsProps {
  colorPrice: number;
  photoPrice: number;
  hasColorSale: boolean;
  colorSaleAmount: number;
  onPriceChange: (price: number) => void;
}

const CustomizeProducts = ({
  colorPrice,
  photoPrice,
  hasColorSale,
  colorSaleAmount,
  onPriceChange,
}: CustomizeProductsProps) => {
  const [selectedVersion, setSelectedVersion] = useState<'color' | 'photo'>('color');
  const displayColorPrice = hasColorSale ? colorPrice - colorSaleAmount : colorPrice;

  const handleVersionChange = (version: 'color' | 'photo') => {
    setSelectedVersion(version);
    onPriceChange(version === 'color' ? displayColorPrice : photoPrice);
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
          Bản gốc (bìa cứng, in màu) - {displayColorPrice.toLocaleString()} VNĐ
          {hasColorSale && (
            <span className="ml-2 text-red-500">
              (Giảm {colorSaleAmount.toLocaleString()} VNĐ)
            </span>
          )}
        </li>
        <li
          className={`ring-1 ring-blue-900 rounded-md py-1 px-4 text-sm cursor-pointer ${
            selectedVersion === 'photo' ? 'bg-blue-900 text-white' : 'text-blue-900'
          }`}
          onClick={() => handleVersionChange('photo')}
        >
          Bản photo (bìa mềm, in đen trắng) - {photoPrice.toLocaleString()} VNĐ
        </li>
      </ul>
    </div>
  );
};

export default CustomizeProducts