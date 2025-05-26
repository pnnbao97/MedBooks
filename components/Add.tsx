'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/hooks/cartStore';
import { useUser } from '@clerk/nextjs';
import { ShoppingCart, Plus, Minus, Package, AlertCircle, CheckCircle, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface AddProps {
  bookId: number;
  availableCopies: number;
  isCompleted?: boolean;
  preorder?: boolean;
  selectedVersion: 'color' | 'photo';
  bookTitle?: string;
}

const Add = ({ 
  bookId, 
  availableCopies, 
  isCompleted = true, 
  preorder = false, 
  selectedVersion,
  bookTitle = 'sách'
}: AddProps) => {
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const maxQuantity = availableCopies > 0 ? availableCopies : 1;
  const canPurchase = (isCompleted || preorder) && availableCopies > 0;
  const { addItem } = useCartStore();
  const { user } = useUser();
  const router = useRouter();

  const handleQuantity = (type: 'i' | 'd') => {
    if (type === 'd' && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
    if (type === 'i' && quantity < maxQuantity) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleCheckout = () => {
    router.push('/checkout');
  };

  const handlePurchase = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng', {
        description: 'Bạn cần đăng nhập để có thể mua sách',
        duration: 5000,
      });
      return;
    }
    
    if (!canPurchase) {
      toast.error('Sách hiện chưa có sẵn để đặt hàng', {
        description: 'Vui lòng thử lại sau',
        duration: 5000,
      });
      return;
    }
    
    setIsLoading(true);
    try {
      await addItem(bookId, selectedVersion, quantity);
      
      // Success toast with checkout action
      const versionText = selectedVersion === 'color' ? 'bản gốc' : 'bản photo';
      toast.success(
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-semibold">Thêm vào giỏ hàng thành công!</span>
          </div>
          <p className="text-sm text-gray-600">
            Đã thêm {quantity} cuốn "{bookTitle}" ({versionText}) vào giỏ hàng
          </p>
        </div>,
        {
          duration: 10000,
          action: {
            label: (
              <div className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <CreditCard className="w-4 h-4" />
                <span className="font-medium">Thanh toán ngay</span>
              </div>
            ),
            onClick: handleCheckout,
          },
          style: {
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
            border: '1px solid #0ea5e9',
            borderRadius: '12px',
          },
        }
      );
    } catch (error: any) {
      toast.error('Có lỗi xảy ra khi thêm vào giỏ hàng', {
        description: error.message || 'Vui lòng thử lại sau',
        duration: 5000,
        style: {
          background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
          border: '1px solid #ef4444',
          borderRadius: '12px',
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const versionText = selectedVersion === 'color' ? 'bản gốc' : 'bản photo';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
          <ShoppingCart className="w-4 h-4 text-white" />
        </div>
        <h4 className="text-lg font-semibold text-gray-900">Thêm vào giỏ hàng</h4>
      </div>

      {/* Stock Status */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
        <div className="flex items-center gap-3">
          <Package className="w-5 h-5 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-gray-900">Tình trạng kho</p>
            <p className="text-xs text-gray-600">Phiên bản {versionText}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-blue-600">{availableCopies} cuốn</p>
          <p className="text-xs text-gray-500">có sẵn</p>
        </div>
      </div>

      {/* Quantity Selector */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Chọn số lượng
        </label>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white border-2 border-gray-200 rounded-xl p-1 shadow-sm">
            <Button
              variant="ghost"
              size="sm"
              className="w-10 h-10 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => handleQuantity('d')}
              disabled={quantity <= 1 || !canPurchase}
            >
              <Minus className="w-4 h-4" />
            </Button>
            <div className="w-16 text-center">
              <span className="text-lg font-semibold text-gray-900">{quantity}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-10 h-10 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => handleQuantity('i')}
              disabled={quantity >= maxQuantity || !canPurchase}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Quantity Info */}
          <div className="flex-1">
            <p className="text-sm text-gray-600">
              Tối đa <span className="font-medium text-gray-900">{maxQuantity}</span> cuốn
            </p>
            {quantity === maxQuantity && (
              <p className="text-xs text-amber-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" />
                Đã đạt giới hạn số lượng
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Add to Cart Button */}
      <div className="pt-4">
        <Button
          onClick={handlePurchase}
          disabled={!canPurchase || !user || isLoading}
          className={`w-full h-14 text-lg font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg ${
            canPurchase && user
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-200'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Đang thêm...
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-5 h-5" />
              {isCompleted ? 'Thêm vào giỏ hàng' : preorder ? 'Đặt trước ngay' : 'Thêm vào giỏ hàng'}
            </div>
          )}
        </Button>

        {/* Status Messages */}
        {!user && (
          <p className="text-sm text-amber-600 text-center mt-3 flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Vui lòng đăng nhập để thực hiện mua hàng
          </p>
        )}
        
        {!canPurchase && user && (
          <p className="text-sm text-red-600 text-center mt-3 flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Sản phẩm hiện không khả dụng
          </p>
        )}

        {canPurchase && user && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 text-center">
              ✅ Sẵn sàng thêm <span className="font-medium">{quantity} cuốn</span> ({versionText}) vào giỏ hàng
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Add;