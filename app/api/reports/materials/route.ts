// File: app/api/reports/materials/route.ts

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
      include: {
        inventoryItem: {
          select: {
            name: true,
            unit: true,
          },
        },
      },
    });

    // Proses agregasi data menggunakan JavaScript
    const report: {
      [key: string]: { name: string; unit: string; totalUsed: number };
    } = {};

    for (const log of usageLogs) {
      const itemId = log.inventoryItemId;
      // Jika bahan ini belum ada di laporan, inisialisasi dulu
      if (!report[itemId]) {
        report[itemId] = {
          name: log.inventoryItem.name,
          unit: log.inventoryItem.unit,
          totalUsed: 0,
        };
      }
      // Tambahkan jumlah yang digunakan ke total
      report[itemId].totalUsed += log.quantityUsed;
    }

    // Ubah format dari objek menjadi array agar mudah ditampilkan
    const reportArray = Object.values(report).sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    return NextResponse.json(reportArray);
  } catch (error) {
    console.error("Gagal membuat laporan penggunaan bahan:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
