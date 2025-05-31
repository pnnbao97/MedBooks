'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [orderId, setOrderId] = useState<string>('');

  useEffect(() => {
    const orderIdParam = searchParams.get('orderId');
    if (orderIdParam) {
      setOrderId(orderIdParam);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Đặt hàng thành công!
        </h1>
        
        <p className="text-gray-600 mb-6">
          Cảm ơn bạn đã mua hàng tại VMedBook. Đơn hàng của bạn đã được xác nhận và sẽ được xử lý trong thời gian sớm nhất.
        </p>
        
        {orderId && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center space-x-2 text-green-700">
              <Package className="h-5 w-5" />
              <span className="font-medium">Mã đơn hàng: {orderId}</span>
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          <button
            onClick={() => router.push(orderId ? `/orders/${orderId}` : '/orders')}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <span>Xem chi tiết đơn hàng</span>
            <ArrowRight className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Tiếp tục mua sắm
          </button>
        </div>
        
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Thông tin quan trọng:</h3>
          <ul className="text-sm text-blue-700 space-y-1 text-left">
            <li>• Chúng tôi sẽ gửi email xác nhận đến bạn</li>
            <li>• Đơn hàng sẽ được giao trong 2-5 ngày làm việc</li>
            <li>• Bạn có thể theo dõi tình trạng đơn hàng trong tài khoản</li>
          </ul>
        </div>
      </div>
    </div>
  );
}