// File: app/api/expenses/[id]/route.ts

import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma'

// Fungsi untuk MENGUPDATE (Edit) catatan pengeluaran
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  try {
    const data = await request.json();
    const { description, amount, category, expenseDate } = data;

    if (!description || !amount || !expenseDate) {
      return NextResponse.json(
        { message: "Deskripsi, jumlah, dan tanggal tidak boleh kosong" },
        { status: 400 }
      );
    }

    const updatedExpense = await prisma.expenseLog.update({
      where: { id },
      data: {
        description,
        amount: parseFloat(amount),
        category,
        expenseDate: new Date(expenseDate),
      },
    });
    return NextResponse.json(updatedExpense);
  } catch (error) {
    console.error(`Gagal mengupdate pengeluaran ${id}:`, error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}

// Fungsi untuk MENGHAPUS catatan pengeluaran
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  try {
    await prisma.expenseLog.delete({
      where: { id },
    });
    return NextResponse.json({
      message: "Catatan pengeluaran berhasil dihapus",
    });
  } catch (error) {
    console.error(`Gagal menghapus pengeluaran ${id}:`, error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
