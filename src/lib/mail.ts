import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";

type SendPasswordResetResult = {
  sent: boolean;
  logged: boolean;
};

const ACCOUNT_FILE = path.join(process.cwd(), ".ethereal-account.json");
const LAST_SEND_FILE = path.join(process.cwd(), "latest-ethereal.json");
const LAST_URL_FILE = path.join(process.cwd(), "latest-ethereal-url.txt");

function persistJson(filePath: string, value: unknown) {
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2), "utf8");
}

function loadCachedAccount(): nodemailer.TestAccount | null {
  try {
    if (!fs.existsSync(ACCOUNT_FILE)) return null;
    const parsed = JSON.parse(fs.readFileSync(ACCOUNT_FILE, "utf8"));
    if (parsed?.user && parsed?.pass) {
      return parsed as nodemailer.TestAccount;
    }
  } catch (error) {
    console.error("[password-reset] Failed to read cached Ethereal account:", error);
  }
  return null;
}

async function getEtherealAccount(): Promise<nodemailer.TestAccount> {
  const envUser = process.env.ETHEREAL_USER;
  const envPass = process.env.ETHEREAL_PASS;
  if (envUser && envPass) {
    return {
      user: envUser,
      pass: envPass,
      smtp: { host: "smtp.ethereal.email", port: 587, secure: false },
      imap: { host: "imap.ethereal.email", port: 993, secure: true },
      pop3: { host: "pop3.ethereal.email", port: 995, secure: true },
      web: "https://ethereal.email",
    };
  }

  const cached = loadCachedAccount();
  if (cached) return cached;

  const created = await nodemailer.createTestAccount();
  persistJson(ACCOUNT_FILE, created);
  return created;
}

function previewUrlFromInfo(info: nodemailer.SentMessageInfo): string | false {
  const response = info?.response ? String(info.response) : "";
  const match = response.match(/\bMSGID=([^\s\]]+)/);
  if (match?.[1]) {
    return `https://ethereal.email/message/${match[1]}`;
  }
  return nodemailer.getTestMessageUrl(info);
}

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
): Promise<SendPasswordResetResult> {
  const apiKey = process.env.RESEND_API_KEY;

  if (apiKey) {
    const from = process.env.EMAIL_FROM ?? "NeuroNexis <onboarding@resend.dev>";
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: "Reset your NeuroNexis password",
        html: `
          <p>You requested a password reset for your NeuroNexis account.</p>
          <p><a href="${resetUrl}">Reset your password</a></p>
          <p>This link expires in 1 hour. If you did not request this, you can ignore this email.</p>
        `,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("[password-reset] Email send failed:", body);
      return { sent: false, logged: false };
    }
    return { sent: true, logged: false };
  }

  const account = await getEtherealAccount();

  const transporter = nodemailer.createTransport({
    host: account.smtp?.host || "smtp.ethereal.email",
    port: account.smtp?.port || 587,
    secure: Boolean(account.smtp?.secure),
    auth: {
      user: account.user,
      pass: account.pass,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: '"NeuroNexis System" <noreply@neuronexis.local>',
      to,
      subject: "Reset your NeuroNexis password",
      html: `
        <p>You requested a password reset for your NeuroNexis account.</p>
        <p><a href="${resetUrl}">Reset your password</a></p>
        <p>This link expires in 1 hour. If you did not request this, you can ignore this email.</p>
      `,
    });

    const previewUrl = previewUrlFromInfo(info);
    console.info(`[password-reset] Ethereal preview URL: ${previewUrl}`);
    console.info(`[password-reset] Ethereal account: ${account.user}`);

    persistJson(LAST_SEND_FILE, {
      previewUrl: previewUrl || null,
      user: account.user,
      pass: account.pass,
      to,
      messageId: info.messageId,
      response: info.response,
      sentAt: new Date().toISOString(),
    });
    fs.writeFileSync(LAST_URL_FILE, previewUrl || "", "utf8");

    return { sent: true, logged: true };
  } catch (error) {
    console.error("[password-reset] Ethereal email send failed:", error);
    return { sent: false, logged: false };
  }
}
