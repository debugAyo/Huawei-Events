import Link from "next/link";
import { Zap, Mail, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer id="about" className="border-t border-white/10 bg-slate-950">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500 text-slate-950">
              <Zap size={16} strokeWidth={2.5} />
            </span>
            <span className="font-bold">HuaweiEvents</span>
          </div>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-400">
            The events platform of Huawei. Discover, register and grow with us.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
            Quick links
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li>
              <Link href="/#events" className="hover:text-emerald-400">
                Upcoming events
              </Link>
            </li>
            <li>
              <Link href="/admin" className="hover:text-emerald-400">
                Admin dashboard
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
            Contact
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li className="flex items-center gap-2">
              <MapPin size={15} /> Huawei, Minna
            </li>
            <li className="flex items-center gap-2">
              <Mail size={15} />
              <a href="mailto:hello@huaweievents.dev" className="hover:text-emerald-400">
                hello@huaweievents.dev
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Huawei. Built with
        care.
      </div>
    </footer>
  );
}
