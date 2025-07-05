// File: app/api/receipts/[id]/route.ts (Versi Final dengan CRUD)

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Fungsi untuk MENGAMBIL DETAIL SATU faktur penerimaan
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  try {
    const receipt = await prisma.goodsReceipt.findUnique({
      where: { id },
      include: {
        supplier: {
          select: { name: true },
        },
      },
    });

    if (!receipt) {
      return NextResponse.json(
        { message: "Faktur penerimaan tidak ditemukan" },
        { status: 404 }
      );
    }

    // --- PERBAIKAN UTAMA DI SINI ---
    // "Enrich" data item dengan nama dan satuan dari tabel Inventaris
    const itemsWithDetails = await Promise.all(
      (receipt.items as any[]).map(async (item) => {
        const inventoryItem = await prisma.inventoryItem.findUnique({
          where: { id: item.inventoryItemId },
          select: { name: true, unit: true },
        });
        return {
          ...item,
          name: inventoryItem?.name || "N/A",
          unit: inventoryItem?.unit || "N/A",
        };
      })
    );

    const responseData = { ...receipt, items: itemsWithDetails };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error(`Gagal mengambil data untuk faktur ${id}:`, error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}

// Fungsi untuk MENGUPDATE (Edit) data faktur
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  try {
    const data = await request.json();
    const { receiptNumber, notes } = data;

    const updatedReceipt = await prisma.goodsReceipt.update({
      where: { id },
      data: {
        receiptNumber,
        notes,
      },
    });
    return NextResponse.json(updatedReceipt);
  } catch (error) {
    console.error(`Gagal mengupdate faktur ${id}:`, error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}

// Fungsi untuk MENGHAPUS faktur dan mengembalikan stok
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Ambil data faktur yang akan dihapus
      const receiptToDelete = await tx.goodsReceipt.findUnique({
        where: { id },
      });
      if (!receiptToDelete)
        throw new Error("Faktur tidak ditemukan untuk dihapus.");

      // 2. Kembalikan stok untuk setiap item di faktur
      for (const item of receiptToDelete.items as any[]) {
        await tx.inventoryItem.update({
          where: { id: item.inventoryItemId },
          data: {
            quantity: {
              decrement: Number(item.quantity), // Kurangi stok yang dulu ditambahkan
            },
          },
        });
      }

      // 3. Hapus faktur itu sendiri
      await tx.goodsReceipt.delete({ where: { id } });
    });

    return NextResponse.json({
      message: "Faktur berhasil dihapus dan stok telah dikembalikan.",
    });
  } catch (error: any) {
    console.error(`Gagal menghapus faktur ${id}:`, error);
    return NextResponse.json(
      { message: error.message || "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
