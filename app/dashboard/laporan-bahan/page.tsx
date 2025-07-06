// File: app/dashboard/laporan-bahan/page.tsx (Versi Final dengan Kartu Sisa Stok)

"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { generateMaterialReportPDF } from "@/app/lib/generateMaterialReportPDF";
import toast from "react-hot-toast";
import Link from "next/link";

// Definisikan tipe data
type MaterialUsageDetail = {
  id: string;
  createdAt: string;
  quantityUsed: number;
  inventoryItem: { name: string; unit: string };
  orderItem: {
    order: { id: string; orderNumber: string; customer: { name: string } };
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

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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
    setUsageDetails([]);
    setInventorySummary([]);

    try {
      const params = new URLSearchParams({ startDate, endDate });
      const res = await fetch(`/api/reports/materials?${params.toString()}`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Gagal mengambil data laporan");
      }
      const data = await res.json();
      setUsageDetails(data.usageLogs);
      setInventorySummary(data.inventorySummary);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
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

      {/* --- BAGIAN BARU: KARTU SISA STOK --- */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          Rekapitulasi Sisa Stok (Saat Ini)
        </h2>
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
              <p className="text-sm font-medium text-slate-600">{item.name}</p>
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
      </div>

      {/* Area Filter */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-8">
        {/* ... isi form filter tidak berubah ... */}
      </div>

      {/* Area Hasil Laporan */}
      {isLoading && <p className="text-center">Menghitung laporan...</p>}

      {!isLoading && usageDetails && (
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
                {usageDetails.length > 0 ? (
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
      )}
    </div>
  );
}
