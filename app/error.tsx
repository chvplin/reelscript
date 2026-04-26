"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-lg rounded-2xl border bg-card/80 p-6 text-center">
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="mt-2 text-sm text-muted">{error.message || "Unexpected error."}</p>
          <button onClick={reset} className="mt-4 min-h-11 rounded-xl border px-4">
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
