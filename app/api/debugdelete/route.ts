export async function GET() {
  return NextResponse.json({
    error: "TEST DELETE (GET)",
    debug: { forced: true, test: 123, tijd: new Date().toISOString() }
  }, { status: 500 });
}
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(req: NextRequest) {
  return NextResponse.json({
    error: "TEST DELETE",
    debug: { forced: true, test: 123, tijd: new Date().toISOString() }
  }, { status: 500 });
}
