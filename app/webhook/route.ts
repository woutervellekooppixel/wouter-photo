import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  // Webhook handler - to be implemented
  return NextResponse.json({ message: 'Webhook received' }, { status: 200 })
}
