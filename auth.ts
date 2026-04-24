import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { AUTHORIZED_EMAILS } from "@/lib/constants";

const INTERNAL_LOGIN_EMAIL = "testing@gmail.com";
const INTERNAL_LOGIN_PASSWORD = "11111111";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET ?? "dev-only-secret-change-me",
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      name: "Internal Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize(credentials) {
        const email = String(credentials?.email ?? "")
          .trim()
          .toLowerCase();
        const password = String(credentials?.password ?? "");

        if (email === INTERNAL_LOGIN_EMAIL && password === INTERNAL_LOGIN_PASSWORD) {
          return {
            id: "internal-admin",
            email,
            name: "Internal Admin",
          };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/signin",
    error: "/access-denied",
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      return AUTHORIZED_EMAILS.includes(user.email as (typeof AUTHORIZED_EMAILS)[number]);
    },
    async session({ session }) {
      return session;
    },
  },
  trustHost: true,
});
