import { NextRequest, NextResponse } from 'next/server';
import { verifyPin } from '@/lib/db/people';

export async function POST(request: NextRequest) {
  const { personId, pin } = await request.json();

  if (!personId || !pin) {
    return NextResponse.json({ success: false, error: 'Missing personId or pin' });
  }

  const valid = await verifyPin(personId, pin);
  return NextResponse.json({ success: valid });
}
