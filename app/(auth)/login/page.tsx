import Link from "next/link";

import { login } from "@/app/actions/auth";
import { AuthForm } from "@/components/auth/auth-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-teal-700">
          Stride
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
          Login
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Access your personal job search workspace.
        </p>
        <AuthForm action={login} buttonLabel="Login" mode="login" />
        <p className="mt-5 text-sm text-slate-600">
          Need an account?{" "}
          <Link className="font-medium text-teal-700 hover:text-teal-800" href="/register">
            Register
          </Link>
        </p>
      </section>
    </main>
  );
}
