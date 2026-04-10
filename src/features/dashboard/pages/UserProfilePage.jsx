import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { PasswordStrengthMeter } from "@/features/auth/components/PasswordStrengthMeter";

// ─── Schemas ─────────────────────────────────────────────────────────────────

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email"),
  phoneNumber: z.string().optional(),
});

const passwordChangeSchema = z
  .object({
    oldPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[a-z]/, "Must contain a lowercase letter")
      .regex(/[0-9]/, "Must contain a number")
      .regex(/[^A-Za-z0-9]/, "Must contain a special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ROLE_BADGE = {
  merchant: "bg-orange-100 text-orange-700",
  buyer:    "bg-blue-100 text-blue-700",
  admin:    "bg-red-100 text-red-700",
};

function Avatar({ name }) {
  const initials = name
    ? name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";
  return (
    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-bold select-none">
      {initials}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function UserProfilePage() {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const setTokens = useAuthStore((s) => s.setTokens);
  const isMerchant = user?.role === "merchant";

  // Profile form
  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      phoneNumber: user?.phoneNumber ?? "",
    },
  });

  // Password form
  const passwordForm = useForm({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: { oldPassword: "", newPassword: "", confirmPassword: "" },
  });

  const watchedNewPassword = passwordForm.watch("newPassword");

  const handleProfileSave = async (data) => {
    try {
      const res = await api.patch("/v1/auth/me", {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phoneNumber: data.phoneNumber?.trim() || undefined,
      });
      updateUser(res.data);
      profileForm.reset({
        name: res.data.name ?? data.name,
        email: res.data.email ?? data.email,
        phoneNumber: res.data.phoneNumber ?? data.phoneNumber,
      });
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    }
  };

  const handlePasswordChange = async (data) => {
    try {
      const res = await api.post("/v1/auth/change-password", {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });
      // Server invalidates old refresh tokens and issues new ones
      if (res.data?.tokens) {
        setTokens(res.data.tokens.access.token, res.data.tokens.refresh.token);
      }
      passwordForm.reset();
      toast.success("Password changed successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">

        {/* ── Profile header ── */}
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <Avatar name={user?.name} />
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold text-slate-900">
              {user?.name || "—"}
            </h1>
            <p className="truncate text-sm text-slate-500">{user?.email}</p>
            <span className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${ROLE_BADGE[user?.role] ?? "bg-slate-100 text-slate-600"}`}>
              {user?.role}
            </span>
          </div>
        </div>

        {/* ── Profile details ── */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="font-semibold text-slate-900">Profile details</h2>
            <p className="text-sm text-slate-500">Update your name, email, and phone number.</p>
          </div>
          <form onSubmit={profileForm.handleSubmit(handleProfileSave)} className="px-6 py-5 space-y-4">
            <FormField
              label={isMerchant ? "Store / Business name" : "Full name"}
              required
              error={profileForm.formState.errors.name?.message}
              id="profile-name"
            >
              <Input
                type="text"
                placeholder={isMerchant ? "Your store name" : "Your full name"}
                {...profileForm.register("name")}
              />
            </FormField>

            <FormField
              label="Email address"
              required
              error={profileForm.formState.errors.email?.message}
              id="profile-email"
            >
              <Input type="email" placeholder="you@example.com" {...profileForm.register("email")} />
            </FormField>

            <FormField
              label="Phone number"
              error={profileForm.formState.errors.phoneNumber?.message}
              id="profile-phone"
            >
              <Input type="tel" placeholder="e.g. +92 300 1234567" {...profileForm.register("phoneNumber")} />
            </FormField>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={profileForm.formState.isSubmitting || !profileForm.formState.isDirty}
                className="min-h-[44px] inline-flex items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-white shadow-md shadow-primary/20 hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {profileForm.formState.isSubmitting ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        </section>

        {/* ── Change password ── */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="font-semibold text-slate-900">Change password</h2>
            <p className="text-sm text-slate-500">Choose a strong password you don&rsquo;t use elsewhere.</p>
          </div>
          <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="px-6 py-5 space-y-4">
            <FormField
              label="Current password"
              required
              error={passwordForm.formState.errors.oldPassword?.message}
              id="old-password"
            >
              <PasswordInput placeholder="Your current password" {...passwordForm.register("oldPassword")} />
            </FormField>

            <FormField
              label="New password"
              required
              error={passwordForm.formState.errors.newPassword?.message}
              id="new-password"
            >
              <PasswordInput placeholder="Min. 8 characters" {...passwordForm.register("newPassword")} />
              <PasswordStrengthMeter password={watchedNewPassword} />
            </FormField>

            <FormField
              label="Confirm new password"
              required
              error={passwordForm.formState.errors.confirmPassword?.message}
              id="confirm-password"
            >
              <PasswordInput placeholder="••••••••" {...passwordForm.register("confirmPassword")} />
            </FormField>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={passwordForm.formState.isSubmitting}
                className="min-h-[44px] inline-flex items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-white shadow-md shadow-primary/20 hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {passwordForm.formState.isSubmitting ? "Changing…" : "Change password"}
              </button>
            </div>
          </form>
        </section>

      </div>
    </div>
  );
}
