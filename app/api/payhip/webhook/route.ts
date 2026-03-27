import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

import { sendPresetPurchaseEmail } from "@/lib/email";
import { createPresetDownloadToken, storeEmailDownloadMapping } from "@/lib/presetDownloads";

export const runtime = "nodejs";

// ── Payhip webhook security verification ─────────────────────────────────────
// Payhip sends a POST with JSON body.
// Security hash: sha256(webhookSecret + saleId + buyerEmail)
// Verify this against the "security" field in the payload.
//
// If you notice verification failing, enable PAYHIP_LOG_BODY=1 temporarily to
// log the raw body and check the exact format against Payhip's IPN documentation.
//
function verifyPayhipWebhook(payload: Record<string, unknown>, secret: string): boolean {
	const security = payload.security;
	if (typeof security !== "string" || !security) return false;

	const saleId = typeof payload.sale_id === "string" ? payload.sale_id : "";
	const buyerEmail = typeof payload.buyer_email === "string" ? payload.buyer_email : "";

	const expected = createHmac("sha256", secret)
		.update(secret + saleId + buyerEmail, "utf8")
		.digest("hex");

	const expectedBuf = Buffer.from(expected, "hex");
	const receivedBuf = Buffer.from(security, "hex");
	if (expectedBuf.length !== receivedBuf.length) return false;
	return timingSafeEqual(expectedBuf, receivedBuf);
}

export async function POST(request: Request) {
	const secret = process.env.PAYHIP_WEBHOOK_SECRET;
	const logBody = process.env.PAYHIP_LOG_BODY === "1";
	const nowIso = new Date().toISOString();
	const requestId = (request.headers.get("x-vercel-id") || request.headers.get("x-request-id")) ?? undefined;

	if (!secret) {
		console.error("[Payhip webhook] Missing PAYHIP_WEBHOOK_SECRET");
		return NextResponse.json({ error: "PAYHIP_WEBHOOK_SECRET is not set" }, { status: 500 });
	}

	const rawBody = await request.text();
	console.log("[Payhip webhook] Incoming", { at: nowIso, requestId, rawBodyLength: rawBody.length });

	if (logBody) {
		console.log("[Payhip webhook] Raw body (debug):", rawBody.slice(0, 2000));
	}

	let payload: Record<string, unknown>;
	try {
		// Payhip can send either JSON or form-encoded — try JSON first
		if (rawBody.trimStart().startsWith("{")) {
			payload = JSON.parse(rawBody);
		} else {
			const params = new URLSearchParams(rawBody);
			payload = Object.fromEntries(params.entries());
		}
	} catch {
		console.warn("[Payhip webhook] Could not parse body", { at: nowIso, requestId });
		return NextResponse.json({ error: "Invalid body" }, { status: 400 });
	}

	console.log("[Payhip webhook] Parsed payload keys:", Object.keys(payload), { at: nowIso, requestId });

	const ok = verifyPayhipWebhook(payload, secret);
	if (!ok) {
		// Log a warning but don't reject in case the signature format differs.
		// Set PAYHIP_SKIP_VERIFICATION=1 temporarily while debugging.
		const skip = process.env.PAYHIP_SKIP_VERIFICATION === "1";
		if (!skip) {
			console.warn("[Payhip webhook] Signature verification failed — set PAYHIP_LOG_BODY=1 to inspect", {
				at: nowIso,
				requestId,
			});
			return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
		}
		console.warn("[Payhip webhook] Signature check skipped (PAYHIP_SKIP_VERIFICATION=1)", { at: nowIso });
	}

	const buyerEmail = typeof payload.buyer_email === "string" ? payload.buyer_email.trim() : null;
	const saleId = typeof payload.sale_id === "string" ? payload.sale_id : undefined;
	const productPermalink = typeof payload.product_permalink === "string" ? payload.product_permalink : null;

	console.log("[Payhip webhook] Verified purchase", {
		at: nowIso,
		requestId,
		saleId,
		productPermalink,
		hasEmail: Boolean(buyerEmail),
	});

	if (!buyerEmail) {
		console.warn("[Payhip webhook] Missing buyer_email — skipping email", { at: nowIso, requestId });
		return NextResponse.json({ received: true });
	}

	const baseUrl = process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || "https://wouter.photo";
	const ttlSeconds = Number(process.env.STAGE_FIX_V6_DOWNLOAD_TTL_SECONDS || String(31 * 24 * 60 * 60));
	const maxUses = Number(process.env.STAGE_FIX_V6_MAX_USES || "3");
	const safeTtl = Number.isFinite(ttlSeconds) && ttlSeconds > 0 ? ttlSeconds : 31 * 24 * 60 * 60;
	const safeMaxUses = Number.isFinite(maxUses) && maxUses > 0 ? Math.floor(maxUses) : 3;
	const linkValidDays = Math.floor(safeTtl / (60 * 60 * 24));

	try {
		const token = createPresetDownloadToken({
			product: "stage-fix-v6",
			transactionId: saleId,
			ttlSeconds: safeTtl,
		});

		// Point to the landing page, not directly to the API
		const downloadUrl = `${baseUrl}/shop/stage-fix-v6/download?token=${encodeURIComponent(token)}`;

		// Store mapping so the customer can request a resend later
		await storeEmailDownloadMapping(
			buyerEmail,
			"stage-fix-v6",
			{ downloadUrl, productName: "Stage Fix v6", linkValidDays, maxUses: safeMaxUses },
			safeTtl
		);

		await sendPresetPurchaseEmail({
			to: buyerEmail,
			productName: "Stage Fix v6",
			downloadUrl,
			transactionId: saleId,
			linkValidDays,
			maxUses: safeMaxUses,
		});

		console.log("[Payhip webhook] Purchase email sent", { at: nowIso, requestId });
	} catch (error) {
		console.error("[Payhip webhook] Failed to process purchase:", error);
		// Still return 200 so Payhip doesn't retry — the error is on our side
	}

	return NextResponse.json({ received: true });
}
