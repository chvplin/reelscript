import Link from "next/link";
import { AuthCard } from "@/components/auth-card";
import { signupAction } from "@/app/(auth)/actions";

type Props = {
  searchParams: Promise<{ error?: string }>;
};

const genres = ["Hyperpop", "Alt-Pop", "Indie Pop", "Hip-Hop", "R&B", "Electronic", "Rock", "Other"];

export default async function SignupPage(props: Props) {
  const searchParams = await props.searchParams;

  return (
    <AuthCard title="Create your artist account" subtitle="Start with 10 free credits and generate instantly.">
      <form action={signupAction} className="space-y-4">
        <div>
          <label htmlFor="artist_name" className="mb-2 block text-sm text-muted">
            Artist Name
          </label>
          <input
            id="artist_name"
            name="artist_name"
            required
            className="w-full rounded-xl border bg-slate-900/60 px-4 py-3 outline-none transition focus:border-purple-400"
          />
        </div>
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
            minLength={8}
            required
            className="w-full rounded-xl border bg-slate-900/60 px-4 py-3 outline-none transition focus:border-pink-400"
          />
        </div>
        <div>
          <label htmlFor="genre" className="mb-2 block text-sm text-muted">
            Primary Genre
          </label>
          <select
            id="genre"
            name="genre"
            defaultValue="Other"
            className="w-full rounded-xl border bg-slate-900/60 px-4 py-3 outline-none transition focus:border-blue-400"
          >
            {genres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </div>
        {searchParams.error ? <p className="text-sm text-rose-300">{searchParams.error}</p> : null}
        <button
          type="submit"
          className="card-glow w-full rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-3 font-semibold transition hover:scale-[1.01]"
        >
          Start Free (10 Credits)
        </button>
      </form>
      <p className="text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-purple-300 underline decoration-purple-400/60 underline-offset-4">
          Log in
        </Link>
      </p>
    </AuthCard>
  );
}
