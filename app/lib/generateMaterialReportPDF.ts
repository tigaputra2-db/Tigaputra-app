// File: app/lib/generateMaterialReportPDF.ts (Versi Final dengan Rekap Total)

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Definisikan tipe data baru
interface MaterialUsageDetail {
  id: string;
  createdAt: string;
  quantityUsed: number;
  inventoryItem: {
    name: string;
    unit: string;
  };
  orderItem: {
    order: {
      id: string;
      orderNumber: string;
    };
  };
}

interface FilterData {
  startDate: string;
  endDate: string;
}

export const generateMaterialReportPDF = (
  reportData: MaterialUsageDetail[],
  filters: FilterData
) => {
  const doc = new jsPDF({ compress: true });

  // --- HEADER DOKUMEN ---
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Laporan Rincian Penggunaan Bahan", 105, 20, { align: "center" });

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  const periodText = `Periode: ${new Date(filters.startDate).toLocaleDateString(
    "id-ID"
  )} - ${new Date(filters.endDate).toLocaleDateString("id-ID")}`;
  doc.text(periodText, 105, 28, { align: "center" });
  let y = 35;

  // --- PERUBAHAN DI SINI: Menambahkan Rekapitulasi Total ---
  // 1. Hitung total penggunaan untuk setiap satuan (unit)
  const summary: { [unit: string]: number } = {};
  reportData.forEach((log) => {
    const unit = log.inventoryItem.unit;
    if (!summary[unit]) {
      summary[unit] = 0;
    }
    summary[unit] += log.quantityUsed;
  });

  // 2. Tampilkan rekapitulasi di PDF
  if (Object.keys(summary).length > 0) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Rekapitulasi Total Penggunaan:", 15, y);
    y += 7;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    Object.entries(summary).forEach(([unit, total]) => {
      doc.text(`- ${total.toLocaleString("id-ID")} ${unit}`, 20, y);
      y += 6;
    });
  }

  y += 5; // Beri sedikit spasi sebelum tabel

  // --- TABEL RINCIAN ---
  const tableColumn = ["Tanggal", "Nama Bahan", "Jumlah", "Untuk Pesanan"];
  const tableRows: any[] = [];

  reportData.forEach((log) => {
    const row = [
      new Date(log.createdAt).toLocaleDateString("id-ID"),
      log.inventoryItem.name,
      `${log.quantityUsed} ${log.inventoryItem.unit}`,
      log.orderItem.order.orderNumber,
    ];
    tableRows.push(row);
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: y, // Gunakan posisi y yang sudah disesuaikan
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185] },
  });

  // --- SIMPAN FILE PDF ---
  const fileName = `laporan_rincian_bahan_${filters.startDate}_sd_${filters.endDate}.pdf`;
  doc.save(fileName);
};
