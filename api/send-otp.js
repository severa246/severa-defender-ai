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

  const { email, otpCode, purpose = 'verification' } = body || {};

  if (!email || !otpCode) {
    return res.status(400).json({ error: 'Email and OTP code are required.' });
  }

  let subjectText = `SEVERA DEFENDER AI - Verification Code: ${otpCode}`;
  let purposeBadge = `🔐 Purpose: Verification Code`;
  let purposeDesc = `Please enter this 6-digit code on the website.`;

  if (purpose === 'reset_password' || purpose === 'forgot_password') {
    subjectText = `SEVERA DEFENDER AI - Password Reset Code: ${otpCode}`;
    purposeBadge = `🔑 Purpose: Password Reset Verification`;
    purposeDesc = `Please enter this 6-digit code on the website to reset your password.`;
  } else if (purpose === 'signup') {
    subjectText = `SEVERA DEFENDER AI - Account Creation Code: ${otpCode}`;
    purposeBadge = `✨ Purpose: New Account Registration`;
    purposeDesc = `Please enter this 6-digit code on the website to complete creating your account.`;
  } else if (purpose === 'login') {
    subjectText = `SEVERA DEFENDER AI - Sign In Security Code: ${otpCode}`;
    purposeBadge = `🛡️ Purpose: Sign In Verification`;
    purposeDesc = `Please enter this 6-digit code on the website to complete your sign in.`;
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
      subject: subjectText,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background-color: #0b1120; color: #ffffff; border-radius: 16px; border: 1px solid #1e293b;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #00dc82; font-size: 24px; font-weight: 900; margin: 0;">Severa AI</h1>
            <p style="color: #94a3b8; font-size: 12px; margin-top: 4px;">Autonomous Code Security Platform</p>
          </div>

          <div style="background-color: #121826; padding: 24px; border-radius: 12px; border: 1px solid #334155; text-align: center;">
            <div style="display: inline-block; padding: 4px 12px; background-color: rgba(0, 220, 130, 0.12); border: 1px solid rgba(0, 220, 130, 0.3); color: #00dc82; font-size: 12px; font-weight: 700; border-radius: 20px; margin-bottom: 16px;">
              ${purposeBadge}
            </div>

            <p style="color: #cbd5e1; font-size: 13px; margin-bottom: 14px; font-weight: 600;">Your 6-digit verification code is:</p>

            <!-- Continuous selectable code block -->
            <div style="margin: 16px 0; padding: 18px; background-color: #050810; border-radius: 10px; border: 2px solid #00dc82; text-align: center;">
              <span style="font-size: 40px; font-weight: 900; color: #00dc82; font-family: monospace, Courier, sans-serif; letter-spacing: 4px;">${otpCode}</span>
            </div>

            <p style="color: #94a3b8; font-size: 12px; margin-top: 14px; leading-relaxed: 1.5;">${purposeDesc}</p>

            <!-- Real working button to open website -->
            <div style="margin-top: 20px;">
              <a href="https://severa-defender-ai.vercel.app/" target="_blank" style="display: inline-block; padding: 12px 24px; background-color: #00dc82; color: #000000; font-weight: 900; font-size: 13px; border-radius: 10px; text-decoration: none; font-family: sans-serif;">
                Open Severa AI to Enter Code →
              </a>
            </div>
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
