import { requireAdminAuth } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const authError = await requireAdminAuth();
  if (authError) return authError;
  return new Response('OK');
}