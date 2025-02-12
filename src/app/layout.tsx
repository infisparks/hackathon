// app/layout.tsx
"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebaseconfig";
import Sidebar from "@/components/Sidebar";
import 'regenerator-runtime/runtime';

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Subscribe to authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // If not logged in and not already on login/register pages, redirect to login
      if (!user && pathname !== "/login" && pathname !== "/register") {
        router.push("/login");
      }
      // If logged in and trying to access login or register, redirect to home
      if (user && (pathname === "/login" || pathname === "/register")) {
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, [pathname, router]);

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="min-h-screen flex">
          <Sidebar />
          <div className="flex-1 p-4">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
