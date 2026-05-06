"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { queueApi } from "@/lib/queue-api";
import { apiError } from "@/lib/api";
import { useQueueSocket } from "@/lib/socket";
import type { TrackResponse } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, RefreshCw, X, Bell } from "lucide-react";

const statusColors: Record<string, string> = {
  waiting: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  serving: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  done: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  cancelled: "bg-zinc-500/15 text-zinc-700 dark:text-zinc-400",
  skipped: "bg-rose-500/15 text-rose-700 dark:text-rose-400",
};

export default function StatusPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<TrackResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastNotified = useRef<number | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const { data } = await queueApi.track();
      setData(data);
      setError(null);
      if (
        data.people_ahead <= 1 &&
        data.token.status === "waiting" &&
        lastNotified.current !== data.token.token_number
      ) {
        toast(
          <span className="flex items-center gap-2">
            <Bell className="h-4 w-4" /> Your turn is coming up!
          </span>
        );
        lastNotified.current = data.token.token_number;
      }
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    fetchStatus();
    const id = setInterval(fetchStatus, 5000);
    return () => clearInterval(id);
  }, [authLoading, user, router, fetchStatus]);

  const trackedQueueId = data?.token.queue
    ? typeof data.token.queue === "string"
      ? data.token.queue
      : data.token.queue._id
    : undefined;
  useQueueSocket(trackedQueueId, () => {
    fetchStatus();
  });

  const handleCancel = async () => {
    if (!data) return;
    try {
      await queueApi.cancel(data.token._id);
      toast.success("Token cancelled");
      setData(null);
      router.push("/services");
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-20 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-12">
        <Alert>
          <AlertTitle>No active queue token</AlertTitle>
          <AlertDescription>
            {error || "You don't have any active token right now."}
          </AlertDescription>
        </Alert>
        <div className="mt-6">
          <Link href="/services" className={buttonVariants()}>
            Browse services
          </Link>
        </div>
      </div>
    );
  }

  const { token, people_ahead, real_time_estimated_wait } = data;
  const isDone = token.status === "done";
  const userInfo =
    typeof token.user === "object" && token.user !== null ? token.user : null;
  const queueInfo =
    typeof token.queue === "object" && token.queue !== null ? token.queue : null;
  const serviceName =
    queueInfo && typeof queueInfo.service === "object" && queueInfo.service
      ? queueInfo.service.service_name
      : undefined;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-10">
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/40">
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Your Queue Token</CardTitle>
              <CardDescription>
                {serviceName ? `${serviceName} · ` : ""}Live status — refreshes
                every 5 seconds.
              </CardDescription>
            </div>
            <Badge className={statusColors[token.status]}>{token.status}</Badge>
          </div>
          {userInfo && (
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span>
                <span className="font-medium text-foreground">
                  {userInfo.name}
                </span>{" "}
                · {userInfo.email}
              </span>
            </div>
          )}
        </CardHeader>

        <CardContent className="grid gap-6 py-8">
          <div className="text-center">
            <div className="text-sm uppercase tracking-wider text-muted-foreground">
              Token number
            </div>
            <div
              key={token.token_number}
              className="mt-2 text-7xl font-bold tabular-nums motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95"
            >
              #{token.token_number}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Stat label="People ahead" value={String(people_ahead)} />
            <Stat
              label="Est. wait"
              value={`${real_time_estimated_wait} min`}
            />
          </div>

          {token.status === "serving" && (
            <Alert className="border-emerald-500/40 bg-emerald-500/10">
              <Bell className="h-4 w-4" />
              <AlertTitle>It&apos;s your turn!</AlertTitle>
              <AlertDescription>
                Please proceed to the service counter.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter className="flex flex-wrap justify-between gap-2 border-t bg-muted/40 py-4">
          <Button variant="outline" size="sm" onClick={fetchStatus}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>

          <div className="flex gap-2">
            {!isDone && token.status !== "cancelled" && (
              <Button variant="destructive" size="sm" onClick={handleCancel}>
                <X className="mr-2 h-4 w-4" /> Cancel queue
              </Button>
            )}
            {isDone && (
              <Link
                href={`/feedback?token=${token._id}`}
                className={buttonVariants({ size: "sm" })}
              >
                Leave feedback
              </Link>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card p-4 text-center">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}
