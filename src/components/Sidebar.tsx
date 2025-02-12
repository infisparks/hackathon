// components/Sidebar.tsx
"use client";

import Link from "next/link";

export default function Sidebar() {
  return (
    <div className="h-screen w-64 bg-blue-800 text-white flex flex-col">
      <div className="p-6 text-2xl font-bold border-b border-blue-700">
        Hospital Dashboard
      </div>
      <nav className="flex flex-col p-4 space-y-2">
        <Link
          href="/"
          className="hover:bg-blue-700 px-3 py-2 rounded-md transition-colors"
        >
          Home
        </Link>
        <Link
          href="/opd-booking"
          className="hover:bg-blue-700 px-3 py-2 rounded-md transition-colors"
        >
          OPD Booking
        </Link>
        <Link
          href="/add-doctor"
          className="hover:bg-blue-700 px-3 py-2 rounded-md transition-colors"
        >
          Add Doctor
        </Link>
        {/* Add more navigation links as needed */}
      </nav>
    </div>
  );
}
