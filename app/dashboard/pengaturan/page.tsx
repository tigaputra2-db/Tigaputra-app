// File: app/dashboard/pengaturan/page.tsx

"use client";

import React, { JSX } from "react";
import Link from "next/link";

// Definisikan tipe untuk setiap kartu pengaturan
type SettingCardProps = {
  href: string;
  title: string;
  description: string;
  icon: JSX.Element;
};

// Komponen untuk setiap kartu
const SettingCard = ({ href, title, description, icon }: SettingCardProps) => (
  <Link href={href}>
    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all h-full">
      <div className="flex items-center gap-4 mb-3">
        <div className="bg-slate-100 p-3 rounded-full">{icon}</div>
        <h3 className="text-lg font-bold text-slate-800">{title}</h3>
      </div>
      <p className="text-sm text-slate-600">{description}</p>
    </div>
  </Link>
);

// Ikon untuk setiap kartu
const KaryawanIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
  </svg>
);
const SupplierIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8Z" />
    <circle cx="6" cy="12" r="2" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);
const PelangganIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const AlurKerjaIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 12h2" />
    <path d="M7 12h2" />
    <path d="M12 2v2" />
    <path d="M12 7v2" />
    <path d="M17 12h2" />
    <path d="M22 12h-2" />
    <path d="M12 17v2" />
    <path d="M12 22v-2" />
    <circle cx="12" cy="12" r="5" />
  </svg>
);

export default function PengaturanPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 mb-8">
        Pengaturan Aplikasi
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SettingCard
          href="/dashboard/pengaturan/karyawan"
          title="Manajemen Karyawan"
          description="Tambah, lihat, dan kelola akun karyawan yang dapat mengakses aplikasi ini."
          icon={<KaryawanIcon />}
        />
        <SettingCard
          href="/dashboard/pengaturan/supplier"
          title="Manajemen Supplier"
          description="Kelola daftar semua pemasok bahan baku untuk toko Anda."
          icon={<SupplierIcon />}
        />
        <SettingCard
          href="/dashboard/pengaturan/pelanggan"
          title="Manajemen Pelanggan"
          description="Lihat daftar semua pelanggan dan riwayat transaksi mereka."
          icon={<PelangganIcon />}
        />
        <SettingCard
          href="/dashboard/pengaturan/jenis-produk"
          title="Jenis Produk"
          description="Mengatur jenis produk layanan beserta detailnya."
          icon={<AlurKerjaIcon />}
        />
        <SettingCard
          href="/dashboard/pengaturan/alur-kerja"
          title="Alur Kerja"
          description="Mengatur alur kerja pada produksi"
          icon={<AlurKerjaIcon />}
        />
        <SettingCard
          href="/dashboard/pengaturan/promosi"
          title="Promosi"
          description="Mengatur promosi aktif pada toko"
          icon={<AlurKerjaIcon />}
        />
      </div>
    </div>
  );
}
