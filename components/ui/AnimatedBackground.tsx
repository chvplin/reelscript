"use client";

import { useReducedMotion } from "framer-motion";

export function AnimatedBackground() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden liquid-bg">
      <div className={`absolute -left-20 top-10 h-72 w-72 rounded-full bg-purple-500/25 blur-3xl ${reduceMotion ? "" : "floating-blob"}`} />
      <div className={`absolute right-0 top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl ${reduceMotion ? "" : "floating-blob"}`} style={{ animationDelay: "2s" }} />
      <div className={`absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-pink-500/20 blur-3xl ${reduceMotion ? "" : "floating-blob"}`} style={{ animationDelay: "4s" }} />
      <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "url('/assets/textures/grid-texture.svg')" }} />
    </div>
  );
}
