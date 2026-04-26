"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { MotionPage } from "@/components/ui/MotionPage";
import { GlassButton } from "@/components/ui/GlassButton";

type ProfilePayload = {
  artist_name: string;
  genre: string;
  email: string;
  credits_remaining: number;
  subscription_tier: "free" | "starter" | "pro";
  monthly_reset_at?: string | null;
  personality_settings?: {
    tone?: string;
    emojiLevel?: string;
    lengthPreference?: string;
    vibe?: string;
  };
};

export function SettingsClient() {
  const [profile, setProfile] = useState<ProfilePayload | null>(null);
  const [saving, setSaving] = useState(false);
  const [showDanger, setShowDanger] = useState(false);

  useEffect(() => {
    let active = true;
    void fetch("/api/profile")
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (active && ok) setProfile(data.profile);
      });
    return () => {
      active = false;
    };
  }, []);

  async function save() {
    if (!profile) return;
    setSaving(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        artist_name: profile.artist_name,
        genre: profile.genre,
        personality_settings: profile.personality_settings,
      }),
    });
    setSaving(false);
    if (!res.ok) return toast.error("Failed to save");
    toast.success("Settings saved");
  }

  async function goCheckout(plan: "starter" | "pro" | "credits") {
    const mode = plan === "credits" ? "payment" : "subscription";
    const res = await fetch("/api/stripe/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan, mode }),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error || "Checkout failed");
    window.location.href = data.url;
  }

  async function manageBilling() {
    const res = await fetch("/api/stripe/portal");
    const data = await res.json();
    if (!res.ok) return toast.error(data.error || "Portal unavailable");
    window.location.href = data.url;
  }

  async function deleteAccount() {
    const res = await fetch("/api/profile", { method: "DELETE" });
    if (!res.ok) return toast.error("Delete failed");
    toast.success("Account data deleted");
    window.location.href = "/login";
  }

  if (!profile) {
    return <div className="glass-card rounded-2xl p-8 text-center text-muted">Loading settings...</div>;
  }

  return (
    <MotionPage className="space-y-4">
      <section className="glass-card rounded-2xl p-5">
        <h1 className="text-2xl font-bold [font-family:var(--font-space-grotesk)]">Settings</h1>
      </section>

      <section className="glass-card rounded-2xl p-5">
        <h2 className="text-lg font-semibold">Profile</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <input className="glass-panel h-11 rounded-xl px-3" value={profile.artist_name} onChange={(e) => setProfile((p) => (p ? { ...p, artist_name: e.target.value } : p))} />
          <input className="glass-panel h-11 rounded-xl px-3" value={profile.genre} onChange={(e) => setProfile((p) => (p ? { ...p, genre: e.target.value } : p))} />
          <input className="glass-panel h-11 rounded-xl px-3 md:col-span-2" value={profile.email} disabled />
        </div>
      </section>

      <section className="glass-card rounded-2xl p-5">
        <h2 className="text-lg font-semibold">Personality Settings</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <input
            className="glass-panel h-11 rounded-xl px-3"
            placeholder="Tone"
            value={profile.personality_settings?.tone || ""}
            onChange={(e) =>
              setProfile((p) => (p ? { ...p, personality_settings: { ...p.personality_settings, tone: e.target.value } } : p))
            }
          />
          <input
            className="glass-panel h-11 rounded-xl px-3"
            placeholder="Emoji level"
            value={profile.personality_settings?.emojiLevel || ""}
            onChange={(e) =>
              setProfile((p) => (p ? { ...p, personality_settings: { ...p.personality_settings, emojiLevel: e.target.value } } : p))
            }
          />
          <input
            className="glass-panel h-11 rounded-xl px-3"
            placeholder="Caption length"
            value={profile.personality_settings?.lengthPreference || ""}
            onChange={(e) =>
              setProfile((p) =>
                p ? { ...p, personality_settings: { ...p.personality_settings, lengthPreference: e.target.value } } : p,
              )
            }
          />
          <input
            className="glass-panel h-11 rounded-xl px-3"
            placeholder="Preferred vibe"
            value={profile.personality_settings?.vibe || ""}
            onChange={(e) =>
              setProfile((p) => (p ? { ...p, personality_settings: { ...p.personality_settings, vibe: e.target.value } } : p))
            }
          />
        </div>
        <GlassButton onClick={save} disabled={saving} className="mt-4 px-4">
          {saving ? "Saving..." : "Save Settings"}
        </GlassButton>
      </section>

      <section className="glass-card rounded-2xl p-5">
        <h2 className="text-lg font-semibold">Billing</h2>
        <p className="mt-1 text-sm text-muted">
          Plan: {profile.subscription_tier.toUpperCase()} - Credits: {profile.credits_remaining}
        </p>
        {profile.monthly_reset_at ? <p className="text-sm text-muted">Monthly reset: {new Date(profile.monthly_reset_at).toLocaleDateString()}</p> : null}
        <div className="mt-3 flex flex-wrap gap-2">
          <button className="glass-panel min-h-11 rounded-xl px-4" onClick={() => goCheckout("starter")}>
            Upgrade Starter
          </button>
          <button className="glass-panel min-h-11 rounded-xl px-4" onClick={() => goCheckout("pro")}>
            Upgrade Pro
          </button>
          <button className="glass-panel min-h-11 rounded-xl px-4" onClick={() => goCheckout("credits")}>
            Buy 20 Credits
          </button>
          <button className="glass-panel min-h-11 rounded-xl px-4" onClick={manageBilling}>
            Manage Billing
          </button>
        </div>
      </section>

      <section className="glass-card rounded-2xl border border-rose-400/40 bg-rose-950/20 p-5">
        <h2 className="text-lg font-semibold text-rose-200">Danger Zone</h2>
        <p className="mt-1 text-sm text-rose-200/80">Deleting your account removes app profile data permanently.</p>
        {!showDanger ? (
          <button className="glass-panel mt-3 min-h-11 rounded-xl border border-rose-400/50 px-4 text-rose-200" onClick={() => setShowDanger(true)}>
            Delete account
          </button>
        ) : (
          <div className="mt-3 flex gap-2">
            <button className="glass-panel min-h-11 rounded-xl border border-rose-400/50 px-4 text-rose-200" onClick={deleteAccount}>
              Confirm delete
            </button>
            <button className="glass-panel min-h-11 rounded-xl px-4" onClick={() => setShowDanger(false)}>
              Cancel
            </button>
          </div>
        )}
      </section>
    </MotionPage>
  );
}
