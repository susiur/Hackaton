import { NextAuthConfig } from 'next-auth';
import Auth0 from 'next-auth/providers/auth0';

// Define los tipos para extender la sesión y el usuario
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    };
  }
}

export default {
  providers: [Auth0],
  callbacks: {
    session: async ({ session, token }) => {
      if (session?.user) {
        session.user.id = token.sub as string; // El sub del token contiene el ID del usuario
      }
      return session;
    },
    jwt: async ({ token, user }) => {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  session: {
    strategy: 'jwt',
  },
} satisfies NextAuthConfig;
