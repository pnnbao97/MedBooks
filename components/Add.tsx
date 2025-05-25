'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/hook/cartStore';
import { useUser } from '@clerk/nextjs';

interface AddProps {
  bookId: number;
  availableCopies: number;
  isCompleted?: boolean;
  preorder?: boolean;
  selectedVersion: 'color' | 'photo';
}

const Add = ({ bookId, availableCopies, isCompleted = true, preorder = false, selectedVersion }: AddProps) => {
  const [quantity, setQuantity] = useState(1);
  const maxQuantity = availableCopies > 0 ? availableCopies : 1;
  const canPurchase = (isCompleted || preorder) && availableCopies > 0;
  const { addItem } = useCartStore();
  const { user } = useUser();

  const handleQuantity = (type: 'i' | 'd') => {
    if (type === 'd' && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
    if (type === 'i' && quantity < maxQuantity) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handlePurchase = async () => {
    if (!user) {
      alert('Vui lòng đăng nhập để thêm vào giỏ hàng');
      return;
    }
    if (!canPurchase) {
      alert('Sách hiện chưa có sẵn để đặt hàng');
      return;
    }
    try {
      await addItem(bookId, selectedVersion, quantity);
      alert(`Đã thêm ${quantity} cuốn (${selectedVersion === 'color' ? 'bản gốc' : 'bản photo'}) vào giỏ hàng`);
    } catch (error: any) {
      alert(`Lỗi: ${error.message}`);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h4 className="font-medium">Số lượng</h4>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="bg-gray-100 py-2 px-4 rounded-3xl flex items-center justify-between w-32">
            <Button
              className="text-xl bg-gray-100 hover:bg-gray-100"
              onClick={() => handleQuantity('d')}
              disabled={quantity <= 1 || !canPurchase}
            >
              -
            </Button>
            {quantity}
            <Button
              className="text-xl bg-gray-100 hover:bg-gray-100"
              onClick={() => handleQuantity('i')}
              disabled={quantity >= maxQuantity || !canPurchase}
            >
              +
            </Button>
          </div>
          <div>
            Còn lại <span className="text-orange-500">{availableCopies}</span> cuốn
          </div>
        </div>
        <div>
          <Button
            className="w-[180px] text-lg rounded-3xl bg-white text-red-700 border border-red-950 hover:bg-red-800 hover:text-white disabled:bg-blue-200 disabled:text-white disabled:cursor-not-allowed"
            onClick={handlePurchase}
            disabled={!canPurchase || !user}
          >
            {isCompleted ? 'Mua sách' : preorder ? 'Đặt trước' : 'Mua sách'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Add;