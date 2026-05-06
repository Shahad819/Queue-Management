"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

  const reason = params.get("reason");
  const next = params.get("next") || "";

  useEffect(() => {
    if (reason === "session") {
      toast.error("Session expired. Please sign in again.");
    } else if (reason === "blacklisted") {
      toast.error("Account blacklisted. Contact admin.");
    }
  }, [reason]);

  const submit = async () => {
    const fieldErrors: typeof errors = {};
    if (!email || !/^\S+@\S+\.\S+$/.test(email))
      fieldErrors.email = "Enter a valid email";
    if (!password) fieldErrors.password = "Password required";
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setSubmitting(true);
    try {
      const u = await login(email, password);
      toast.success("Welcome back");
      const dest = next || (u.role === "admin" ? "/admin" : "/services");
      router.push(dest);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-md items-center px-4 py-10">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Choose admin or customer credentials.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {reason === "session" && (
            <Alert variant="destructive">
              <AlertTitle>Session expired</AlertTitle>
              <AlertDescription>
                Your previous session is no longer valid. Sign in again to
                continue.
              </AlertDescription>
            </Alert>
          )}
          {reason === "blacklisted" && (
            <Alert variant="destructive">
              <AlertTitle>Account blacklisted</AlertTitle>
              <AlertDescription>
                This account is blocked from joining queues. Contact an admin
                to lift the restriction.
              </AlertDescription>
            </Alert>
          )}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={onKeyDown}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={onKeyDown}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 mt-2">
          <Button
            type="button"
            className="w-full"
            disabled={submitting}
            onClick={submit}
          >
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign in
          </Button>
          <p className="text-sm text-muted-foreground">
            No account?{" "}
            <Link href="/register" className="font-medium text-primary">
              Register
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
