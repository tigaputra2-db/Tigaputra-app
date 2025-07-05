// File: app/api/production-statuses/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Fungsi untuk MENGAMBIL SEMUA status produksi
export async function GET() {
  try {
    const statuses = await prisma.productionStatus.findMany({
      orderBy: {
        order: "asc", // Urutkan berdasarkan nomor urut
      },
    });
    return NextResponse.json(statuses);
  } catch (error) {
    console.error("Gagal mengambil status produksi:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}

// Fungsi untuk MEMBUAT status produksi BARU
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, order } = data;

    if (!name) {
      return NextResponse.json(
        { message: "Nama status harus diisi" },
        { status: 400 }
      );
    }

    const newStatus = await prisma.productionStatus.create({
      data: {
        name,
        order: Number(order) || 0,
      },
    });

    return NextResponse.json(newStatus, { status: 201 });
  } catch (error) {
    console.error("Gagal membuat status produksi:", error);
    if ((error as any).code === "P2002") {
      return NextResponse.json(
        { message: "Status dengan nama tersebut sudah ada." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
