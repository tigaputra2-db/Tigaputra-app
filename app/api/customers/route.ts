// File: app/api/customers/route.ts

import { NextResponse } from "next/server";
import { prisma } from '@/app/lib/prisma'

// Fungsi untuk MENGAMBIL SEMUA pelanggan
export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        _count: {
          select: { orders: true },
        },
      },
      orderBy: {
        name: "asc",
      },
    });
    return NextResponse.json(customers);
  } catch (error) {
    console.error("Gagal mengambil data pelanggan:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}

// Fungsi untuk MEMBUAT pelanggan BARU
export async function POST(request: Request) {
  try {
    const data = await request.json();
    // --- PERBAIKAN DI SINI: Tambahkan 'address' ---
    const { name, phone, address } = data;

    if (!name) {
      return NextResponse.json(
        { message: "Nama pelanggan harus diisi" },
        { status: 400 }
      );
    }

    const newCustomer = await prisma.customer.create({
      data: {
        name,
        phone,
        address, // <-- Tambahkan 'address' ke data yang akan disimpan
      },
    });

    return NextResponse.json(newCustomer, { status: 201 });
  } catch (error) {
    console.error("Gagal membuat pelanggan baru:", error);
    if (
      (error as any).code === "P2002" &&
      (error as any).meta?.target?.includes("phone")
    ) {
      return NextResponse.json(
        { message: "Pelanggan dengan nomor telepon tersebut sudah ada." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
