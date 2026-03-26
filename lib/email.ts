import { Resend } from "resend";

let resend: Resend | null = null;

function getResend(): Resend {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not set");
    }
    resend = new Resend(apiKey);
  }
  return resend;
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "info@woutervellekoop.nl";

export async function sendDownloadNotification(
  slug: string,
  fileCount: number
): Promise<void> {
  try {
    await getResend().emails.send({
      from: "Download Notificaties <downloads@wouter.photo>",
      to: ADMIN_EMAIL,
      subject: `Download: ${slug}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Download Notificatie</h2>
          <p>Er is een download uitgevoerd:</p>
          <ul>
            <li><strong>Project:</strong> ${slug}</li>
            <li><strong>Aantal bestanden:</strong> ${fileCount}</li>
            <li><strong>Tijd:</strong> ${new Date().toLocaleString("nl-NL")}</li>
          </ul>
          <p style="color: #666; font-size: 14px; margin-top: 20px;">
            Dit is een automatische notificatie van je download portal.
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send email notification:", error);
    // Don't throw - email failure shouldn't break the download
  }
}

export async function sendPresetPurchaseEmail({
	to,
	productName,
	downloadUrl,
	transactionId,
	linkValidDays,
	maxUses,
}: {
	to: string;
	productName: string;
	downloadUrl: string;
	transactionId?: string;
	linkValidDays?: number;
	maxUses?: number;
}): Promise<void> {
	const validDaysText =
		typeof linkValidDays === "number" && Number.isFinite(linkValidDays) && linkValidDays > 0
			? `${Math.floor(linkValidDays)} days`
			: null;

	const maxUsesText =
		typeof maxUses === "number" && Number.isFinite(maxUses) && maxUses > 0 ? `${Math.floor(maxUses)} times` : null;

	const usageLine = validDaysText && maxUsesText
		? `This link works for <strong>${validDaysText}</strong> and can be used up to <strong>${maxUsesText}</strong>.`
		: validDaysText
			? `This link works for <strong>${validDaysText}</strong>.`
			: maxUsesText
				? `This link can be used up to <strong>${maxUsesText}</strong>.`
				: null;

	await getResend().emails.send({
		from: "Wouter Photo <hello@wouter.photo>",
		to,
		subject: `Your download: ${productName}`,
		html: `
      <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; max-width: 640px; margin: 0 auto; line-height: 1.6; color: #111;">
        <div style="padding: 24px; border: 1px solid #e5e5e5; border-radius: 14px;">
          <h2 style="margin: 0 0 10px; font-size: 20px;">Your download is ready</h2>
          <p style="margin: 0 0 14px; color: #333;">Thanks for your purchase of <strong>${productName}</strong>.</p>

          <div style="margin: 18px 0 18px; padding: 14px; background: #f7f7f7; border-radius: 12px;">
            <p style="margin: 0 0 10px; font-size: 14px; color: #333;">Download:</p>
            <p style="margin: 0;">
              <a href="${downloadUrl}" style="display: inline-block; padding: 12px 16px; background: #111; color: #fff; text-decoration: none; border-radius: 10px; font-weight: 600;">
                Download ${productName}
              </a>
            </p>
            ${usageLine ? `<p style="margin: 10px 0 0; font-size: 13px; color: #555;">${usageLine}</p>` : ""}
          </div>

          <p style="margin: 0 0 8px; color: #666; font-size: 13px;">If the button doesn’t work, copy/paste this link:</p>
          <p style="margin: 0 0 16px; font-size: 13px; word-break: break-all;"><a href="${downloadUrl}" style="color: #111;">${downloadUrl}</a></p>

          <p style="margin: 0; color: #666; font-size: 13px;">
            Trouble with the download? Reply to this email and I’ll help.
          </p>

          ${transactionId ? `<p style="margin: 14px 0 0; color: #999; font-size: 12px;">Transaction: ${transactionId}</p>` : ""}
        </div>
      </div>
    `,
	});
}
