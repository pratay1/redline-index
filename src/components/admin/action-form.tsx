"use client";

import { useActionState, type ReactNode } from "react";

export type ActionState = { ok: boolean; message: string };
const initialState: ActionState = { ok: false, message: "" };

export function AdminActionForm({ action, children, className = "" }: { action: (state: ActionState, formData: FormData) => Promise<ActionState>; children: ReactNode; className?: string }) {
  const [state, formAction, pending] = useActionState(action, initialState);
  return <form action={formAction} className={className}>{children}<p aria-live="polite" className={`mt-3 text-sm ${state.ok ? "text-emerald-300" : "text-signal"}`}>{state.message}</p><button type="submit" disabled={pending} className="mt-4 inline-flex min-h-10 items-center bg-foreground px-4 font-mono text-[0.65rem] tracking-[0.12em] text-background uppercase disabled:opacity-50">{pending ? "Saving…" : "Save"}</button></form>;
}
