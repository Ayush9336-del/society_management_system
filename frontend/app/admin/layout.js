'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { getAuth } from '@/lib/auth';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/admin/login') return;
    const auth = getAuth();
    if (!auth || auth.user?.role !== 'admin') {
      router.push('/admin/login');
    }
  }, [router, pathname]);

  if (pathname === '/admin/login') return children;

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAdmin={true} />
      <main className="max-w-screen-xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
