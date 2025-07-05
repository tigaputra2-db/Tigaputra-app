// File: app/dashboard/penerimaan/baru/page.tsx (Versi Final Lengkap)

"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

// Definisikan Tipe Data
type Supplier = { id: string; name: string };
type InventoryItem = { id: string; name: string; unit: string };
type ReceivedItem = {
  inventoryItemId: string;
  name: string; // Untuk ditampilkan di daftar
  unit: string; // Untuk ditampilkan di daftar
  quantity: number;
};

// Helper component
const InputGroup = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="mb-4">
    <label className="block mb-1 text-sm font-medium text-slate-700">
      {label}
    </label>
    {children}
  </div>
);

export default function PenerimaanBaruPage() {
  const router = useRouter();

  // State untuk data yang di-fetch
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // State untuk form utama
  const [supplierId, setSupplierId] = useState("");
  const [receiptNumber, setReceiptNumber] = useState("");
  const [notes, setNotes] = useState("");

  // State untuk "keranjang" item yang diterima
  const [receivedItems, setReceivedItems] = useState<ReceivedItem[]>([]);

  // State untuk form "Tambah Item"
  const [currentItemId, setCurrentItemId] = useState("");
  const [currentItemQty, setCurrentItemQty] = useState(1);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch data suppliers dan inventory saat halaman dimuat
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        const [suppliersRes, inventoryRes] = await Promise.all([
          fetch("/api/suppliers"),
          fetch("/api/inventory"),
        ]);
        if (!suppliersRes.ok) throw new Error("Gagal memuat data supplier");
        if (!inventoryRes.ok) throw new Error("Gagal memuat data inventaris");

        const suppliersData = await suppliersRes.json();
        const inventoryData = await inventoryRes.json();

        setSuppliers(suppliersData);
        setInventoryItems(inventoryData);
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const handleAddItem = () => {
    if (!currentItemId || currentItemQty <= 0) {
      toast.error("Pilih barang dan masukkan jumlah yang valid.");
      return;
    }
    const selectedItem = inventoryItems.find((i) => i.id === currentItemId);
    if (!selectedItem) return;

    // Cek apakah item sudah ada di daftar
    const existingItemIndex = receivedItems.findIndex(
      (item) => item.inventoryItemId === currentItemId
    );

    if (existingItemIndex > -1) {
      // Jika sudah ada, tambahkan kuantitasnya
      const updatedItems = [...receivedItems];
      updatedItems[existingItemIndex].quantity += currentItemQty;
      setReceivedItems(updatedItems);
    } else {
      // Jika belum ada, tambahkan sebagai item baru
      setReceivedItems([
        ...receivedItems,
        {
          inventoryItemId: selectedItem.id,
          name: selectedItem.name,
          unit: selectedItem.unit,
          quantity: currentItemQty,
        },
      ]);
    }

    // Reset form tambah item
    setCurrentItemId("");
    setCurrentItemQty(1);
    toast.success(`${selectedItem.name} ditambahkan!`);
  };

  const handleRemoveItem = (itemId: string) => {
    setReceivedItems(
      receivedItems.filter((item) => item.inventoryItemId !== itemId)
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (receivedItems.length === 0) {
      toast.error("Daftar barang yang diterima masih kosong.");
      return;
    }
    setIsSubmitting(true);

    const payload = {
      supplierId,
      receiptNumber,
      notes,
      items: receivedItems.map(({ name, unit, ...rest }) => rest), // Kirim data yang relevan saja
    };

    try {
      const res = await fetch("/api/receipts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Gagal menyimpan data penerimaan");
      }

      toast.success(
        "Penerimaan barang berhasil dicatat & stok telah diperbarui!"
      );
      router.push("/dashboard/penerimaan");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) return <p>Memuat data formulir...</p>;

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/dashboard/penerimaan"
          className="text-sm text-blue-600 hover:underline"
        >
          &larr; Kembali ke Riwayat Penerimaan
        </Link>
        <h1 className="text-3xl font-bold text-slate-800 mt-2">
          Catat Penerimaan Barang Baru
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* KOLOM KIRI & TENGAH */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4">
                Informasi Faktur Supplier
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputGroup label="Pilih Supplier">
                  <select
                    className="w-full p-2 border rounded"
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    required
                  >
                    <option value="">-- Pilih Supplier --</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </InputGroup>
                <InputGroup label="No. Surat Jalan / Faktur">
                  <input
                    className="w-full p-2 border rounded"
                    value={receiptNumber}
                    onChange={(e) => setReceiptNumber(e.target.value)}
                    placeholder="Nomor dari supplier"
                    required
                  />
                </InputGroup>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4">
                Tambah Item yang Diterima
              </h3>
              <div className="flex items-end gap-4">
                <div className="flex-grow">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Pilih Barang
                  </label>
                  <select
                    value={currentItemId}
                    onChange={(e) => setCurrentItemId(e.target.value)}
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
                    value={currentItemQty}
                    onChange={(e) => setCurrentItemQty(Number(e.target.value))}
                    className="w-32 p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-4 py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600"
                >
                  + Tambah
                </button>
              </div>
            </div>
          </div>

          {/* KOLOM KANAN */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4">
                Daftar Barang Diterima
              </h3>
              {receivedItems.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">
                  Belum ada item ditambahkan.
                </p>
              ) : (
                <div className="space-y-3">
                  {receivedItems.map((item) => (
                    <div
                      key={item.inventoryItemId}
                      className="flex justify-between items-center p-3 bg-slate-50 rounded-lg"
                    >
                      <p className="font-semibold text-sm">{item.name}</p>
                      <div className="flex items-center gap-3">
                        <span className="font-bold">
                          {item.quantity} {item.unit}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.inventoryItemId)}
                          className="text-red-500 text-xs hover:text-red-700"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4">
                Catatan & Aksi
              </h3>
              <InputGroup label="Catatan Tambahan">
                <textarea
                  className="w-full p-2 border rounded"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                ></textarea>
              </InputGroup>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-blue-500 text-white font-bold rounded hover:bg-blue-600 disabled:bg-blue-300"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Penerimaan"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
