"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginUser } from "@/lib/api/auth";
import { loginSchema, type LoginFormData } from "@/lib/schemas/auth";

export function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);

    try {
      await loginUser(data);
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Something went wrong. Try again.");
    }
  };

  return (
    <main className="robo-dashboard-bg relative min-h-screen overflow-hidden">
      <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-cyan-500/20 blur-[180px]" />

      <div className="relative z-10 flex min-h-screen">
        <div className="hidden w-1/2 flex-col justify-center px-20 lg:flex">
          <span className="robo-subtitle mb-4">ROBUVERSE ERP</span>

          <h1 className="robo-heading text-7xl leading-none">
            OPERATING
            <br />
            THE FUTURE
          </h1>

          <p className="robo-muted mt-6 max-w-lg text-lg">
            Unified CRM, HRMS, Inventory, Finance, Projects and Operations Platform built for modern organizations.
          </p>

          <div className="mt-12 grid grid-cols-2 gap-5">
            <div className="robo-stat-card">
              <h3 className="robo-stat-value">99.9%</h3>
              <p className="robo-stat-label">System Uptime</p>
            </div>

            <div className="robo-stat-card">
              <h3 className="robo-stat-value">24/7</h3>
              <p className="robo-stat-label">Monitoring</p>
            </div>

            <div className="robo-stat-card">
              <h3 className="robo-stat-value">CRM</h3>
              <p className="robo-stat-label">Sales Pipeline</p>
            </div>

            <div className="robo-stat-card">
              <h3 className="robo-stat-value">HRMS</h3>
              <p className="robo-stat-label">Employee Hub</p>
            </div>
          </div>
        </div>

        <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
          <div className="robo-glass w-full max-w-md p-8 md:p-10">
            <div className="mb-8 text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10">
                  <span className="text-xl font-bold text-cyan-400">R</span>
                </div>
              </div>

              <h2 className="robo-heading text-4xl">SIGN IN</h2>
              <p className="robo-muted mt-2">Access your Robuverse workspace</p>
            </div>

            {serverError && (
              <div className="robo-badge robo-badge-danger mb-5 block w-full text-center">{serverError}</div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
              <div>
                <label htmlFor="email" className="robo-label">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  className="robo-input"
                  placeholder="name@company.com"
                  {...register("email")}
                />
                {errors.email && <p className="robo-danger mt-1 text-sm">{errors.email.message}</p>}
              </div>

              <div>
                <label htmlFor="password" className="robo-label">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="robo-input"
                  placeholder="Password"
                  {...register("password")}
                />
                {errors.password && <p className="robo-danger mt-1 text-sm">{errors.password.message}</p>}
              </div>

              <button
                type="submit"
                className="robo-btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing In..." : "Sign In"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}