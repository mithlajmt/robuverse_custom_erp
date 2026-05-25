import { ShieldCheck } from "lucide-react";
import { signInWithEmail } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/field";
import { hasSupabaseConfig } from "@/lib/supabase/server";

type PageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const configured = hasSupabaseConfig();

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-cyan-300/25 bg-cyan-300/10">
            <ShieldCheck className="h-6 w-6 text-cyan-200" />
          </div>
          <CardTitle>Robuverse ERP Login</CardTitle>
        </CardHeader>
        <CardContent>
          {!configured && (
            <div className="mb-4 rounded-lg border border-amber-300/20 bg-amber-300/10 p-3 text-sm text-amber-100">
              Supabase env vars are not configured yet, so route protection is disabled for local setup.
            </div>
          )}
          {params.error && (
            <div className="mb-4 rounded-lg border border-rose-300/20 bg-rose-300/10 p-3 text-sm text-rose-100">
              {params.error}
            </div>
          )}
          <form action={signInWithEmail} className="grid gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required placeholder="admin@robuverse.in" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required placeholder="Password" />
            </div>
            <Button type="submit" disabled={!configured}>Sign In</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
