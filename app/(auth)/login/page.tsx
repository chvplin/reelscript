import Link from "next/link";
import { AuthCard } from "@/components/auth-card";
import { loginAction } from "@/app/(auth)/actions";

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage(props: Props) {
  const searchParams = await props.searchParams;

  return (
    <AuthCard title="Welcome back" subtitle="Log in to generate high-converting captions in seconds.">
      <form action={loginAction} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-2 block text-sm text-muted">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-xl border bg-slate-900/60 px-4 py-3 outline-none transition focus:border-purple-400"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-2 block text-sm text-muted">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full rounded-xl border bg-slate-900/60 px-4 py-3 outline-none transition focus:border-pink-400"
          />
        </div>
        {searchParams.error ? <p className="text-sm text-rose-300">{searchParams.error}</p> : null}
        <button
          type="submit"
          className="card-glow w-full rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-3 font-semibold transition hover:scale-[1.01]"
        >
          Log In
        </button>
      </form>
      <p className="text-sm text-muted">
        New here?{" "}
        <Link href="/signup" className="text-purple-300 underline decoration-purple-400/60 underline-offset-4">
          Create account
        </Link>
      </p>
    </AuthCard>
  );
}
