// File: app/api/orders/[id]/route.ts

import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma'

// Fungsi untuk mengambil DETAIL SATU pesanan
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      // Sertakan semua data terkait yang kita butuhkan
      include: {
        customer: true, // Data pelanggan
        items: true, // Semua item dalam pesanan ini
      },
    });

    if (!order) {
      return NextResponse.json(
        { message: "Pesanan tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error(`Gagal mengambil data untuk pesanan ${id}:`, error);
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
  const id = params.id;
  try {
    const data = await request.json();

    // 1. Ambil data pesanan saat ini SEBELUM diupdate
    const currentOrder = await prisma.order.findUnique({
      where: { id },
    });

    if (!currentOrder) {
      return NextResponse.json(
        { message: "Pesanan tidak ditemukan" },
        { status: 404 }
      );
    }

    // Gunakan transaksi untuk update dan logging
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // 2. Update data pesanan
      const order = await tx.order.update({
        where: { id },
        data: {
          dueDate: data.dueDate ? new Date(data.dueDate) : null,
          totalAmount: parseFloat(data.totalAmount || 0),
          paidAmount: parseFloat(data.paidAmount || 0),
          paymentStatus: data.paymentStatus,
          paymentMethod: data.paymentMethod,
          productionStatus: data.productionStatus,
          notes: data.notes,
        },
      });

      // 3. Cek apakah status pembayaran berubah
      if (currentOrder.paymentStatus !== order.paymentStatus) {
        let logMessage = "";
        if (order.paymentStatus === "DP") {
          logMessage = `Pembayaran DP untuk pesanan #${order.orderNumber} telah diterima.`;
        } else if (order.paymentStatus === "LUNAS") {
          logMessage = `Pesanan #${order.orderNumber} telah lunas.`;
        }

        // Buat log hanya jika ada pesan yang relevan
        if (logMessage) {
          await tx.activityLog.create({
            data: {
              type: "PEMBAYARAN",
              message: logMessage,
              link: `/dashboard/pesanan/${order.id}`,
            },
          });
        }
      }
      return order;
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error(`Gagal mengupdate pesanan ${id}:`, error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server saat mengupdate pesanan" },
      { status: 500 }
    );
  }
}

// +++ TAMBAHKAN FUNGSI DELETE BARU INI DI BAWAHNYA +++
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  try {
    // Gunakan transaksi untuk memastikan item dan pesanan utama terhapus bersamaan
    const result = await prisma.$transaction(async (tx) => {
      // 1. Hapus semua item yang terkait dengan pesanan ini
      await tx.orderItem.deleteMany({
        where: { orderId: id },
      });

      // 2. Hapus pesanan utamanya
      const deletedOrder = await tx.order.delete({
        where: { id },
      });

      return deletedOrder;
    });

    return NextResponse.json({
      message: "Pesanan berhasil dihapus",
      deletedOrderId: result.id,
    });
  } catch (error) {
    console.error(`Gagal menghapus pesanan ${id}:`, error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server saat menghapus pesanan" },
      { status: 500 }
    );
  }
}
