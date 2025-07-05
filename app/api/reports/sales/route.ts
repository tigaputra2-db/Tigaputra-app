// File: app/api/reports/sales/route.ts (Versi Diperbarui)

import { NextResponse } from "next/server";
import { PrismaClient, Prisma, PaymentStatus } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const productType = searchParams.get("productType");
    const paymentStatus = searchParams.get("paymentStatus");
    const paymentMethod = searchParams.get("paymentMethod"); // <-- Ambil parameter baru

    if (!startDate || !endDate) {
      return NextResponse.json(
        { message: "Parameter startDate dan endDate diperlukan" },
        { status: 400 }
      );
    }

    // Membangun klausa 'where' secara dinamis
    let whereClause: Prisma.OrderWhereInput = {
      orderDate: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    };

    if (paymentStatus && paymentStatus !== "semua") {
      if (
        Object.values(PaymentStatus).includes(paymentStatus as PaymentStatus)
      ) {
        whereClause.paymentStatus = paymentStatus as PaymentStatus;
      }
    }

    if (productType && productType !== "semua") {
      whereClause.items = {
        some: {
          productType: productType,
        },
      };
    }

    // --- TAMBAHAN LOGIKA FILTER UNTUK METODE PEMBAYARAN ---
    if (paymentMethod && paymentMethod !== "semua") {
      whereClause.paymentMethod = paymentMethod;
    }

    // Mengambil data dengan klausa 'where' yang sudah dinamis
    const transactions = await prisma.order.findMany({
      where: whereClause,
      orderBy: { orderDate: "desc" },
      include: { customer: true },
    });

    const aggregates = await prisma.order.aggregate({
      where: whereClause,
      _sum: {
        totalAmount: true,
      },
      _count: {
        id: true,
      },
    });

    const totalRevenue = aggregates._sum.totalAmount || 0;
    const totalTransactions = aggregates._count.id || 0;
    const averagePerTransaction =
      totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    const reportData = {
      summary: {
        totalRevenue,
        totalTransactions,
        averagePerTransaction,
      },
      transactions: transactions,
    };

    return NextResponse.json(reportData);
  } catch (error) {
    console.error("Gagal membuat laporan penjualan:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
