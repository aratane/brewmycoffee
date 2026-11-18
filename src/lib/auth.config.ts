import type { NextAuthConfig } from "next-auth";
import type { RoleName } from "@prisma/client";

// Edge-safe config: no database or Node-only imports here.
export default {
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  trustHost: true,
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id ?? "";
        token.role = ((user as { role?: RoleName }).role ?? "CUSTOMER") as RoleName;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as RoleName;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
