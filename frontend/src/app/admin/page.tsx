"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { adminApi, queueApi, type QueueListItem, type HistoryItem } from "@/lib/queue-api";
import { apiError } from "@/lib/api";
import { useQueueSocket } from "@/lib/socket";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowRight,
  ChevronsRight,
  UserX,
  Loader2,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import type { DailyStats } from "@/lib/types";

const QUEUE_KEY = "qm_admin_queue_id";

export default function AdminPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [queueId, setQueueId] = useState("");
  const [currentToken, setCurrentToken] = useState<number | null>(null);
  const [nowServingUser, setNowServingUser] = useState<{
    name: string;
    email: string;
  } | null>(null);
  const [stats, setStats] = useState<DailyStats | null>(null);
  const [busy, setBusy] = useState(false);
  const [userId, setUserId] = useState("");
  const [allQueues, setAllQueues] = useState<QueueListItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "admin") {
      toast.error("Admin only");
      router.replace("/");
      return;
    }
    const saved = localStorage.getItem(QUEUE_KEY);
    if (saved) setQueueId(saved);
    queueApi
      .list()
      .then(({ data }) => setAllQueues(data.queues))
      .catch(() => {});
  }, [user, loading, router]);

  useEffect(() => {
    if (queueId) localStorage.setItem(QUEUE_KEY, queueId);
  }, [queueId]);

  useQueueSocket(queueId, (p) => {
    setCurrentToken(p.current_token);
    if (p.now_serving_user !== undefined) {
      setNowServingUser(p.now_serving_user ?? null);
    }
  });

  const extractUser = (
    tok: { user?: unknown } | undefined | null
  ): { name: string; email: string } | null => {
    if (!tok || typeof tok !== "object") return null;
    const u = (tok as { user?: unknown }).user;
    if (u && typeof u === "object" && "name" in u && "email" in u) {
      const cast = u as { name: string; email: string };
      return { name: cast.name, email: cast.email };
    }
    return null;
  };

  const refreshStats = async () => {
    if (!queueId) return;
    try {
      const { data } = await adminApi.stats(queueId);
      setStats(data);
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  const handleCallNext = async () => {
    if (!queueId) return toast.error("Queue ID required");
    setBusy(true);
    try {
      const { data } = await adminApi.callNext(queueId);
      if (data.token) setCurrentToken(data.token.token_number);
      setNowServingUser(extractUser(data.token));
      toast.success(data.message);
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setBusy(false);
    }
  };

  const handleSkip = async () => {
    if (!queueId) return toast.error("Queue ID required");
    setBusy(true);
    try {
      const { data } = await adminApi.skip(queueId);
      if (data.token) setCurrentToken(data.token.token_number);
      setNowServingUser(extractUser(data.token));
      toast.success(data.message);
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setBusy(false);
    }
  };

  const handleReset = async () => {
    if (!queueId) return toast.error("Queue ID required");
    if (!confirm("Reset queue? All waiting tokens will be cancelled.")) return;
    setBusy(true);
    try {
      const { data } = await adminApi.reset(queueId);
      setCurrentToken(0);
      setNowServingUser(null);
      toast.success(data.message);
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setBusy(false);
    }
  };

  const loadHistory = async () => {
    if (!queueId) return toast.error("Queue ID required");
    try {
      const { data } = await adminApi.history(queueId);
      setHistory(data.history);
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  const handleBlacklist = async () => {
    if (!userId) return toast.error("User ID required");
    setBusy(true);
    try {
      const { data } = await adminApi.blacklist(userId);
      toast.success(data.message);
      setUserId("");
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setBusy(false);
    }
  };

  if (loading || !user || user.role !== "admin") {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-20 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Admin Console</h1>
        <p className="text-muted-foreground">
          Control the queue, manage users, view daily stats.
        </p>
      </header>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Active queue</CardTitle>
          <CardDescription>
            Pick a queue to control, or paste an ID.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {allQueues.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {allQueues.map((q) => (
                <Button
                  key={q._id}
                  size="sm"
                  variant={queueId === q._id ? "default" : "outline"}
                  onClick={() => setQueueId(q._id)}
                >
                  {q.service.service_name}
                </Button>
              ))}
            </div>
          )}
          <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
            <Input
              id="queueId"
              placeholder="Mongo ObjectId of queue"
              value={queueId}
              onChange={(e) => setQueueId(e.target.value)}
            />
            <Button
              variant="outline"
              onClick={refreshStats}
              disabled={!queueId}
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Stats
            </Button>
            <Button
              variant="destructive"
              onClick={handleReset}
              disabled={busy || !queueId}
            >
              <RotateCcw className="mr-2 h-4 w-4" /> Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="control">
        <TabsList>
          <TabsTrigger value="control">Control</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="control" className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Now serving</CardTitle>
              <CardDescription>Live current token.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-6xl font-bold tabular-nums">
                  {currentToken !== null ? `#${currentToken}` : "—"}
                </div>
                {nowServingUser && (
                  <div className="mt-3 text-sm">
                    <div className="font-medium">{nowServingUser.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {nowServingUser.email}
                    </div>
                  </div>
                )}
                <Badge variant="outline" className="mt-3">
                  {queueId ? "Listening for updates" : "Set queue ID first"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>Advance or skip the queue.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Button onClick={handleCallNext} disabled={busy || !queueId}>
                <ArrowRight className="mr-2 h-4 w-4" /> Call next token
              </Button>
              <Button
                variant="outline"
                onClick={handleSkip}
                disabled={busy || !queueId}
              >
                <ChevronsRight className="mr-2 h-4 w-4" /> Skip current
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Blacklist toggle</CardTitle>
              <CardDescription>
                Toggle blacklist for a user by Mongo ID.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Label htmlFor="uid">User ID</Label>
              <Input
                id="uid"
                placeholder="Mongo ObjectId of user"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
            </CardContent>
            <CardFooter>
              <Button
                variant="destructive"
                onClick={handleBlacklist}
                disabled={busy}
              >
                <UserX className="mr-2 h-4 w-4" /> Toggle blacklist
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>Daily stats</CardTitle>
              <CardDescription>Today&apos;s queue performance.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Stat
                label="Total served"
                value={stats ? String(stats.totalServed) : "—"}
              />
              <Stat
                label="Avg wait (min)"
                value={stats ? String(stats.avgWaitTimeMins) : "—"}
              />
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                onClick={refreshStats}
                disabled={!queueId}
              >
                <RefreshCw className="mr-2 h-4 w-4" /> Refresh
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Queue history</CardTitle>
              <CardDescription>Last 100 tokens for this queue.</CardDescription>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No history loaded yet.
                </p>
              ) : (
                <div className="overflow-x-auto rounded border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40 text-left">
                      <tr>
                        <th className="px-3 py-2">#</th>
                        <th className="px-3 py-2">User</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((h) => (
                        <tr key={h._id} className="border-t">
                          <td className="px-3 py-2 tabular-nums">
                            #{h.token_number}
                          </td>
                          <td className="px-3 py-2">
                            {typeof h.user === "string"
                              ? h.user
                              : h.user?.name || "—"}
                          </td>
                          <td className="px-3 py-2">
                            <Badge variant="outline">{h.status}</Badge>
                          </td>
                          <td className="px-3 py-2 text-muted-foreground">
                            {new Date(h.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                onClick={loadHistory}
                disabled={!queueId}
              >
                <RefreshCw className="mr-2 h-4 w-4" /> Load history
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card p-4 text-center">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-3xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}
