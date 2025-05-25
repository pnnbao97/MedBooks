"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/hook/cartStore';
import { useUser } from '@clerk/nextjs';

const CartModal = () => {
  const { items, totalPrice, updateQuantity, removeItem, isLoading, clearCart } = useCartStore();
  const { user } = useUser();

  return (
    <div className="w-max absolute p-4 rounded-md shadow-[0_3px_10px_rgb(0,0,0,0.2)] bg-white top-12 right-0 flex flex-col gap-6 z-20">
      {isLoading ? (
        <div>Đang tải...</div>
      ) : items.length === 0 ? (
        <div>Giỏ hàng trống</div>
      ) : (
        <>
          <h2 className="text-xl">Sách của bạn</h2>
          <div className="flex flex-col gap-8">
            {items.map((item) => (
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
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </Button>
                      <span className="text-gray-500">Số lượng: {item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
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
                </div>
              </div>
            ))}
          </div>
          <div>
            <div className="flex items-center justify-between font-semibold">
              <span>Tổng tiền</span>
              <span>{(totalPrice * 1000).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span>
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