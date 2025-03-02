'use client';
import { useState } from 'react';
import Link from 'next/link';
import { NAVIGATION_TABS, DROPDOWN_TABS } from '@/constants/navigationTabs.js';

export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const renderNavigationTabs = () => {
    return NAVIGATION_TABS.map(({ id, href, label }) => (
      <Link className="text-neutral-600 hover:text-neutral-900 transition" key={id} href={href}>
        {label}
      </Link>
    ));
  };

  const renderDropdownTabs = () => {
    return DROPDOWN_TABS.map(({ id, href, label }) => (
      <Link className="block px-4 py-2 hover:bg-gray-100" key={id} href={href}>
        {label}
      </Link>
    ));
  };

  return (
    <nav className="bg-white relative text-white p-5 rounded-b-lg w-4/5 mx-auto">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="text-xl font-semibold text-neutral-900">
          PC Store AI
        </Link>
        <div className="hidden md:flex space-x-6">{renderNavigationTabs()}</div>
        {/* User Dropdown */}
        <div className="relative">
          <button onClick={toggleDropdown} className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6  text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
          {isDropdownOpen && <div className="absolute right-0 mt-2 w-48 bg-white rounded-md border border-gray-300 shadow-2xl py-1 text-gray-800">{renderDropdownTabs()}</div>}
        </div>
      </div>
    </nav>
  );
}
