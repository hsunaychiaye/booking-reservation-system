import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SeatingChart } from "@/components/SeatingChart";
import { SignOutButton } from "@/components/sign-out-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { AUTHORIZED_EMAILS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

function tableSorter(a: { id: string }, b: { id: string }) {
  const [, prefixA, numA] = a.id.match(/^([AB])(\d+)$/) ?? [];
  const [, prefixB, numB] = b.id.match(/^([AB])(\d+)$/) ?? [];
  if (prefixA !== prefixB) return (prefixA ?? "").localeCompare(prefixB ?? "");
  return Number(numA ?? 0) - Number(numB ?? 0);
}

export default async function HomePage() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) redirect("/signin");
  if (!AUTHORIZED_EMAILS.includes(email as (typeof AUTHORIZED_EMAILS)[number])) {
    redirect("/access-denied");
  }

  let tables: Awaited<ReturnType<typeof prisma.table.findMany>> = [];
  let dbError = "";

  try {
    tables = await prisma.table.findMany({
      include: {
        reservation: true,
      },
    });
    tables.sort(tableSorter);
  } catch (error) {
    dbError =
      error instanceof Error
        ? error.message
        : "Database is unavailable. Please check DATABASE_URL and PostgreSQL status.";
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 md:px-8">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#9ECAD6]/60 bg-[#1f2937]/80 p-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#FFEAEA]">Seat Reservation Dashboard</h1>
          <p className="text-sm text-[#FFEAEA]/70">Internal Admin Tool</p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <SignOutButton />
        </div>
      </header>

      {dbError ? (
        <section className="rounded-xl border border-red-300/60 bg-red-500/10 p-4 text-sm text-red-100">
          <p className="font-semibold">Database connection error</p>
          <p className="mt-2">The app cannot reach PostgreSQL at `localhost:5432`.</p>
          <p className="mt-2">
            Start PostgreSQL, confirm `DATABASE_URL` in `.env`, then refresh this page.
          </p>
        </section>
      ) : (
        <SeatingChart tables={tables} />
      )}
    </main>
  );
}
