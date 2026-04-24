import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AccessDeniedPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-6">
      <div className="w-full rounded-2xl border border-red-300/60 bg-[#111827]/80 p-8 text-center">
        <h1 className="text-3xl font-semibold text-[#FFEAEA]">Access Denied</h1>
        <p className="mt-3 text-[#FFEAEA]/80">
          This internal admin tool only allows pre-authorized emails.
        </p>
        <Button asChild className="mt-6">
          <Link href="/signin">Back to Sign In</Link>
        </Button>
      </div>
    </main>
  );
}
