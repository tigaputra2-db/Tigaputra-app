// File: app/dashboard/pengaturan/jenis-produk/[id]/page.tsx (Dengan Fungsi Hapus)

"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

// Definisikan tipe data
type FieldDefinition = {
  id: string;
  label: string;
  name: string;
  type: string;
  order: number;
};

type ProductTypeDetail = {
  id: string;
  name: string;
  description: string | null;
  fieldDefinitions: FieldDefinition[];
};

export default function AturKolomPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [productType, setProductType] = useState<ProductTypeDetail | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  // State untuk formulir tambah kolom baru
  const [label, setLabel] = useState("");
  const [type, setType] = useState("TEXT");
  const [options, setOptions] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Fungsi untuk mengambil data jenis produk dan kolomnya
  const fetchProductTypeDetail = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/product-types/${id}`);
      if (!res.ok) throw new Error("Gagal memuat detail jenis produk");
      const data = await res.json();
      setProductType(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProductTypeDetail();
  }, [id]);

  // Fungsi untuk menangani submit formulir tambah kolom
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/field-definitions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label,
          name: label.toLowerCase().replace(/\s+/g, "_"),
          type,
          options:
            type === "DROPDOWN"
              ? options.split(",").map((opt) => opt.trim())
              : [],
          productTypeId: id,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Gagal menambah kolom");
      }

      toast.success("Kolom baru berhasil ditambahkan!");
      setLabel("");
      setType("TEXT");
      setOptions("");
      fetchProductTypeDetail();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- FUNGSI BARU UNTUK HAPUS ---
  const handleDelete = async (fieldId: string, fieldLabel: string) => {
    if (!window.confirm(`Anda yakin ingin menghapus kolom "${fieldLabel}"?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/field-definitions/${fieldId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Gagal menghapus kolom");
      }
      toast.success("Kolom berhasil dihapus.");
      fetchProductTypeDetail(); // Muat ulang daftar setelah berhasil menghapus
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    }
  };

  if (isLoading) return <p>Memuat data...</p>;
  if (error) return <div>Error: {error}</div>;
  if (!productType) return <div>Jenis produk tidak ditemukan.</div>;

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/dashboard/pengaturan/jenis-produk"
          className="text-sm text-blue-600 hover:underline"
        >
          &larr; Kembali ke Daftar Jenis Produk
        </Link>
        <h1 className="text-3xl font-bold text-slate-800 mt-2">
          Atur Kolom untuk: {productType.name}
        </h1>
        <p className="text-slate-600 mt-1">
          Definisikan semua sub-detail yang diperlukan untuk jenis produk ini.
        </p>
      </div>

      {/* Formulir Tambah Kolom */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          Tambah Kolom Baru
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Label Kolom
              </label>
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Contoh: Bahan Kain"
                required
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tipe Input
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full p-2 border rounded-lg"
              >
                <option value="TEXT">Teks Singkat</option>
                <option value="TEXTAREA">Teks Panjang</option>
                <option value="NUMBER">Angka</option>
                <option value="DROPDOWN">Pilihan Dropdown</option>
                <option value="FILE">Upload File</option>
              </select>
            </div>
            {type === "DROPDOWN" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Pilihan (pisahkan dengan koma)
                </label>
                <input
                  value={options}
                  onChange={(e) => setOptions(e.target.value)}
                  placeholder="Putih,Hitam,Merah"
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
          >
            {isSubmitting ? "Menyimpan..." : "Tambah Kolom"}
          </button>
        </form>
      </div>

      {/* Daftar Kolom yang Ada */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          Kolom yang Sudah Ada
        </h2>
        <div className="space-y-3">
          {productType.fieldDefinitions.length > 0 ? (
            productType.fieldDefinitions.map((field) => (
              <div
                key={field.id}
                className="flex justify-between items-center p-4 bg-slate-50 rounded-lg border"
              >
                <div>
                  <h3 className="font-bold text-slate-800">{field.label}</h3>
                  <p className="text-sm text-slate-500">
                    Tipe: {field.type}, Nama Variabel: {field.name}
                  </p>
                </div>
                <div>
                  {/* --- TOMBOL HAPUS SEKARANG BERFUNGSI --- */}
                  <button
                    onClick={() => handleDelete(field.id, field.label)}
                    className="font-medium text-red-500 hover:underline"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">
              Belum ada kolom yang didefinisikan untuk jenis produk ini.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
