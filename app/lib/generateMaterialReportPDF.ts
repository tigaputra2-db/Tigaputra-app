// File: app/lib/generateMaterialReportPDF.ts (Versi Diperbarui dengan Sisa Stok)

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Definisikan tipe data yang diharapkan oleh fungsi ini
interface MaterialReportItem {
  name: string;
  unit: string;
  totalUsed: number;
  remainingStock: number; // <-- Tambahkan properti baru
}

interface FilterData {
  startDate: string;
  endDate: string;
}

export const generateMaterialReportPDF = (
  reportData: MaterialReportItem[],
  filters: FilterData
) => {
  const doc = new jsPDF({ compress: true });

  // --- HEADER DOKUMEN ---
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Laporan Penggunaan & Sisa Stok Bahan", 105, 20, {
    align: "center",
  });

  // Info Periode Laporan
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  const periodText = `Periode Penggunaan: ${new Date(
    filters.startDate
  ).toLocaleDateString("id-ID")} - ${new Date(
    filters.endDate
  ).toLocaleDateString("id-ID")}`;
  doc.text(periodText, 105, 28, { align: "center" });

  // --- TABEL RINCIAN ---
  // --- PERUBAHAN DI SINI: Tambahkan kolom "Sisa Stok" ---
  const tableColumn = ["Nama Bahan", "Total Terpakai", "Sisa Stok", "Satuan"];
  const tableRows: any[] = [];

  reportData.forEach((item) => {
    const row = [
      item.name,
      item.totalUsed.toLocaleString("id-ID"),
      item.remainingStock.toLocaleString("id-ID"), // <-- Tambahkan data baru
      item.unit,
    ];
    tableRows.push(row);
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 40,
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185] },
    styles: { halign: "left" },
    columnStyles: {
      1: { halign: "right" }, // Rata kanan untuk kolom Total Terpakai
      2: { halign: "right" }, // Rata kanan untuk kolom Sisa Stok
    },
  });

  // --- SIMPAN FILE PDF ---
  const fileName = `laporan_bahan_${filters.startDate}_sd_${filters.endDate}.pdf`;
  doc.save(fileName);
};
