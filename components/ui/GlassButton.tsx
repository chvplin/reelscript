"use client";

import { motion } from "framer-motion";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type GlassButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  className?: string;
};

export function GlassButton({ children, className = "", ...props }: GlassButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      <button
        className={`glass-button min-h-11 rounded-xl px-4 font-semibold text-white transition ${className}`}
        {...props}
      >
        {children}
      </button>
    </motion.div>
  );
}
