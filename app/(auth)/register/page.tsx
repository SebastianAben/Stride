import Link from "next/link";

import { register } from "@/app/actions/auth";
import { AuthForm } from "@/components/auth/auth-form";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-teal-700">
          Stride
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
          Create account
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Start tracking applications, follow-ups, and deadlines in one place.
        </p>
        <AuthForm action={register} buttonLabel="Create account" mode="register" />
        <p className="mt-5 text-sm text-slate-600">
          Already have an account?{" "}
          <Link className="font-medium text-teal-700 hover:text-teal-800" href="/login">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}
