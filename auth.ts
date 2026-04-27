import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { ADMIN_CREDENTIALS, isAuthorizedEmail, normalizeEmail } from "@/lib/constants";

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
        const email = normalizeEmail(String(credentials?.email ?? ""));
        const password = String(credentials?.password ?? "");

        if (isAuthorizedEmail(email) && ADMIN_CREDENTIALS[email as keyof typeof ADMIN_CREDENTIALS] === password) {
          return {
            id: email,
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
      return isAuthorizedEmail(user.email);
    },
    async jwt({ token, user }) {
      if (user?.email) {
        token.email = normalizeEmail(user.email);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.email) {
        session.user.email = normalizeEmail(String(token.email));
      }
      return session;
    },
  },
  trustHost: true,
});
