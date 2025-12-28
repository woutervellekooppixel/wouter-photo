import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Dynamically import Resend to avoid issues in edge runtimes
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    const mail = await resend.emails.send({
      from: 'Contact Form <no-reply@wouter.photo>',
      to: ['hello@wouter.photo'],
      subject: `New Contact Form Submission from ${name}`,
      replyTo: email,
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    });

    if (mail.error) {
      return NextResponse.json({ error: mail.error.message || 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
