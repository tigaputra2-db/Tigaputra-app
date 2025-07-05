// File: app/dashboard/pesanan/edit/[id]/page.tsx (Versi Baru dengan Tampilan Modern)

"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/hooks/useAuth";
import toast from "react-hot-toast";

// Helper component
const InputGroup = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="mb-4">
    <label className="block mb-1 text-sm font-medium text-slate-700">
      {label}
    </label>
    {children}
  </div>
);

export default function EditPesananPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();

  const [formData, setFormData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      const fetchOrder = async () => {
        setIsLoading(true);
        try {
          const res = await fetch(`/api/orders/${id}`);
          if (!res.ok) throw new Error("Gagal memuat data pesanan");
          const data = await res.json();
          setFormData({
            ...data,
            dueDate: data.dueDate
              ? new Date(data.dueDate).toISOString().split("T")[0]
              : "",
          });
        } catch (err: any) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchOrder();
    }
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]:
        name === "totalAmount" || name === "paidAmount"
          ? parseFloat(value)
          : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user?.userId) {
      toast.error("Sesi tidak valid. Silakan login kembali.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, updatedById: user.userId }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Gagal mengupdate pesanan");
      }

      toast.success("Pesanan berhasil diupdate!");
      router.push(`/dashboard/pesanan/${id}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <p>Memuat data pesanan untuk diedit...</p>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div className="mb-8">
        <Link
          href={`/dashboard/pesanan/${id}`}
          className="text-sm text-blue-600 hover:underline"
        >
          &larr; Kembali ke Detail Pesanan
        </Link>
        <h1 className="text-3xl font-bold text-slate-800 mt-2">
          Edit Pesanan #{formData.orderNumber}
        </h1>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 max-w-4xl">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Kolom Kiri */}
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4">
                Status & Jadwal
              </h3>
              <InputGroup label="Status Produksi">
                <select
                  name="productionStatus"
                  value={formData.productionStatus || ""}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="Antrian">Antrian</option>
                  <option value="Proses Cetak">Proses Cetak</option>
                  <option value="Proses Jahit">Proses Jahit</option>
                  <option value="Finishing">Finishing</option>
                  <option value="Selesai">Selesai</option>
                </select>
              </InputGroup>
              <InputGroup label="Tanggal Selesai (Deadline)">
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate || ""}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                />
              </InputGroup>
            </div>

            {/* Kolom Kanan */}
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4">
                Pembayaran
              </h3>
              <InputGroup label="Status Pembayaran">
                <select
                  name="paymentStatus"
                  value={formData.paymentStatus || ""}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="BELUM_BAYAR">Belum Bayar</option>
                  <option value="DP">DP</option>
                  <option value="LUNAS">Lunas</option>
                </select>
              </InputGroup>
              <InputGroup label="Metode Pembayaran">
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod || ""}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="Cash">Cash</option>
                  <option value="Transfer">Transfer</option>
                  <option value="QRIS">QRIS</option>
                </select>
              </InputGroup>
              <InputGroup label="Total Biaya (Rp)">
                <input
                  type="number"
                  name="totalAmount"
                  value={formData.totalAmount || 0}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                />
              </InputGroup>
              <InputGroup label="Sudah Dibayar (Rp)">
                <input
                  type="number"
                  name="paidAmount"
                  value={formData.paidAmount || 0}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                />
              </InputGroup>
            </div>
          </div>

          <div className="mt-6 border-t pt-6">
            <InputGroup label="Catatan Tambahan">
              <textarea
                name="notes"
                value={formData.notes || ""}
                onChange={handleChange}
                rows={4}
                className="w-full p-2 border rounded-md"
              ></textarea>
            </InputGroup>
          </div>

          {error && <p className="text-red-500 mt-4">{error}</p>}
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
            >
              {isSubmitting ? "Menyimpan..." : "Update Pesanan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
