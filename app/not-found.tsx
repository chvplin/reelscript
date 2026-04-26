import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <section className="w-full max-w-lg rounded-2xl border bg-card/80 p-8 text-center">
        <h1 className="text-3xl font-bold">404</h1>
        <p className="mt-2 text-muted">Page not found.</p>
        <Link href="/" className="mt-4 inline-flex min-h-11 items-center rounded-xl border px-4">
          Go home
        </Link>
      </section>
    </main>
  );
}
