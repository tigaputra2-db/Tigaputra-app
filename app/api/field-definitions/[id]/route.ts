// File: app/api/field-definitions/[id]/route.ts

import { NextResponse } from "next/server";
import { prisma } from '@/app/lib/prisma'

// Fungsi untuk MENGHAPUS satu definisi kolom berdasarkan ID
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  try {
    await prisma.fieldDefinition.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Kolom berhasil dihapus" });
  } catch (error) {
    console.error(`Gagal menghapus kolom ${id}:`, error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
