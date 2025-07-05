// File: app/lib/generateInvoice.ts (Versi Dioptimalkan untuk Ukuran File)

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Definisikan tipe data agar lebih aman
interface OrderData {
  orderNumber: string;
  orderDate: string;
  customer: { name: string; phone: string | null; address: string | null };
  items: { productType: string; quantity: number; unitPrice: number }[];
  totalAmount: number;
  paidAmount: number;
  notes: string | null;
}

export const generateInvoicePDF = (order: OrderData) => {
  // --- PERUBAHAN 1: Aktifkan kompresi PDF ---
  const doc = new jsPDF({ compress: true });
  const pageHeight = doc.internal.pageSize.height;
  let y = 15;

  // --- HEADER ---
  // Logo di Kiri
  const logoUrl =
    "https://wymrcotvuonhmltshbis.supabase.co/storage/v1/object/public/desain-pesanan//3p%20logo.png";
  // --- PERUBAHAN 2: Tambahkan kompresi pada gambar ---
  doc.addImage(logoUrl, "PNG", 15, y, 20, 16.7, undefined, "FAST");

  // Info Perusahaan di Tengah
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Tiga Putra Sablon & Konveksi", 105, y + 5, { align: "center" });
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(
    "Jl. Anjasmoro Tengah I No.22, Karangayu, Semarang Barat, Jawa Tengah 50149",
    105,
    y + 11,
    { align: "center" }
  );
  doc.text(
    "tigaputrakids@gmail.com | 0858-8139-7842 | 0823-2474-9297",
    105,
    y + 16,
    {
      align: "center",
    }
  );

  // Teks Invoice di Kanan
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", 195, y + 8, { align: "right" });

  y += 20;

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

  // --- TABEL ITEM ---
  const tableColumn = ["Deskripsi", "Kuantitas", "Harga Satuan", "Subtotal"];
  const tableRows: any[] = [];

  order.items.forEach((item) => {
    const subtotal = item.quantity * item.unitPrice;
    const itemData = [
      item.productType,
      item.quantity,
      `Rp ${item.unitPrice.toLocaleString("id-ID")}`,
      `Rp ${subtotal.toLocaleString("id-ID")}`,
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

  // --- RINGKASAN BIAYA ---
  const sisaPembayaran = order.totalAmount - order.paidAmount;
  doc.setFontSize(10);
  doc.text(`Total:`, 150, y, { align: "right" });
  doc.text(`Rp ${order.totalAmount.toLocaleString("id-ID")}`, 195, y, {
    align: "right",
  });
  y += 7;
  doc.text(`Sudah Dibayar (DP):`, 150, y, { align: "right" });
  doc.text(`Rp ${order.paidAmount.toLocaleString("id-ID")}`, 195, y, {
    align: "right",
  });
  y += 7;
  doc.setFont("helvetica", "bold");
  doc.text(`Sisa Pembayaran:`, 150, y, { align: "right" });
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
    y += splitNotes.length * 5 + 5;
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
