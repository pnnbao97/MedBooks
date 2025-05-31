'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { handleVNPayCallback } from '@/lib/checkout';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function VNPayCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');
  const [orderNumber, setOrderNumber] = useState<string>('');
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Lấy tất cả params từ URL
        const params: Record<string, string> = {};
        searchParams.forEach((value, key) => {
          params[key] = value;
        });

        // Kiểm tra xem có đủ params cần thiết không
        if (!params.vnp_TxnRef || !params.vnp_ResponseCode || !params.vnp_SecureHash) {
          throw new Error('Thiếu thông tin thanh toán');
        }

        // Gọi hàm xử lý callback
        const result = await handleVNPayCallback(params);
        
        if (result.success) {
          setStatus('success');
          setOrderNumber(result.orderId);
          setMessage('Thanh toán thành công! Đơn hàng của bạn đã được xác nhận.');
          
          // Chuyển hướng sau 3 giây
          setTimeout(() => {
            router.push(`/orders/${result.orderId}`);
          }, 3000);
        } else {
          throw new Error('Xử lý thanh toán thất bại');
        }
      } catch (error: any) {
        console.error('VNPay callback error:', error);
        setStatus('error');
        setMessage(error.message || 'Có lỗi xảy ra trong quá trình xử lý thanh toán');
        
        // Chuyển hướng về trang checkout sau 5 giây
        setTimeout(() => {
          router.push('/checkout');
        }, 5000);
      }
    };

    processCallback();
  }, [searchParams, router]);

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-16 w-16 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case 'error':
        return <XCircle className="h-16 w-16 text-red-500" />;
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'loading':
        return 'Đang xử lý thanh toán...';
      case 'success':
        return 'Thanh toán thành công!';
      case 'error':
        return 'Thanh toán thất bại!';
    }
  };

  const getStatusDescription = () => {
    switch (status) {
      case 'loading':
        return 'Vui lòng đợi trong giây lát, chúng tôi đang xác nhận thanh toán của bạn.';
      case 'success':
        return 'Cảm ơn bạn đã mua hàng. Bạn sẽ được chuyển hướng đến trang chi tiết đơn hàng.';
      case 'error':
        return 'Bạn sẽ được chuyển hướng về trang thanh toán để thử lại.';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6 flex justify-center">
          {getStatusIcon()}
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {getStatusTitle()}
        </h1>
        
        <p className="text-gray-600 mb-6">
          {message || getStatusDescription()}
        </p>
        
        {status === 'success' && orderNumber && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-700">
              <span className="font-medium">Mã đơn hàng:</span> {orderNumber}
            </p>
          </div>
        )}
        
        {status === 'loading' && (
          <div className="space-y-2">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full animate-pulse"></div>
            </div>
            <p className="text-sm text-gray-500">
              Không tắt trình duyệt trong quá trình xử lý
            </p>
          </div>
        )}
        
        {status === 'error' && (
          <div className="space-y-4">
            <button
              onClick={() => router.push('/checkout')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Quay lại thanh toán
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Về trang chủ
            </button>
          </div>
        )}
        
        {status === 'success' && (
          <div className="space-y-4">
            <button
              onClick={() => router.push(`/orders/${orderNumber}`)}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
            >
              Xem chi tiết đơn hàng
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        )}
      </div>
    </div>
  );
}