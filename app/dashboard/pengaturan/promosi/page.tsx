// File: app/dashboard/pengaturan/promosi/page.tsx (Dengan Fungsi Hapus)

"use client";

import React, { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

// Definisikan tipe data
type Promotion = {
  id: string;
  name: string;
  description: string | null;
  type: string;
  value: number;
  isActive: boolean;
};

export default function PromosiPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("PERCENTAGE");
  const [value, setValue] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchPromotions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/promotions");
      if (!res.ok) throw new Error("Gagal memuat data promosi");
      const data = await res.json();
      setPromotions(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, type, value }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Gagal menambah promosi");
      }
      toast.success("Promosi baru berhasil ditambahkan!");
      setName("");
      setDescription("");
      setType("PERCENTAGE");
      setValue(0);
      fetchPromotions();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- FUNGSI BARU UNTUK HAPUS ---
  const handleDelete = async (promoId: string, promoName: string) => {
    if (!window.confirm(`Anda yakin ingin menghapus promosi "${promoName}"?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/promotions/${promoId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Gagal menghapus promosi");
      }
      toast.success("Promosi berhasil dihapus.");
      fetchPromotions(); // Muat ulang daftar setelah berhasil menghapus
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
          Pengelolaan Promosi & Diskon
        </h1>
      </div>

      {/* Formulir Tambah Promosi */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          Tambah Promosi Baru
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama Promosi (e.g., Diskon Lebaran)"
              required
              className="p-2 border rounded"
            />
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi (Opsional)"
              className="p-2 border rounded"
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="PERCENTAGE">Persentase (%)</option>
              <option value="FIXED_AMOUNT">Potongan Harga (Rp)</option>
            </select>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              placeholder="Nilai (e.g., 15 atau 20000)"
              required
              className="p-2 border rounded"
            />
          </div>
          {error && <p className="text-red-500 mt-2">{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            {isSubmitting ? "Menyimpan..." : "Tambah Promosi"}
          </button>
        </form>
      </div>

      {/* Daftar Promosi */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          Daftar Promosi Aktif
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Nama Promosi
                </th>
                <th scope="col" className="px-6 py-3">
                  Tipe
                </th>
                <th scope="col" className="px-6 py-3">
                  Nilai
                </th>
                <th scope="col" className="px-6 py-3">
                  Status
                </th>
                <th scope="col" className="px-6 py-3">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10">
                    Memuat data...
                  </td>
                </tr>
              ) : (
                promotions.map((promo) => (
                  <tr
                    key={promo.id}
                    className="bg-white border-b hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {promo.name}
                    </td>
                    <td className="px-6 py-4">
                      {promo.type === "PERCENTAGE"
                        ? "Persentase"
                        : "Potongan Harga"}
                    </td>
                    <td className="px-6 py-4">
                      {promo.type === "PERCENTAGE"
                        ? `${promo.value}%`
                        : `Rp ${promo.value.toLocaleString("id-ID")}`}
                    </td>
                    <td className="px-6 py-4">
                      {promo.isActive ? "Aktif" : "Tidak Aktif"}
                    </td>
                    <td className="px-6 py-4">
                      {/* --- TOMBOL HAPUS SEKARANG BERFUNGSI --- */}
                      <button
                        onClick={() => handleDelete(promo.id, promo.name)}
                        className="font-medium text-red-500 hover:underline"
                      >
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
