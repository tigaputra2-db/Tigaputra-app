// File: app/lib/generateSalesReportPDF.ts

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Definisikan tipe data yang diharapkan oleh fungsi ini
interface ReportData {
  summary: {
    totalRevenue: number;
    totalTransactions: number;
  };
  transactions: {
    orderNumber: string;
    orderDate: string;
    customer: { name: string };
    totalAmount: number;
    paymentMethod: string | null;
  }[];
}

interface FilterData {
  startDate: string;
  endDate: string;
}

export const generateSalesReportPDF = (
  reportData: ReportData,
  filters: FilterData
) => {
  const doc = new jsPDF({ compress: true });

  // --- HEADER DOKUMEN ---
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Laporan Penjualan", 105, 20, { align: "center" });

  // Info Periode Laporan
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  const periodText = `Periode: ${new Date(filters.startDate).toLocaleDateString(
    "id-ID"
  )} - ${new Date(filters.endDate).toLocaleDateString("id-ID")}`;
  doc.text(periodText, 105, 28, { align: "center" });

  // --- BAGIAN RINGKASAN ---
  let y = 40;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Ringkasan", 15, y);
  y += 8;
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Total Omzet: Rp ${reportData.summary.totalRevenue.toLocaleString(
      "id-ID"
    )}`,
    15,
    y
  );
  y += 7;
  doc.text(
    `Jumlah Transaksi: ${reportData.summary.totalTransactions} pesanan`,
    15,
    y
  );
  y += 10;

  // --- TABEL RINCIAN TRANSAKSI ---
  const tableColumn = [
    "No. Pesanan",
    "Tanggal",
    "Pelanggan",
    "Metode Bayar",
    "Total (Rp)",
  ];
  const tableRows: any[] = [];

  reportData.transactions.forEach((tx) => {
    const row = [
      tx.orderNumber,
      new Date(tx.orderDate).toLocaleDateString("id-ID"),
      tx.customer.name,
      tx.paymentMethod || "-",
      tx.totalAmount.toLocaleString("id-ID"),
    ];
    tableRows.push(row);
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: y,
    theme: "striped",
    headStyles: { fillColor: [41, 128, 185] },
    styles: { halign: "left" },
    columnStyles: {
      4: { halign: "right" }, // Rata kanan untuk kolom Total
    },
  });

  // --- SIMPAN FILE PDF ---
  const fileName = `laporan_penjualan_${filters.startDate}_sd_${filters.endDate}.pdf`;
  doc.save(fileName);
};
