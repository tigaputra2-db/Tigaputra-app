// File: app/dashboard/pengaturan/pelanggan/page.tsx (Versi Baru dengan Tampilan Modern)

"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";

// Definisikan tipe data untuk pelanggan
type Customer = {
  id: string;
  name: string;
  phone: string | null;
  _count: {
    orders: number;
  };
};

export default function PelangganPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fungsi untuk mengambil data pelanggan
  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/customers");
      if (!res.ok) throw new Error("Gagal memuat data pelanggan.");
      const data = await res.json();
      setCustomers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Logika untuk memfilter pelanggan berdasarkan pencarian
  const filteredCustomers = useMemo(() => {
    if (!searchTerm) return customers;
    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.phone && customer.phone.includes(searchTerm))
    );
  }, [customers, searchTerm]);

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/dashboard/pengaturan"
          className="text-sm text-blue-600 hover:underline"
        >
          &larr; Kembali ke Pengaturan
        </Link>
        <div className="flex justify-between items-center mt-2">
          <h1 className="text-3xl font-bold text-slate-800">
            Manajemen Pelanggan
          </h1>
          <Link href="/dashboard/pengaturan/pelanggan/baru">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors">
              + Tambah Pelanggan
            </button>
          </Link>
        </div>
      </div>

      {/* Daftar Pelanggan */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800">Daftar Pelanggan</h2>
          <div className="w-full max-w-xs">
            <input
              type="text"
              placeholder="Cari Nama atau No. Telepon..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Nama Pelanggan
                </th>
                <th scope="col" className="px-6 py-3">
                  Nomor Telepon
                </th>
                <th scope="col" className="px-6 py-3">
                  Jumlah Pesanan
                </th>
                <th scope="col" className="px-6 py-3">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="text-center py-10">
                    Memuat data...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-red-500">
                    {error}
                  </td>
                </tr>
              ) : filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="bg-white border-b hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {customer.name}
                    </td>
                    <td className="px-6 py-4">{customer.phone || "-"}</td>
                    <td className="px-6 py-4">{customer._count.orders} kali</td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/pengaturan/pelanggan/${customer.id}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        Lihat Riwayat
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-10">
                    Tidak ada data pelanggan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
