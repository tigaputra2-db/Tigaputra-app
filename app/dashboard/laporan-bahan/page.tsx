// File: app/dashboard/laporan-bahan/page.tsx (Versi Final dengan Nama Pemesan)

"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { generateMaterialReportPDF } from "@/app/lib/generateMaterialReportPDF";
import toast from "react-hot-toast";
import Link from "next/link";

// --- Tipe data baru yang lebih lengkap ---
type MaterialUsageDetail = {
  id: string;
  createdAt: string;
  quantityUsed: number;
  inventoryItem: {
    name: string;
    unit: string;
    quantity: number; // Sisa stok saat ini
  };
  orderItem: {
    order: {
      id: string;
      orderNumber: string;
      customer: {
        // <-- Tambahkan info customer
        name: string;
      };
    };
  };
};

export default function LaporanBahanPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportData, setReportData] = useState<MaterialUsageDetail[]>([]);
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
    generateMaterialReportPDF(reportData, { startDate, endDate });
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 mb-8">
        Laporan Rincian Penggunaan Bahan
      </h1>

      {/* ... Area Filter tidak berubah ... */}

      {!isLoading && reportData && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-xl font-bold text-slate-800 mb-4">
            Rincian Penggunaan
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
                    Jml Terpakai
                  </th>
                  <th scope="col" className="px-6 py-3 text-right">
                    Sisa Stok
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Untuk Pesanan
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Nama Pemesan
                  </th>{" "}
                  {/* <-- Kolom baru */}
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
                      <td
                        className={`px-6 py-4 text-right font-bold ${
                          log.inventoryItem.quantity < 10
                            ? "text-red-600"
                            : "text-slate-800"
                        }`}
                      >
                        {log.inventoryItem.quantity}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/dashboard/pesanan/${log.orderItem.order.id}`}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          {log.orderItem.order.orderNumber}
                        </Link>
                      </td>
                      {/* --- Data Nama Pemesan --- */}
                      <td className="px-6 py-4">
                        {log.orderItem.order.customer.name}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-10">
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
