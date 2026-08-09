"use client";

import { useActionState, useMemo, useState } from "react";
import {
  Download,
  Search,
  Check,
  CheckCheck,
  UserX,
  ListPlus,
  Loader2,
} from "lucide-react";
import { updateRegistrationStatus } from "@/app/actions";
import type { RegistrationRow, RegistrationStatus } from "@/lib/types";
import {
  REGISTRATION_STATUS_LABELS,
  formatDateTime,
  slugify,
} from "@/lib/utils";

type RowState = { pending?: boolean };

function StatusButton({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="rounded-md border border-white/10 px-2 py-1 text-[11px] font-medium text-slate-300 transition hover:border-emerald-400/50 hover:text-emerald-300 disabled:opacity-40"
    >
      {label}
    </button>
  );
}

function RegistrationRowActions({
  registration,
}: {
  registration: RegistrationRow;
}) {
  const [, action, pending] = useActionState(
    async (_prev: RowState, formData: FormData) => {
      await updateRegistrationStatus(formData);
      return {};
    },
    {},
  );

  const setStatus = (status: RegistrationStatus) => {
    const fd = new FormData();
    fd.set("id", registration.id);
    fd.set("status", status);
    action(fd);
  };

  if (pending) {
    return <Loader2 size={16} className="animate-spin text-emerald-400" />;
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {registration.status === "confirmed" && (
        <StatusButton label="Check in" onClick={() => setStatus("checked_in")} />
      )}
      {registration.status !== "confirmed" &&
        registration.status !== "checked_in" && (
          <StatusButton
            label="Confirm"
            onClick={() => setStatus("confirmed")}
          />
        )}
      {registration.status === "confirmed" && (
        <StatusButton label="Waitlist" onClick={() => setStatus("waitlisted")} />
      )}
      {registration.status !== "cancelled" && (
        <StatusButton
          label="Cancel"
          onClick={() => setStatus("cancelled")}
        />
      )}
      {registration.status === "cancelled" && (
        <StatusButton
          label="Restore"
          onClick={() => setStatus("confirmed")}
        />
      )}
    </div>
  );
}

export function RegistrationsTable({
  registrations,
  eventTitle,
}: {
  registrations: RegistrationRow[];
  eventTitle: string;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return registrations;
    return registrations.filter((r) =>
      [r.full_name, r.email, r.matric_number, r.department]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q)),
    );
  }, [registrations, query]);

  function exportCsv() {
    const header = [
      "Full Name",
      "Email",
      "Phone",
      "Matric No.",
      "Department",
      "Level",
      "Status",
      "Registered At",
      "Notes",
    ];
    const rows = registrations.map((r) => [
      r.full_name,
      r.email,
      r.phone ?? "",
      r.matric_number ?? "",
      r.department ?? "",
      r.level ?? "",
      REGISTRATION_STATUS_LABELS[r.status],
      r.created_at,
      r.notes ?? "",
    ]);
    const csv = [header, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slugify(eventTitle)}-registrations.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const STATUS_STYLES: Record<RegistrationStatus, string> = {
    confirmed: "bg-green-400/10 text-green-300",
    waitlisted: "bg-amber-400/10 text-amber-300",
    cancelled: "bg-rose-400/10 text-rose-300",
    checked_in: "bg-sky-400/10 text-sky-300",
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/40">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
        <h2 className="font-semibold">
          Registrations ({registrations.length})
        </h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="w-48 rounded-lg border border-white/10 bg-slate-950 py-2 pl-9 pr-3 text-sm text-white placeholder:text-slate-600 focus:border-emerald-400 focus:outline-none"
            />
          </div>
          <button
            onClick={exportCsv}
            disabled={registrations.length === 0}
            className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-emerald-400/40 hover:text-emerald-300 disabled:opacity-40"
          >
            <Download size={15} />
            CSV
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-10 text-center text-sm text-slate-400">
          {registrations.length === 0
            ? "No registrations yet."
            : "No registrations match your search."}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3 font-medium">Attendee</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Registered</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]"
                >
                  <td className="px-5 py-4">
                    <div className="font-medium text-slate-100">
                      {r.full_name}
                    </div>
                    <div className="text-xs text-slate-500">
                      {r.matric_number && `${r.matric_number} · `}
                      {r.department && r.department}
                      {r.level && ` · L${r.level}`}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-slate-300">{r.email}</div>
                    {r.phone && (
                      <div className="text-xs text-slate-500">{r.phone}</div>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                        STATUS_STYLES[r.status]
                      }`}
                    >
                      {r.status === "checked_in" ? (
                        <CheckCheck size={13} />
                      ) : r.status === "confirmed" ? (
                        <Check size={13} />
                      ) : r.status === "cancelled" ? (
                        <UserX size={13} />
                      ) : (
                        <ListPlus size={13} />
                      )}
                      {REGISTRATION_STATUS_LABELS[r.status]}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-400">
                    {formatDateTime(r.created_at)}
                  </td>
                  <td className="px-4 py-4">
                    <RegistrationRowActions registration={r} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
