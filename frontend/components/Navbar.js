'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getAuth, clearAuth } from '@/lib/auth';
import {
  LayoutDashboard, Building2, CreditCard, FileText,
  DollarSign, BarChart3, Bell, User, LogOut, Menu, X
} from 'lucide-react';

const adminLinks = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/flats', label: 'Flats', icon: Building2 },
  { href: '/admin/subscriptions', label: 'Plans', icon: CreditCard },
  { href: '/admin/monthly-records', label: 'Records', icon: FileText },
  { href: '/admin/payment-entry', label: 'Payments', icon: DollarSign },
  { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { href: '/admin/notifications', label: 'Notify', icon: Bell },
];

const userLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/subscriptions', label: 'History', icon: CreditCard },
  { href: '/pay-now', label: 'Pay Now', icon: DollarSign },
];

export default function Navbar({ isAdmin = false }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    if (auth) setUser(auth.user);
  }, []);

  const links = isAdmin ? adminLinks : userLinks;

  const handleLogout = () => {
    clearAuth();
    router.push(isAdmin ? '/admin/login' : '/login');
  };

  return (
    <nav className="bg-primary text-white shadow-lg min-h-20">
      {/* Top bar */}
      <div className="max-w-screen-xl mx-auto px-4 h-16 flex items-center justify-between ">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center font-bold text-sm">
            S
          </div>
          <div>
            <p className="font-semibold text-sm leading-none">Society Manager</p>
            <p className="text-white/60 text-xs">{isAdmin ? 'Admin' : 'Resident'}</p>
          </div>
        </div>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active ? 'bg-accent text-white' : 'text-white/80 hover:bg-white/10'
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          {/* Switch portal if admin */}
          {user?.role === 'admin' && (
            <button
              onClick={() => router.push(isAdmin ? '/dashboard' : '/admin/dashboard')}
              className="text-xs px-3 py-1.5 border border-white/30 rounded-lg hover:bg-white/10 transition-colors"
            >
              {isAdmin ? 'Resident View' : 'Admin View'}
            </button>
          )}

          {/* Profile link */}
          <Link
            href={isAdmin ? '/admin/profile' : '/profile'}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              pathname.includes('/profile') ? 'bg-accent' : 'text-white/80 hover:bg-white/10'
            }`}
          >
            <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center text-xs font-bold">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="text-sm">{user?.name?.split(' ')[0]}</span>
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/80 hover:bg-white/10 transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 hover:bg-white/10 rounded-lg"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/10 px-4 py-3 space-y-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active ? 'bg-accent text-white' : 'text-white/80 hover:bg-white/10'
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}

          <Link
            href={isAdmin ? '/admin/profile' : '/profile'}
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/80 hover:bg-white/10"
          >
            <User size={16} />
            Profile
          </Link>

          {user?.role === 'admin' && (
            <button
              onClick={() => { router.push(isAdmin ? '/dashboard' : '/admin/dashboard'); setMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/80 hover:bg-white/10"
            >
              <LayoutDashboard size={16} />
              {isAdmin ? 'Resident View' : 'Admin View'}
            </button>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/80 hover:bg-white/10"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
