"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User,
  KeyRound,
  Mail,
  Building2,
  Lock,
  EyeOff,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";
import { Field, Input } from "./setup-helpers";

export const setupSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    employeeId: z
      .string()
      .min(2, "Employee ID is required")
      .regex(
        /^[A-Z0-9-]+$/,
        "Use uppercase letters, numbers, and hyphens only (e.g. MX001)"
      ),
    email: z.string().email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    confirmPassword: z.string(),
    companyName: z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SetupFormValues = z.infer<typeof setupSchema>;

export function SetupForm({
  onSuccess,
}: {
  onSuccess: (employeeId: string, codes: string[]) => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SetupFormValues>({ resolver: zodResolver(setupSchema) });

  const passwordValue = watch("password") || "";
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (!pass) return 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };
  const strengthScore = getPasswordStrength(passwordValue);

  const onSubmit = async (values: SetupFormValues) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: values.firstName,
          lastName: values.lastName,
          employeeId: values.employeeId,
          email: values.email,
          password: values.password,
          companyName: values.companyName || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 404) {
          toast.error("Platform is already initialized. Please sign in.");
          return;
        }
        toast.error(data.error ?? "Setup failed. Please try again.");
        return;
      }

      onSuccess(data.employeeId as string, data.recoveryCodes as string[]);
    } catch {
      toast.error("Network error. Please check your connection and retry.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Name row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="First Name" error={errors.firstName?.message}>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <Input placeholder="eg. Manikandan" className="pl-9" {...register("firstName")} />
          </div>
        </Field>
        <Field label="Last Name" error={errors.lastName?.message}>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <Input placeholder="eg. Kumar" className="pl-9" {...register("lastName")} />
          </div>
        </Field>
      </div>

      {/* Employee ID */}
      <Field label="Employee ID" error={errors.employeeId?.message}>
        <div className="relative">
          <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
          <Input
            placeholder="eg. MX001"
            {...register("employeeId", {
              onChange: (e) =>
                setValue("employeeId", e.target.value.toUpperCase(), {
                  shouldValidate: true,
                }),
            })}
            className="pl-9 font-mono tracking-wider"
          />
        </div>
      </Field>

      {/* Email */}
      <Field label="Email Address" error={errors.email?.message}>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
          <Input
            type="email"
            placeholder="eg. manikandan@mergex.in"
            className="pl-9"
            {...register("email")}
          />
        </div>
      </Field>

      {/* Company Name */}
      <Field label="Company Name (optional)" error={errors.companyName?.message}>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
          <Input placeholder="eg. MergeX Solutions" className="pl-9" {...register("companyName")} />
        </div>
      </Field>

      {/* Password row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Password */}
        <Field label="Password" error={errors.password?.message}>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Min. 8 chars"
              {...register("password")}
              className="pl-9 pr-9"
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
          {/* Password strength indicator */}
          {passwordValue && (
            <div className="flex gap-1 mt-2 h-1 w-full rounded-full overflow-hidden bg-white/5">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={`flex-1 transition-all duration-300 ${
                    strengthScore >= level
                      ? strengthScore <= 2
                        ? "bg-rose-500"
                        : strengthScore <= 4
                        ? "bg-amber-400"
                        : "bg-emerald-500"
                      : "bg-transparent"
                  }`}
                />
              ))}
            </div>
          )}
        </Field>

        {/* Confirm Password */}
        <Field label="Confirm Password" error={errors.confirmPassword?.message}>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <Input
              type={showConfirm ? "text" : "password"}
              placeholder="Repeat password"
              {...register("confirmPassword")}
              className="pl-9 pr-9"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
            >
              {showConfirm ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
        </Field>
      </div>

      <div className="w-full pt-2 flex justify-end">
        <LiquidMetalButton
          label={submitting ? "Initializing..." : "Initialize Platform"}
          width={180}
          height={42}
        />
      </div>
    </form>
  );
}
