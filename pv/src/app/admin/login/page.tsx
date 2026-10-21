import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import LoginForm from "@/app/admin/login/LoginForm";

export default async function AdminLogin() {
  if (await isAdmin()) redirect("/admin");
  return (
    <div className="flex w-full items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">
        <p className="text-sm font-semibold uppercase tracking-widest text-muted">Admin</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Welcome back, PV.</h1>
        <p className="mt-2 text-muted">Sign in to write posts and see how the blog is doing.</p>
        <LoginForm />
      </div>
    </div>
  );
}
