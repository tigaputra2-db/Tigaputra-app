// File: app/api/promotions/route.ts

import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma'

// Fungsi untuk MENGAMBIL SEMUA promosi
export async function GET() {
  try {
    const promotions = await prisma.promotion.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(promotions);
  } catch (error) {
    console.error("Gagal mengambil data promosi:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}

// Fungsi untuk MEMBUAT promosi BARU
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, description, type, value, isActive } = data;

    if (!name || !type || !value) {
      return NextResponse.json(
        { message: "Nama, tipe, dan nilai promosi harus diisi" },
        { status: 400 }
      );
    }

    const newPromotion = await prisma.promotion.create({
      data: {
        name,
        description,
        type,
        value: parseFloat(value),
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(newPromotion, { status: 201 });
  } catch (error) {
    console.error("Gagal membuat promosi baru:", error);
    if ((error as any).code === "P2002") {
      return NextResponse.json(
        { message: "Promosi dengan nama tersebut sudah ada." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
