// File: app/api/production/[id]/route.ts (Versi Diperbarui dengan Log Aktivitas)

import { NextResponse } from "next/server";
import { prisma } from '@/app/lib/prisma'

// Fungsi GET (tidak berubah)
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  try {
    const item = await prisma.orderItem.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            customer: true,
          },
        },
        materialUsage: {
          include: {
            inventoryItem: {
              select: { name: true, unit: true },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json(
        { message: "Pekerjaan tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error(`Gagal mengambil data untuk item ${id}:`, error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}

// Fungsi PATCH (diperbarui dengan pencatatan log)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id; // ID dari OrderItem
  try {
    const { newStatus } = await request.json();

    if (!newStatus) {
      return NextResponse.json(
        { message: "Status baru harus disediakan" },
        { status: 400 }
      );
    }

    // Gunakan transaksi untuk memastikan semua aksi berhasil
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // 1. Cari OrderItem untuk mendapatkan id Pesanan (Order)
      const orderItem = await tx.orderItem.findUnique({
        where: { id },
        select: { orderId: true, order: { select: { orderNumber: true } } },
      });

      if (!orderItem) {
        throw new Error("Item pekerjaan tidak ditemukan");
      }

      // 2. Update status di tabel Pesanan (Order) utama
      const order = await tx.order.update({
        where: { id: orderItem.orderId },
        data: { productionStatus: newStatus },
      });

      // 3. BUAT LOG AKTIVITAS BARU
      await tx.activityLog.create({
        data: {
          type: "PRODUKSI",
          message: `Status pesanan #${order.orderNumber} diubah menjadi "${newStatus}".`,
          link: `/dashboard/pesanan/${order.id}`, // Link ke halaman detail pesanan
        },
      });

      return order;
    });

    return NextResponse.json(updatedOrder);
  } catch (error: any) {
    console.error(`Gagal mengupdate status untuk item ${id}:`, error);
    return NextResponse.json(
      { message: error.message || "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
