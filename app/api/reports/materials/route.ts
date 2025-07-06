// File: app/api/reports/materials/route.ts (Versi Final dengan Data Lengkap)

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!startDate || !endDate) {
      return NextResponse.json(
        { message: "Parameter startDate dan endDate diperlukan" },
        { status: 400 }
      );
    }

    const usageLogs = await prisma.materialUsageLog.findMany({
      where: {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      include: {
        inventoryItem: {
          select: {
            id: true,
            name: true,
            unit: true,
            quantity: true, // Sisa stok saat ini
          },
        },
        orderItem: {
          include: {
            order: {
              include: {
                customer: {
                  // <-- PERUBAHAN DI SINI: Sertakan data pelanggan
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(usageLogs);
  } catch (error) {
    console.error("Gagal membuat laporan penggunaan bahan:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
