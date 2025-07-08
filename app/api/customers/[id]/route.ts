// File: app/api/customers/[id]/route.ts

import { NextResponse } from "next/server";
import { prisma } from '@/app/lib/prisma'

// Fungsi untuk MENGAMBIL DETAIL SATU pelanggan
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  try {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        orders: { orderBy: { orderDate: "desc" } },
      },
    });
    if (!customer) {
      return NextResponse.json(
        { message: "Pelanggan tidak ditemukan" },
        { status: 404 }
      );
    }
    return NextResponse.json(customer);
  } catch (error) {
    console.error(`Gagal mengambil data untuk pelanggan ${id}:`, error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}

// Fungsi untuk MENGUPDATE data pelanggan
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  try {
    const data = await request.json();
    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: {
        name: data.name,
        phone: data.phone,
        address: data.address
      },
    });
    return NextResponse.json(updatedCustomer);
  } catch (error) {
    console.error(`Gagal mengupdate pelanggan ${id}:`, error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}

// Fungsi untuk MENGHAPUS pelanggan
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  try {
    // Perhatian: Menghapus pelanggan akan gagal jika ia masih memiliki pesanan.
    // Ini adalah fitur keamanan database (relational constraint).
    // Untuk pengembangan, kita akan biarkan seperti ini dulu.
    await prisma.customer.delete({
      where: { id },
    });
    return NextResponse.json({ message: "Pelanggan berhasil dihapus" });
  } catch (error) {
    console.error(`Gagal menghapus pelanggan ${id}:`, error);
    if ((error as any).code === "P2003") {
      return NextResponse.json(
        {
          message:
            "Tidak bisa menghapus pelanggan yang masih memiliki riwayat pesanan.",
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
