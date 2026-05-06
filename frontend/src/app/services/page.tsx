"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { queueApi, type QueueListItem } from "@/lib/queue-api";
import { apiError } from "@/lib/api";
import {
  listSavedQueues,
  removeSavedQueue,
  saveQueue,
  type SavedQueue,
} from "@/lib/saved-queues";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Stethoscope,
  Landmark,
  Briefcase,
  Loader2,
  Trash2,
  Users,
} from "lucide-react";

const iconFor = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("bank")) return Building2;
  if (n.includes("doctor") || n.includes("hospital")) return Stethoscope;
  if (n.includes("gov")) return Landmark;
  return Briefcase;
};

export default function ServicesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [queues, setQueues] = useState<QueueListItem[]>([]);
  const [loadingQueues, setLoadingQueues] = useState(true);
  const [queuesError, setQueuesError] = useState<string | null>(null);
  const [saved, setSaved] = useState<SavedQueue[]>([]);
  const [queueId, setQueueId] = useState("");
  const [label, setLabel] = useState("");
  const [joining, setJoining] = useState<string | null>(null);

  const loadQueues = async () => {
    setLoadingQueues(true);
    setQueuesError(null);
    try {
      const { data } = await queueApi.list();
      setQueues(data.queues);
    } catch (err) {
      const msg = apiError(err);
      setQueuesError(msg);
      toast.error(msg);
    } finally {
      setLoadingQueues(false);
    }
  };

  useEffect(() => {
    loadQueues();
    setSaved(listSavedQueues());
  }, []);

  const handleJoin = async (id: string, lbl?: string) => {
    if (!user) {
      toast.error("Please login first");
      router.push("/login");
      return;
    }
    if (!id) {
      toast.error("Queue ID required");
      return;
    }
    setJoining(id);
    try {
      const { data } = await queueApi.join(id);
      saveQueue({ queueId: id, label: lbl || "Service" });
      toast.success(`Joined queue. Token #${data.token.token_number}`);
      router.push("/status");
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setJoining(null);
    }
  };

  const handleRemove = (id: string) => {
    removeSavedQueue(id);
    setSaved(listSavedQueues());
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Services</h1>
        <p className="text-muted-foreground">
          Pick a service to join its queue, or paste a queue ID provided by the
          desk.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loadingQueues ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="h-40 animate-pulse bg-muted/50" />
          ))
        ) : queuesError ? (
          <div className="col-span-full rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm">
            <p className="font-medium text-destructive">
              Cannot reach backend.
            </p>
            <p className="mt-1 text-muted-foreground">{queuesError}</p>
            <p className="mt-2 text-muted-foreground">
              Start it with <code className="rounded bg-muted px-1">npm run dev</code>{" "}
              from the repo root, then{" "}
              <button
                onClick={loadQueues}
                className="underline underline-offset-2"
              >
                retry
              </button>
              .
            </p>
          </div>
        ) : queues.length === 0 ? (
          <p className="col-span-full text-sm text-muted-foreground">
            No queues yet. Run <code>npm run seed</code> on the backend.
          </p>
        ) : (
          queues.map((q) => {
              const Icon = iconFor(q.service.service_name);
              const busy = joining === q._id;
              return (
                <Card key={q._id} className="flex flex-col">
                  <CardHeader className="items-center text-center">
                    <Icon className="mx-auto h-8 w-8 text-primary" />
                    <CardTitle className="text-base">
                      {q.service.service_name}
                    </CardTitle>
                    <CardDescription className="text-xs line-clamp-2">
                      {q.service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {q.waiting_count} waiting
                      </span>
                      <span>· now #{q.current_token}</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      size="sm"
                      onClick={() => handleJoin(q._id, q.service.service_name)}
                      disabled={busy}
                    >
                      {busy && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Join
                    </Button>
                  </CardFooter>
                </Card>
              );
            })
        )}
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Join by ID</CardTitle>
            <CardDescription>
              Paste a queue ID provided by a service desk.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="grid gap-2">
              <Label htmlFor="queueId">Queue ID</Label>
              <Input
                id="queueId"
                placeholder="69f… mongo ObjectId"
                value={queueId}
                onChange={(e) => setQueueId(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="label">Label (optional)</Label>
              <Input
                id="label"
                placeholder="e.g. Bank A"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => handleJoin(queueId, label)}
              disabled={joining !== null}
              className="w-full"
            >
              {joining && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Join queue
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Saved queues</CardTitle>
            <CardDescription>Your recent joins.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {saved.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No saved queues yet.
              </p>
            )}
            {saved.map((q) => (
              <div
                key={q.queueId}
                className="flex items-center justify-between gap-2 rounded-md border p-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{q.label}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {q.queueId}
                  </div>
                </div>
                <Badge variant="outline" className="hidden sm:inline-flex">
                  saved
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleJoin(q.queueId, q.label)}
                  disabled={joining !== null}
                >
                  Join
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => handleRemove(q.queueId)}
                  aria-label="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
