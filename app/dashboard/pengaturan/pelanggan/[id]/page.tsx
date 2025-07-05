// File: app/dashboard/pengaturan/pelanggan/[id]/page.tsx (Versi Baru dengan Tampilan Modern)

"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

// Definisikan tipe data
type Order = {
  id: string;
  orderNumber: string;
  orderDate: string;
  productionStatus: string;
  totalAmount: number;
};

type CustomerDetail = {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  orders: Order[];
};

export default function DetailPelangganPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchCustomerDetail = async () => {
        try {
          const res = await fetch(`/api/customers/${id}`);
          if (!res.ok) throw new Error("Gagal memuat detail pelanggan");
          const data = await res.json();
          setCustomer(data);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchCustomerDetail();
    }
  }, [id]);

  const handleDelete = async () => {
    if (
      !window.confirm(
        `Anda yakin ingin menghapus pelanggan "${customer?.name}"? Aksi ini tidak bisa dibatalkan dan akan gagal jika pelanggan masih memiliki pesanan.`
      )
    ) {
      return;
    }
    try {
      const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message);
      }
      toast.success("Pelanggan berhasil dihapus.");
      router.push("/dashboard/pengaturan/pelanggan");
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    }
  };

  if (isLoading) return <p>Memuat riwayat pelanggan...</p>;
  if (error) return <div>Error: {error}</div>;
  if (!customer) return <div>Pelanggan tidak ditemukan.</div>;

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/dashboard/pengaturan/pelanggan"
          className="text-sm text-blue-600 hover:underline"
        >
          &larr; Kembali ke Daftar Pelanggan
        </Link>
        <div className="flex justify-between items-start mt-2">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              {customer.name}
            </h1>
            <p className="text-slate-600">
              {customer.phone || "Nomor telepon tidak tersedia"}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {customer.address || "Alamat tidak tersedia"}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href={`/dashboard/pengaturan/pelanggan/edit/${customer.id}`}>
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
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          Riwayat Pesanan
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3">
                  No. Pesanan
                </th>
                <th scope="col" className="px-6 py-3">
                  Tanggal Pesan
                </th>
                <th scope="col" className="px-6 py-3">
                  Status Produksi
                </th>
                <th scope="col" className="px-6 py-3 text-right">
                  Total
                </th>
                <th scope="col" className="px-6 py-3">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {customer.orders.length > 0 ? (
                customer.orders.map((order) => (
                  <tr
                    key={order.id}
                    className="bg-white border-b hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4">
                      {new Date(order.orderDate).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-6 py-4">{order.productionStatus}</td>
                    <td className="px-6 py-4 text-right font-medium">
                      Rp {order.totalAmount.toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/pesanan/${order.id}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        Lihat Detail
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-10">
                    Pelanggan ini belum memiliki riwayat pesanan.
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
