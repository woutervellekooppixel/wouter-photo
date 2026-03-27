const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "info@woutervellekoop.nl";
const CONTACT_FORM_TO = process.env.CONTACT_FORM_TO || "hello@wouter.photo";

type SendEmailOptions = {
  from: string;
  to: string | string[];
  subject: string;
  htmlBody?: string;
  textBody?: string;
  replyTo?: string;
  tag?: string;
};

function getMessageStream(): string {
  return process.env.BREVO_TAG_PREFIX || "wouter-photo";
}

function getBrevoApiKey(): string {
  const token = process.env.BREVO_API_KEY;
  if (!token) {
    throw new Error("BREVO_API_KEY is not set");
  }

  return token;
}

function parseMailbox(value: string): { email: string; name?: string } {
  const match = value.match(/^(.*?)<([^>]+)>$/);
  if (!match) {
    return { email: value.trim() };
  }

  const name = match[1]?.trim().replace(/^"|"$/g, "");
  const email = match[2]?.trim();

  return name ? { email, name } : { email };
}

function sanitizeMailboxName(value: string): string {
  return value.replace(/[\r\n<>"']/g, "").trim();
}

function toRecipients(value: string | string[]): Array<{ email: string; name?: string }> {
  const items = Array.isArray(value) ? value : [value];
  return items.map(parseMailbox);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function sendEmail(options: SendEmailOptions): Promise<void> {
  const sender = parseMailbox(options.from);
  const tags = options.tag ? [`${getMessageStream()}:${options.tag}`] : undefined;
  const replyTo = options.replyTo ? parseMailbox(options.replyTo) : undefined;

  const response = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "api-key": getBrevoApiKey(),
    },
    body: JSON.stringify({
      sender,
      to: toRecipients(options.to),
      subject: options.subject,
      htmlContent: options.htmlBody,
      textContent: options.textBody,
      replyTo,
      tags,
    }),
  });

  const payload = (await response.json().catch(() => null)) as
    | { message?: string; code?: string }
    | null;

  if (!response.ok) {
		throw new Error(payload?.message || `Brevo send failed with status ${response.status}`);
  }
}

export async function sendDownloadNotification(
  slug: string,
  fileCount: number
): Promise<void> {
  try {
    const safeSlug = escapeHtml(slug);

    await sendEmail({
			from: process.env.EMAIL_FROM_DOWNLOAD_NOTIFICATIONS || "Download Notificaties <downloads@wouter.photo>",
			to: ADMIN_EMAIL,
			subject: `Download: ${slug}`,
			htmlBody: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Download Notificatie</h2>
          <p>Er is een download uitgevoerd:</p>
          <ul>
            <li><strong>Project:</strong> ${safeSlug}</li>
            <li><strong>Aantal bestanden:</strong> ${fileCount}</li>
            <li><strong>Tijd:</strong> ${new Date().toLocaleString("nl-NL")}</li>
          </ul>
          <p style="color: #666; font-size: 14px; margin-top: 20px;">
            Dit is een automatische notificatie van je download portal.
          </p>
        </div>
      `,
      textBody: `Download notificatie\n\nProject: ${slug}\nAantal bestanden: ${fileCount}\nTijd: ${new Date().toLocaleString("nl-NL")}`,
      tag: "download-notification",
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

  const safeProductName = escapeHtml(productName);
  const safeDownloadUrl = escapeHtml(downloadUrl);
  const safeTransactionId = transactionId ? escapeHtml(transactionId) : null;

  const textParts = [
    `Your download is ready`,
    ``,
    `Thanks for your purchase of ${productName}.`,
    ``,
    `Download link: ${downloadUrl}`,
    usageLine ? usageLine.replace(/<[^>]+>/g, "") : null,
    transactionId ? `Transaction: ${transactionId}` : null,
  ].filter(Boolean);

  await sendEmail({
    from: process.env.EMAIL_FROM_PRESETS || "Wouter Photo <hello@wouter.photo>",
    to,
    subject: `Your download: ${productName}`,
    htmlBody: `
      <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; max-width: 640px; margin: 0 auto; line-height: 1.6; color: #111;">
        <div style="padding: 24px; border: 1px solid #e5e5e5; border-radius: 14px;">
          <h2 style="margin: 0 0 10px; font-size: 20px;">Your download is ready</h2>
          <p style="margin: 0 0 14px; color: #333;">Thanks for your purchase of <strong>${safeProductName}</strong>.</p>

          <div style="margin: 18px 0 18px; padding: 14px; background: #f7f7f7; border-radius: 12px;">
            <p style="margin: 0 0 10px; font-size: 14px; color: #333;">Download:</p>
            <p style="margin: 0;">
              <a href="${safeDownloadUrl}" style="display: inline-block; padding: 12px 16px; background: #111; color: #fff; text-decoration: none; border-radius: 10px; font-weight: 600;">
                Download ${safeProductName}
              </a>
            </p>
            ${usageLine ? `<p style="margin: 10px 0 0; font-size: 13px; color: #555;">${usageLine}</p>` : ""}
          </div>

          <p style="margin: 0 0 8px; color: #666; font-size: 13px;">If the button doesn’t work, copy/paste this link:</p>
          <p style="margin: 0 0 16px; font-size: 13px; word-break: break-all;"><a href="${safeDownloadUrl}" style="color: #111;">${safeDownloadUrl}</a></p>

          <p style="margin: 0; color: #666; font-size: 13px;">
            Trouble with the download? Reply to this email and I’ll help.
          </p>

          ${safeTransactionId ? `<p style="margin: 14px 0 0; color: #999; font-size: 12px;">Transaction: ${safeTransactionId}</p>` : ""}
        </div>
      </div>
    `,
    textBody: textParts.join("\n"),
    tag: "preset-purchase",
	});
}

export async function sendContactFormEmail({
  name,
  email,
  message,
}: {
  name: string;
  email: string;
  message: string;
}): Promise<void> {
  const contactSender = parseMailbox(process.env.EMAIL_FROM_CONTACT || "Contact Form <hello@wouter.photo>");
  const senderName = sanitizeMailboxName(name);
  const baseSenderName = contactSender.name || "Contact Form";
  const fromName = senderName ? `${senderName} via ${baseSenderName}` : baseSenderName;
  const replyTo = senderName ? `${senderName} <${email}>` : email;
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message);

  await sendEmail({
    from: `${fromName} <${contactSender.email}>`,
    to: CONTACT_FORM_TO,
    subject: `New Contact Form Submission from ${name}`,
    replyTo,
    textBody: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    htmlBody: `
      <div style="font-family: sans-serif; max-width: 640px; margin: 0 auto; line-height: 1.6; color: #111;">
        <h2>New contact form submission</h2>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap;">${safeMessage}</p>
      </div>
    `,
    tag: "contact-form",
  });
}
