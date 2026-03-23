'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { getAuth } from '@/lib/auth';

export default function UserLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/login') return;
    const auth = getAuth();
    if (!auth) {
      router.push('/login');
    }
  }, [router, pathname]);
 
  if (pathname === '/login') return children;

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAdmin={false} />
      <main className="max-w-screen-xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
