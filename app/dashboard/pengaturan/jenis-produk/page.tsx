// File: app/dashboard/pengaturan/jenis-produk/page.tsx

"use client";

import React, { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

// Definisikan tipe data
type ProductType = {
  id: string;
  name: string;
  description: string | null;
  fieldDefinitions: any[]; // Untuk sementara kita gunakan any
};

export default function JenisProdukPage() {
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State untuk formulir tambah baru
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Fungsi untuk mengambil data
  const fetchProductTypes = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/product-types");
      if (!res.ok) throw new Error("Gagal memuat data jenis produk");
      const data = await res.json();
      setProductTypes(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProductTypes();
  }, []);

  // Fungsi untuk menangani submit formulir
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/product-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Gagal menambah jenis produk");
      }

      toast.success("Jenis produk baru berhasil ditambahkan!");
      // Bersihkan form dan muat ulang daftar
      setName("");
      setDescription("");
      fetchProductTypes();
    } catch (err: any) {
      toast.error(err.message);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
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
        <h1 className="text-3xl font-bold text-slate-800 mt-2">
          Pengaturan Jenis Produk
        </h1>
        <p className="text-slate-600 mt-1">
          Definisikan semua layanan atau produk yang Anda tawarkan di sini.
        </p>
      </div>

      {/* Formulir Tambah Jenis Produk */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          Tambah Jenis Produk Baru
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nama Jenis Produk
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Pesan Kaos Jadi"
              required
              className="w-full p-2 border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Deskripsi (Opsional)
            </label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Penjelasan singkat tentang jenis produk ini"
              className="w-full p-2 border border-slate-300 rounded-lg"
            />
          </div>
          {error && <p className="text-red-500 mt-2">{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
          >
            {isSubmitting ? "Menyimpan..." : "Tambah Jenis Produk"}
          </button>
        </form>
      </div>

      {/* Daftar Jenis Produk yang Ada */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          Daftar Jenis Produk
        </h2>
        <div className="space-y-3">
          {isLoading ? (
            <p>Memuat data...</p>
          ) : (
            productTypes.map((pt) => (
              <div
                key={pt.id}
                className="flex justify-between items-center p-4 bg-slate-50 rounded-lg border border-slate-200"
              >
                <div>
                  <h3 className="font-bold text-slate-800">{pt.name}</h3>
                  <p className="text-sm text-slate-500">
                    {pt.description || "Tidak ada deskripsi"}
                  </p>
                </div>
                <div>
                  <Link
                    href={`/dashboard/pengaturan/jenis-produk/${pt.id}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    Atur Kolom
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
