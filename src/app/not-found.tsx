import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="grid min-h-[60vh] place-items-center px-4">
      <div className="text-center">
        <Compass className="mx-auto text-emerald-400" size={40} />
        <h1 className="mt-4 text-3xl font-bold">Page not found</h1>
        <p className="mt-2 text-sm text-slate-400">
          The event or page you are looking for doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
        >
          Browse events
        </Link>
      </div>
    </div>
  );
}
