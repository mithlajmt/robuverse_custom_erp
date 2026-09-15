import { z } from "zod";

/**
 * Shared login schema — single source of truth.
 * Used by:
 *  - the login form (via zodResolver)
 *  - the /api/auth/login route (server-side guard)
 *
 * Add more auth-related schemas here as you build them
 * (registerSchema, forgotPasswordSchema, resetPasswordSchema, etc).
 */

export const loginSchema = z.object({
    email: z
        .string()               // must be a string
        .min(1, "Email is required")   // can't be empty
        .email("Enter a valid email address"), // must look like an email
    password: z
        .string()               // must be a string
        .min(6, "Password must be at least 6 characters"), // at least 6 chars
});
// This line auto-generates a TypeScript type from the schema above.
// LoginFormData will be: { email: string, password: string }
export type LoginFormData = z.infer<typeof loginSchema>;