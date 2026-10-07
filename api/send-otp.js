import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (_e) {}
  }

  const { email, otpCode } = body || {};

  if (!email || !otpCode) {
    return res.status(400).json({ error: 'Email and OTP code are required.' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 5000,
      auth: {
        user: 'severadefenderai@gmail.com',
        pass: 'wcvc owsf yhgd xbdm'
      }
    });

    await transporter.sendMail({
      from: '"SEVERA DEFENDER AI" <severadefenderai@gmail.com>',
      to: email,
      subject: `SEVERA DEFENDER AI - 6-Digit Code: ${otpCode}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background-color: #0b1120; color: #ffffff; border-radius: 16px; border: 1px solid #1e293b;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #00dc82; font-size: 24px; font-weight: 900; margin: 0; tracking-tight: -0.05em;">Severa AI</h1>
            <p style="color: #94a3b8; font-size: 12px; margin-top: 4px;">Autonomous Code Security Platform</p>
          </div>
          <div style="background-color: #121826; padding: 24px; border-radius: 12px; border: 1px solid #334155; text-align: center;">
            <p style="color: #cbd5e1; font-size: 13px; margin-bottom: 14px; font-weight: 600;">Your official 6-digit verification code is:</p>
            <div style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #00dc82; font-family: monospace; margin: 16px 0; padding: 14px; background-color: #050810; border-radius: 10px; border: 1px solid #00dc82;">
              ${otpCode}
            </div>
            <p style="color: #94a3b8; font-size: 12px; margin-top: 14px; leading-relaxed: 1.5;">Please enter this 6-digit code on the website to verify your account or reset your password.</p>
          </div>
          <div style="text-align: center; margin-top: 24px; font-size: 11px; color: #64748b;">
            Sent automatically from SEVERA DEFENDER AI (<a href="mailto:severadefenderai@gmail.com" style="color: #00dc82; text-decoration: none;">severadefenderai@gmail.com</a>).
          </div>
        </div>
      `
    });

    return res.status(200).json({ success: true, message: 'OTP sent via Gmail SMTP' });
  } catch (error) {
    console.error('Nodemailer Error:', error);
    return res.status(500).json({ error: error.message || 'SMTP failed' });
  }
}
