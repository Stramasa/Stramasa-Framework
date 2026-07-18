import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });

  const { name = '', email = '', org = '', phone = '', message = '' } = req.body ?? {};

  if (!name.trim() || !email.trim() || !message.trim()) {
    return res.status(422).json({ error: 'Name, email, and message are required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return res.status(422).json({ error: 'Please provide a valid email address.' });
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: { rejectUnauthorized: false },
  });

  const subject = `New Strategy Request — ${name.trim()}${org.trim() ? ` (${org.trim()})` : ''}`;

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:linear-gradient(135deg,#1a3ccc 0%,#1565c8 35%,#0a7ea4 70%,#0d9488 100%);padding:32px 36px;">
        <p style="color:rgba(255,255,255,0.85);font-size:14px;margin:0 0 8px;">New contact form submission</p>
        <h1 style="color:#fff;font-size:22px;margin:0;font-weight:700;">Strategy Request — Stramasa</h1>
      </div>
      <div style="padding:32px 36px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:10px 0;font-size:13px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;width:120px;">Name</td>
            <td style="padding:10px 0;font-size:15px;color:#1a1a2e;">${name.trim()}</td>
          </tr>
          <tr style="border-top:1px solid #f3f4f6;">
            <td style="padding:10px 0;font-size:13px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;">Email</td>
            <td style="padding:10px 0;font-size:15px;"><a href="mailto:${email.trim()}" style="color:#2563eb;">${email.trim()}</a></td>
          </tr>
          ${phone.trim() ? `<tr style="border-top:1px solid #f3f4f6;"><td style="padding:10px 0;font-size:13px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;">Phone</td><td style="padding:10px 0;font-size:15px;color:#1a1a2e;">${phone.trim()}</td></tr>` : ''}
          ${org.trim() ? `<tr style="border-top:1px solid #f3f4f6;"><td style="padding:10px 0;font-size:13px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;">Organization</td><td style="padding:10px 0;font-size:15px;color:#1a1a2e;">${org.trim()}</td></tr>` : ''}
          <tr style="border-top:1px solid #f3f4f6;">
            <td style="padding:10px 0;font-size:13px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;vertical-align:top;">Message</td>
            <td style="padding:10px 0;font-size:15px;color:#1a1a2e;line-height:1.65;white-space:pre-wrap;">${message.trim()}</td>
          </tr>
        </table>
      </div>
      <div style="padding:20px 36px;background:#f9fafb;border-top:1px solid #e5e7eb;">
        <p style="margin:0;font-size:12px;color:#9ca3af;">Sent from spiritual.stramasa.com contact form</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Stramasa Contact Form" <${process.env.SMTP_USER}>`,
      to: ['requests@stramasa.com', 'stramasapro@gmail.com'],
      replyTo: email.trim(),
      subject,
      html,
    });
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('SMTP error:', err);
    return res.status(500).json({ error: 'Failed to send message. Please email us directly at info@stramasa.com' });
  }
}
