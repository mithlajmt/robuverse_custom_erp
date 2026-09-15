import { LoginForm } from "@/components/auth/login-form";
import { redirectIfAuthenticated } from "@/lib/auth/session";

export default async function LoginPage() {
  await redirectIfAuthenticated();

  return <LoginForm />;
}