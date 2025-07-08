// File: app/api/inventory/route.ts

import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma'

// Fungsi untuk MENGAMBIL SEMUA barang di inventaris
export async function GET() {
  try {
    const inventoryItems = await prisma.inventoryItem.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(inventoryItems);
  } catch (error) {
    console.error("Gagal mengambil data inventaris:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}

// Fungsi untuk MENAMBAH item inventaris BARU
export async function POST(request: Request) {
  try {
    const data = await request.json();
    if (!data.name || !data.unit) {
      return NextResponse.json(
        { message: "Nama barang dan satuan harus diisi" },
        { status: 400 }
      );
    }
    const newItem = await prisma.inventoryItem.create({
      data: {
        name: data.name,
        sku: data.sku,
        quantity: Number(data.quantity) || 0,
        unit: data.unit,
      },
    });
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error("Gagal menambah item inventaris:", error);
    if ((error as any).code === "P2002") {
      return NextResponse.json(
        { message: "Item dengan SKU tersebut sudah ada." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
