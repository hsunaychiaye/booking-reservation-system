import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { AUTHORIZED_EMAILS } from "@/lib/constants";

export default auth((req) => {
  const pathname = req.nextUrl.pathname;

  if (pathname.startsWith("/api/auth")) return NextResponse.next();
  if (pathname === "/signin" || pathname === "/access-denied") {
    return NextResponse.next();
  }

  if (!req.auth?.user) {
    return NextResponse.redirect(new URL("/signin", req.nextUrl));
  }

  const email = req.auth.user.email;
  if (!email || !AUTHORIZED_EMAILS.includes(email as (typeof AUTHORIZED_EMAILS)[number])) {
    return NextResponse.redirect(new URL("/access-denied", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
