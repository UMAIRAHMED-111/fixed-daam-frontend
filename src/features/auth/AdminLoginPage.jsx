import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import { loginSchema } from "./schemas/authSchemas";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { trimFormData } from "@/lib/formUtils";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuthStore();

  const form = useForm({
    defaultValues: { email: "", password: "" },
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
  });

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      navigate("/dashboard/admin/orders", { replace: true });
    }
  }, [isAuthenticated, user?.role, navigate]);

  if (isAuthenticated && user?.role === "admin") {
    return null;
  }

  const handleSubmit = async (data) => {
    const cleaned = trimFormData(data);
    try {
      const res = await api.post("/v1/auth/login", {
        email: cleaned.email,
        password: cleaned.password,
        role: "admin",
      });
      login(res.data.user);
      form.reset();
      navigate("/dashboard/admin/orders", { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || "Invalid credentials";
      toast.error(message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
            <ShieldCheck className="h-5 w-5 text-red-600" aria-hidden />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Admin portal</h1>
        </div>
        <p className="mt-1 text-sm text-slate-500 mb-6">
          Restricted access — authorised personnel only.
        </p>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField label="Email" required error={form.formState.errors.email?.message} id="email">
            <Input type="email" placeholder="admin@example.com" {...form.register("email")} />
          </FormField>
          <FormField label="Password" required error={form.formState.errors.password?.message} id="password">
            <PasswordInput placeholder="••••••••" {...form.register("password")} />
          </FormField>
          <button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="w-full min-h-[48px] inline-flex items-center justify-center rounded-xl bg-red-600 px-4 text-sm font-semibold text-white shadow-lg shadow-red-600/20 hover:bg-red-700 transition-colors disabled:opacity-50 touch-manipulation"
          >
            {form.formState.isSubmitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
