// File: app/dashboard/page.tsx (Versi Baru dengan Panel Aktivitas)

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

// Definisikan tipe data yang lebih lengkap
type LatestOrder = {
  id: string;
  orderNumber: string;
  totalAmount: number;
  productionStatus: string;
  customer: { name: string };
};
type ActivityLog = {
  id: string;
  message: string;
  link: string | null;
  createdAt: string;
};
type SummaryData = {
  newOrdersToday: number;
  inProductionCount: number;
  lowStockCount: number;
  latestOrders: LatestOrder[];
  latestActivities: ActivityLog[]; // <-- Tambahkan tipe untuk log
};

// Komponen untuk setiap kartu ringkasan
const SummaryCard = ({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 flex items-center gap-5">
    <div className="bg-blue-100 text-blue-600 p-3 rounded-full">{icon}</div>
    <div>
      <p className="text-sm text-slate-500 font-medium">{title}</p>
      <p className="text-3xl font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

// Ikon untuk setiap kartu
const PesananIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect width="8" height="4" x="8" y="2" rx="1" />
  </svg>
);
const ProduksiIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 16.9A7 7 0 0 1 5 16.9" />
    <path d="M12 12A3 3 0 1 1 9 9c0 1.66 1.34 3 3 3" />
    <path d="M12 12v10" />
    <path d="M12 2v4" />
    <path d="m4.93 4.93 2.83 2.83" />
    <path d="m16.24 16.24 2.83 2.83" />
    <path d="m4.93 19.07 2.83-2.83" />
    <path d="m16.24 7.76-2.83 2.83" />
  </svg>
);
const StokIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

// Fungsi helper untuk format waktu relatif
function timeAgo(date: string) {
  const seconds = Math.floor(
    (new Date().getTime() - new Date(date).getTime()) / 1000
  );
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " tahun lalu";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " bulan lalu";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " hari lalu";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " jam lalu";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " menit lalu";
  return "Baru saja";
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch("/api/dashboard/summary");
        if (!res.ok) throw new Error("Gagal memuat data ringkasan");
        const data = await res.json();
        setSummary(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (isLoading) {
    return <p>Memuat dasbor...</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 mb-8">
        Dasbor Ringkasan
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SummaryCard
          title="Pesanan Baru Hari Ini"
          value={summary?.newOrdersToday ?? 0}
          icon={<PesananIcon />}
        />
        <SummaryCard
          title="Sedang Dalam Produksi"
          value={summary?.inProductionCount ?? 0}
          icon={<ProduksiIcon />}
        />
        <SummaryCard
          title="Stok Barang Kritis"
          value={summary?.lowStockCount ?? 0}
          icon={<StokIcon />}
        />
      </div>

      {/* --- BAGIAN BARU: AKTIVITAS & PESANAN TERBARU --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-4">
            Pesanan Terbaru
          </h2>
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
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Total
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {summary?.latestOrders && summary.latestOrders.length > 0 ? (
                  summary.latestOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="bg-white border-b hover:bg-slate-50"
                    >
                      <th
                        scope="row"
                        className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap"
                      >
                        {order.orderNumber}
                      </th>
                      <td className="px-6 py-4">{order.customer.name}</td>
                      <td className="px-6 py-4">{order.productionStatus}</td>
                      <td className="px-6 py-4">
                        Rp {order.totalAmount.toLocaleString("id-ID")}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/dashboard/pesanan/${order.id}`}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          Lihat Detail
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-10">
                      Tidak ada pesanan terbaru.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-4">
            Aktivitas Terbaru
          </h2>
          <div className="space-y-4">
            {summary?.latestActivities &&
            summary.latestActivities.length > 0 ? (
              summary.latestActivities.map((log) => (
                <div key={log.id} className="flex items-start gap-3">
                  <div className="w-1 h-1 bg-slate-300 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-700">
                      {log.link ? (
                        <Link href={log.link} className="hover:underline">
                          {log.message}
                        </Link>
                      ) : (
                        log.message
                      )}
                    </p>
                    <p className="text-xs text-slate-400">
                      {timeAgo(log.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">
                Tidak ada aktivitas terbaru.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
