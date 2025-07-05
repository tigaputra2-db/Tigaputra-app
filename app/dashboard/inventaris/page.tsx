// File: app/dashboard/inventaris/page.tsx (Versi Final Lengkap)

"use client";

import React, { useState, useEffect, useMemo, FormEvent } from "react";
import toast from "react-hot-toast";

// Definisikan tipe data
type InventoryItem = {
  id: string;
  name: string;
  sku: string | null;
  quantity: number;
  unit: string;
};

export default function InventarisPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State untuk form tambah item baru
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [unit, setUnit] = useState("Pcs");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // State untuk modal edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Fungsi untuk mengambil data inventaris
  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/inventory");
      if (!res.ok) throw new Error("Gagal memuat data inventaris.");
      const data = await res.json();
      setItems(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Fungsi untuk menangani penambahan item baru
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, sku, quantity, unit }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Gagal menambah item");
      }
      setName("");
      setSku("");
      setQuantity(0);
      setUnit("Pcs");
      toast.success("Item baru berhasil ditambahkan!");
      fetchItems();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fungsi untuk membuka modal edit
  const handleOpenEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
  };

  // Fungsi untuk mengupdate item
  const handleUpdateItem = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/inventory/${editingItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingItem.name, sku: editingItem.sku }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Gagal mengupdate item");
      }
      toast.success("Item berhasil diupdate!");
      setIsEditModalOpen(false);
      setEditingItem(null);
      fetchItems();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fungsi untuk menghapus item
  const handleDeleteItem = async (itemId: string, itemName: string) => {
    if (!window.confirm(`Anda yakin ingin menghapus "${itemName}"?`)) return;

    try {
      const res = await fetch(`/api/inventory/${itemId}`, { method: "DELETE" });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message);
      }
      toast.success("Item berhasil dihapus.");
      fetchItems();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Logika untuk memfilter inventaris
  const filteredItems = useMemo(() => {
    if (!searchTerm) return items;
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [items, searchTerm]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 mb-8">
        Manajemen Inventaris
      </h1>

      {/* Formulir Tambah Item Inventaris */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          Tambah Item Baru
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nama Barang
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Kaos Polos Hitam M"
                required
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                SKU (Kode Unik)
              </label>
              <input
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="Contoh: KPH-M"
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Stok Awal
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  required
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Satuan
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                >
                  <option value="Pcs">Pcs</option>
                  <option value="Meter">Meter</option>
                  <option value="Liter">Liter</option>
                  <option value="Rol">Rol</option>
                </select>
              </div>
            </div>
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-4 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
              >
                {isSubmitting ? "Menyimpan..." : "Tambah Item"}
              </button>
            </div>
          </div>
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </form>
      </div>

      {/* Daftar Item Inventaris */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800">
            Daftar Stok Barang
          </h2>
          <div className="w-full max-w-xs">
            <input
              type="text"
              placeholder="Cari Nama Barang atau SKU..."
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
                  Nama Barang
                </th>
                <th scope="col" className="px-6 py-3">
                  SKU
                </th>
                <th scope="col" className="px-6 py-3 text-right">
                  Jumlah Stok
                </th>
                <th scope="col" className="px-6 py-3">
                  Satuan
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
              ) : error ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-red-500">
                    {error}
                  </td>
                </tr>
              ) : filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className={`bg-white border-b hover:bg-slate-50 ${
                      item.quantity < 10 ? "bg-red-50" : ""
                    }`}
                  >
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-mono">
                      {item.sku || "-"}
                    </td>
                    <td
                      className={`px-6 py-4 text-right font-bold ${
                        item.quantity < 10 ? "text-red-600" : "text-slate-800"
                      }`}
                    >
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4">{item.unit}</td>
                    <td className="px-6 py-4 flex gap-4">
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="font-medium text-yellow-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id, item.name)}
                        className="font-medium text-red-600 hover:underline"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-10">
                    Tidak ada item di inventaris.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL UNTUK EDIT ITEM */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Item Inventaris</h2>
            <form onSubmit={handleUpdateItem}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nama Barang
                  </label>
                  <input
                    value={editingItem.name}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, name: e.target.value })
                    }
                    required
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    SKU (Kode Unik)
                  </label>
                  <input
                    value={editingItem.sku || ""}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, sku: e.target.value })
                    }
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600"
                >
                  {isSubmitting ? "..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
