'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { setAuth } from '@/lib/auth';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const userStr = searchParams.get('user');

    if (!token || !userStr) {
      router.push('/login?error=auth_failed');
      return;
    }

    try {
      const user = JSON.parse(decodeURIComponent(userStr));
      setAuth(token, user);
      router.push(user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
    } catch {
      router.push('/login?error=auth_failed');
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-gray-500 text-sm">Signing you in...</p>
    </div>
  );
}
