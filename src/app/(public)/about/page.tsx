import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, GraduationCap, Lightbulb, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "About Huawei ICT Academy",
  description: "Learn about Huawei ICT Academy and its learning community.",
};

const pillars = [
  {
    title: "Learn with purpose",
    description: "Build practical skills through focused training, workshops and certifications.",
    icon: GraduationCap,
  },
  {
    title: "Create what matters",
    description: "Turn ideas into useful projects with modern technology and hands-on guidance.",
    icon: Lightbulb,
  },
  {
    title: "Grow together",
    description: "Meet peers, mentors and industry practitioners through an active community.",
    icon: Users,
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-500">About the academy</p>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-6xl">A place to learn, build and move forward.</h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--muted-foreground)]">
          Huawei ICT Academy at FUT Minna connects students with practical technology education, meaningful projects and a community that keeps learning in motion.
        </p>
      </div>

      <div className="mt-16 grid gap-5 md:grid-cols-3">
        {pillars.map(({ title, description, icon: Icon }) => (
          <article key={title} className="rounded-2xl border border-black/10 bg-slate-50 p-6 dark:border-white/10 dark:bg-slate-900/60">
            <Icon className="text-emerald-500" size={28} />
            <h2 className="mt-6 text-xl font-bold">{title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">{description}</p>
          </article>
        ))}
      </div>

      <div className="mt-16 flex flex-wrap items-center gap-4 border-t border-black/10 pt-8 dark:border-white/10">
        <Link href="/#events" className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600">
          Explore events <ArrowRight size={16} />
        </Link>
        <span className="text-sm text-[var(--muted-foreground)]">No account needed to register.</span>
      </div>
    </div>
  );
}