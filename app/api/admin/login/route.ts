import { NextRequest, NextResponse } from "next/server";
import { getSession, verifyPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  if (!password) {
    return NextResponse.json(
      { error: "Password required" },
      { status: 400 }
    );
  }

  const isValid = await verifyPassword(password);

  if (!isValid) {
    return NextResponse.json(
      { error: "Invalid password" },
      { status: 401 }
    );
  }

  const session = await getSession();
  session.isLoggedIn = true;
  session.email = process.env.ADMIN_EMAIL;
  session.loginTime = Date.now();
  await session.save();

  return NextResponse.json({ success: true });
}
