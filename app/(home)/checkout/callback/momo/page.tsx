'use client';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function MoMoCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const resultCode = searchParams.get('resultCode');
    const orderId = searchParams.get('orderId')?.replace('MM', '');
    if (resultCode === '0' && orderId) {
      router.push(`/checkout/success?order=${orderId}&status=success`);
    } else {
      router.push(`/checkout?status=failed`);
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin" />
      <p className="ml-2">Đang xử lý thanh toán...</p>
    </div>
  );
}