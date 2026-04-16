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
