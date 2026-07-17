import Link from "next/link";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { getProjects, getRoles, isReadOnlyDeployment } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin — Jordan Mitchell" };

export default async function AdminPage() {
  const [projects, roles] = await Promise.all([
    getProjects({ includeUnpublished: true }),
    getRoles(),
  ]);
  const supabase = isSupabaseConfigured();
  const readOnly = isReadOnlyDeployment();

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-10 font-garamond">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-hand text-5xl text-ink-strong">Admin</h1>
          <p className="mt-1 text-base text-ink/70">
            Edit projects and roles.{" "}
            <Link href="/" className="underline underline-offset-2">
              View site →
            </Link>
          </p>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-xs ${
            supabase
              ? "border-green-700/40 bg-green-700/10 text-green-900"
              : "border-ink/30 bg-black/5 text-ink/70"
          }`}
        >
          {supabase ? "Supabase connected" : "Local store (data/store.json)"}
        </span>
      </div>

      {readOnly && (
        <div className="mb-6 rounded-md border border-amber-800/30 bg-amber-700/10 px-4 py-3 text-base text-amber-950">
          This deployment is <strong>read-only</strong> — it serves the content
          snapshot committed to the repo. To edit online, connect Supabase (env
          vars from <code>.env.local.example</code>). Until then: edit locally,
          run <code>npm run publish-content</code>, and push.
        </div>
      )}

      <AdminDashboard projects={projects} roles={roles} readOnly={readOnly} />
    </main>
  );
}
