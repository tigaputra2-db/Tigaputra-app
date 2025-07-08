// File: app/api/material-usage/route.ts (Versi Diperbarui dengan Log Stok Kritis)

import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma'

const LOW_STOCK_THRESHOLD = 10; // Batas stok dianggap kritis. Anda bisa ubah angka ini.

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { orderItemId, inventoryItemId, quantityUsed, loggedById } = data;

    if (!orderItemId || !inventoryItemId || !quantityUsed || !loggedById) {
      return NextResponse.json(
        { message: "Data tidak lengkap." },
        { status: 400 }
      );
    }

    const quantity = parseFloat(quantityUsed);
    if (isNaN(quantity) || quantity <= 0) {
      return NextResponse.json(
        { message: "Kuantitas harus berupa angka positif." },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Cek ketersediaan stok
      const stockItem = await tx.inventoryItem.findUnique({
        where: { id: inventoryItemId },
      });

      if (!stockItem || stockItem.quantity < quantity) {
        throw new Error(
          `Stok untuk "${stockItem?.name || "barang"}" tidak mencukupi.`
        );
      }

      // 2. Kurangi stok di inventaris
      const updatedStockItem = await tx.inventoryItem.update({
        where: { id: inventoryItemId },
        data: {
          quantity: {
            decrement: quantity,
          },
        },
      });

      // 3. Catat log penggunaan bahan
      const newLog = await tx.materialUsageLog.create({
        data: {
          orderItemId,
          inventoryItemId,
          quantityUsed: quantity,
          loggedById,
        },
      });

      // --- 4. LOGIKA BARU: Cek jika stok menjadi kritis ---
      if (updatedStockItem.quantity < LOW_STOCK_THRESHOLD) {
        await tx.activityLog.create({
          data: {
            type: "STOK",
            message: `Stok untuk "${updatedStockItem.name}" menipis. Sisa: ${updatedStockItem.quantity} ${updatedStockItem.unit}.`,
            link: `/dashboard/inventaris`,
          },
        });
      }

      return newLog;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("Gagal mencatat penggunaan bahan:", error);
    return NextResponse.json(
      { message: error.message || "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
