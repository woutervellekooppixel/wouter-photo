import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth';

async function guard() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const authError = await requireAdminAuth();
  if (authError) return authError;
  return null;
}

export async function GET() {
  const g = await guard();
  if (g) return g;

  return NextResponse.json(
    {
      error: 'TEST DELETE (GET)',
      debug: { forced: true, test: 123, tijd: new Date().toISOString() },
    },
    { status: 500 }
  );
}

export async function DELETE(req: NextRequest) {
  const g = await guard();
  if (g) return g;

  return NextResponse.json({
    error: "TEST DELETE",
    debug: { forced: true, test: 123, tijd: new Date().toISOString() }
  }, { status: 500 });
}
