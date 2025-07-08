// File: app/api/product-types/[id]/route.ts

import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma'

// Fungsi untuk MENGAMBIL DETAIL SATU jenis produk
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  try {
    const productType = await prisma.productType.findUnique({
      where: { id },
      include: {
        fieldDefinitions: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    if (!productType) {
      return NextResponse.json(
        { message: "Jenis produk tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(productType);
  } catch (error) {
    console.error(`Gagal mengambil data untuk jenis produk ${id}:`, error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}

// Fungsi untuk MENGUPDATE data jenis produk
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  try {
    const data = await request.json();
    const updatedProductType = await prisma.productType.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
      },
    });
    return NextResponse.json(updatedProductType);
  } catch (error) {
    console.error(`Gagal mengupdate jenis produk ${id}:`, error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}

// Fungsi untuk MENGHAPUS jenis produk
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  try {
    // Menghapus ProductType akan otomatis menghapus FieldDefinition terkait karena "onDelete: Cascade"
    await prisma.productType.delete({
      where: { id },
    });
    return NextResponse.json({ message: "Jenis produk berhasil dihapus" });
  } catch (error) {
    console.error(`Gagal menghapus jenis produk ${id}:`, error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
