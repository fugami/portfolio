import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import RichContent from "@/components/RichContent";
import BackToTop from "@/components/BackToTop";
import { getProjectBySlug } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Not found" };
  return {
    title: `${project.title} — Jordan Mitchell`,
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project || !project.published) notFound();

  return (
    <main className="min-h-screen">
      <SiteHeader variant="monogram" />

      <article className="mx-auto w-full max-w-2xl px-6 pb-28 pt-6">
        <header className="mb-10 text-center">
          <h1 className="font-hand text-5xl text-ink-strong sm:text-6xl">
            {project.title}
          </h1>
        </header>

        {project.cover_image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.cover_image}
            alt={project.title}
            className="mx-auto mb-14 w-full max-w-xl rounded-sm shadow-[0_18px_40px_-18px_rgba(40,20,15,0.55)]"
          />
        )}

        {project.content && (
          <div className="prose-garamond">
            <RichContent content={project.content} />
          </div>
        )}
      </article>

      <BackToTop />
    </main>
  );
}
