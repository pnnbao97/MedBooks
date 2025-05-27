// app/checkout/page.tsx
import { auth } from '@clerk/nextjs/server';
import { getUserShippingAddresses } from '@/lib/checkout';
import CheckoutClient from '@/components/CheckoutClient';
import { useCartStore } from '@/hooks/cartStore';
import { redirect } from 'next/navigation';

export default async function CheckoutPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in?redirect_url=/checkout');
  }

  // Lấy địa chỉ giao hàng từ cơ sở dữ liệu
  const savedAddresses = await getUserShippingAddresses(userId);

  // Lấy giỏ hàng từ Zustand server-side
  // Vì đây là server component, ta không thể dùng hook trực tiếp
  // Thay vào đó, ta sẽ truyền userId để CheckoutClient lấy giỏ hàng từ Zustand
  return <CheckoutClient userId={userId} savedAddresses={savedAddresses} />;
}