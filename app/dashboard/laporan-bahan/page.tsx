// File: app/dashboard/laporan-bahan/page.tsx

"use client";

import React, { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { generateMaterialReportPDF } from "@/app/lib/generateMaterialReportPDF";
import toast from "react-hot-toast";

// Definisikan tipe data untuk hasil laporan
type MaterialReportItem = {
  name: string;
  unit: string;
  totalUsed: number;
  remainingStock: number;
};

export default function LaporanBahanPage() {
  // State untuk filter
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // State untuk menampung hasil laporan
  const [reportData, setReportData] = useState<MaterialReportItem[]>([]);
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
      toast.error("Tidak ada data untuk dicetak.");
      return;
    }
    // Sekarang kita mengirim data yang sudah lengkap ke fungsi PDF
    generateMaterialReportPDF(reportData, { startDate, endDate });
  };

  return (
    <div>
      <div className="mb-8">
        {/* Link Kembali telah dihapus agar menjadi halaman utama */}
        <h1 className="text-3xl font-bold text-slate-800">
          Laporan Penggunaan Bahan
        </h1>
      </div>

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
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
            >
              {isLoading ? "Memuat..." : "Tampilkan Laporan"}
            </button>
          </div>
        </form>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>

      {/* Area Hasil Laporan */}
      {isLoading && <p className="text-center">Menghitung laporan...</p>}

      {!isLoading && reportData && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Rekapitulasi Penggunaan Bahan</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500">
              <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3">Nama Bahan</th>
                  <th scope="col" className="px-6 py-3 text-right">Total Terpakai</th>
                  <th scope="col" className="px-6 py-3 text-right">Sisa Stok</th> {/* <-- Kolom baru */}
                  <th scope="col" className="px-6 py-3">Satuan</th>
                </tr>
              </thead>
              <tbody>
                {reportData.length > 0 ? reportData.map((item, index) => (
                  <tr key={index} className={`bg-white border-b hover:bg-slate-50 ${item.remainingStock < 10 ? 'bg-red-50' : ''}`}>
                    <td className="px-6 py-4 font-medium text-slate-900">{item.name}</td>
                    <td className="px-6 py-4 text-right font-medium">{item.totalUsed.toLocaleString('id-ID')}</td>
                    {/* --- Data baru --- */}
                    <td className={`px-6 py-4 text-right font-bold ${item.remainingStock < 10 ? 'text-red-600' : 'text-slate-800'}`}>
                      {item.remainingStock.toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4">{item.unit}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className="text-center py-10">Tidak ada data penggunaan bahan pada periode ini.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
