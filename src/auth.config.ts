import { NextAuthConfig } from 'next-auth';
import Auth0 from 'next-auth/providers/auth0';

/* 
export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Auth0],
  session: {
    strategy: "jwt" 
  }
});
 */
export default {
  providers: [Auth0],
  session: {
    strategy: 'jwt', // Usa JWT en lugar de sesiones de base de datos para la compatibilidad con Edge
  },
} satisfies NextAuthConfig;
