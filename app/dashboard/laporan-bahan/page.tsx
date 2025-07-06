// File: app/dashboard/laporan-bahan/page.tsx (Versi Baru dengan Rincian per Pesanan)

"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { generateMaterialReportPDF } from "@/app/lib/generateMaterialReportPDF";
import toast from "react-hot-toast";
import Link from "next/link";

// Definisikan tipe data baru untuk hasil laporan yang detail
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
    };
  };
};

export default function LaporanBahanPage() {
  // State untuk filter
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // State untuk menampung hasil laporan
  const [reportData, setReportData] = useState<MaterialUsageDetail[]>([]);
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
    setReportData([]);

    try {
      const params = new URLSearchParams({ startDate, endDate });
      const res = await fetch(`/api/reports/materials?${params.toString()}`);

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

  const handlePrintReport = () => {
    if (!reportData || reportData.length === 0) {
      toast.error(
        "Tidak ada data untuk dicetak. Silakan tampilkan laporan terlebih dahulu."
      );
      return;
    }
    // Kita perlu update fungsi generateMaterialReportPDF juga
    // generateMaterialReportPDF(reportData, { startDate, endDate });
    toast.error("Fungsi cetak untuk laporan detail ini belum dibuat.");
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 mb-8">
        Laporan Rincian Penggunaan Bahan
      </h1>

      {/* Area Filter */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-8">
        <form
          onSubmit={handleFetchReport}
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
              disabled={!reportData || reportData.length === 0 || isLoading}
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
      {isLoading && <p className="text-center">Menghitung laporan...</p>}

      {!isLoading && reportData && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-xl font-bold text-slate-800 mb-4">
            Rincian Penggunaan Bahan
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
                </tr>
              </thead>
              <tbody>
                {reportData.length > 0 ? (
                  reportData.map((log) => (
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
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-10">
                      Tidak ada data penggunaan bahan pada periode ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
