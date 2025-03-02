'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold">
          PC Store AI
        </Link>

        {/* Navigation Tabs */}
        <div className="hidden md:flex space-x-6">
          <Link href="/categories" className="hover:text-gray-300 transition">Categories</Link>
          <Link href="/ai-assistant" className="hover:text-gray-300 transition">AI Assistant</Link>
          <Link href="/deals" className="hover:text-gray-300 transition">Deals</Link>
          <Link href="/new-arrivals" className="hover:text-gray-300 transition">New arrivals</Link>
          <Link href="/guides" className="hover:text-gray-300 transition">Guides</Link>
          <Link href="/contact" className="hover:text-gray-300 transition">Contact</Link>
        </div>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={toggleDropdown}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-800"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 text-gray-800">
              <Link href="/my-account" className="block px-4 py-2 hover:bg-gray-100">My Account</Link>
              <Link href="/cart" className="block px-4 py-2 hover:bg-gray-100">Cart</Link>
              <Link href="/my-orders" className="block px-4 py-2 hover:bg-gray-100">My Orders</Link>
              <Link href="/" className="block px-4 py-2 hover:bg-gray-100">Logout</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}