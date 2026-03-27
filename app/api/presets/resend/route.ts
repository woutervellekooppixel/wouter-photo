import { NextRequest, NextResponse } from "next/server";

import { resendRateLimit } from "@/lib/rateLimit";
import { getEmailDownloadMapping } from "@/lib/presetDownloads";
import { sendPresetPurchaseEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
	const limited = await resendRateLimit(request);
	if (limited) return limited;

	let email: string;
	let product: string;
	try {
		const body = await request.json();
		email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
		product = typeof body.product === "string" ? body.product.trim() : "";
	} catch {
		return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
	}

	if (!email || !product) {
		return NextResponse.json({ error: "Missing email or product" }, { status: 400 });
	}

	// Always respond with 200 — never reveal whether an email is in our system
	try {
		const mapping = await getEmailDownloadMapping(email, product);
		if (mapping) {
			await sendPresetPurchaseEmail({
				to: email,
				productName: mapping.productName,
				downloadUrl: mapping.downloadUrl,
				linkValidDays: mapping.linkValidDays,
				maxUses: mapping.maxUses,
			});
			console.log("[Resend] Email sent", { product, emailDomain: email.split("@")[1] });
		} else {
			// No mapping found — don't reveal this to the caller
			console.log("[Resend] No mapping found", { product, emailDomain: email.split("@")[1] });
		}
	} catch (err) {
		console.error("[Resend] Error:", err);
		// Still return 200
	}

	return NextResponse.json({ ok: true });
}
