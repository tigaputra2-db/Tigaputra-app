// File: app/dashboard/pengaturan/pelanggan/edit/[id]/page.tsx (Versi Baru dengan Tampilan Modern)

"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function EditPelangganPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      const fetchCustomer = async () => {
        try {
          const res = await fetch(`/api/customers/${id}`);
          if (!res.ok) throw new Error("Gagal memuat data pelanggan");
          const data = await res.json();
          setName(data.name);
          setPhone(data.phone || "");
          setAddress(data.address || "");
        } catch (err: any) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchCustomer();
    }
  }, [id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, address }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Gagal mengupdate pelanggan");
      }
      toast.success("Data pelanggan berhasil diupdate!");
      router.push(`/dashboard/pengaturan/pelanggan/${id}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <p>Memuat data...</p>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div className="mb-8">
        <Link
          href={`/dashboard/pengaturan/pelanggan/${id}`}
          className="text-sm text-blue-600 hover:underline"
        >
          &larr; Kembali ke Detail Pelanggan
        </Link>
        <h1 className="text-3xl font-bold text-slate-800 mt-2">
          Edit Pelanggan
        </h1>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 max-w-2xl">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nama Pelanggan
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nomor Telepon
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Alamat
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                className="w-full p-2 border border-slate-300 rounded-lg"
              ></textarea>
            </div>
          </div>
          {error && <p className="text-red-500 mt-4">{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 px-4 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
          >
            {isSubmitting ? "Menyimpan..." : "Update Pelanggan"}
          </button>
        </form>
      </div>
    </div>
  );
}
