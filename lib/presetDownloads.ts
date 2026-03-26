import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { kv } from "@vercel/kv";

const kvEnabled = Boolean(process.env.KV_REST_API_URL);

// In-memory fallback (works locally / without KV, but not shared across instances)
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
	n: string; // nonce
	t?: string; // transaction id (optional)
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
	if (!secret) {
		throw new Error("PRESETS_DOWNLOAD_SIGNING_SECRET is not set");
	}

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
	// Keep the usage-counter around for as long as the token is valid.
	// Cap to 1 year to avoid unbounded TTL in KV.
	const ttl = Math.max(1, Math.min(Math.floor(ttlSeconds), 60 * 60 * 24 * 365));

	if (kvEnabled) {
		try {
			const count = await kv.incr(key);
			if (count === 1) {
				await kv.expire(key, ttl);
			}
			return count <= allowedUses;
		} catch (error) {
			console.error("[PresetDL] KV error, fallback to memory:", error);
			// fall through
		}
	}

	const now = Date.now();
	const expiresAt = now + ttl * 1000;
	const recordKey = `${key}:count`;
	const countKey = `${recordKey}`;
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
