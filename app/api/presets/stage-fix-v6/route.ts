import { NextRequest, NextResponse } from "next/server";

import { downloadRateLimit } from "@/lib/rateLimit";
import { getSignedDownloadUrlWithFilename } from "@/lib/r2";
import { markPresetDownloadTokenUsedUpTo, verifyPresetDownloadToken } from "@/lib/presetDownloads";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
	const limited = await downloadRateLimit(request);
	if (limited) return limited;

	const token = request.nextUrl.searchParams.get("token");
	if (!token) {
		return NextResponse.json({ error: "Missing token" }, { status: 400 });
	}

	const payload = verifyPresetDownloadToken(token);
	if (!payload) {
		return NextResponse.json({ error: "Invalid or expired token" }, { status: 403 });
	}

	const key = process.env.STAGE_FIX_V6_R2_KEY;
	if (!key) {
		return NextResponse.json({ error: "STAGE_FIX_V6_R2_KEY is not set" }, { status: 500 });
	}

	const now = Math.floor(Date.now() / 1000);
	const remainingSeconds = Math.max(1, payload.exp - now);
	const maxUses = Number(process.env.STAGE_FIX_V6_MAX_USES || "2");

	const usedOk = await markPresetDownloadTokenUsedUpTo(
		payload.n,
		remainingSeconds,
		Number.isFinite(maxUses) && maxUses > 0 ? Math.floor(maxUses) : 2
	);
	if (!usedOk) {
		return NextResponse.json({ error: "This download link was already used" }, { status: 410 });
	}

	const signedUrlTtlSeconds = Math.min(300, remainingSeconds); // R2 presign TTL; keep short
	const signedUrl = await getSignedDownloadUrlWithFilename(
		key,
		"WOUTER_PHOTO_STAGE_FIX_v6_INSTALL.zip",
		signedUrlTtlSeconds
	);

	return NextResponse.redirect(signedUrl, { status: 302 });
}
