// File: app/api/production/route.ts

import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Kita mengambil data dari OrderItem karena fokusnya pada item yang diproduksi
    const productionItems = await prisma.orderItem.findMany({
      // Sertakan data dari Pesanan (Order) yang terkait
      include: {
        order: {
          select: {
            orderNumber: true,
            dueDate: true,
            productionStatus: true,
          },
        },
      },
      // Urutkan berdasarkan tanggal deadline terdekat
      orderBy: {
        order: {
          dueDate: "asc",
        },
      },
      // Opsional: Filter agar yang statusnya "Selesai" tidak muncul
      // where: {
      //   order: {
      //     productionStatus: {
      //       not: 'Selesai'
      //     }
      //   }
      // }
    });

    return NextResponse.json(productionItems);
  } catch (error) {
    console.error("Gagal mengambil data produksi:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
