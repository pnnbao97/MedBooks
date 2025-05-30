'use client';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function ZaloPayCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const status = searchParams.get('status');
    const orderNumber = searchParams.get('apptransid')?.split('_')[1];
    if (status === '1' && orderNumber) {
      router.push(`/checkout/success?order=ORD${orderNumber}&status=success`);
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