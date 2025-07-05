// File: app/dashboard/laporan/page.tsx (Versi Baru dengan Kolom Metode Pembayaran)

"use client";

import React, { useState, useEffect, FormEvent } from "react";

// Definisikan tipe data untuk Laporan
type ReportSummary = {
  totalRevenue: number;
  totalTransactions: number;
  averagePerTransaction: number;
};

type Transaction = {
  id: string;
  orderNumber: string;
  orderDate: string;
  totalAmount: number;
  paymentMethod: string | null; // <-- Tambahkan properti ini
  customer: { name: string };
};

type ReportData = {
  summary: ReportSummary;
  transactions: Transaction[];
};

// Komponen untuk setiap kartu ringkasan
const SummaryCard = ({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
    <p className="text-sm text-slate-500 font-medium">{title}</p>
    <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
  </div>
);

export default function LaporanPage() {
  // State untuk filter
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [productTypeFilter, setProductTypeFilter] = useState("semua");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("semua");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("semua");

  // State untuk menampung hasil laporan
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Set tanggal default untuk bulan ini saat halaman dimuat
  useEffect(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .split("T")[0];
    const lastDayOfMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    )
      .toISOString()
      .split("T")[0];
    setStartDate(firstDayOfMonth);
    setEndDate(lastDayOfMonth);
  }, []);

  const handleFetchReport = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError("");
    setReportData(null);

    try {
      const params = new URLSearchParams({ startDate, endDate });
      if (productTypeFilter !== "semua")
        params.append("productType", productTypeFilter);
      if (paymentStatusFilter !== "semua")
        params.append("paymentStatus", paymentStatusFilter);
      if (paymentMethodFilter !== "semua")
        params.append("paymentMethod", paymentMethodFilter);

      const res = await fetch(`/api/reports/sales?${params.toString()}`);

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Gagal mengambil data laporan");
      }

      const data = await res.json();
      setReportData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 mb-8">
        Laporan Penjualan
      </h1>

      {/* Area Filter */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-8">
        <form
          onSubmit={handleFetchReport}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end"
        >
          {/* Filter Tanggal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Dari Tanggal
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Sampai Tanggal
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>
          {/* Filter Dropdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Jenis Produk
              </label>
              <select
                value={productTypeFilter}
                onChange={(e) => setProductTypeFilter(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg"
              >
                <option value="semua">Semua Jenis</option>
                <option value="Jual Kaos Polos Saja">
                  Jual Kaos Polos Saja
                </option>
                <option value="Pesan Kaos Jadi">Pesan Kaos Jadi</option>
                <option value="Jasa Cetak & Press">Jasa Cetak & Press</option>
                <option value="Jasa Cetak DTF Saja">Jasa Cetak DTF Saja</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Status Bayar
              </label>
              <select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg"
              >
                <option value="semua">Semua Status</option>
                <option value="LUNAS">Lunas</option>
                <option value="DP">DP</option>
                <option value="BELUM_BAYAR">Belum Bayar</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Metode Bayar
              </label>
              <select
                value={paymentMethodFilter}
                onChange={(e) => setPaymentMethodFilter(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg"
              >
                <option value="semua">Semua Metode</option>
                <option value="Cash">Cash</option>
                <option value="Transfer">Transfer</option>
                <option value="QRIS">QRIS</option>
              </select>
            </div>
          </div>
          {/* Tombol Terapkan */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
            >
              {isLoading ? "Memuat..." : "Terapkan Filter"}
            </button>
          </div>
        </form>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>

      {/* Area Hasil Laporan */}
      {isLoading && <p className="text-center">Menghitung laporan...</p>}

      {reportData && (
        <div>
          {/* Kartu Ringkasan */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <SummaryCard
              title="Total Omzet"
              value={`Rp ${reportData.summary.totalRevenue.toLocaleString(
                "id-ID"
              )}`}
            />
            <SummaryCard
              title="Jumlah Transaksi"
              value={`${reportData.summary.totalTransactions} Pesanan`}
            />
            <SummaryCard
              title="Rata-rata per Transaksi"
              value={`Rp ${Math.round(
                reportData.summary.averagePerTransaction
              ).toLocaleString("id-ID")}`}
            />
          </div>

          {/* Tabel Rincian Transaksi */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-4">
              Rincian Transaksi
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-500">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      No. Pesanan
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Tanggal
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Pelanggan
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Metode Bayar
                    </th>{" "}
                    {/* <-- Kolom baru */}
                    <th scope="col" className="px-6 py-3 text-right">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.transactions.length > 0 ? (
                    reportData.transactions.map((tx) => (
                      <tr
                        key={tx.id}
                        className="bg-white border-b hover:bg-slate-50"
                      >
                        <td className="px-6 py-4 font-medium text-slate-900">
                          {tx.orderNumber}
                        </td>
                        <td className="px-6 py-4">
                          {new Date(tx.orderDate).toLocaleDateString("id-ID")}
                        </td>
                        <td className="px-6 py-4">{tx.customer.name}</td>
                        <td className="px-6 py-4">
                          {tx.paymentMethod || "-"}
                        </td>{" "}
                        {/* <-- Data baru */}
                        <td className="px-6 py-4 text-right font-medium">
                          Rp {tx.totalAmount.toLocaleString("id-ID")}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-10">
                        Tidak ada transaksi yang cocok dengan filter ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
