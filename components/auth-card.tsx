import type { ReactNode } from "react";

type AuthCardProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="w-full max-w-md rounded-2xl border border-card-border/80 bg-card/80 p-8 backdrop-blur-xl">
      <p className="text-sm font-mono text-muted">ReelScript AI</p>
      <h1 className="mt-2 text-3xl font-bold [font-family:var(--font-space-grotesk)]">{title}</h1>
      <p className="mt-2 text-sm text-muted">{subtitle}</p>
      <div className="mt-8 space-y-4">{children}</div>
    </div>
  );
}
