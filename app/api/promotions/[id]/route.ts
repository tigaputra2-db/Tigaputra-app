// File: app/api/promotions/[id]/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Fungsi untuk MENGHAPUS satu promosi berdasarkan ID
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  try {
    await prisma.promotion.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Promosi berhasil dihapus" });
  } catch (error) {
    console.error(`Gagal menghapus promosi ${id}:`, error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
