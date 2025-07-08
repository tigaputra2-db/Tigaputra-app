// File: app/api/reports/materials/route.ts (Versi Final)

import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma'

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

    // Mengambil semua data secara paralel
    const [usageLogs, inventorySummary] = await Promise.all([
      // 1. Ambil log penggunaan dalam rentang tanggal
      prisma.materialUsageLog.findMany({
        where: {
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
        include: {
          inventoryItem: {
            select: { name: true, unit: true },
          },
          orderItem: {
            include: {
              order: {
                include: {
                  customer: { select: { name: true } },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      // 2. Ambil ringkasan SEMUA item di inventaris
      prisma.inventoryItem.findMany({
        orderBy: { name: "asc" },
      }),
    ]);

    // Gabungkan kedua hasil dalam satu respons
    return NextResponse.json({ usageLogs, inventorySummary });
  } catch (error) {
    console.error("Gagal membuat laporan penggunaan bahan:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
