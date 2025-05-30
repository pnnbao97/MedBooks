// app/checkout/page.tsx
import { auth } from '@clerk/nextjs/server';
import CheckoutClient from '@/components/CheckoutClient';
import { redirect } from 'next/navigation';

export default async function CheckoutPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in?redirect_url=/checkout');
  }

  return <CheckoutClient userId={userId} />;
}