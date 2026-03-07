import nodemailer from 'nodemailer';

interface SendVerificationEmailInput {
  email: string;
  code: string;
}

function getFromAddress() {
  return process.env.EMAIL_FROM_ADDRESS || 'no-reply@hemma.local';
}

function getMailpitSendUrl() {
  if (!process.env.MAILPIT_URL) {
    return null;
  }

  return new URL('/api/v1/send', process.env.MAILPIT_URL).toString();
}

function buildEmailContent(code: string) {
  return {
    subject: 'Your hemma verification code',
    text: `Your hemma verification code is ${code}. It expires in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
        <p style="margin: 0 0 12px;">Use this code to verify your email before we create your hemma account:</p>
        <p style="font-size: 32px; font-weight: 700; letter-spacing: 6px; margin: 0 0 12px;">${code}</p>
        <p style="margin: 0; color: #6b7280;">This code expires in 10 minutes.</p>
      </div>
    `,
  };
}

async function sendWithMailpit(email: string, code: string) {
  const sendUrl = getMailpitSendUrl();
  if (!sendUrl) {
    return false;
  }

  const content = buildEmailContent(code);
  const response = await fetch(sendUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      From: {
        Email: getFromAddress(),
        Name: 'hemma',
      },
      To: [{ Email: email }],
      Subject: content.subject,
      Text: content.text,
      HTML: content.html,
      Tags: ['email-verification'],
    }),
  });

  if (!response.ok) {
    throw new Error(`Mailpit send failed with status ${response.status}`);
  }

  return true;
}

async function sendWithSmtp(email: string, code: string) {
  if (!process.env.EMAIL_SMTP_URL && !process.env.EMAIL_SMTP_HOST) {
    return false;
  }

  const transport = process.env.EMAIL_SMTP_URL
    ? nodemailer.createTransport(process.env.EMAIL_SMTP_URL)
    : nodemailer.createTransport({
        host: process.env.EMAIL_SMTP_HOST,
        port: Number(process.env.EMAIL_SMTP_PORT || '587'),
        secure: String(process.env.EMAIL_SMTP_SECURE || '').toLowerCase() === 'true',
        auth: process.env.EMAIL_SMTP_USER
          ? {
              user: process.env.EMAIL_SMTP_USER,
              pass: process.env.EMAIL_SMTP_PASS,
            }
          : undefined,
      });

  const content = buildEmailContent(code);
  await transport.sendMail({
    from: getFromAddress(),
    to: email,
    subject: content.subject,
    text: content.text,
    html: content.html,
  });

  return true;
}

export async function sendVerificationEmail({ email, code }: SendVerificationEmailInput) {
  if (await sendWithMailpit(email, code)) {
    return;
  }

  if (await sendWithSmtp(email, code)) {
    return;
  }

  throw new Error('No email transport is configured for signup verification.');
}
