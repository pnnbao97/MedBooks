import { NextResponse } from 'next/server';
import { handleZaloPayCallback } from '@/lib/checkout';

export async function POST(request: Request) {
  try {
    const { data, mac } = await request.json();
    const result = await handleZaloPayCallback(data, mac);
    return NextResponse.json({ success: true, orderId: result.orderId });
  } catch (error: any) {
    console.error('ZaloPay webhook error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}