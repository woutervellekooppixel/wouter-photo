import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/auth";
import { listAllUploads, isR2Configured } from "@/lib/r2";

export async function GET(request: NextRequest) {
  const authError = await requireAdminAuth();
  if (authError) return authError;

  if (!isR2Configured()) {
    return NextResponse.json(
      { 
        error: "R2 storage not configured", 
        details: "Please configure R2 environment variables in .env.local. See .env.example for required variables."
      },
      { status: 503 }
    );
  }

  try {
    const uploads = await listAllUploads();
    return NextResponse.json(uploads);
  } catch (error) {
    console.error("Error listing uploads:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to list uploads";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
