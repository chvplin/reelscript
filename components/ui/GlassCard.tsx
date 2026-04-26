"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

type GlassCardProps = {
  children: ReactNode;
  className?: string;
  hover?: boolean;
};

export function GlassCard({ children, className = "", hover = true }: GlassCardProps) {
  return (
    <motion.div
      className={`glass-card rounded-2xl ${className}`}
      whileHover={hover ? { y: -2, scale: 1.015 } : undefined}
      transition={{ type: "spring", stiffness: 210, damping: 22 }}
    >
      {children}
    </motion.div>
  );
}
