// File: app/api/inventory/[id]/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Fungsi untuk MENGUPDATE (Edit) data item
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  try {
    const data = await request.json();
    const { name, sku } = data;

    if (!name) {
      return NextResponse.json(
        { message: "Nama barang tidak boleh kosong" },
        { status: 400 }
      );
    }

    const updatedItem = await prisma.inventoryItem.update({
      where: { id },
      data: {
        name,
        sku,
      },
    });
    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error(`Gagal mengupdate item inventaris ${id}:`, error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}

// Fungsi untuk MENGHAPUS item
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  try {
    // Perhatian: Menghapus item akan gagal jika sudah pernah digunakan dalam produksi.
    // Ini adalah fitur keamanan database untuk menjaga integritas data.
    await prisma.inventoryItem.delete({
      where: { id },
    });
    return NextResponse.json({ message: "Item berhasil dihapus" });
  } catch (error) {
    console.error(`Gagal menghapus item inventaris ${id}:`, error);
    if ((error as any).code === "P2003") {
      return NextResponse.json(
        {
          message:
            "Tidak bisa menghapus item yang sudah memiliki riwayat penggunaan bahan.",
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
