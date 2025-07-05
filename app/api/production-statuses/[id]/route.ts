// File: app/api/production-statuses/[id]/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Fungsi untuk MENGHAPUS satu status produksi berdasarkan ID
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  try {
    await prisma.productionStatus.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Status berhasil dihapus" });
  } catch (error) {
    console.error(`Gagal menghapus status ${id}:`, error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
