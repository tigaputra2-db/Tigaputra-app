// File: app/api/receipts/route.ts

import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const receipts = await prisma.goodsReceipt.findMany({
      orderBy: { receiptDate: "desc" },
      // Sertakan juga nama supplier agar bisa ditampilkan
      include: {
        supplier: {
          select: {
            name: true,
          },
        },
      },
    });
    return NextResponse.json(receipts);
  } catch (error) {
    console.error("Gagal mengambil data penerimaan:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
// Fungsi untuk MEMBUAT catatan penerimaan barang BARU
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { supplierId, receiptNumber, notes, items } = data;

    // Validasi input dasar
    if (!supplierId || !receiptNumber || !items || items.length === 0) {
      return NextResponse.json(
        { message: "Data supplier, nomor faktur, dan item tidak boleh kosong" },
        { status: 400 }
      );
    }

    // Prisma Transaction: Menjalankan beberapa aksi database sekaligus.
    // Jika salah satu gagal, semua akan dibatalkan (rollback). Ini menjaga data tetap konsisten.
    const result = await prisma.$transaction(async (tx) => {
      // Aksi 1: Buat catatan GoodsReceipt (Faktur Penerimaan)
      const goodsReceipt = await tx.goodsReceipt.create({
        data: {
          receiptNumber,
          supplierId,
          notes,
          items: items, // Menyimpan detail item sebagai JSON
        },
      });

      // Aksi 2: Loop melalui setiap item yang diterima dan update stok di Inventaris
      for (const item of items) {
        await tx.inventoryItem.update({
          where: { id: item.inventoryItemId },
          data: {
            quantity: {
              increment: parseInt(item.quantity, 10), // Menambah jumlah stok
            },
          },
        });
      }

      return goodsReceipt;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Gagal mencatat penerimaan barang:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
