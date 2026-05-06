import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Building2,
  Stethoscope,
  Landmark,
  Bell,
  Activity,
  ShieldCheck,
} from "lucide-react";

const services = [
  { icon: Building2, name: "Bank", desc: "Skip teller lines" },
  { icon: Stethoscope, name: "Hospital", desc: "Reserve your slot" },
  { icon: Landmark, name: "Government", desc: "No more standing" },
];

const features = [
  {
    icon: Activity,
    title: "Live updates",
    desc: "Realtime position via WebSocket.",
  },
  {
    icon: Bell,
    title: "Smart alerts",
    desc: "Toast notifications when your turn nears.",
  },
  {
    icon: ShieldCheck,
    title: "Secure JWT auth",
    desc: "Customer and admin role separation.",
  },
];

export default function Home() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <section className="grid gap-8 py-12 lg:grid-cols-2 lg:items-center">
        <div className="space-y-6">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Skip the line. <br />
            Track the queue.
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            Smart Queue Management for banks, hospitals, and government
            services. Join from your phone, watch your token in real time.
          </p>
          <div className="flex gap-3">
            <Link
              href="/services"
              className={buttonVariants({ size: "lg" })}
            >
              Browse services
            </Link>
            <Link
              href="/register"
              className={buttonVariants({ size: "lg", variant: "outline" })}
            >
              Create account
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {services.map((s) => (
            <Card
              key={s.name}
              className="border-dashed transition hover:border-solid hover:shadow-md"
            >
              <CardHeader className="items-center text-center">
                <s.icon className="mx-auto h-8 w-8 text-primary" />
                <CardTitle className="text-base">{s.name}</CardTitle>
                <CardDescription>{s.desc}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-4 py-12 sm:grid-cols-3">
        {features.map((f) => (
          <Card key={f.title}>
            <CardHeader>
              <f.icon className="h-6 w-6 text-primary" />
              <CardTitle className="mt-2">{f.title}</CardTitle>
              <CardDescription>{f.desc}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>
    </div>
  );
}
