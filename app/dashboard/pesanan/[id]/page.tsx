// File: app/dashboard/pesanan/[id]/page.tsx (Versi Baru dengan Tampilan Modern)

"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { generateInvoicePDF } from "@/app/lib/generateInvoice";

// Definisikan tipe data yang lengkap
type OrderDetail = {
  id: string;
  orderNumber: string;
  orderDate: string;
  dueDate: string | null;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: string;
  paymentMethod: string | null;
  productionStatus: string;
  notes: string | null;
  customer: {
    name: string;
    phone: string | null;
    address: string | null;
  };
  items: {
    id: string;
    productType: string;
    quantity: number;
    unitPrice: number;
    details: any;
  }[];
};

// Komponen untuk menampilkan status dengan warna
const StatusBadge = ({ status }: { status: string }) => {
  const statusStyles: { [key: string]: string } = {
    Antrian: "bg-gray-100 text-gray-800",
    "Proses Cetak": "bg-blue-100 text-blue-800",
    "Proses Jahit": "bg-indigo-100 text-indigo-800",
    Selesai: "bg-green-100 text-green-800",
    LUNAS: "bg-green-100 text-green-800",
    DP: "bg-yellow-100 text-yellow-800",
    BELUM_BAYAR: "bg-red-100 text-red-800",
  };
  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full ${
        statusStyles[status] || "bg-slate-100 text-slate-800"
      }`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
};

export default function DetailPesananPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchOrderDetail = async () => {
        try {
          const res = await fetch(`/api/orders/${id}`);
          if (!res.ok) throw new Error("Gagal memuat detail pesanan");
          const data = await res.json();
          setOrder(data);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchOrderDetail();
    }
  }, [id]);

  const handleDelete = async () => {
    if (
      !window.confirm(
        `Anda yakin ingin menghapus pesanan #${order?.orderNumber}? Aksi ini tidak bisa dibatalkan.`
      )
    ) {
      return;
    }
    try {
      const res = await fetch(`/api/orders/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message);
      }
      toast.success("Pesanan berhasil dihapus.");
      router.push("/dashboard/pesanan");
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    }
  };

  if (isLoading) return <p>Memuat detail pesanan...</p>;
  if (error) return <div>Error: {error}</div>;
  if (!order) return <div>Pesanan tidak ditemukan.</div>;

  const sisaPembayaran = order.totalAmount - order.paidAmount;
  const handlePrintInvoice = () => {
    if (order) {
      // Map items to include discount property (default 0 if not present)
      const orderWithDiscount = {
        ...order,
        items: order.items.map((item) => ({
          ...item,
          discount: (item as any).discount ?? 0,
        })),
      };
      generateInvoicePDF(orderWithDiscount);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <Link
            href="/dashboard/pesanan"
            className="text-sm text-blue-600 hover:underline mb-2 block"
          >
            &larr; Kembali ke Daftar Pesanan
          </Link>
          <h1 className="text-3xl font-bold text-slate-800">
            Detail Pesanan #{order.orderNumber}
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrintInvoice}
            className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors"
          >
            Cetak Invoice
          </button>
          <Link href={`/dashboard/pesanan/edit/${order.id}`}>
            <button className="px-4 py-2 bg-yellow-400 text-slate-800 font-semibold rounded-lg hover:bg-yellow-500 transition-colors">
              Edit
            </button>
          </Link>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
          >
            Hapus
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* KOLOM KIRI & TENGAH */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">
              Rincian Item
            </h3>
            {order.items.map((item) => (
              <div key={item.id} className="py-4 border-b last:border-b-0">
                <p className="font-semibold text-slate-800">
                  {item.productType}
                </p>
                <p className="text-sm text-slate-600">
                  Kuantitas: {item.quantity} x Rp{" "}
                  {item.unitPrice.toLocaleString("id-ID")}
                </p>
                <div className="mt-2 bg-slate-50 p-3 rounded-md text-xs">
                  <h4 className="font-semibold mb-1">Spesifikasi:</h4>
                  {Object.entries(item.details).map(([key, value]) => {
                    if (
                      typeof value === "string" &&
                      (key === "designFileUrl" || key === "mockupFileUrl")
                    ) {
                      return (
                        <p key={key}>
                          <span className="capitalize font-medium">
                            {key.replace("FileUrl", " File")}:{" "}
                          </span>
                          <a
                            href={value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Lihat/Unduh
                          </a>
                        </p>
                      );
                    }
                    return (
                      <p key={key}>
                        <span className="capitalize font-medium">{key}: </span>
                        {String(value)}
                      </p>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* KOLOM KANAN */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">
              Status & Biaya
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Status Produksi:</span>{" "}
                <StatusBadge status={order.productionStatus} />
              </div>
              <div className="flex justify-between">
                <span>Status Bayar:</span>{" "}
                <StatusBadge status={order.paymentStatus} />
              </div>
              <div className="flex justify-between">
                <span>Metode Bayar:</span>{" "}
                <span className="font-medium">
                  {order.paymentMethod || "-"}
                </span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between">
                <span>Total Biaya:</span>{" "}
                <span className="font-medium">
                  Rp {order.totalAmount.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Sudah Dibayar:</span>{" "}
                <span className="font-medium">
                  Rp {order.paidAmount.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between font-bold text-base">
                <span>Sisa Bayar:</span>{" "}
                <span>Rp {sisaPembayaran.toLocaleString("id-ID")}</span>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">
              Info Pelanggan
            </h3>
            <p className="font-semibold">{order.customer.name}</p>
            <p className="text-sm text-slate-600">
              {order.customer.phone || "-"}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {order.customer.address || "Alamat tidak tersedia"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
