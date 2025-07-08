// File: app/api/suppliers/route.ts

import { NextResponse } from "next/server";
import { prisma } from '@/app/lib/prisma'

// Fungsi untuk MENGAMBIL SEMUA supplier
export async function GET() {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(suppliers);
  } catch (error) {
    console.error("Gagal mengambil data supplier:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}

// Fungsi untuk MEMBUAT supplier BARU
export async function POST(request: Request) {
  try {
    const data = await request.json();

    if (!data.name) {
      return NextResponse.json(
        { message: "Nama supplier harus diisi" },
        { status: 400 }
      );
    }

    const newSupplier = await prisma.supplier.create({
      data: {
        name: data.name,
        contactPerson: data.contactPerson,
        phone: data.phone,
        address: data.address,
      },
    });

    return NextResponse.json(newSupplier, { status: 201 });
  } catch (error) {
    console.error("Gagal membuat supplier baru:", error);
    // Cek jika error karena nama duplikat
    if ((error as any).code === "P2002") {
      return NextResponse.json(
        { message: "Supplier dengan nama tersebut sudah ada." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
