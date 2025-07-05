// File: app/dashboard/pesanan/page.tsx (Versi Baru dengan Tampilan Modern)

"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";

// Definisikan tipe data
type Customer = {
  name: string;
};
type Order = {
  id: string;
  orderNumber: string;
  customer: Customer;
  orderDate: string;
  productionStatus: string;
  paymentStatus: string;
  totalAmount: number;
};

// Komponen kecil untuk menampilkan status dengan warna
const StatusBadge = ({ status }: { status: string }) => {
  const statusStyles: { [key: string]: string } = {
    Antrian: "bg-gray-100 text-gray-800",
    "Proses Cetak": "bg-blue-100 text-blue-800",
    "Proses Jahit": "bg-indigo-100 text-indigo-800",
    Selesai: "bg-green-100 text-green-800",
    LUNAS: "bg-green-100 text-green-800",
    DP: "bg-yellow-100 text-yellow-800",
    BELUM_BAYAR: "bg-red-100 text-red-800",
  };
  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full ${
        statusStyles[status] || "bg-slate-100 text-slate-800"
      }`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
};

export default function PesananPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders");
        if (!res.ok) throw new Error("Gagal memuat data pesanan");
        const data = await res.json();
        setOrders(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Logika untuk memfilter pesanan berdasarkan pencarian
  const filteredOrders = useMemo(() => {
    if (!searchTerm) return orders;
    return orders.filter(
      (order) =>
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [orders, searchTerm]);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Manajemen Pesanan</h1>
        <Link href="/dashboard/pesanan/baru">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Buat Pesanan Baru
          </button>
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800">
            Daftar Semua Pesanan
          </h2>
          <div className="w-full max-w-xs">
            <input
              type="text"
              placeholder="Cari No. Pesanan atau Nama..."
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
                  Pelanggan
                </th>
                <th scope="col" className="px-6 py-3">
                  Tanggal
                </th>
                <th scope="col" className="px-6 py-3">
                  Status Produksi
                </th>
                <th scope="col" className="px-6 py-3">
                  Status Bayar
                </th>
                <th scope="col" className="px-6 py-3 text-right">
                  Total
                </th>
                <th scope="col" className="px-6 py-3">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10">
                    Memuat data...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-red-500">
                    {error}
                  </td>
                </tr>
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="bg-white border-b hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4">{order.customer.name}</td>
                    <td className="px-6 py-4">
                      {new Date(order.orderDate).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.productionStatus} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.paymentStatus} />
                    </td>
                    <td className="px-6 py-4 text-right font-medium">
                      Rp {order.totalAmount.toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/pesanan/${order.id}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-10">
                    Tidak ada pesanan yang cocok.
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
