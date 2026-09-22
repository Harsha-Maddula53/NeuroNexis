import fs from "fs";
import path from "path";
import { sendPasswordResetEmail } from "../src/lib/mail";

function loadEnvFile(file: string) {
  if (!fs.existsSync(file)) return;
  for (const raw of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFile(path.join(process.cwd(), ".env"));
delete process.env.RESEND_API_KEY;

async function main() {
  const resetUrl =
    "http://localhost:3000/reset-password?token=verify-ethereal-artifact";
  const mailResult = await sendPasswordResetEmail(
    "smoke-1788853710389@test.com",
    resetUrl,
  );
  const lastSend = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "latest-ethereal.json"), "utf8"),
  );
  const account = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), ".ethereal-account.json"), "utf8"),
  );
  const out = {
    mailResult,
    previewUrl: lastSend.previewUrl,
    user: lastSend.user,
    accountUser: account.user,
    sameAccount: lastSend.user === account.user,
    messageId: lastSend.messageId,
    response: lastSend.response,
    sentAt: lastSend.sentAt,
  };
  fs.mkdirSync(path.join(process.cwd(), "artifacts"), { recursive: true });
  fs.writeFileSync(
    path.join(process.cwd(), "artifacts", "bug2-last-send.json"),
    JSON.stringify(out, null, 2),
  );
  console.log(JSON.stringify(out, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
