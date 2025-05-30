import { NextResponse } from 'next/server';
import { handleVNPayCallback } from '@/lib/checkout';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    const result = await handleVNPayCallback(params);
    return NextResponse.redirect(`/checkout/success?order=${result.orderId}&status=success`);
  } catch (error: any) {
    console.error('VNPay callback error:', error);
    return NextResponse.redirect(`/checkout?status=failed`);
  }
}