import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { pathname } = request.nextUrl;

    // Routes publiques exactes — pas de redirection
    const publicRoutes = ['/login', '/register', '/forgot-password', '/', '/reset-password'];
    const isPublicRoute = publicRoutes.some(
      (r) => pathname === r || (r !== '/' && pathname.startsWith(r))
    );

    // Utilisateur non connecté → rediriger vers login (sauf routes publiques)
    if (!user && !isPublicRoute) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    // Utilisateur connecté sur page auth → rediriger vers dashboard
    if (user && (pathname === '/login' || pathname === '/register')) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  } catch {
    // Si Supabase est inaccessible, on laisse passer sans bloquer
    return NextResponse.next({ request });
  }

  return supabaseResponse;
}
