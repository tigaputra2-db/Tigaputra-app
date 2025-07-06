// File: app/dashboard/pengeluaran/page.tsx

"use client";

import React, { useState, useEffect, FormEvent } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/app/hooks/useAuth";

// Definisikan tipe data
type Expense = {
  id: string;
  description: string;
  amount: number;
  category: string | null;
  expenseDate: string;
  loggedBy: { name: string };
};

export default function PengeluaranPage() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State untuk form tambah baru
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState("Operasional");
  const [expenseDate, setExpenseDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // State untuk filter
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Fungsi untuk mengambil data pengeluaran
  const fetchExpenses = async (start: string, end: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ startDate: start, endDate: end });
      const res = await fetch(`/api/expenses?${params.toString()}`);
      if (!res.ok) throw new Error("Gagal memuat data pengeluaran.");
      const data = await res.json();
      setExpenses(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .split("T")[0];
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      .toISOString()
      .split("T")[0];
    setStartDate(firstDay);
    setEndDate(lastDay);
    fetchExpenses(firstDay, lastDay);
  }, []);

  const handleFilterSubmit = (e: FormEvent) => {
    e.preventDefault();
    fetchExpenses(startDate, endDate);
  };

  // Fungsi untuk menangani penambahan
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user?.userId) {
      return toast.error("Sesi tidak valid, silakan login ulang.");
    }
    setIsSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          amount,
          category,
          expenseDate,
          loggedById: user.userId,
        }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Gagal menambah pengeluaran");
      }
      setDescription("");
      setAmount(0);
      setCategory("Operasional");
      toast.success("Catatan pengeluaran berhasil ditambahkan!");
      fetchExpenses(startDate, endDate);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 mb-8">
        Catatan Pengeluaran
      </h1>

      {/* Formulir Tambah Pengeluaran */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          Tambah Catatan Baru
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Deskripsi
              </label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Contoh: Bayar Listrik Bulan Juli"
                required
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Jumlah (Rp)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                required
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 border rounded-lg"
              >
                <option value="Operasional">Operasional</option>
                <option value="Bahan Baku">Bahan Baku</option>
                <option value="Gaji">Gaji</option>
                <option value="Lain-lain">Lain-lain</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tanggal
              </label>
              <input
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                required
                className="w-full p-2 border rounded-lg"
              />
            </div>
          </div>
          {error && <p className="text-red-500 mt-4">{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 px-4 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
          >
            {isSubmitting ? "Menyimpan..." : "Simpan Catatan"}
          </button>
        </form>
      </div>

      {/* Daftar Pengeluaran */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          Riwayat Pengeluaran
        </h2>
        {/* Di sini nanti bisa ditambahkan filter tanggal untuk riwayat */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Tanggal
                </th>
                <th scope="col" className="px-6 py-3">
                  Deskripsi
                </th>
                <th scope="col" className="px-6 py-3">
                  Kategori
                </th>
                <th scope="col" className="px-6 py-3 text-right">
                  Jumlah
                </th>
                <th scope="col" className="px-6 py-3">
                  Dicatat Oleh
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10">
                    Memuat data...
                  </td>
                </tr>
              ) : expenses.length > 0 ? (
                expenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className="bg-white border-b hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      {new Date(expense.expenseDate).toLocaleDateString(
                        "id-ID"
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {expense.description}
                    </td>
                    <td className="px-6 py-4">{expense.category}</td>
                    <td className="px-6 py-4 text-right font-medium">
                      Rp {expense.amount.toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4">{expense.loggedBy.name}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-10">
                    Tidak ada catatan pengeluaran pada periode ini.
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
