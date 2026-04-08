import { createServerClient } from '@supabase/ssr';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * DELETE /api/account/delete
 * Supprime le compte de l'utilisateur connecté et toutes ses données (RGPD).
 * Les données profiles/structures/vacations sont supprimées en cascade (ON DELETE CASCADE).
 */
export async function DELETE() {
  const cookieStore = await cookies();

  // Client standard — vérifier la session
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  // Client admin (service_role) nécessaire pour deleteUser
  // SUPABASE_SERVICE_ROLE_KEY est une variable serveur (pas NEXT_PUBLIC_)
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);

  if (error) {
    console.error('Erreur suppression compte:', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
