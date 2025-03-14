'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { NAVIGATION_TABS, DROPDOWN_TABS } from '@/constants/navigationTabs.js';
import type { NavigationTab, DropdownTab } from '@/constants/navigationTabs.js';
import { useRouter } from 'next/navigation';

interface User {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  id: string;
}

export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const renderNavigationTabs = () => {
    return NAVIGATION_TABS.map(({ id, href, label }: NavigationTab) => (
      <Link className="text-neutral-600 hover:text-neutral-900 transition" key={id} href={href}>
        {label}
      </Link>
    ));
  };

  const renderDropdownTabs = () => {
    const tabs = [...DROPDOWN_TABS] as DropdownTab[];

    if (tabs.length > 0) {
      const lastTab = tabs[tabs.length - 1];
      if (lastTab.label === 'Logout') {
        tabs.pop();
        tabs.push({
          id: lastTab.id,
          href: '#',
          label: 'Logout',
          onClick: handleLogout,
        });
      }
    }

    return tabs.map(({ id, href, label, onClick }: DropdownTab) =>
      onClick ? (
        <button key={id} onClick={onClick} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
          {label}
        </button>
      ) : (
        <Link className="block px-4 py-2 hover:bg-gray-100" key={id} href={href}>
          {label}
        </Link>
      ),
    );
  };

  return (
    <nav className="bg-white relative text-white p-5 rounded-b-lg w-4/5 mx-auto">
      <div className="w-full mx-auto flex items-center justify-between">
        <Link href="/" className="text-xl font-semibold text-neutral-900">
          PC Store AI
        </Link>
        <div className="hidden md:flex space-x-6">{renderNavigationTabs()}</div>

        {/* User Dropdown or Login Button */}
        <div className="relative">
          {!loading &&
            (user ? (
              <>
                <button onClick={toggleDropdown} className="flex items-center space-x-2 cursor-pointer">
                  <span className="text-gray-800">{`${user.firstName} ${user.lastName}`}</span>
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </button>
                {isDropdownOpen && <div className="absolute right-0 mt-2 w-48 bg-white rounded-md border border-gray-300 shadow-2xl py-1 text-gray-800">{renderDropdownTabs()}</div>}
              </>
            ) : (
              <Link href="/auth/login" className="px-4 py-2 bg-black text-white rounded-md hover:bg-slate-800 hover:cursor-pointer transition">
                Login
              </Link>
            ))}
        </div>
      </div>
    </nav>
  );
}
