import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "./prisma";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
          include: {
            aiIdentity: true
          }
        });

        if (!user || !user?.password) {
          throw new Error("Invalid credentials");
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          hasAiIdentity: !!user.aiIdentity,
          aiEnabled: user.aiEnabled,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // On initial sign-in, populate token from the authorize result
      if (user) {
        token.id = user.id;
        token.hasAiIdentity = (user as any).hasAiIdentity;
        token.aiEnabled = (user as any).aiEnabled;
        token.name = user.name;
        token.email = user.email;
      }

      // Only re-fetch from DB if specifically triggered by an update
      // or if it's the initial sign in. This prevents exhausting DB connections
      // on every single page load/request.
      if (trigger === "update" && session?.name) {
        token.name = session.name;
        if (session.email) token.email = session.email;
      }

      // If we need to sync with DB for critical flags, do it sparingly
      // For now, we trust the token and only update when the user changes something.
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        (session.user as any).hasAiIdentity = token.hasAiIdentity;
        (session.user as any).aiEnabled = token.aiEnabled;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    newUser: "/register",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
