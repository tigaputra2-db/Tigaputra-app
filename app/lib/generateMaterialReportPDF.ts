// File: app/lib/generateMaterialReportPDF.ts (Versi Final dengan Semua Detail)

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Definisikan tipe data baru
interface MaterialUsageDetail {
  id: string;
  createdAt: string;
  quantityUsed: number;
  inventoryItem: { name: string; unit: string };
  orderItem: {
    order: { id: string; orderNumber: string; customer: { name: string } };
  };
}
interface InventorySummaryItem {
  name: string;
  quantity: number;
  unit: string;
}
interface FilterData {
  startDate: string;
  endDate: string;
}

export const generateMaterialReportPDF = (
  usageDetails: MaterialUsageDetail[],
  inventorySummary: InventorySummaryItem[],
  filters: FilterData
) => {
  const doc = new jsPDF({ compress: true });

  // --- HEADER DOKUMEN ---
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Laporan Penggunaan & Sisa Stok Bahan", 105, 20, {
    align: "center",
  });
  let y = 30;

  // --- REKAPITULASI SISA STOK ---
  doc.setFontSize(12);
  doc.text("Rekapitulasi Sisa Stok (Saat Ini)", 15, y);
  y += 6;
  const summaryBody = inventorySummary.map((item) => [
    item.name,
    `${item.quantity.toLocaleString("id-ID")} ${item.unit}`,
  ]);
  autoTable(doc, {
    head: [["Nama Bahan", "Sisa Stok"]],
    body: summaryBody,
    startY: y,
    theme: "grid",
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  // --- RINCIAN PENGGUNAAN ---
  doc.setFontSize(12);
  doc.text(
    `Rincian Penggunaan (Periode: ${new Date(
      filters.startDate
    ).toLocaleDateString("id-ID")} - ${new Date(
      filters.endDate
    ).toLocaleDateString("id-ID")})`,
    15,
    y
  );
  y += 6;

  const usageTableColumn = [
    "Tanggal",
    "Nama Bahan",
    "Jumlah",
    "Untuk Pesanan",
    "Nama Pemesan",
  ];
  const usageTableRows: any[] = [];
  usageDetails.forEach((log) => {
    const row = [
      new Date(log.createdAt).toLocaleDateString("id-ID"),
      log.inventoryItem.name,
      `${log.quantityUsed} ${log.inventoryItem.unit}`,
      log.orderItem.order.orderNumber,
      log.orderItem.order.customer.name,
    ];
    usageTableRows.push(row);
  });

  autoTable(doc, {
    head: [usageTableColumn],
    body: usageTableRows,
    startY: y,
    theme: "striped",
    headStyles: { fillColor: [41, 128, 185] },
  });

  // --- SIMPAN FILE PDF ---
  const fileName = `laporan_bahan_${filters.startDate}_sd_${filters.endDate}.pdf`;
  doc.save(fileName);
};
