// components/Sidebar.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LayoutDashboard, Calendar, User, LogOut } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export default function Sidebar() {
  // State to control sidebar open/close
  const [isOpen, setIsOpen] = useState(false);
  // Determine if viewport is mobile (<768px)
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Set isMobile based on window width and open sidebar by default on desktop
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsOpen(true);
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Toggle sidebar open/close
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Define your navigation items
  const navItems = [
    { title: "Home", href: "/", icon: <LayoutDashboard size={20} /> },
    { title: "OPD Booking", href: "/opd", icon: <Calendar size={20} /> },
    { title: "Add Doctor", href: "/doctor", icon: <User size={20} /> },
    // Add more navigation items as needed
  ];

  // Framer Motion variants for sidebar slide-in/out
  const sidebarVariants = {
    open: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    closed: { x: "-100%", transition: { type: "spring", stiffness: 300, damping: 30 } },
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <AnimatePresence>
        {isMobile && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-full shadow-lg md:hidden"
            onClick={toggleSidebar}
            aria-label="Toggle Sidebar"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        className="fixed top-0 left-0 h-screen w-64 bg-blue-800 text-white shadow-xl z-40 flex flex-col"
        aria-label="Sidebar Navigation"
      >
        {/* Sidebar Header */}
        <div className="p-6 text-2xl font-bold border-b border-blue-700">
          Hospital Dashboard
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.title}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-md transition-colors hover:bg-blue-700 ${
                  active ? "bg-blue-700" : ""
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.title}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-blue-700">
          <button
            onClick={() => router.push("/login")}
            className="flex items-center w-full px-3 py-2 rounded-md transition-colors hover:bg-blue-700"
          >
            <LogOut size={20} className="mr-2" />
            Logout
          </button>
        </div>
      </motion.aside>

      {/* Overlay for Mobile */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={toggleSidebar}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
    </>
  );
}
