import { NextRequest, NextResponse } from "next/server";
import { getMetadata } from "@/lib/r2";
import { isValidSlug } from "@/lib/validation";
import { isExpired } from "@/lib/expiry";
import { sendRelinkRequestNotification } from "@/lib/email";
import { rateLimit } from "@/lib/rateLimit";

// Klant vraagt op de verlopen-pagina met één klik een nieuwe link aan.
// Streng gelimiteerd: dit stuurt een mail naar Wouter.
const relinkRateLimit = rateLimit({
  name: "relink",
  windowMs: 60 * 60 * 1000,
  maxRequests: 3,
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const rateLimitResponse = await relinkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { slug } = await params;
    if (!isValidSlug(slug)) {
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
    }

    const metadata = await getMetadata(slug);
    if (!metadata) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    // Alleen voor daadwerkelijk verlopen transfers — actieve links hebben
    // deze knop niet en horen hier ook geen mail voor te genereren.
    if (!isExpired(metadata)) {
      return NextResponse.json({ error: "Not expired" }, { status: 400 });
    }

    await sendRelinkRequestNotification(slug, metadata.title);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Relink request error:", error);
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}
