// File: app/dashboard/penerimaan/[id]/page.tsx (Versi Final dengan Cetak Faktur)

"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { generateReceiptPDF } from "@/app/lib/generateReceiptPDF"; // <-- 1. Import fungsi pencetak

// Definisikan tipe data
type ReceivedItem = {
  inventoryItemId: string;
  name: string;
  unit: string;
  quantity: number;
};

type ReceiptDetail = {
  id: string;
  receiptNumber: string;
  receiptDate: string;
  notes: string | null;
  supplier: {
    name: string;
  };
  items: ReceivedItem[];
};

export default function DetailPenerimaanPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [receipt, setReceipt] = useState<ReceiptDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchReceiptDetail = async () => {
        try {
          const res = await fetch(`/api/receipts/${id}`);
          if (!res.ok) throw new Error("Gagal memuat detail penerimaan");
          const data = await res.json();
          setReceipt(data);
        } catch (err: any) {
          setError(err.message);
          toast.error(err.message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchReceiptDetail();
    }
  }, [id]);

  // --- FUNGSI BARU UNTUK CETAK ---
  const handlePrintReceipt = () => {
    if (receipt) {
      generateReceiptPDF(receipt);
    }
  };

  const handleDelete = async () => {
    if (!receipt) return;
    if (
      !window.confirm(
        `Anda yakin ingin menghapus faktur #${receipt.receiptNumber}? Stok akan dikembalikan seperti semula.`
      )
    ) {
      return;
    }
    try {
      const res = await fetch(`/api/receipts/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message);
      }
      toast.success("Faktur berhasil dihapus.");
      router.push("/dashboard/penerimaan");
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    }
  };

  if (isLoading) return <p>Memuat detail penerimaan...</p>;
  if (error) return <div>Error: {error}</div>;
  if (!receipt) return <div>Data penerimaan tidak ditemukan.</div>;

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/dashboard/penerimaan"
          className="text-sm text-blue-600 hover:underline"
        >
          &larr; Kembali ke Riwayat Penerimaan
        </Link>
        <div className="flex justify-between items-start mt-2">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Detail Penerimaan: #{receipt.receiptNumber}
            </h1>
          </div>
          <div className="flex gap-2">
            {/* --- TOMBOL CETAK BARU --- */}
            <button
              onClick={handlePrintReceipt}
              className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600"
            >
              Cetak
            </button>
            <Link href={`/dashboard/penerimaan/edit/${receipt.id}`}>
              <button className="px-4 py-2 bg-yellow-400 text-slate-800 font-semibold rounded-lg hover:bg-yellow-500">
                Edit
              </button>
            </Link>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600"
            >
              Hapus
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* KOLOM KIRI & TENGAH */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              Daftar Barang Diterima
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-500">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      Nama Barang
                    </th>
                    <th scope="col" className="px-6 py-3 text-right">
                      Jumlah
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Satuan
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {receipt.items.map((item, index) => (
                    <tr
                      key={index}
                      className="bg-white border-b hover:bg-slate-50"
                    >
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 text-right font-bold">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4">{item.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              Informasi Faktur
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>No. Faktur:</span>{" "}
                <span className="font-medium">{receipt.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Tanggal Terima:</span>{" "}
                <span className="font-medium">
                  {new Date(receipt.receiptDate).toLocaleDateString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Dari Supplier:</span>{" "}
                <span className="font-medium">{receipt.supplier.name}</span>
              </div>
            </div>
          </div>
          {receipt.notes && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Catatan</h3>
              <p className="text-sm text-slate-600 whitespace-pre-wrap">
                {receipt.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
