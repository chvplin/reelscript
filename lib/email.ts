import { Resend } from "resend";
import { getServerEnv } from "@/lib/env";

function getResendClient() {
  const { RESEND_API_KEY } = getServerEnv();
  if (!RESEND_API_KEY) return null;
  return new Resend(RESEND_API_KEY);
}

export async function sendWelcomeEmail(to: string, artistName: string) {
  const resend = getResendClient();
  if (!resend) return;
  await resend.emails.send({
    from: "ReelScript AI <noreply@reelscript.ai>",
    to,
    subject: "Welcome to ReelScript AI",
    html: `<p>Welcome ${artistName}. Start your first generation now.</p>`,
  });
}

export async function sendLowCreditsEmail(to: string, credits: number) {
  const resend = getResendClient();
  if (!resend) return;
  await resend.emails.send({
    from: "ReelScript AI <noreply@reelscript.ai>",
    to,
    subject: "Running low on caption credits",
    html: `<p>You have ${credits} credits left. Upgrade or buy more credits.</p>`,
  });
}

export async function sendSubscriptionConfirmationEmail(to: string, plan: "starter" | "pro") {
  const resend = getResendClient();
  if (!resend) return;
  await resend.emails.send({
    from: "ReelScript AI <noreply@reelscript.ai>",
    to,
    subject: `You're now on ReelScript ${plan}`,
    html: `<p>Your ${plan} subscription is active. Benefits are now unlocked.</p>`,
  });
}

export async function sendPaymentFailedEmail(to: string) {
  const resend = getResendClient();
  if (!resend) return;
  await resend.emails.send({
    from: "ReelScript AI <noreply@reelscript.ai>",
    to,
    subject: "Payment issue with your subscription",
    html: "<p>We could not process your latest payment. Please update billing details.</p>",
  });
}
