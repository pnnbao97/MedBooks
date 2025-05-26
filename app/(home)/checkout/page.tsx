// app/checkout/page.tsx
import { getUserCartItems, getUserShippingAddresses } from '@/lib/checkout';
import { auth } from '@clerk/nextjs/server';
import CheckoutClient from '@/components/CheckoutClient';

export default async function CheckoutPage() {
  const { userId } = await auth();
  if (!userId) {
    return <div>Please sign in to continue</div>;
  }

  const cartItems = await getUserCartItems(userId);
  const savedAddresses = await getUserShippingAddresses(userId);

  return <CheckoutClient cartItems={cartItems} savedAddresses={savedAddresses} />;
}