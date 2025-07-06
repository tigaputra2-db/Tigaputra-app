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
      include: {
        inventoryItem: {
          select: {
            id: true, // Ambil ID untuk mencocokkan
            name: true,
            unit: true,
          },
        },
      },
    });

    // Proses agregasi data penggunaan
    const usageReport: {
      [key: string]: { name: string; unit: string; totalUsed: number };
    } = {};
    for (const log of usageLogs) {
      const itemId = log.inventoryItemId;
      if (!usageReport[itemId]) {
        usageReport[itemId] = {
          name: log.inventoryItem.name,
          unit: log.inventoryItem.unit,
          totalUsed: 0,
        };
      }
      usageReport[itemId].totalUsed += log.quantityUsed;
    }

    // Ambil semua data inventaris untuk mendapatkan stok saat ini
    const allInventoryItems = await prisma.inventoryItem.findMany();

    // Gabungkan data penggunaan dengan data stok saat ini
    const finalReport = Object.entries(usageReport).map(
      ([itemId, usageData]) => {
        const currentStock = allInventoryItems.find((inv) => inv.id === itemId);
        return {
          ...usageData,
          remainingStock: currentStock?.quantity ?? 0, // Ambil sisa stok
        };
      }
    );

    return NextResponse.json(
      finalReport.sort((a, b) => a.name.localeCompare(b.name))
    );
  } catch (error) {
    console.error("Gagal membuat laporan penggunaan bahan:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
