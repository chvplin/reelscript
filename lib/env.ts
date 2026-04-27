const requiredVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

function cleanEnv(value: string | undefined) {
  return value?.trim().replace(/^['"]|['"]$/g, "");
}

export function getPublicEnv() {
  const env = {
    NEXT_PUBLIC_SUPABASE_URL: cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  };

  for (const key of requiredVars) {
    if (!env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }

  return env as Record<(typeof requiredVars)[number], string>;
}

export function getServerEnv() {
  return {
    ANTHROPIC_API_KEY: cleanEnv(process.env.ANTHROPIC_API_KEY ?? process.env.CLAUDE_API_KEY ?? process.env.ANTHROPIC_KEY),
    STRIPE_SECRET_KEY: cleanEnv(process.env.STRIPE_SECRET_KEY),
    STRIPE_WEBHOOK_SECRET: cleanEnv(process.env.STRIPE_WEBHOOK_SECRET),
    STRIPE_PRICE_STARTER: cleanEnv(process.env.STRIPE_PRICE_STARTER),
    STRIPE_PRICE_PRO: cleanEnv(process.env.STRIPE_PRICE_PRO),
    STRIPE_PRICE_CREDITS: cleanEnv(process.env.STRIPE_PRICE_CREDITS),
    NEXT_PUBLIC_APP_URL: cleanEnv(process.env.NEXT_PUBLIC_APP_URL) || "http://localhost:3000",
    RESEND_API_KEY: cleanEnv(process.env.RESEND_API_KEY),
    UPSTASH_REDIS_REST_URL: cleanEnv(process.env.UPSTASH_REDIS_REST_URL),
    UPSTASH_REDIS_REST_TOKEN: cleanEnv(process.env.UPSTASH_REDIS_REST_TOKEN),
    ADMIN_EMAILS: cleanEnv(process.env.ADMIN_EMAILS) || "",
  };
}
