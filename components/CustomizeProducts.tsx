"use client";
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';

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
    onPriceChange(price * 1000);
    onVersionChange(version);
  };

  const versions = [
    {
      type: 'color' as const,
      title: 'Bản Gốc',
      description: 'Bìa cứng, in màu cao cấp',
      price: displayColorPrice,
      originalPrice: hasColorSale ? colorPrice : null,
      features: ['In màu chất lượng cao', 'Bìa cứng bền đẹp', 'Giấy cao cấp'],
      popular: true,
      icon: '🎨',
      gradient: 'from-blue-500 to-indigo-600'
    },
    {
      type: 'photo' as const,
      title: 'Bản Photo',
      description: 'Bìa mềm, in đen trắng tiết kiệm',
      price: photoPrice,
      originalPrice: null,
      features: ['In đen trắng rõ nét', 'Bìa mềm tiện lợi', 'Giá cả phải chăng'],
      popular: false,
      icon: '📄',
      gradient: 'from-gray-500 to-gray-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
          <span className="text-white text-sm font-bold">📚</span>
        </div>
        <h4 className="text-lg font-semibold text-gray-900">Chọn phiên bản sách</h4>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {versions.map((version) => (
          <div
            key={version.type}
            onClick={() => handleVersionChange(version.type)}
            className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg ${
              selectedVersion === version.type
                ? 'border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            {/* Popular Badge */}
            {version.popular && (
              <div className="absolute -top-3 left-6">
                <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 text-xs font-medium">
                  ⭐ Phổ biến
                </Badge>
              </div>
            )}

            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 bg-gradient-to-br ${version.gradient} rounded-xl flex items-center justify-center text-2xl`}>
                  {version.icon}
                </div>
                <div>
                  <h5 className="font-semibold text-gray-900 text-lg">{version.title}</h5>
                  <p className="text-sm text-gray-600">{version.description}</p>
                </div>
              </div>
              
              {/* Radio Button */}
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                selectedVersion === version.type
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-gray-300'
              }`}>
                {selectedVersion === version.type && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="mb-4">
              <div className="flex items-baseline gap-2">
                {version.originalPrice && (
                  <span className="text-lg text-gray-400 line-through">
                    {(version.originalPrice * 1000).toLocaleString()} VNĐ
                  </span>
                )}
                <span className="text-2xl font-bold text-gray-900">
                  {(version.price * 1000).toLocaleString()} VNĐ
                </span>
              </div>
              {version.originalPrice && (
                <div className="inline-block">
                  <Badge variant="destructive" className="text-xs mt-1">
                    Tiết kiệm {((version.originalPrice - version.price) * 1000).toLocaleString()} VNĐ
                  </Badge>
                </div>
              )}
            </div>

            {/* Features */}
            <div className="space-y-2">
              {version.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                  <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${version.gradient} flex items-center justify-center`}>
                    <span className="text-white text-xs">✓</span>
                  </div>
                  {feature}
                </div>
              ))}
            </div>

            {/* Selection Indicator */}
            {selectedVersion === version.type && (
              <div className="absolute inset-0 rounded-2xl bg-blue-500 bg-opacity-5 pointer-events-none">
                <div className="absolute top-4 right-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-white p-4 rounded-xl border border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Đã chọn:</span>
            <span className="font-medium text-gray-900">
              {versions.find(v => v.type === selectedVersion)?.title}
            </span>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-blue-600">
              {(versions.find(v => v.type === selectedVersion)?.price! * 1000).toLocaleString()} VNĐ
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizeProducts;