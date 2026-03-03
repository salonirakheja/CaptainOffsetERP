import { NextRequest, NextResponse } from 'next/server';
import { verifyPin, updatePin } from '@/lib/db/people';

export async function POST(req: NextRequest) {
  const { personId, currentPin, newPin } = await req.json();

  if (!personId || !currentPin || !newPin) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
    return NextResponse.json({ error: 'PIN must be 4 digits' }, { status: 400 });
  }

  const valid = await verifyPin(personId, currentPin);
  if (!valid) {
    return NextResponse.json({ error: 'Current PIN is incorrect' });
  }

  await updatePin(personId, newPin);
  return NextResponse.json({ success: true });
}
