import { NextRequest, NextResponse } from "next/server";
import { getSession, verifyPassword } from "@/lib/auth";
import { loginRateLimit } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  const limited = await loginRateLimit(request);
  if (limited) return limited;

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
