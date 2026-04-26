"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { MotionPage } from "@/components/ui/MotionPage";

type Favorite = {
  id: string;
  caption_text: string;
  tags: string[];
  content_type: string | null;
  copy_count: number;
  created_at: string;
};

export function FavoritesClient() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [q, setQ] = useState("");
  const [contentType, setContentType] = useState("all");
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams({ q, contentType, sort });
    void fetch(`/api/favorites?${params.toString()}`)
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!active) return;
        if (ok) setFavorites(data.favorites || []);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [q, contentType, sort]);

  const load = async () => {
    const params = new URLSearchParams({ q, contentType, sort });
    const res = await fetch(`/api/favorites?${params.toString()}`);
    const data = await res.json();
    if (res.ok) setFavorites(data.favorites || []);
  };

  async function copyFavorite(item: Favorite) {
    await navigator.clipboard.writeText(item.caption_text);
    await fetch(`/api/favorites/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ incrementCopy: true, copyCount: item.copy_count }),
    });
    toast.success("Copied!");
    load();
  }

  async function deleteFavorite(id: string) {
    const res = await fetch(`/api/favorites/${id}`, { method: "DELETE" });
    if (!res.ok) return toast.error("Delete failed");
    toast.success("Deleted");
    load();
  }

  async function saveTags(id: string, tagsInput: string) {
    const tags = tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    const res = await fetch(`/api/favorites/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tags }),
    });
    if (!res.ok) return toast.error("Could not save tags");
    toast.success("Tags saved");
    load();
  }

  const hasItems = useMemo(() => favorites.length > 0, [favorites]);

  return (
    <MotionPage className="space-y-4">
      <div className="glass-card rounded-2xl p-4 sm:p-5">
        <h1 className="text-2xl font-bold [font-family:var(--font-space-grotesk)]">Favorites</h1>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <input className="glass-panel h-11 rounded-xl px-3" placeholder="Search text or tag" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="glass-panel h-11 rounded-xl px-3" value={contentType} onChange={(e) => setContentType(e.target.value)}>
            <option value="all">All types</option>
            <option value="reel">Reel</option>
            <option value="static">Static</option>
            <option value="announcement">Announcement</option>
            <option value="performance">Performance</option>
            <option value="personal">Personal</option>
          </select>
          <select className="glass-panel h-11 rounded-xl px-3" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="most">Most copied</option>
          </select>
        </div>
      </div>

      {!hasItems ? (
        <div className="glass-card rounded-2xl border-dashed p-10 text-center">
          <div className="mx-auto mb-4 max-w-sm overflow-hidden rounded-xl border border-card-border/70">
            <Image
              src="/assets/mockups/dashboard-empty-state.svg"
              alt="Empty favorites visual"
              width={1200}
              height={760}
              className="h-auto w-full"
            />
          </div>
          <p className="text-muted">No saved captions yet - generate your first masterpiece.</p>
          <a href="/generate" className="glass-panel mt-4 inline-flex min-h-11 items-center rounded-xl px-4">
            Go to Generate
          </a>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {favorites.map((fav) => (
            <article key={fav.id} className="glass-card rounded-2xl p-4">
              <p className="line-clamp-4 text-sm">{fav.caption_text}</p>
              <p className="mt-2 text-xs text-muted">
                {new Date(fav.created_at).toLocaleString()} - copied {fav.copy_count}x
              </p>
              <input
                className="glass-panel mt-3 h-11 w-full rounded-lg px-3 text-sm"
                defaultValue={fav.tags?.join(", ")}
                placeholder="tags, comma, separated"
                onBlur={(e) => saveTags(fav.id, e.target.value)}
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <button className="glass-panel min-h-11 rounded-lg px-3 text-sm" onClick={() => copyFavorite(fav)}>
                  Copy
                </button>
                <button className="glass-panel min-h-11 rounded-lg px-3 text-sm" onClick={() => deleteFavorite(fav.id)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </MotionPage>
  );
}
