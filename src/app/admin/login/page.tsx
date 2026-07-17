import { loginAction } from "./actions";
import { inputClass, labelClass, btnPrimary } from "@/components/admin/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin login — Jordan Mitchell" };

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center px-6 font-garamond">
      <h1 className="mb-1 font-hand text-5xl text-ink-strong">Admin</h1>
      <p className="mb-8 text-base text-ink/70">This area is password-protected.</p>

      <form action={loginAction} className="space-y-4">
        <div>
          <label htmlFor="password" className={labelClass}>
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoFocus
            autoComplete="current-password"
            className={inputClass}
          />
        </div>
        {error && (
          <p className="text-sm text-red-900">That password isn&rsquo;t right — try again.</p>
        )}
        <button type="submit" className={`${btnPrimary} w-full`}>
          Enter
        </button>
      </form>
    </main>
  );
}
