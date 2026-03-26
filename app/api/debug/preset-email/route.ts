import { NextResponse } from "next/server";

import { sendPresetPurchaseEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(request: Request) {
	const adminKey = process.env.ADMIN_DEBUG_KEY;
	if (!adminKey) {
		return NextResponse.json({ error: "ADMIN_DEBUG_KEY is not set" }, { status: 500 });
	}

	const provided = request.headers.get("x-admin-key");
	if (!provided || provided !== adminKey) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	let body: any;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
	}

	const to = body?.to;
	const downloadUrl = body?.downloadUrl;

	if (!to || typeof to !== "string") {
		return NextResponse.json({ error: "Missing 'to'" }, { status: 400 });
	}
	if (!downloadUrl || typeof downloadUrl !== "string") {
		return NextResponse.json({ error: "Missing 'downloadUrl'" }, { status: 400 });
	}

	await sendPresetPurchaseEmail({
		to,
		productName: "Stage Fix v6",
		downloadUrl,
		transactionId: body?.transactionId && typeof body.transactionId === "string" ? body.transactionId : "debug",
		linkValidDays: 31,
		maxUses: 2,
	});

	return NextResponse.json({ ok: true });
}
