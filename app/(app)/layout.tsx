import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { BottomNavbar, Sidebar } from '@/components/layout/Navbar';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-subtle)]">
      {/* Sidebar desktop */}
      <Sidebar />

      {/* Contenu principal */}
      <main className="md:ml-60 pb-20 md:pb-0 min-h-screen">
        {children}
      </main>

      {/* Navbar bottom mobile */}
      <BottomNavbar />
    </div>
  );
}
