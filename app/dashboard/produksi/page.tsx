// File: app/dashboard/produksi/page.tsx (Versi Baru dengan Tampilan Modern)

"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";

// Definisikan tipe data
type OrderInfo = {
  orderNumber: string;
  dueDate: string | null;
  productionStatus: string;
};

type ProductionItem = {
  id: string;
  productType: string;
  quantity: number;
  details: any;
  order: OrderInfo;
};

// Komponen untuk menampilkan status dengan warna
const StatusBadge = ({ status }: { status: string }) => {
  const statusStyles: { [key: string]: string } = {
    Antrian: "bg-gray-100 text-gray-800",
    "Proses Cetak": "bg-blue-100 text-blue-800",
    "Proses Jahit": "bg-indigo-100 text-indigo-800",
    Selesai: "bg-green-100 text-green-800",
    Finishing: "bg-purple-100 text-purple-800",
    "Proses Press": "bg-orange-100 text-orange-800",
  };
  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full ${
        statusStyles[status] || "bg-slate-100 text-slate-800"
      }`}
    >
      {status}
    </span>
  );
};

export default function ProduksiPage() {
  const [items, setItems] = useState<ProductionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchProductionItems = async () => {
      try {
        const res = await fetch("/api/production");
        if (!res.ok) throw new Error("Gagal memuat data antrian produksi");
        const data = await res.json();
        setItems(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProductionItems();
  }, []);

  // Logika untuk memfilter pekerjaan berdasarkan pencarian
  const filteredItems = useMemo(() => {
    if (!searchTerm) return items;
    return items.filter(
      (item) =>
        item.order.orderNumber
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        item.productType.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);

  const getShortDetail = (item: ProductionItem) => {
    return `${item.quantity} ${item.details.unit || "Pcs"}`;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Antrian Produksi</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <div className="flex items-center justify-end mb-4">
          <div className="w-full max-w-xs">
            <input
              type="text"
              placeholder="Cari No. Pesanan atau Jenis..."
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
                  No. Pesanan
                </th>
                <th scope="col" className="px-6 py-3">
                  Jenis Produk
                </th>
                <th scope="col" className="px-6 py-3">
                  Detail Singkat
                </th>
                <th scope="col" className="px-6 py-3">
                  Deadline
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
                  <td colSpan={6} className="text-center py-10">
                    Memuat data...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-red-500">
                    {error}
                  </td>
                </tr>
              ) : filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="bg-white border-b hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {item.order.orderNumber}
                    </td>
                    <td className="px-6 py-4">{item.productType}</td>
                    <td className="px-6 py-4">{getShortDetail(item)}</td>
                    <td className="px-6 py-4">
                      {item.order.dueDate
                        ? new Date(item.order.dueDate).toLocaleDateString(
                            "id-ID"
                          )
                        : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={item.order.productionStatus} />
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/produksi/${item.id}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        Lihat & Update
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-10">
                    Tidak ada pekerjaan di antrian produksi.
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
