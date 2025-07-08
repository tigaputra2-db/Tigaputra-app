// File: app/api/product-types/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'

// Fungsi untuk MENGAMBIL SEMUA Jenis Produk
export async function GET() {
  try {
    const productTypes = await prisma.productType.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      // Sertakan juga definisi kolom yang terkait
      include: {
        fieldDefinitions: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });
    return NextResponse.json(productTypes);
  } catch (error) {
    console.error("Gagal mengambil jenis produk:", error);
    return NextResponse.json({ message: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}

// Fungsi untuk MEMBUAT Jenis Produk BARU
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, description } = data;

    if (!name) {
      return NextResponse.json({ message: "Nama jenis produk harus diisi" }, { status: 400 });
    }

    const newProductType = await prisma.productType.create({
      data: {
        name,
        description,
      },
    });

    return NextResponse.json(newProductType, { status: 201 });
  } catch (error) {
    console.error("Gagal membuat jenis produk:", error);
    if ((error as any).code === 'P2002') {
       return NextResponse.json({ message: "Jenis produk dengan nama tersebut sudah ada." }, { status: 409 });
    }
    return NextResponse.json({ message: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}
