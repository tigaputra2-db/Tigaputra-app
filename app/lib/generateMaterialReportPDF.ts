// File: app/lib/generateMaterialReportPDF.ts (Versi Final dengan Semua Detail)

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Tipe data baru yang lebih lengkap
interface MaterialUsageDetail {
  id: string;
  createdAt: string;
  quantityUsed: number;
  inventoryItem: {
    name: string;
    unit: string;
    quantity: number; // Sisa stok
  };
  orderItem: {
    order: {
      id: string;
      orderNumber: string;
      customer: {
        // <-- Tambahkan info customer
        name: string;
      };
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

  // --- REKAPITULASI TOTAL PENGGUNAAN (DIPERBAIKI) ---
  const summary: { [name: string]: { total: number; unit: string } } = {};
  reportData.forEach((log) => {
    const name = log.inventoryItem.name;
    if (!summary[name]) {
      summary[name] = { total: 0, unit: log.inventoryItem.unit };
    }
    summary[name].total += log.quantityUsed;
  });

  if (Object.keys(summary).length > 0) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Rekapitulasi Total Penggunaan:", 15, y);
    y += 7;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    Object.entries(summary).forEach(([name, data]) => {
      doc.text(
        `- ${name}: ${data.total.toLocaleString("id-ID")} ${data.unit}`,
        20,
        y
      );
      y += 6;
    });
  }

  y += 5;

  // --- TABEL RINCIAN ---
  const tableColumn = [
    "Tanggal",
    "Nama Bahan",
    "Jumlah",
    "Sisa Stok",
    "Untuk Pesanan",
    "Nama Pemesan",
  ];
  const tableRows: any[] = [];

  reportData.forEach((log) => {
    const row = [
      new Date(log.createdAt).toLocaleDateString("id-ID"),
      log.inventoryItem.name,
      `${log.quantityUsed} ${log.inventoryItem.unit}`,
      `${log.inventoryItem.quantity} ${log.inventoryItem.unit}`,
      log.orderItem.order.orderNumber,
      log.orderItem.order.customer.name,
    ];
    tableRows.push(row);
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: y,
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185] },
  });

  // --- SIMPAN FILE PDF ---
  const fileName = `laporan_rincian_bahan_${filters.startDate}_sd_${filters.endDate}.pdf`;
  doc.save(fileName);
};
