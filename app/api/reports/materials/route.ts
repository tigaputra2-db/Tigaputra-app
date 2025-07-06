// File: app/api/reports/materials/route.ts (Versi Diperbarui)

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

    // Ambil semua log dalam rentang tanggal yang dipilih
    const usageLogs = await prisma.materialUsageLog.findMany({
      where: {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      // Sertakan semua informasi terkait yang kita butuhkan
      include: {
        inventoryItem: {
          select: {
            name: true,
            unit: true,
          },
        },
        orderItem: {
          include: {
            order: {
              select: {
                id: true,
                orderNumber: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc", // Tampilkan yang terbaru di atas
      },
    });

    // Kita tidak lagi melakukan agregasi di sini, langsung kirim data rinciannya
    return NextResponse.json(usageLogs);
  } catch (error) {
    console.error("Gagal membuat laporan penggunaan bahan:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
