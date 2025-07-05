// File: app/dashboard/penerimaan/edit/[id]/page.tsx

"use client";

import React, { useState, useEffect, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function EditPenerimaanPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [receiptNumber, setReceiptNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      const fetchReceipt = async () => {
        try {
          const res = await fetch(`/api/receipts/${id}`);
          if (!res.ok) throw new Error("Gagal memuat data penerimaan");
          const data = await res.json();
          setReceiptNumber(data.receiptNumber);
          setNotes(data.notes || '');
        } catch (err: any) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchReceipt();
    }
  }, [id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      const res = await fetch(`/api/receipts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiptNumber, notes }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Gagal mengupdate data');
      }
      toast.success('Data penerimaan berhasil diupdate!');
      router.push(`/dashboard/penerimaan/${id}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <p>Memuat data...</p>;

  return (
    <div>
      <div className="mb-8">
        <Link href={`/dashboard/penerimaan/${id}`} className="text-sm text-blue-600 hover:underline">
          &larr; Kembali ke Detail Penerimaan
        </Link>
        <h1 className="text-3xl font-bold text-slate-800 mt-2">Edit Penerimaan Barang</h1>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 max-w-2xl">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">No. Surat Jalan / Faktur</label>
              <input value={receiptNumber} onChange={e => setReceiptNumber(e.target.value)} required className="w-full p-2 border border-slate-300 rounded-lg"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Catatan</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} className="w-full p-2 border border-slate-300 rounded-lg"></textarea>
            </div>
          </div>
          {error && <p className="text-red-500 mt-4">{error}</p>}
          <button type="submit" disabled={isSubmitting} className="mt-6 px-4 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 disabled:bg-blue-300">
            {isSubmitting ? 'Menyimpan...' : 'Update Data'}
          </button>
        </form>
      </div>
    </div>
  );
}
