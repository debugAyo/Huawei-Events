"use client";

import { useActionState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteEvent } from "@/app/actions";

export function DeleteEventButton({ id }: { id: string }) {
  const [, action, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      await deleteEvent(formData);
      return {};
    },
    {},
  );

  return (
    <form
      action={(formData: FormData) => {
        if (window.confirm("Delete this event and all its registrations?")) {
          formData.set("id", id);
          return action(formData);
        }
      }}
    >
      <button
        type="submit"
        disabled={pending}
        title="Delete"
        className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-300 disabled:opacity-50"
      >
        {pending ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Trash2 size={16} />
        )}
      </button>
    </form>
  );
}
