import Home from "@/components/Home";
import { getProjects, getRoles } from "@/lib/data";

// Always reflect the latest store/Supabase data.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [projects, roles] = await Promise.all([getProjects(), getRoles()]);

  return <Home projects={projects} roles={roles} />;
}
