import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { kv } from "@vercel/kv";

const kvEnabled = Boolean(process.env.KV_REST_API_URL);

if (!kvEnabled && process.env.NODE_ENV === "production") {
	console.warn(
		"[PresetDL] KV_REST_API_URL is not set — token usage tracking uses in-memory fallback, " +
		"which is not reliable across serverless instances. The resend flow will also not work."
	);
}

// In-memory fallback (works locally / within a single instance, not across instances)
const usedTokenStore = new Map<string, number>();

function base64UrlEncode(input: Buffer | string): string {
	const buf = typeof input === "string" ? Buffer.from(input, "utf8") : input;
	return buf
		.toString("base64")
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/g, "");
}

function base64UrlDecodeToString(input: string): string {
	const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
	const b64 = input.replace(/-/g, "+").replace(/_/g, "/") + pad;
	return Buffer.from(b64, "base64").toString("utf8");
}

function sign(data: string, secret: string): string {
	const mac = createHmac("sha256", secret).update(data, "utf8").digest();
	return base64UrlEncode(mac);
}

function safeEqual(a: string, b: string): boolean {
	const ab = Buffer.from(a);
	const bb = Buffer.from(b);
	if (ab.length !== bb.length) return false;
	return timingSafeEqual(ab, bb);
}

export type PresetProduct = "stage-fix-v6";

export interface PresetDownloadTokenPayload {
	p: PresetProduct;
	exp: number; // unix seconds
	n: string;   // nonce
	t?: string;  // transaction id (optional)
}

export interface EmailDownloadMapping {
	downloadUrl: string;
	productName: string;
	linkValidDays: number;
	maxUses?: number;
}

export function createPresetDownloadToken({
	product,
	transactionId,
	ttlSeconds,
}: {
	product: PresetProduct;
	transactionId?: string;
	ttlSeconds: number;
}): string {
	const secret = process.env.PRESETS_DOWNLOAD_SIGNING_SECRET;
	if (!secret) throw new Error("PRESETS_DOWNLOAD_SIGNING_SECRET is not set");

	const now = Math.floor(Date.now() / 1000);
	const payload: PresetDownloadTokenPayload = {
		p: product,
		exp: now + ttlSeconds,
		n: randomBytes(16).toString("hex"),
		...(transactionId ? { t: transactionId } : {}),
	};

	const body = base64UrlEncode(JSON.stringify(payload));
	const signature = sign(body, secret);
	return `${body}.${signature}`;
}

export function verifyPresetDownloadToken(token: string): PresetDownloadTokenPayload | null {
	const secret = process.env.PRESETS_DOWNLOAD_SIGNING_SECRET;
	if (!secret) return null;

	const [body, signature] = token.split(".");
	if (!body || !signature) return null;

	const expected = sign(body, secret);
	if (!safeEqual(signature, expected)) return null;

	let payload: PresetDownloadTokenPayload;
	try {
		payload = JSON.parse(base64UrlDecodeToString(body));
	} catch {
		return null;
	}

	if (!payload || typeof payload !== "object") return null;
	if (payload.p !== "stage-fix-v6") return null;
	if (typeof payload.exp !== "number" || !Number.isFinite(payload.exp)) return null;
	if (typeof payload.n !== "string" || payload.n.length < 10) return null;

	const now = Math.floor(Date.now() / 1000);
	if (payload.exp <= now) return null;

	return payload;
}

export async function markPresetDownloadTokenUsedOnce(nonce: string, ttlSeconds: number): Promise<boolean> {
	return markPresetDownloadTokenUsedUpTo(nonce, ttlSeconds, 1);
}

export async function markPresetDownloadTokenUsedUpTo(
	nonce: string,
	ttlSeconds: number,
	maxUses: number
): Promise<boolean> {
	const key = `presetdl:${nonce}`;
	const allowedUses = Math.max(1, Math.floor(maxUses));
	const ttl = Math.max(1, Math.min(Math.floor(ttlSeconds), 60 * 60 * 24 * 365));

	if (kvEnabled) {
		try {
			const count = await kv.incr(key);
			if (count === 1) await kv.expire(key, ttl);
			return count <= allowedUses;
		} catch (error) {
			console.error("[PresetDL] KV error, fallback to memory:", error);
		}
	}

	const now = Date.now();
	const expiresAt = now + ttl * 1000;
	const countKey = `${key}:count`;
	const expiryKey = `${key}:exp`;

	const storedExpiry = usedTokenStore.get(expiryKey);
	if (!storedExpiry || storedExpiry <= now) {
		usedTokenStore.set(expiryKey, expiresAt);
		usedTokenStore.set(countKey, 1);
		return true;
	}

	const currentCount = usedTokenStore.get(countKey) ?? 0;
	const nextCount = currentCount + 1;
	usedTokenStore.set(countKey, nextCount);
	return nextCount <= allowedUses;
}

// ── Email → download mapping (for the resend flow) ────────────────────────────
// Stored in KV when a purchase is processed. Key: purchase:{product}:{email}

export async function storeEmailDownloadMapping(
	email: string,
	product: string,
	data: EmailDownloadMapping,
	ttlSeconds: number
): Promise<void> {
	if (!kvEnabled) {
		console.warn("[PresetDL] KV not available — resend flow will not work for this purchase");
		return;
	}
	const key = `purchase:${product}:${email.toLowerCase().trim()}`;
	const ttl = Math.max(1, Math.min(Math.floor(ttlSeconds), 60 * 60 * 24 * 365));
	try {
		await kv.set(key, data, { ex: ttl });
	} catch (err) {
		console.error("[PresetDL] Failed to store email mapping:", err);
	}
}

export async function getEmailDownloadMapping(
	email: string,
	product: string
): Promise<EmailDownloadMapping | null> {
	if (!kvEnabled) return null;
	const key = `purchase:${product}:${email.toLowerCase().trim()}`;
	try {
		return await kv.get<EmailDownloadMapping>(key);
	} catch (err) {
		console.error("[PresetDL] Failed to get email mapping:", err);
		return null;
	}
}
