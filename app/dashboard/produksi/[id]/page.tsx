// File: app/dashboard/produksi/[id]/page.tsx (Versi Final dengan Alamat Pelanggan)

"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/app/lib/supabaseClient";
import toast from "react-hot-toast";
import { useAuth } from "@/app/hooks/useAuth";

// Definisikan Tipe Data
type InventoryItem = { id: string; name: string; unit: string };
type ProductionStatusOption = { id: string; name: string };
type MaterialUsageLog = {
  id: string;
  quantityUsed: number;
  createdAt: string;
  inventoryItem: { name: string; unit: string };
};
type ProductionItemDetail = {
  id: string;
  productType: string;
  quantity: number;
  details: any;
  materialUsage: MaterialUsageLog[];
  order: {
    id: string;
    orderNumber: string;
    dueDate: string | null;
    productionStatus: string;
    orderDate: string;
    customer: {
      name: string;
      phone: string | null;
      address: string | null; // <-- Tipe data diperbarui untuk alamat
    };
  };
};

// Fungsi untuk mengambil nama file dari URL
const getFileNameFromUrl = (url: string): string => {
  try {
    const path = new URL(url).pathname;
    const decodedPath = decodeURIComponent(path);
    const parts = decodedPath.split("/");
    return parts[parts.length - 1].split("-").slice(1).join("-") || "File";
  } catch (e) {
    return "File tidak valid";
  }
};

