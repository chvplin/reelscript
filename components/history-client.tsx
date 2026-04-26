"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MotionPage } from "@/components/ui/MotionPage";

type Generation = {
  id: string;
  content_type: string;
  visual_description: string;
  results: { captions?: { text: string }[] };
  inputs?: Record<string, unknown>;
  credits_used: number;
  created_at: string;
};

type Props = {
  tier: "free" | "starter" | "pro";
};

export function HistoryClient({ tier }: Props) {
  const router = useRouter();
  const [items, setItems] = useState<Generation[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [contentType, setContentType] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams({ q, contentType });
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    void fetch(`/api/generations?${params.toString()}`)
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (active && ok) setItems(data.generations || []);
      });
    return () => {
      active = false;
    };
  }, [q, contentType, from, to]);

  async function load() {
    const params = new URLSearchParams({ q, contentType });
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    const res = await fetch(`/api/generations?${params.toString()}`);
    const data = await res.json();
    if (res.ok) setItems(data.generations || []);
  }

  async function remove(id: string) {
    const res = await fetch(`/api/generations/${id}`, { method: "DELETE" });
    if (!res.ok) return toast.error("Delete failed");
    toast.success("Deleted");
    load();
  }

  async function runAgain(item: Generation) {
    if (!item.inputs) return toast.error("Original inputs unavailable");
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item.inputs),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error || "Run again failed");
    toast.success("Generated again");
    router.push("/generate");
  }

  const retention = useMemo(() => {
    if (tier === "free") return "Free plan: history visible for 7 days.";
    if (tier === "starter") return "Starter plan: history visible for 90 days.";
    return "Pro plan: unlimited history.";
  }, [tier]);

  return (
    <MotionPage className="space-y-4">
      <div className="glass-card rounded-2xl p-5">
        <h1 className="text-2xl font-bold [font-family:var(--font-space-grotesk)]">History</h1>
        <p className="mt-1 text-sm text-muted">{retention}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <input className="glass-panel h-11 rounded-xl px-3" placeholder="Search descriptions" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="glass-panel h-11 rounded-xl px-3" value={contentType} onChange={(e) => setContentType(e.target.value)}>
            <option value="all">All types</option>
            <option value="reel">Reel</option>
            <option value="static">Static</option>
            <option value="announcement">Announcement</option>
            <option value="performance">Performance</option>
            <option value="personal">Personal</option>
          </select>
          <input className="glass-panel h-11 rounded-xl px-3" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <input className="glass-panel h-11 rounded-xl px-3" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <article key={item.id} className="glass-card rounded-2xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold capitalize">{item.content_type}</p>
                <p className="text-sm text-muted">{new Date(item.created_at).toLocaleString()}</p>
              </div>
              <span className="text-sm text-muted">Credits used: {item.credits_used}</span>
            </div>
            <p className="mt-2 text-sm text-slate-300">{item.visual_description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button className="glass-panel min-h-11 rounded-lg px-3 text-sm" onClick={() => setExpanded(expanded === item.id ? null : item.id)}>
                {expanded === item.id ? "Hide Results" : "View Results"}
              </button>
              <button className="glass-panel min-h-11 rounded-lg px-3 text-sm" onClick={() => runAgain(item)}>
                Run Again
              </button>
              <button className="glass-panel min-h-11 rounded-lg px-3 text-sm" onClick={() => remove(item.id)}>
                Delete
              </button>
            </div>
            {expanded === item.id && (
              <div className="glass-panel mt-4 space-y-2 rounded-xl p-3 text-sm">
                {(item.results?.captions || []).slice(0, 4).map((cap, idx) => (
                  <p key={`${item.id}-${idx}`}>{cap.text}</p>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </MotionPage>
  );
}
