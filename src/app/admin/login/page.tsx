import { LoginForm } from "@/components/admin/LoginForm";

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center bg-slate-50 px-4 py-16">
      <div className="mx-auto w-full max-w-md">
        <LoginForm />
      </div>
    </main>
  );
}
