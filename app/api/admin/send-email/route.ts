import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/auth";
import { getMetadata, getSignedDownloadUrl } from "@/lib/r2";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  const authError = await requireAdminAuth();
  if (authError) return authError;

  try {
    const { slug, recipientEmail, customMessage } = await request.json();

    if (!slug || !recipientEmail) {
      return NextResponse.json(
        { error: "Slug en email zijn verplicht" },
        { status: 400 }
      );
    }

    // Get metadata
    const metadata = await getMetadata(slug);
    if (!metadata) {
      return NextResponse.json(
        { error: "Upload niet gevonden" },
        { status: 404 }
      );
    }

    // Get preview image URL
    let previewImageUrl = "";
    const previewFile = metadata.previewImageKey
      ? metadata.files.find(f => f.key === metadata.previewImageKey)
      : metadata.files.find(f => f.type.startsWith("image/"));

    if (previewFile) {
      previewImageUrl = await getSignedDownloadUrl(previewFile.key);
    }

    // Calculate total size
    const totalSize = metadata.files.reduce((acc, f) => acc + f.size, 0);
    const formatBytes = (bytes: number) => {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
    };


    // Build download URL
    const downloadUrl = `https://wouter.photo/${slug}`;

    // Get title for subject and email
    const transferTitle = metadata.title || slug;
    const emailSubject = metadata.title 
      ? `${metadata.title} - Je foto's staan klaar! 📷`
      : "Je foto's staan klaar! 📷";

    // Format custom message - convert newlines to <br> tags
    const formattedCustomMessage = customMessage 
      ? customMessage.replace(/\n/g, '<br>')
      : '';

    // Send email
    const { data, error } = await resend.emails.send({
      from: "Wouter Vellekoop <downloads@wouter.photo>",
      replyTo: "info@woutervellekoop.nl",
      to: recipientEmail,
      subject: emailSubject,
      headers: {
        "X-Entity-Ref-ID": slug,
        "List-Unsubscribe": `<mailto:info@woutervellekoop.nl?subject=Unsubscribe>`,
      },
      html: `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${transferTitle}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse;">
          
          ${previewImageUrl ? `
          <!-- Preview Image (clickable) -->
          <tr>
            <td style="padding: 0 0 24px 0;">
              <a href="${downloadUrl}" style="display: block;">
                <img src="${previewImageUrl}" alt="Preview" style="width: 100%; height: auto; display: block; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);" />
              </a>
            </td>
          </tr>
          ` : ""}
          
          <!-- Content Card -->
          <tr>
            <td style="background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);">
              
              <!-- Custom Message (altijd verplicht) -->
              <div style="margin-bottom: 32px; background-color: #ffffff;">
                <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #374151;">${formattedCustomMessage}</p>
              </div>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; margin-bottom: 32px;">
                <tr>
                  <td align="left">
                    <a href="${downloadUrl}" style="display: inline-block; padding: 16px 48px; background: #000000; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600;">
                      DOWNLOAD
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Signature -->
              <div style="margin-bottom: 32px; background-color: #ffffff;">
                <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #374151;">
                  Vragen of opmerkingen? Stuur me gerust een berichtje!<br><br>
                  Groetjes,<br>
                  <strong>Wouter Vellekoop</strong>
                </p>
              </div>

              <!-- Social Icons -->
              <table role="presentation" style="width: 100%; margin-bottom: 20px;">
                <tr>
                  <td align="center">
                    <a href="https://instagram.com/woutervellekoop" style="display: inline-block; margin: 0 8px;" target="_blank" rel="noopener">
                      <span style="display: inline-block; width: 28px; height: 28px; vertical-align: middle;">
                        <svg width="28" height="28" viewBox="0 0 448 448" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="448" height="448" rx="90" fill="#fff"/>
                          <radialGradient id="ig-gradient" cx="0.5" cy="0.5" r="0.8">
                            <stop offset="0%" stop-color="#f9ce34"/>
                            <stop offset="45%" stop-color="#ee2a7b"/>
                            <stop offset="100%" stop-color="#6228d7"/>
                          </radialGradient>
                          <rect x="24" y="24" width="400" height="400" rx="80" fill="url(#ig-gradient)"/>
                          <circle cx="224" cy="224" r="90" stroke="#fff" stroke-width="32" fill="none"/>
                          <circle cx="224" cy="224" r="56" fill="#fff"/>
                          <circle cx="320" cy="128" r="20" fill="#fff"/>
                        </svg>
                      </span>
                    </a>
                    <a href="https://linkedin.com/in/woutervellekoop" style="display: inline-block; margin: 0 8px;" target="_blank" rel="noopener">
                      <span style="display: inline-block; width: 28px; height: 28px; vertical-align: middle;">
                        <svg width="28" height="28" viewBox="0 0 448 448" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="448" height="448" rx="90" fill="#fff"/>
                          <rect x="24" y="24" width="400" height="400" rx="80" fill="#0077b5"/>
                          <rect x="100" y="180" width="48" height="120" rx="12" fill="#fff"/>
                          <circle cx="124" cy="140" r="24" fill="#fff"/>
                          <rect x="180" y="180" width="48" height="120" rx="12" fill="#fff"/>
                          <rect x="236" y="220" width="48" height="80" rx="12" fill="#fff"/>
                          <rect x="292" y="180" width="48" height="120" rx="12" fill="#fff"/>
                        </svg>
                      </span>
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Logo -->
              <table role="presentation" style="width: 100%;">
                <tr>
                  <td align="center">
                    <!-- Logo met zwarte tekst voor light mode, witte tekst voor dark mode (meest robuust: zwart met lichte schaduw) -->
                    <div style="color: #000000; font-size: 14px; letter-spacing: 2px; text-shadow: 0 1px 4px #fff, 0 1px 4px #000;">
                      <span style="font-weight: 700;">WOUTER</span><span style="font-weight: 400;">.</span><span style="font-weight: 300;">PHOTO</span>
                    </div>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Email verzenden mislukt", details: error },
        { status: 500 }
      );
    }

    console.log("Email sent successfully:", data?.id);
    return NextResponse.json({
      success: true,
      messageId: data?.id,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Email verzenden mislukt", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
