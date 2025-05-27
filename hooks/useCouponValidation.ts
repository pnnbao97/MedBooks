// hooks/useCouponValidation.ts
import { useState, useCallback } from 'react';
import { validateCoupon } from '@/lib/checkout';

export const useCouponValidation = () => {
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const validateCouponCode = useCallback(async (code: string, orderAmount: number) => {
    if (!code.trim()) return;
    
    setCouponLoading(true);
    setCouponError('');
    
    try {
      const result = await validateCoupon(code, orderAmount);
      if (result.valid && result.discountAmount) {
        setCouponDiscount(result.discountAmount);
        setCouponError('');
      } else {
        setCouponError(result.error || 'Mã giảm giá không hợp lệ');
        setCouponDiscount(0);
      }
    } catch (error) {
      setCouponError('Có lỗi xảy ra khi kiểm tra mã giảm giá');
      setCouponDiscount(0);
    } finally {
      setCouponLoading(false);
    }
  }, []);

  const resetCoupon = useCallback(() => {
    setCouponCode('');
    setCouponDiscount(0);
    setCouponError('');
  }, []);

  return {
    couponCode,
    setCouponCode,
    couponDiscount,
    couponError,
    couponLoading,
    validateCouponCode,
    resetCoupon
  };
};