export default function DetailProduksiPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user } = useAuth();

  // State Management
  const [item, setItem] = useState<ProductionItemDetail | null>(null);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [statusOptions, setStatusOptions] = useState<ProductionStatusOption[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newStatus, setNewStatus] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const [selectedMaterialId, setSelectedMaterialId] = useState("");
  const [quantityUsed, setQuantityUsed] = useState(0);
  const [isLoggingMaterial, setIsLoggingMaterial] = useState(false);

  // Fungsi untuk mengambil semua data yang diperlukan halaman ini
  const fetchPageData = async () => {
    try {
      const [itemRes, inventoryRes, statusesRes] = await Promise.all([
        fetch(`/api/production/${id}`),
        fetch("/api/inventory"),
        fetch("/api/production-statuses"),
      ]);

      if (!itemRes.ok) throw new Error("Gagal memuat detail pekerjaan");
      if (!inventoryRes.ok) throw new Error("Gagal memuat data inventaris");
      if (!statusesRes.ok)
        throw new Error("Gagal memuat daftar status produksi");

      const itemData = await itemRes.json();
      const inventoryData = await inventoryRes.json();
      const statusesData = await statusesRes.json();

      setItem(itemData);
      setInventoryItems(inventoryData);
      setStatusOptions(statusesData);
      setNewStatus(itemData.order.productionStatus);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      fetchPageData();
    }
  }, [id]);

  // Fungsi untuk update status produksi
  const handleUpdateStatus = async () => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/production/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newStatus }),
      });
      if (!res.ok) throw new Error("Gagal mengupdate status");
      toast.success("Status berhasil diperbarui!");
      router.push("/dashboard/produksi");
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  // Fungsi untuk mencatat penggunaan bahan
  const handleLogMaterial = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedMaterialId || quantityUsed <= 0) {
      toast.error("Pilih bahan dan masukkan jumlah yang valid.");
      return;
    }
    if (!user?.userId) {
      alert("Sesi Anda tidak valid. Silakan login kembali.");
      return;
    }

    setIsLoggingMaterial(true);
    try {
      const res = await fetch("/api/material-usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderItemId: id,
          inventoryItemId: selectedMaterialId,
          quantityUsed: quantityUsed,
          loggedById: user.userId, // <-- Gunakan ID pengguna yang login
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Gagal mencatat bahan");
      }

      toast.success("Penggunaan bahan berhasil dicatat!");
      setSelectedMaterialId("");
      setQuantityUsed(0);
      fetchPageData();
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setIsLoggingMaterial(false);
    }
  };

  if (isLoading) return <p>Memuat detail pekerjaan...</p>;
  if (error) return <div>Error: {error}</div>;
  if (!item) return <div>Pekerjaan tidak ditemukan.</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 mb-8">
        Detail Produksi: {item.order.orderNumber}
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* KOLOM KIRI & TENGAH */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              Spesifikasi & File
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <p>
                <strong>Jenis Produk:</strong> {item.productType}
              </p>
              <p>
                <strong>Kuantitas:</strong> {item.quantity}{" "}
                {item.details.unit || "Pcs"}
              </p>
            </div>
            <div className="mt-4 pt-4 border-t">
              <h4 className="font-semibold mb-2">File Terlampir:</h4>
              <div className="flex flex-wrap gap-2">
                {item.details.designFileUrl ? (
                  <a
                    href={item.details.designFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600"
                  >
                    {getFileNameFromUrl(item.details.designFileUrl)}
                  </a>
                ) : null}
                {item.details.mockupFileUrl ? (
                  <a
                    href={item.details.mockupFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-slate-600 text-white text-sm font-semibold rounded-lg hover:bg-slate-700"
                  >
                    {getFileNameFromUrl(item.details.mockupFileUrl)}
                  </a>
                ) : null}
                {!item.details.designFileUrl && !item.details.mockupFileUrl && (
                  <p className="text-sm text-slate-500">
                    Tidak ada file yang dilampirkan.
                  </p>
                )}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <h4 className="font-semibold mb-2">Detail Lainnya:</h4>
              <div className="text-sm space-y-2">
                {Object.entries(item.details).map(([key, value]) => {
                  if (key === "designFileUrl" || key === "mockupFileUrl")
                    return null;
                  return (
                    <div key={key} className="flex">
                      <span className="w-1/3 text-slate-500 capitalize">
                        {key.replace(/([A-Z])/g, " $1")}:
                      </span>
                      <span className="w-2/3 font-medium text-slate-800">
                        {String(value)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              Catat Penggunaan Bahan Baku
            </h3>
            <form onSubmit={handleLogMaterial} className="flex items-end gap-4">
              <div className="flex-grow">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Pilih Bahan
                </label>
                <select
                  value={selectedMaterialId}
                  onChange={(e) => setSelectedMaterialId(e.target.value)}
                  required
                  className="w-full p-2 border border-slate-300 rounded-lg"
                >
                  <option value="">-- Pilih dari Inventaris --</option>
                  {inventoryItems.map((invItem) => (
                    <option key={invItem.id} value={invItem.id}>
                      {invItem.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Jumlah
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={quantityUsed}
                  onChange={(e) => setQuantityUsed(Number(e.target.value))}
                  required
                  className="w-32 p-2 border border-slate-300 rounded-lg"
                />
              </div>
              <button
                type="submit"
                disabled={isLoggingMaterial}
                className="px-4 py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 disabled:bg-green-300"
              >
                {isLoggingMaterial ? "..." : "Catat"}
              </button>
            </form>
          </div>
        </div>

        {/* KOLOM KANAN */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              Informasi Pelanggan
            </h3>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Nama:</strong> {item.order.customer.name}
              </p>
              <p>
                <strong>Telepon:</strong> {item.order.customer.phone || "-"}
              </p>
              {/* --- PERUBAHAN DI SINI --- */}
              <p>
                <strong>Alamat:</strong>{" "}
                {item.order.customer.address || "Alamat tidak tersedia"}
              </p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              Update Status Produksi
            </h3>
            <p className="text-sm mb-2">
              Status Saat Ini:{" "}
              <span className="font-bold text-blue-600">
                {item.order.productionStatus}
              </span>
            </p>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Ubah Status Menjadi:
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="mt-1 w-full p-2 border border-slate-300 rounded-lg"
              >
                {statusOptions.map((status) => (
                  <option key={status.id} value={status.name}>
                    {status.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleUpdateStatus}
              disabled={isUpdating}
              className="mt-4 w-full px-4 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
            >
              {isUpdating ? "Memperbarui..." : "Simpan Status"}
            </button>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              Riwayat Bahan Terpakai
            </h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {item.materialUsage.length > 0 ? (
                item.materialUsage.map((log) => (
                  <div
                    key={log.id}
                    className="text-sm p-2 bg-slate-50 rounded-md"
                  >
                    <p className="font-semibold">{log.inventoryItem.name}</p>
                    <p className="text-slate-600">
                      Jumlah: {log.quantityUsed} {log.inventoryItem.unit}
                    </p>
                    <p className="text-xs text-slate-400">
                      Dicatat: {new Date(log.createdAt).toLocaleString("id-ID")}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  Belum ada bahan yang dicatat.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
