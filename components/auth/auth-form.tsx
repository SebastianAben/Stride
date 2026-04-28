"use client";

import { useActionState } from "react";

import type { AuthFormState } from "@/app/actions/auth";

type AuthFormProps = {
  action: (
    state: AuthFormState,
    formData: FormData,
  ) => Promise<AuthFormState>;
  buttonLabel: string;
  mode: "login" | "register";
};

const initialState: AuthFormState = {};

export function AuthForm({ action, buttonLabel, mode }: AuthFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="mt-8 space-y-4">
      {mode === "register" ? (
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Name</span>
          <input
            autoComplete="name"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            name="name"
            required
            type="text"
          />
        </label>
      ) : null}

      <label className="block">
        <span className="text-sm font-medium text-slate-700">Email</span>
        <input
          autoComplete="email"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
          name="email"
          required
          type="email"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-slate-700">Password</span>
        <input
          autoComplete={mode === "register" ? "new-password" : "current-password"}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
          name="password"
          required
          type="password"
        />
      </label>

      {state.error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <button
        className="w-full rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "Please wait..." : buttonLabel}
      </button>
    </form>
  );
}
