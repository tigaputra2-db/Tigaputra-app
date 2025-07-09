// File: app/dashboard/layout.tsx (Versi Diperbaiki untuk Hydration Error)

"use client";

import React, { useState, useEffect, JSX } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";
import Image from "next/image";

// Definisikan tipe untuk setiap link navigasi
type NavLink = {
  href: string;
  label: string;
  icon: JSX.Element;
};

// Komponen Ikon (SVG)
const DashboardIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="7" height="9" x="3" y="3" rx="1" />
    <rect width="7" height="5" x="14" y="3" rx="1" />
    <rect width="7" height="9" x="14" y="12" rx="1" />
    <rect width="7" height="5" x="3" y="16" rx="1" />
  </svg>
);
const PesananIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect width="8" height="4" x="8" y="2" rx="1" />
  </svg>
);
const ProduksiIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 16.9A7 7 0 0 1 5 16.9" />
    <path d="M12 12A3 3 0 1 1 9 9c0 1.66 1.34 3 3 3" />
    <path d="M12 12v10" />
    <path d="M12 2v4" />
    <path d="m4.93 4.93 2.83 2.83" />
    <path d="m16.24 16.24 2.83 2.83" />
    <path d="m4.93 19.07 2.83-2.83" />
    <path d="m16.24 7.76-2.83 2.83" />
  </svg>
);
const LaporanPenjualanIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 3.26a2 2 0 0 1 3 0l2.5 4.33a2 2 0 0 1 0 2.82l-2.5 4.33a2 2 0 0 1-3 0v-11.5Z" />
    <path d="M9 3.26a2 2 0 0 0-3 0l-2.5 4.33a2 2 0 0 0 0 2.82l2.5 4.33a2 2 0 0 0 3 0V3.26Z" />
    <path d="M3 12a9 9 0 0 0 18 0Z" />
  </svg>
);
const LaporanBahanIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21.25 12H2.75" />
    <path d="M11.25 5.25v13.5" />
    <path d="M5.25 5.25v13.5" />
    <path d="M17.25 5.25v13.5" />
  </svg>
);
const InventarisIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="16" height="20" x="4" y="2" rx="2" />
    <path d="M9 7h6" />
    <path d="M9 12h6" />
    <path d="M9 17h2" />
  </svg>
);
const PenerimaanIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
const PengeluaranIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="14" x="2" y="5" rx="2" />
    <line x1="2" x2="22" y1="10" y2="10" />
  </svg>
);
const PengaturanIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false); // <-- State baru

  // Efek ini hanya berjalan di sisi klien setelah komponen dimuat
  useEffect(() => {
    setIsClient(true);
  }, []);

  const navLinks: NavLink[] = [
    { href: "/dashboard", label: "Dasbor", icon: <DashboardIcon /> },
    { href: "/dashboard/pesanan", label: "Pesanan", icon: <PesananIcon /> },
    { href: "/dashboard/produksi", label: "Produksi", icon: <ProduksiIcon /> },
    {
      href: "/dashboard/laporan",
      label: "Laporan Penjualan",
      icon: <LaporanPenjualanIcon />,
    },
    {
      href: "/dashboard/laporan-bahan",
      label: "Laporan Bahan",
      icon: <LaporanBahanIcon />,
    },
    {
      href: "/dashboard/inventaris",
      label: "Inventaris",
      icon: <InventarisIcon />,
    },
    {
      href: "/dashboard/penerimaan",
      label: "Penerimaan",
      icon: <PenerimaanIcon />,
    },
    {
      href: "/dashboard/pengeluaran",
      label: "Pengeluaran",
      icon: <PengeluaranIcon />,
    },
  ];

  const settingsLink: NavLink = {
    href: "/dashboard/pengaturan",
    label: "Pengaturan",
    icon: <PengaturanIcon />,
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Toaster position="top-center" reverseOrder={false} />

      <aside className="w-64 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col">
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-200">
          <Image
            src="/3plogoonly.png"
            alt="Logo Tiga Putra"
            width={34}
            height={34}
            className="h-8 w-8.5 rounded-full"
            priority
          />
          <h2 className="text-xl font-bold text-slate-800">Tigaputra App</h2>
        </div>

        <nav className="flex-grow p-4">
          <ul>
            {navLinks.map((link) => {
              // --- PERBAIKAN LOGIKA DI SINI ---
              const isActive =
                isClient &&
                (pathname === link.href ||
                  pathname.startsWith(link.href + "/"));
              const isDashboardActive = isClient && pathname === "/dashboard";
              const finalIsActive =
                link.href === "/dashboard" ? isDashboardActive : isActive;

              return (
                <li key={link.href} className="mb-2">
                  <Link href={link.href}>
                    <span
                      className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        finalIsActive
                          ? "bg-blue-500 text-white font-semibold"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {link.icon}
                      {link.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-200">
          <ul>
            <li className="mb-2">
              <Link href={settingsLink.href}>
                <span
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    isClient && pathname.startsWith(settingsLink.href)
                      ? "bg-blue-500 text-white font-semibold"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {settingsLink.icon}
                  {settingsLink.label}
                </span>
              </Link>
            </li>
          </ul>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 p-3 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-semibold transition-colors mt-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" x2="9" y1="12" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8"></header>
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
