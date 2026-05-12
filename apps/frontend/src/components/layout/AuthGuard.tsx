'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRoles?: ('ADMIN' | 'KASIR')[];
}

export default function AuthGuard({ children, requiredRoles }: AuthGuardProps) {
  const { token, user } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!token) {
      router.push('/login');
      return;
    }
    if (requiredRoles && user && !requiredRoles.includes(user.role)) {
      router.push('/dashboard');
    }
  }, [mounted, token, user, requiredRoles, router]);

  if (!mounted) return null;
  if (!token) return null;
  if (requiredRoles && user && !requiredRoles.includes(user.role)) return null;

  return <>{children}</>;
}
