// File: app/dashboard/pengaturan/alur-kerja/page.tsx (Dengan Fungsi Hapus)

"use client";

import React, { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

// Definisikan tipe data untuk status
type ProductionStatus = {
  id: string;
  name: string;
  order: number;
};

export default function AlurKerjaPage() {
  const [statuses, setStatuses] = useState<ProductionStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [name, setName] = useState("");
  const [order, setOrder] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Fungsi untuk mengambil data status
  const fetchStatuses = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/production-statuses");
      if (!res.ok) throw new Error("Gagal memuat data status");
      const data = await res.json();
      setStatuses(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, []);

  // Fungsi untuk menangani submit formulir tambah
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/production-statuses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, order }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Gagal menambah status");
      }
      toast.success("Status baru berhasil ditambahkan!");
      setName("");
      setOrder(0);
      fetchStatuses();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- FUNGSI BARU UNTUK HAPUS ---
  const handleDelete = async (statusId: string, statusName: string) => {
    if (!window.confirm(`Anda yakin ingin menghapus status "${statusName}"?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/production-statuses/${statusId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Gagal menghapus status");
      }
      toast.success("Status berhasil dihapus.");
      fetchStatuses(); // Muat ulang daftar setelah berhasil menghapus
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/dashboard/pengaturan"
          className="text-sm text-blue-600 hover:underline"
        >
          &larr; Kembali ke Pengaturan
        </Link>
        <h1 className="text-3xl font-bold text-slate-800">
          Pengaturan Alur Kerja Produksi
        </h1>
      </div>

      {/* Formulir Tambah Status */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          Tambah Status Baru
        </h2>
        <form onSubmit={handleSubmit} className="flex items-end gap-4">
          <div className="flex-grow">
            <label className="text-sm font-medium text-slate-600">
              Nama Status
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Proses Jahit"
              required
              className="w-full p-2 border rounded mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600">
              Nomor Urut
            </label>
            <input
              type="number"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
              required
              className="w-24 p-2 border rounded mt-1"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300 h-10"
          >
            {isSubmitting ? "..." : "Tambah"}
          </button>
        </form>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      {/* Daftar Status yang Ada */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          Daftar Status Saat Ini
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Urutan
                </th>
                <th scope="col" className="px-6 py-3">
                  Nama Status
                </th>
                <th scope="col" className="px-6 py-3">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="text-center py-10">
                    Memuat data...
                  </td>
                </tr>
              ) : (
                statuses.map((status) => (
                  <tr
                    key={status.id}
                    className="bg-white border-b hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">{status.order}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {status.name}
                    </td>
                    <td className="px-6 py-4">
                      {/* Nanti kita tambahkan fungsi Edit & Hapus di sini */}
                      <button className="font-medium text-red-500 hover:underline">
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
