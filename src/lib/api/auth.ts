import type { LoginFormData } from "@/lib/schemas/auth";
import { API_ENDPOINTS } from "./endpoints";

type AuthUser = {
  id: string;
  email: string | undefined;
};

type LoginResponse = {
  user: AuthUser;
};

type CurrentUserResponse = {
  user: AuthUser | null;
};

export async function loginUser(data: LoginFormData): Promise<LoginResponse> {
  const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error ?? "Login failed");
  }

  return result;
}

export async function getCurrentUser(): Promise<CurrentUserResponse> {
  const response = await fetch(API_ENDPOINTS.AUTH.ME);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error ?? "Unable to load current user");
  }

  return result;
}

export async function logout(): Promise<void> {
  const response = await fetch(API_ENDPOINTS.AUTH.LOGOUT, {
    method: "POST"
  });

  if (!response.ok) {
    const result = await response.json();
    throw new Error(result.error ?? "Unable to sign out");
  }
}