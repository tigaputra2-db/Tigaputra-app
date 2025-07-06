// File: app/lib/generateInvoice.ts (Versi Final dengan Perbaikan Kalkulasi)

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Definisikan tipe data yang lebih lengkap
interface OrderItemData {
  productType: string;
  quantity: number;
  unitPrice: number;
  discount: number; // Diskon per item
}

interface OrderData {
  orderNumber: string;
  orderDate: string;
  customer: { name: string; phone: string | null; address: string | null };
  items: OrderItemData[];
  totalAmount: number; // Ini adalah Grand Total setelah semua diskon
  paidAmount: number;
  notes: string | null;
}

export const generateInvoicePDF = (order: OrderData) => {
  const doc = new jsPDF({ compress: true });
  const pageHeight = doc.internal.pageSize.height;
  let y = 15;

  // --- HEADER ---
  const logoUrl =
    "https://wymrcotvuonhmltshbis.supabase.co/storage/v1/object/public/desain-pesanan//3p%20logo.png";
  doc.addImage(logoUrl, "PNG", 15, y, 20, 16.7, undefined, "FAST");
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Tiga Putra Sablon & Konveksi", 40, y + 5);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Jl. Anjasmoro Tengah I No.22, Karangayu,", 40, y + 11);
  doc.text("Semarang Barat, Jawa Tengah 50149", 40, y + 16);
  doc.text(
    "tigaputrakids@gmail.com | 0858-8139-7842 | 0823-2474-9297",
    40,
    y + 21
  );
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", 195, y + 8, { align: "right" });
  y += 25;
  doc.setLineWidth(0.5);
  doc.line(15, y, 195, y);
  y += 10;

  // --- INFO PESANAN ---
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Ditagihkan Kepada:", 15, y);
  doc.text("Info Pesanan:", 110, y);
  doc.setFont("helvetica", "normal");
  y += 6;
  doc.text(order.customer.name, 15, y);
  doc.text(`No. Pesanan: ${order.orderNumber}`, 110, y);
  y += 5;
  doc.text(order.customer.phone || "-", 15, y);
  doc.text(
    `Tanggal: ${new Date(order.orderDate).toLocaleDateString("id-ID")}`,
    110,
    y
  );
  y += 5;
  const customerAddress = doc.splitTextToSize(
    order.customer.address || "-",
    80
  );
  doc.text(customerAddress, 15, y);
  y =
    doc.getTextDimensions(customerAddress).h > 5
      ? y + doc.getTextDimensions(customerAddress).h + 5
      : y + 10;

  // --- TABEL ITEM DENGAN DISKON ---
  const tableColumn = [
    "Deskripsi",
    "Kuantitas",
    "Harga Satuan",
    "Diskon (Rp)",
    "Subtotal",
  ];
  const tableRows: any[] = [];
  let subtotalBeforeDiscount = 0;

  order.items.forEach((item) => {
    const itemSubtotal = item.quantity * item.unitPrice;
    subtotalBeforeDiscount += itemSubtotal;
    const itemTotal = item.quantity * (item.unitPrice - (item.discount || 0));

    const itemData = [
      item.productType,
      item.quantity,
      `Rp ${item.unitPrice.toLocaleString("id-ID")}`,
      `- Rp ${(item.discount || 0).toLocaleString("id-ID")}`,
      `Rp ${itemTotal.toLocaleString("id-ID")}`,
    ];
    tableRows.push(itemData);
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: y,
    theme: "striped",
    headStyles: { fillColor: [41, 128, 185] },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // --- RINGKASAN BIAYA DENGAN DETAIL DISKON (DIPERBAIKI) ---
  const totalItemDiscount = order.items.reduce(
    (sum, item) => sum + item.quantity * (item.discount || 0),
    0
  );
  const subtotalAfterItemDiscount = subtotalBeforeDiscount - totalItemDiscount;
  const subtotalDiscount = subtotalAfterItemDiscount - order.totalAmount;
  const sisaPembayaran = order.totalAmount - order.paidAmount;

  doc.setFontSize(10);
  doc.text(`Subtotal:`, 140, y, { align: "right" });
  doc.text(`Rp ${subtotalBeforeDiscount.toLocaleString("id-ID")}`, 195, y, {
    align: "right",
  });
  y += 7;

  if (totalItemDiscount > 0) {
    doc.text(`Total Diskon Item:`, 140, y, { align: "right" });
    doc.text(`- Rp ${totalItemDiscount.toLocaleString("id-ID")}`, 195, y, {
      align: "right",
    });
    y += 7;
  }

  if (subtotalDiscount > 0) {
    doc.text(`Diskon Tambahan:`, 140, y, { align: "right" });
    doc.text(`- Rp ${subtotalDiscount.toLocaleString("id-ID")}`, 195, y, {
      align: "right",
    });
    y += 7;
  }

  doc.setFont("helvetica", "bold");
  doc.text(`Grand Total:`, 140, y, { align: "right" });
  doc.text(`Rp ${order.totalAmount.toLocaleString("id-ID")}`, 195, y, {
    align: "right",
  });
  y += 7;

  doc.setFont("helvetica", "normal");
  doc.text(`Sudah Dibayar (DP):`, 140, y, { align: "right" });
  doc.text(`Rp ${order.paidAmount.toLocaleString("id-ID")}`, 195, y, {
    align: "right",
  });
  y += 7;

  doc.setFont("helvetica", "bold");
  doc.text(`Sisa Pembayaran:`, 140, y, { align: "right" });
  doc.text(`Rp ${sisaPembayaran.toLocaleString("id-ID")}`, 195, y, {
    align: "right",
  });
  y += 10;

  // --- CATATAN ---
  if (order.notes) {
    doc.setFont("helvetica", "normal");
    doc.text("Catatan:", 15, y);
    y += 5;
    const splitNotes = doc.splitTextToSize(order.notes, 180);
    doc.text(splitNotes, 15, y);
  }

  // --- FOOTER ---
  doc.setFontSize(10);
  doc.text("Terima kasih atas kepercayaan Anda!", 105, pageHeight - 15, {
    align: "center",
  });

  // --- SIMPAN PDF ---
  const customerName = order.customer.name
    .replace(/[^a-zA-Z0-9]/g, "_")
    .toLowerCase();
  doc.save(`${customerName}_INV-${order.orderNumber}.pdf`);
};
