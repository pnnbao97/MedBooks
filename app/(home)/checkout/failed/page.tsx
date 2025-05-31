'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { XCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function CheckoutFailedPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      setErrorMessage(decodeURIComponent(error));
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="h-12 w-12 text-red-500" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Thanh toán thất bại!
        </h1>
        
        <p className="text-gray-600 mb-6">
          {errorMessage || 'Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.'}
        </p>
        
        <div className="space-y-4">
          <button
            onClick={() => router.push('/checkout')}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Thử lại thanh toán</span>
          </button>
          
          <button
            onClick={() => router.push('/cart')}
            className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Quay lại giỏ hàng</span>
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="w-full text-gray-500 py-2 px-4 rounded-lg hover:text-gray-700 transition-colors"
          >
            Về trang chủ
          </button>
        </div>
        
        <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
          <h3 className="font-medium text-yellow-900 mb-2">Cần hỗ trợ?</h3>
          <p className="text-sm text-yellow-700">
            Nếu bạn gặp khó khăn, vui lòng liên hệ hotline: <strong>1900-xxxx</strong> hoặc email: <strong>support@vmedbook.com</strong>
          </p>
        </div>
      </div>
    </div>
  );
}