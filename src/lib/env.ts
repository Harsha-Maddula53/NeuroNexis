const required = ["DATABASE_URL", "NEXTAUTH_SECRET"];

const optional = ["GROQ_API_KEY", "NEXTAUTH_URL", "NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"];

const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.warn(`⚠ Missing required environment variables: ${missing.join(", ")}`);
}

const missingOptional = optional.filter((key) => !process.env[key]);
if (missingOptional.length > 0) {
  console.info(`ℹ Optional environment variables not set: ${missingOptional.join(", ")}`);
}
