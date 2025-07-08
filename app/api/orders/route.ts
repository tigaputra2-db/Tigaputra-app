// File: app/api/orders/route.ts (Versi Final & Paling Stabil)

import { NextResponse } from "next/server";
import { PrismaClient, PaymentStatus } from "@prisma/client";

const prisma = new PrismaClient();

// Fungsi untuk mengambil semua pesanan (tidak berubah)
export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: {
        orderDate: "desc",
      },
      include: {
        customer: true,
      },
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Gagal mengambil data pesanan:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}

// Fungsi untuk membuat pesanan baru (diperbaiki dengan struktur yang lebih eksplisit)
export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Destrukturisasi manual untuk menghindari potensi bug parser
    const {
      customerName,
      customerPhone,
      customerAddress,
      items,
      dueDate,
      totalAmount,
      paidAmount,
      paymentStatus,
      paymentMethod,
      productionStatus,
      notes,
    } = data;

    // Gunakan transaksi untuk semua operasi agar aman
    const newOrder = await prisma.$transaction(async (tx) => {
      // 1. Cari atau buat pelanggan baru
      const customer = await tx.customer.upsert({
        where: { phone: customerPhone || "NO_PHONE_" + Date.now() },
        update: { name: customerName, address: customerAddress },
        create: {
          name: customerName,
          phone: customerPhone,
          address: customerAddress,
        },
      });

      // 2. Buat Nomor Pesanan unik
      const today = new Date();
      const datePart = today.toISOString().slice(2, 10).replace(/-/g, "");
      const randomPart = Math.floor(100 + Math.random() * 900);
      const orderNumber = `TIGA-${datePart}-${randomPart}`;

      // 3. Buat data Pesanan (Order) utama
      const createdOrder = await tx.order.create({
        data: {
          orderNumber: orderNumber,
          customerId: customer.id,
          dueDate: dueDate ? new Date(dueDate) : null,
          totalAmount: parseFloat(totalAmount || 0),
          paidAmount: parseFloat(paidAmount || 0),
          paymentStatus: paymentStatus as PaymentStatus, // Casting tipe data
          paymentMethod: paymentMethod,
          productionStatus: productionStatus || "Antrian",
          notes: notes,
        },
      });

      // 4. Buat item-item pesanan yang terkait
      if (items && Array.isArray(items)) {
        for (const item of items) {
          await tx.orderItem.create({
            data: {
              orderId: createdOrder.id,
              productType: item.productType,
              quantity: parseFloat(item.quantity || 1),
              unitPrice: parseFloat(item.unitPrice || 0),
              details: item.details || {},
            },
          });
        }
      }

      // 5. BUAT LOG AKTIVITAS BARU
      await tx.activityLog.create({
        data: {
          type: "PESANAN",
          message: `Pesanan baru #${orderNumber} telah dibuat untuk ${customer.name}.`,
          link: `/dashboard/pesanan/${createdOrder.id}`,
        },
      });

      return createdOrder;
    });

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error: any) {
    console.error("Gagal membuat pesanan baru:", error);
    return NextResponse.json(
      {
        message:
          error.message || "Terjadi kesalahan pada server saat membuat pesanan",
      },
      { status: 500 }
    );
  }
}
