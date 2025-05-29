"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/hooks/cartStore';
import { useUser } from '@clerk/nextjs';
import { Input } from '@/components/ui/input';

const CartModal = () => {
  const { items, totalPrice, updateQuantity, removeItem, isLoading, clearCart } = useCartStore();
  const { user } = useUser();

  // State để lưu quantity tạm thời cho mỗi item (cho debouncing)
  const [tempQuantities, setTempQuantities] = useState<{[key: number]: number}>({});
  const [debounceTimeouts, setDebounceTimeouts] = useState<{[key: number]: NodeJS.Timeout}>({});

  // Khởi tạo tempQuantities khi items thay đổi
  useEffect(() => {
    const initialQuantities: {[key: number]: number} = {};
    items.forEach(item => {
      initialQuantities[item.id] = item.quantity;
    });
    setTempQuantities(initialQuantities);
  }, [items]);

  // Debounced update function
  const debouncedUpdate = useCallback((itemId: number, newQuantity: number) => {
    // Clear existing timeout nếu có
    if (debounceTimeouts[itemId]) {
      clearTimeout(debounceTimeouts[itemId]);
    }

    // Set timeout mới
    const timeoutId = setTimeout(() => {
      if (newQuantity > 0) {
        updateQuantity(itemId, newQuantity);
      }
      // Cleanup timeout
      setDebounceTimeouts(prev => {
        const updated = { ...prev };
        delete updated[itemId];
        return updated;
      });
    }, 800); // Đợi 800ms sau khi người dùng ngừng thao tác

    setDebounceTimeouts(prev => ({
      ...prev,
      [itemId]: timeoutId
    }));
  }, [updateQuantity, debounceTimeouts]);

  // Handle quantity change (cho cả button và input)
  const handleQuantityChange = (itemId: number, newQuantity: number, item: any) => {
    // Validate quantity
    if (newQuantity < 1) newQuantity = 1;
    if (newQuantity > item.book.availableCopies) {
      newQuantity = item.book.availableCopies;
    }

    // Update temp state ngay lập tức (cho UI responsive)
    setTempQuantities(prev => ({
      ...prev,
      [itemId]: newQuantity
    }));

    // Debounced update
    debouncedUpdate(itemId, newQuantity);
  };

  // Handle input change
  const handleInputChange = (itemId: number, value: string, item: any) => {
    const numValue = parseInt(value) || 1;
    handleQuantityChange(itemId, numValue, item);
  };

  // Handle input blur (khi người dùng click ra ngoài input)
  const handleInputBlur = (itemId: number, item: any) => {
    const currentTemp = tempQuantities[itemId] || item.quantity;
    
    // Clear timeout và update ngay lập tức
    if (debounceTimeouts[itemId]) {
      clearTimeout(debounceTimeouts[itemId]);
      setDebounceTimeouts(prev => {
        const updated = { ...prev };
        delete updated[itemId];
        return updated;
      });
    }

    if (currentTemp !== item.quantity && currentTemp > 0) {
      updateQuantity(itemId, currentTemp);
    }
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimeouts).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, [debounceTimeouts]);

  return (
    <div className="w-max absolute p-4 rounded-md shadow-[0_3px_10px_rgb(0,0,0,0.2)] bg-white top-12 right-0 flex flex-col gap-6 z-20">
      {/* {isLoading ? (
        <div>Đang tải...</div> */}
      {items.length === 0 ? (
        <div>Giỏ hàng trống</div>
      ) : (
        <>
          <h2 className="text-xl">Sách của bạn</h2>
          <div className="flex flex-col gap-8">
            {items.map((item) => {
              const currentQuantity = tempQuantities[item.id] ?? item.quantity;
              // const hasChanges = currentQuantity !== item.quantity;
              
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
                        <Link href={`/books/${item.book.slug}`} className="text-amber-700 font-semibold hover:underline">
                          {item.book.title}
                        </Link>
                        <div className="font-normal text-amber-900">
                          {(
                            (item.version === 'color'
                              ? item.book.hasColorSale
                                ? item.book.colorPrice - item.book.colorSaleAmount
                                : item.book.colorPrice
                              : item.book.photoPrice) * 1000
                          ).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
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
                          disabled={currentQuantity <= 1}
                        >
                          -
                        </Button>
                        <div className="flex flex-col items-center">
                          <Input
                            type="number"
                            min="1"
                            max={item.book.availableCopies}
                            value={currentQuantity}
                            onChange={(e) => handleInputChange(item.id, e.target.value, item)}
                            onBlur={() => handleInputBlur(item.id, item)}
                            className="w-16 text-center border rounded px-2 py-1 text-sm border-gray-300"
                          />
                          {/* {hasChanges && (
                            <span className="text-xs text-orange-500 mt-1">
                              Đang cập nhật...
                            </span>
                          )} */}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, currentQuantity + 1, item)}
                          disabled={currentQuantity >= item.book.availableCopies}
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
            })}
          </div>
          <div>
            <div className="flex items-center justify-between font-semibold">
              <span>Tổng tiền</span>
              <span>{(totalPrice).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span>
            </div>
            <p className="text-gray-500 text-sm mt-2 mb-4">
              Thanh toán ngay để được hưởng ưu đãi
            </p>
            <div className="flex justify-between text-sm">
              <Button
                className="bg-blue-900 text-white hover:bg-white hover:text-blue-900"
                onClick={() => user && clearCart()}
                disabled={!user}
              >
                Xóa giỏ hàng
              </Button>
              <Button className="text-lg bg-black text-white hover:bg-white hover:text-black">
                <Link href="/checkout">Thanh toán</Link>
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CartModal;