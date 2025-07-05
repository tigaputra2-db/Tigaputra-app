// File: app/lib/generateReceiptPDF.ts (Versi Diperbarui dengan Header Rata Kiri)

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Definisikan tipe data
interface ReceiptData {
  receiptNumber: string;
  receiptDate: string;
  supplier: { name: string };
  items: { name: string; quantity: number; unit: string }[];
  notes: string | null;
}

export const generateReceiptPDF = (receipt: ReceiptData) => {
  const doc = new jsPDF({ compress: true });
  const pageHeight = doc.internal.pageSize.height;
  let y = 15;

  // --- HEADER ---
  // Logo di Kiri
  const logoUrl =
    "https://wymrcotvuonhmltshbis.supabase.co/storage/v1/object/public/desain-pesanan//3p%20logo.png";
  doc.addImage(logoUrl, "PNG", 17, y + 3, 20, 16.7, undefined, "FAST");

  // --- PERUBAHAN DI SINI: Info Perusahaan Rata Kiri setelah Logo ---
  const companyInfoX = 40; // Posisi X setelah logo
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Tiga Putra Sablon & Konveksi", companyInfoX, y + 5); // Rata kiri adalah default
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Jl. Anjasmoro Tengah I No.22, Karangayu,", companyInfoX, y + 11);
  doc.text("Semarang Barat, Jawa Tengah 50149", companyInfoX, y + 16);
  doc.text(
    "tigaputrakids@gmail.com | 0858-8139-7842 | 0823-2474-9297",
    companyInfoX,
    y + 21
  );

  // Teks Judul di Kanan
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("BUKTI PENERIMAAN BARANG", 195, y + 8, { align: "right" });
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text(`No: ${receipt.receiptNumber}`, 195, y + 14, { align: "right" });

  y += 25;

  doc.setLineWidth(0.5);
  doc.line(15, y, 195, y);
  y += 10;

  // --- INFO PENERIMAAN ---
  doc.setFontSize(10);
  doc.text(
    `Tanggal Terima: ${new Date(receipt.receiptDate).toLocaleDateString(
      "id-ID"
    )}`,
    15,
    y
  );
  doc.text(`Diterima dari: ${receipt.supplier.name}`, 110, y);
  y += 10;

  // --- TABEL ITEM ---
  const tableColumn = ["Nama Barang", "Jumlah", "Satuan"];
  const tableRows: any[] = [];

  receipt.items.forEach((item) => {
    const itemData = [item.name, item.quantity, item.unit];
    tableRows.push(itemData);
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: y,
    theme: "grid",
    headStyles: { fillColor: [80, 80, 80] },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // --- CATATAN ---
  if (receipt.notes) {
    doc.setFont("helvetica", "normal");
    doc.text("Catatan:", 15, y);
    y += 5;
    const splitNotes = doc.splitTextToSize(receipt.notes, 180);
    doc.text(splitNotes, 15, y);
  }

  // --- SIMPAN PDF ---
  const supplierName = receipt.supplier.name
    .replace(/[^a-zA-Z0-9]/g, "_")
    .toLowerCase();
  doc.save(`penerimaan_${supplierName}_${receipt.receiptNumber}.pdf`);
};
