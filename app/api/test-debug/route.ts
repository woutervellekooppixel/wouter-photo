import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  return NextResponse.json({
    error: "TEST ERROR",
    debug: { forced: true, test: 123, tijd: new Date().toISOString() }
  }, { status: 500 });
}
