import { NextResponse } from 'next/server';
import { handleMoMoCallback } from '@/lib/checkout';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const result = await handleMoMoCallback(data);
    return NextResponse.json({ success: true, orderId: result.orderId });
  } catch (error: any) {
    console.error('MoMo webhook error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}