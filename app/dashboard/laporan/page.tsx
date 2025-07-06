// File: app/dashboard/laporan/page.tsx

"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  FormEvent,
  Fragment,
} from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { generateSalesReportPDF } from "@/app/lib/generateSalesReportPDF";

// --- DEFINISI TIPE DATA ---
type OrderItem = {
  id: string;
  productType: string;
  quantity: number;
  unitPrice: number;
  discount: number;
};
type Transaction = {
  id: string;
  orderNumber: string;
  orderDate: string;
  totalAmount: number;
  paymentMethod: string | null;
  customer: { name: string };
  items: OrderItem[];
};
type ReportSummary = {
  totalRevenue: number;
  totalTransactions: number;
  averagePerTransaction: number;
};
type ReportData = {
  summary: ReportSummary;
  transactions: Transaction[];
};

// --- KOMPONEN KECIL ---
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

// --- KOMPONEN UTAMA ---
export default function LaporanPage() {
  // State untuk filter
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [productTypeFilter, setProductTypeFilter] = useState("semua");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("semua");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("semua");

  // State untuk data & UI
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // Set tanggal default untuk bulan ini
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

  // Fungsi untuk mengambil laporan dari API
  const handleFetchReport = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError("");
    setReportData(null);
    setExpandedRowId(null);

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
      toast.error(err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi untuk cetak PDF
  const handlePrintReport = () => {
    if (!reportData || reportData.transactions.length === 0) {
      toast.error("Tidak ada data untuk dicetak.");
      return;
    }
    // generateSalesReportPDF(reportData, { startDate, endDate });
    toast.error(
      "Fungsi cetak laporan detail belum diimplementasikan sepenuhnya."
    );
  };

  // Fungsi untuk membuka/menutup baris detail
  const toggleRow = (orderId: string) => {
    setExpandedRowId((prevId) => (prevId === orderId ? null : orderId));
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-end"
        >
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 xl:col-span-2">
            <div className="sm:col-span-1">
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
            <div className="sm:col-span-1">
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
            <div className="sm:col-span-1">
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
          <div className="flex gap-2 xl:col-start-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
            >
              {isLoading ? "..." : "Terapkan"}
            </button>
            <button
              type="button"
              onClick={handlePrintReport}
              disabled={!reportData || isLoading}
              className="w-full px-4 py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 disabled:bg-green-300"
            >
              Cetak
            </button>
          </div>
        </form>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>

      {isLoading && <p className="text-center">Menghitung laporan...</p>}

      {reportData && (
        <div>
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

          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-4">
              Rincian Transaksi
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-500">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 w-12"></th>
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
                    </th>
                    <th scope="col" className="px-6 py-3 text-right">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.transactions.length > 0 ? (
                    reportData.transactions.map((tx) => (
                      <Fragment key={tx.id}>
                        <tr
                          className="bg-white border-b hover:bg-slate-50 cursor-pointer"
                          onClick={() => toggleRow(tx.id)}
                        >
                          <td className="px-6 py-4 text-center">
                            <span className="font-bold text-blue-600">
                              {expandedRowId === tx.id ? "v" : ">"}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-900">
                            {tx.orderNumber}
                          </td>
                          <td className="px-6 py-4">
                            {new Date(tx.orderDate).toLocaleDateString("id-ID")}
                          </td>
                          <td className="px-6 py-4">{tx.customer.name}</td>
                          <td className="px-6 py-4">
                            {tx.paymentMethod || "-"}
                          </td>
                          <td className="px-6 py-4 text-right font-medium">
                            Rp {tx.totalAmount.toLocaleString("id-ID")}
                          </td>
                        </tr>
                        {expandedRowId === tx.id && (
                          <tr className="bg-slate-50">
                            <td colSpan={6} className="p-0">
                              <div className="p-4">
                                <h4 className="font-semibold mb-2 text-slate-700">
                                  Detail Item:
                                </h4>
                                <table className="w-full text-xs">
                                  <thead className="bg-slate-200">
                                    <tr>
                                      <th className="px-4 py-2">Jenis Item</th>
                                      <th className="px-4 py-2 text-right">
                                        Kuantitas
                                      </th>
                                      <th className="px-4 py-2 text-right">
                                        Harga Satuan
                                      </th>
                                      <th className="px-4 py-2 text-right">
                                        Diskon
                                      </th>
                                      <th className="px-4 py-2 text-right">
                                        Total
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {tx.items.map((item) => (
                                      <tr
                                        key={item.id}
                                        className="border-b last:border-b-0"
                                      >
                                        <td className="px-4 py-2">
                                          {item.productType}
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                          {item.quantity}
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                          Rp{" "}
                                          {item.unitPrice.toLocaleString(
                                            "id-ID"
                                          )}
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                          Rp{" "}
                                          {(item.discount || 0).toLocaleString(
                                            "id-ID"
                                          )}
                                        </td>
                                        <td className="px-4 py-2 text-right font-semibold">
                                          Rp{" "}
                                          {(
                                            item.quantity *
                                            (item.unitPrice -
                                              (item.discount || 0))
                                          ).toLocaleString("id-ID")}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-10">
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
