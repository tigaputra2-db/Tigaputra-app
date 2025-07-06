// File: app/api/expenses/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Fungsi untuk MENGAMBIL SEMUA catatan pengeluaran
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let whereClause = {};
    if (startDate && endDate) {
      whereClause = {
        expenseDate: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      };
    }

    const expenses = await prisma.expenseLog.findMany({
      where: whereClause,
      include: {
        loggedBy: {
          select: { name: true },
        },
      },
      orderBy: {
        expenseDate: "desc",
      },
    });
    return NextResponse.json(expenses);
  } catch (error) {
    console.error("Gagal mengambil data pengeluaran:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}

// Fungsi untuk MEMBUAT catatan pengeluaran BARU
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { description, amount, category, expenseDate, loggedById } = data;

    if (!description || !amount || !expenseDate || !loggedById) {
      return NextResponse.json(
        { message: "Deskripsi, jumlah, tanggal, dan pencatat harus diisi" },
        { status: 400 }
      );
    }

    const newExpense = await prisma.expenseLog.create({
      data: {
        description,
        amount: parseFloat(amount),
        category,
        expenseDate: new Date(expenseDate),
        loggedById,
      },
    });

    return NextResponse.json(newExpense, { status: 201 });
  } catch (error) {
    console.error("Gagal membuat catatan pengeluaran:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
