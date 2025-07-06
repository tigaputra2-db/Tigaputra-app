// File: app/dashboard/laporan-bahan/page.tsx

"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { generateMaterialReportPDF } from "@/app/lib/generateMaterialReportPDF";
import toast from "react-hot-toast";
import Link from "next/link";

// Definisikan Tipe Data
type MaterialUsageDetail = {
  id: string;
  createdAt: string;
  quantityUsed: number;
  inventoryItem: {
    name: string;
    unit: string;
  };
  orderItem: {
    order: {
      id: string;
      orderNumber: string;
      customer: {
        name: string;
      };
    };
  };
};

type InventorySummaryItem = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
};

export default function LaporanBahanPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // State dipisah untuk data rincian dan data ringkasan stok
  const [usageDetails, setUsageDetails] = useState<MaterialUsageDetail[]>([]);
  const [inventorySummary, setInventorySummary] = useState<
    InventorySummaryItem[]
  >([]);

  const [isLoading, setIsLoading] = useState(true); // Diubah menjadi true
  const [error, setError] = useState("");

  // Fungsi untuk mengambil data
  const fetchReportData = async (start: string, end: string) => {
    setIsLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ startDate: start, endDate: end });
      const res = await fetch(`/api/reports/materials?${params.toString()}`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Gagal mengambil data laporan");
      }
      const data = await res.json();
      setUsageDetails(data.usageLogs);
      setInventorySummary(data.inventorySummary);
    } catch (err: any) {
      toast.error(err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Set tanggal default dan fetch data awal
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
    fetchReportData(firstDayOfMonth, lastDayOfMonth);
  }, []);

  const handleFilterSubmit = (e: FormEvent) => {
    e.preventDefault();
    fetchReportData(startDate, endDate);
  };

  const handlePrintReport = () => {
    if (usageDetails.length === 0 && inventorySummary.length === 0) {
      toast.error("Tidak ada data untuk dicetak.");
      return;
    }
    generateMaterialReportPDF(usageDetails, inventorySummary, {
      startDate,
      endDate,
    });
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 mb-8">
        Laporan Penggunaan & Stok Bahan
      </h1>

      {/* Rekapitulasi Sisa Stok */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          Rekapitulasi Sisa Stok (Saat Ini)
        </h2>
        {isLoading ? (
          <p>Memuat sisa stok...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {inventorySummary.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-lg shadow-sm border ${
                  item.quantity < 10
                    ? "bg-red-50 border-red-200"
                    : "bg-white border-slate-200"
                }`}
              >
                <p className="text-sm font-medium text-slate-600 truncate">
                  {item.name}
                </p>
                <p
                  className={`text-2xl font-bold ${
                    item.quantity < 10 ? "text-red-600" : "text-slate-800"
                  }`}
                >
                  {item.quantity.toLocaleString("id-ID")}
                </p>
                <p className="text-xs text-slate-500">{item.unit}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Area Filter */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-8">
        <form
          onSubmit={handleFilterSubmit}
          className="flex flex-wrap items-end gap-4"
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
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
            >
              {isLoading ? "Memuat..." : "Tampilkan"}
            </button>
            <button
              type="button"
              onClick={handlePrintReport}
              disabled={
                isLoading ||
                (usageDetails.length === 0 && inventorySummary.length === 0)
              }
              className="px-4 py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 disabled:bg-green-300"
              title="Cetak Laporan"
            >
              Cetak
            </button>
          </div>
        </form>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>

      {/* Area Hasil Laporan */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h3 className="text-xl font-bold text-slate-800 mb-4">
          Rincian Penggunaan Bahan (Sesuai Periode)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Tanggal
                </th>
                <th scope="col" className="px-6 py-3">
                  Nama Bahan
                </th>
                <th scope="col" className="px-6 py-3 text-right">
                  Jumlah Terpakai
                </th>
                <th scope="col" className="px-6 py-3">
                  Untuk Pesanan
                </th>
                <th scope="col" className="px-6 py-3">
                  Nama Pemesan
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10">
                    Memuat rincian penggunaan...
                  </td>
                </tr>
              ) : usageDetails.length > 0 ? (
                usageDetails.map((log) => (
                  <tr
                    key={log.id}
                    className="bg-white border-b hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      {new Date(log.createdAt).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {log.inventoryItem.name}
                    </td>
                    <td className="px-6 py-4 text-right font-medium">
                      {log.quantityUsed} {log.inventoryItem.unit}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/pesanan/${log.orderItem.order.id}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {log.orderItem.order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      {log.orderItem.order.customer.name}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-10">
                    Tidak ada data penggunaan bahan pada periode ini.
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
