// middleware.ts
import { auth } from '@/auth';

export default auth((req) => {
  // Si el usuario no está autenticado y la ruta comienza con "/dashboard", redirige al inicio
  if (!req.auth && req.nextUrl.pathname.startsWith('/dashboard')) {
    const newUrl = new URL('/', req.nextUrl.origin);
    return Response.redirect(newUrl);
  }

  // Si el usuario está autenticado y la ruta es "/", redirige a "/dashboard"
  if (req.auth && req.nextUrl.pathname === '/') {
    const newUrl = new URL('/dashboard', req.nextUrl.origin);
    return Response.redirect(newUrl);
  }
});

// Configuración del matcher para proteger las rutas de "/dashboard" y redirigir desde "/"
export const config = {
  matcher: ['/dashboard/:path*', '/dashboard', '/'],
};
