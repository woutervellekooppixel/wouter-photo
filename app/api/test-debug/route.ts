import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const authError = await requireAdminAuth();
  if (authError) return authError;

  return NextResponse.json({
    error: "TEST ERROR",
    debug: { forced: true, test: 123, tijd: new Date().toISOString() }
  }, { status: 500 });
}
