import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

import { sendPresetPurchaseEmail } from "@/lib/email";
import { createPresetDownloadToken } from "@/lib/presetDownloads";

export const runtime = "nodejs";

function parsePaddleSignatureHeader(header: string | null): { ts: string; h1: string } | null {
	if (!header) return null;
	const parts = header.split(";").map((p) => p.trim());
	let ts = "";
	let h1 = "";
	for (const part of parts) {
		const [key, value] = part.split("=");
		if (key === "ts" && value) ts = value;
		if (key === "h1" && value) h1 = value;
	}
	if (!ts || !h1) return null;
	return { ts, h1 };
}

function verifyPaddleWebhookSignature({
	rawBody,
	signatureHeader,
	secret,
	maxClockSkewSeconds = 300,
}: {
	rawBody: string;
	signatureHeader: string | null;
	secret: string;
	maxClockSkewSeconds?: number;
}): boolean {
	const parsed = parsePaddleSignatureHeader(signatureHeader);
	if (!parsed) return false;

	const tsSeconds = Number(parsed.ts);
	if (!Number.isFinite(tsSeconds)) return false;
	const nowSeconds = Math.floor(Date.now() / 1000);
	if (Math.abs(nowSeconds - tsSeconds) > maxClockSkewSeconds) return false;

	const signedPayload = `${parsed.ts}:${rawBody}`;
	const expected = createHmac("sha256", secret).update(signedPayload, "utf8").digest("hex");

	const expectedBuf = Buffer.from(expected, "hex");
	const receivedBuf = Buffer.from(parsed.h1, "hex");
	if (expectedBuf.length !== receivedBuf.length) return false;
	return timingSafeEqual(expectedBuf, receivedBuf);
}

export async function POST(request: Request) {
	const secret = process.env.PADDLE_WEBHOOK_SECRET;
	if (!secret) {
		return NextResponse.json({ error: "PADDLE_WEBHOOK_SECRET is not set" }, { status: 500 });
	}

	const rawBody = await request.text();
	const signatureHeader = request.headers.get("paddle-signature");

	const ok = verifyPaddleWebhookSignature({ rawBody, signatureHeader, secret });
	if (!ok) {
		return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
	}

	let event: any;
	try {
		event = JSON.parse(rawBody);
	} catch {
		return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
	}

	// Typical shape: { event_id, event_type, data, occurred_at }
	const eventType = event?.event_type;

	if (eventType === "transaction.completed") {
		const customerEmail = event?.data?.customer?.email;
		const transactionId = event?.data?.id;

		if (customerEmail && typeof customerEmail === "string") {
			const baseUrl = process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || "https://wouter.photo";
			const ttlSeconds = Number(process.env.STAGE_FIX_V6_DOWNLOAD_TTL_SECONDS || "900");
			const maxUses = Number(process.env.STAGE_FIX_V6_MAX_USES || "2");

			let downloadUrl: string | null = null;
			try {
				const token = createPresetDownloadToken({
					product: "stage-fix-v6",
					transactionId: typeof transactionId === "string" ? transactionId : undefined,
					ttlSeconds: Number.isFinite(ttlSeconds) && ttlSeconds > 0 ? ttlSeconds : 900,
				});
				downloadUrl = `${baseUrl}/api/presets/stage-fix-v6?token=${encodeURIComponent(token)}`;
			} catch (error) {
				console.error("[Paddle webhook] Failed to create preset download token:", error);
			}

			if (downloadUrl) {
				const safeTtlSeconds = Number.isFinite(ttlSeconds) && ttlSeconds > 0 ? ttlSeconds : 900;
				const linkValidDays = safeTtlSeconds / (60 * 60 * 24);
				await sendPresetPurchaseEmail({
					to: customerEmail,
					productName: "Stage Fix v6",
					downloadUrl,
					transactionId: typeof transactionId === "string" ? transactionId : undefined,
					linkValidDays,
					maxUses: Number.isFinite(maxUses) && maxUses > 0 ? Math.floor(maxUses) : undefined,
				});
			}
		}
	}

	return NextResponse.json({ received: true });
}
