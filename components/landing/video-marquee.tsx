"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type DemoVideo = {
  src: string;
  fallback: string;
  text: string;
};

const demoVideos: DemoVideo[] = [
  { src: "/assets/demo-videos/demo-1.mp4", fallback: "/assets/demo-thumbnails/demo-1.svg", text: "back" },
  { src: "/assets/demo-videos/demo-2.mp4", fallback: "/assets/demo-thumbnails/demo-2.svg", text: "two three\nfour\npenny\nyou" },
  { src: "/assets/demo-videos/demo-3.mp4", fallback: "/assets/demo-thumbnails/demo-3.svg", text: "place we\nfound" },
  { src: "/assets/demo-videos/demo-4.mp4", fallback: "/assets/demo-thumbnails/demo-4.svg", text: "right now" },
  { src: "/assets/demo-videos/demo-5.mp4", fallback: "/assets/demo-thumbnails/demo-5.svg", text: "you\nchildren" },
];

// Place your own commercial-safe videos in /public/assets/demo-videos and keep matching fallback thumbnails.
export function VideoMarquee() {
  const items = useMemo(() => [...demoVideos, ...demoVideos], []);

  return (
    <div className="marquee-mask mt-10 overflow-hidden rounded-2xl border border-card-border/70 bg-slate-950/40 p-4">
      <div className="marquee-track flex w-max gap-4 hover:[animation-play-state:paused]">
        {items.map((item, index) => (
          <article
            key={`${item.fallback}-${index}`}
            className="group relative aspect-[9/16] w-[170px] overflow-hidden rounded-xl border border-card-border/80 bg-slate-900 transition hover:shadow-[0_0_0_1px_rgba(168,85,247,0.4),0_12px_40px_rgba(236,72,153,0.35)] sm:w-[200px]"
          >
            <VideoCard item={item} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10 opacity-90" />
            <p className="capcut-text absolute inset-0 flex items-center justify-center px-4 text-center whitespace-pre-line">
              {item.text}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}

function VideoCard({ item }: { item: DemoVideo }) {
  const [videoFailed, setVideoFailed] = useState(false);

  if (videoFailed) {
    return <Image src={item.fallback} alt="" fill className="object-cover transition duration-300 group-hover:scale-[1.03]" />;
  }

  return (
    <video
      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster={item.fallback}
      onError={() => setVideoFailed(true)}
    >
      <source src={item.src} type="video/mp4" />
    </video>
  );
}
