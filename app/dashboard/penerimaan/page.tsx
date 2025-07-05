// File: app/dashboard/penerimaan/page.tsx (Versi Baru dengan Tampilan Modern)

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

// Definisikan tipe data
type Receipt = {
  id: string;
  receiptNumber: string;
  receiptDate: string;
  supplier: {
    name: string;
  };
};

export default function PenerimaanPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        const res = await fetch("/api/receipts");
        if (!res.ok) throw new Error("Gagal memuat data penerimaan");
        const data = await res.json();
        setReceipts(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReceipts();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Riwayat Penerimaan Barang
        </h1>
        <Link href="/dashboard/penerimaan/baru">
          <button className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors">
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
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
            Catat Penerimaan Baru
          </button>
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          Daftar Faktur Masuk
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3">
                  No. Faktur Supplier
                </th>
                <th scope="col" className="px-6 py-3">
                  Nama Supplier
                </th>
                <th scope="col" className="px-6 py-3">
                  Tanggal Terima
                </th>
                <th scope="col" className="px-6 py-3">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="text-center py-10">
                    Memuat data...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-red-500">
                    {error}
                  </td>
                </tr>
              ) : receipts.length > 0 ? (
                receipts.map((receipt) => (
                  <tr
                    key={receipt.id}
                    className="bg-white border-b hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {receipt.receiptNumber}
                    </td>
                    <td className="px-6 py-4">{receipt.supplier.name}</td>
                    <td className="px-6 py-4">
                      {new Date(receipt.receiptDate).toLocaleDateString(
                        "id-ID"
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {/* Nanti kita bisa buat halaman detail untuk ini */}
                      <Link
                        href={`/dashboard/penerimaan/${receipt.id}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        Lihat Detail
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-10">
                    Belum ada riwayat penerimaan barang.
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
