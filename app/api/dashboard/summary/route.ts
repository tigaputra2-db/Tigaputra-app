// File: app/api/dashboard/summary/route.ts (Versi Diperbarui)

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Mengambil semua data secara paralel untuk efisiensi
    const [
      newOrdersToday,
      inProductionCount,
      lowStockCount,
      latestOrders,
      latestActivities, // <-- Mengambil data log aktivitas
    ] = await Promise.all([
      prisma.order.count({
        where: { orderDate: { gte: today, lt: tomorrow } },
      }),
      prisma.order.count({
        where: { productionStatus: { notIn: ["Antrian", "Selesai"] } },
      }),
      prisma.inventoryItem.count({ where: { quantity: { lt: 10 } } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { orderDate: "desc" },
        include: { customer: { select: { name: true } } },
      }),
      // --- PERUBAHAN DI SINI ---
      prisma.activityLog.findMany({
        take: 7, // Ambil 7 aktivitas terakhir
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // Gabungkan semua data
    const summaryData = {
      newOrdersToday,
      inProductionCount,
      lowStockCount,
      latestOrders,
      latestActivities, // <-- Sertakan log aktivitas di dalam respons
    };

    return NextResponse.json(summaryData);
  } catch (error) {
    console.error("Gagal mengambil data ringkasan dasbor:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
