"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/hooks/cartStore';
import { useUser } from '@clerk/nextjs';
import { Input } from '@/components/ui/input';
import { debounce } from 'lodash';

const CartModal = () => {
  const { items, totalPrice, updateQuantity, removeItem, isLoading, clearCart } = useCartStore();
  const { user } = useUser();

  // State để lưu quantity tạm thời cho mỗi item
  const [tempQuantities, setTempQuantities] = useState<{[key: number]: number}>({});

  // Khởi tạo tempQuantities khi items thay đổi
  useEffect(() => {
    const initialQuantities: {[key: number]: number} = {};
    items.forEach(item => {
      initialQuantities[item.id] = item.quantity;
    });
    setTempQuantities(initialQuantities);
  }, [items]);

  // Tạo debounced update function với useMemo để tránh recreate
  const debouncedUpdate = useMemo(
    () => debounce((itemId: number, newQuantity: number) => {
      if (newQuantity <= 0) {
        removeItem(itemId);
      } else {
        updateQuantity(itemId, newQuantity);
      }
    }, 500),
    [updateQuantity, removeItem]
  );

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedUpdate.cancel();
    };
  }, [debouncedUpdate]);

  // Validate và normalize quantity
  const normalizeQuantity = useCallback((quantity: number, maxAvailable: number) => {
    if (quantity <= 0) return 0;
    return Math.min(quantity, maxAvailable);
  }, []);

  // Handle quantity change (unified function cho cả button và input)
  const handleQuantityChange = useCallback((itemId: number, newQuantity: number, item: any) => {
    const normalizedQuantity = normalizeQuantity(newQuantity, item.book.availableCopies);

    // Update temp state ngay lập tức (cho UI responsive)
    setTempQuantities(prev => ({
      ...prev,
      [itemId]: normalizedQuantity
    }));

    // Debounced update
    debouncedUpdate(itemId, normalizedQuantity);
  }, [normalizeQuantity, debouncedUpdate]);

  // Handle input change
  const handleInputChange = useCallback((itemId: number, value: string, item: any) => {
    const numValue = value === '' ? 0 : parseInt(value) || 0;
    handleQuantityChange(itemId, numValue, item);
  }, [handleQuantityChange]);

  // Handle input blur (immediate update khi blur)
  const handleInputBlur = useCallback((itemId: number, item: any) => {
    const currentTemp = tempQuantities[itemId] ?? item.quantity;
    
    // Cancel pending debounced call và update ngay lập tức
    debouncedUpdate.cancel();
    
    if (currentTemp !== item.quantity) {
      if (currentTemp <= 0) {
        removeItem(itemId);
      } else {
        updateQuantity(itemId, currentTemp);
      }
    }
  }, [tempQuantities, debouncedUpdate, removeItem, updateQuantity]);

  // Render cart item
  const renderCartItem = useCallback((item: any) => {
    const currentQuantity = tempQuantities[item.id] ?? item.quantity;
    const itemPrice = (
      item.version === 'color'
        ? item.book.hasColorSale
          ? item.book.colorPrice - item.book.colorSaleAmount
          : item.book.colorPrice
        : item.book.photoPrice
    ) * 1000;

    return (
      <div key={item.id} className="flex gap-4">
        <Image
          src={item.book.coverUrl || '/default-book-cover.jpg'}
          alt={item.book.title}
          width={72}
          height={96}
          className="object-cover rounded-md"
        />
        <div className="flex flex-col justify-between w-full">
          <div>
            <div className="flex max-w-xs items-center justify-between gap-8">
              <Link 
                href={`/books/${item.book.slug}`} 
                className="text-amber-700 font-semibold hover:underline"
              >
                {item.book.title}
              </Link>
              <div className="font-normal text-amber-900">
                {itemPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Phiên bản: {item.version === 'color' ? 'Bản gốc (in màu)' : 'Bản photo (đen trắng)'}
            </div>
          </div>
          
          <div className="flex justify-between text-sm items-center">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuantityChange(item.id, currentQuantity - 1, item)}
                disabled={isLoading}
              >
                -
              </Button>
              
              <Input
                type="number"
                min="0"
                max={item.book.availableCopies}
                value={currentQuantity === 0 ? '' : currentQuantity}
                onChange={(e) => handleInputChange(item.id, e.target.value, item)}
                onBlur={() => handleInputBlur(item.id, item)}
                className="w-16 text-center border rounded px-2 py-1 text-sm border-gray-300"
                disabled={isLoading}
              />
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuantityChange(item.id, currentQuantity + 1, item)}
                disabled={currentQuantity >= item.book.availableCopies || isLoading}
              >
                +
              </Button>
            </div>
            
            <span
              className="text-blue-500 cursor-pointer hover:underline"
              onClick={() => removeItem(item.id)}
            >
              Hủy bỏ
            </span>
          </div>
          
          {item.book.availableCopies <= 5 && (
            <div className="text-xs text-red-500 mt-1">
              Chỉ còn {item.book.availableCopies} cuốn
            </div>
          )}
        </div>
      </div>
    );
  }, [tempQuantities, isLoading, handleQuantityChange, handleInputChange, handleInputBlur, removeItem]);

  if (items.length === 0) {
    return (
      <div className="w-max absolute p-4 rounded-md shadow-[0_3px_10px_rgb(0,0,0,0.2)] bg-white top-12 right-0 flex flex-col gap-6 z-20">
        <div>Giỏ hàng trống</div>
      </div>
    );
  }

  return (
    <div className="w-max absolute p-4 rounded-md shadow-[0_3px_10px_rgb(0,0,0,0.2)] bg-white top-12 right-0 flex flex-col gap-6 z-20">
      <h2 className="text-xl">Sách của bạn</h2>
      
      <div className="flex flex-col gap-8">
        {items.map(renderCartItem)}
      </div>
      
      <div>
        <div className="flex items-center justify-between font-semibold">
          <span>Tổng tiền</span>
          <span>{totalPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span>
        </div>
        <p className="text-gray-500 text-sm mt-2 mb-4">
          Thanh toán ngay để được hưởng ưu đãi
        </p>
        <div className="flex justify-between text-sm">
          <Button
            className="bg-blue-900 text-white hover:bg-white hover:text-blue-900"
            onClick={() => user && clearCart()}
            disabled={!user || isLoading}
          >
            Xóa giỏ hàng
          </Button>
          <Button className="text-lg bg-black text-white hover:bg-white hover:text-black">
            <Link href="/checkout">Thanh toán</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartModal;