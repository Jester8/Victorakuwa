"use client";

import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
import { loginAction, type ActionState } from "@/app/admin/actions";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(loginAction, {});
  const [showPassword, setShowPassword] = useState(false);

  const inputClass =
    "mt-2 h-12 w-full rounded-xl border border-line bg-background px-4 outline-none transition-colors focus:border-foreground";

  return (
    <form action={formAction} className="mt-8 space-y-4">
      <label className="block text-sm font-semibold">
        Email
        <input
          key={state.email}
          name="email"
          type="email"
          autoComplete="username"
          required
          defaultValue={state.email}
          className={inputClass}
        />
      </label>
      <label className="block text-sm font-semibold">
        Password
        <input name="password" type="password" autoComplete="current-password" required className={inputClass} />
      </label>
      {state.error && (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground text-sm font-semibold text-background transition-opacity hover:opacity-80 disabled:opacity-60"
      >
        {pending && <Loader2 size={16} className="animate-spin" />}
        Sign in
      </button>
    </form>
  );
}
