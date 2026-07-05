type SendPasswordResetResult = {
  sent: boolean;
  logged: boolean;
};

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
): Promise<SendPasswordResetResult> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    if (process.env.NODE_ENV === "development") {
      console.info(`[password-reset] Reset link for ${to}:\n${resetUrl}`);
    }
    return { sent: false, logged: true };
  }

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
