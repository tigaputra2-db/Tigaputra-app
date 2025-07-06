// File: app/lib/generateSalesReportPDF.ts (Versi Final dengan Sub-Detail)

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Definisikan tipe data yang lengkap sesuai dengan data dari API
interface OrderItem {
  id: string;
  productType: string;
  quantity: number;
  unitPrice: number;
  discount: number;
}
interface Transaction {
  id: string;
  orderNumber: string;
  orderDate: string;
  totalAmount: number;
  paymentMethod: string | null;
  customer: { name: string };
  items: OrderItem[];
}
interface ReportData {
  summary: {
    totalRevenue: number;
    totalTransactions: number;
  };
  transactions: Transaction[];
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
  const pageHeight = doc.internal.pageSize.height;
  let y = 15;

  // --- HEADER DOKUMEN ---
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Laporan Penjualan Rinci", 105, y, { align: "center" });
  y += 8;
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  const periodText = `Periode: ${new Date(filters.startDate).toLocaleDateString(
    "id-ID"
  )} - ${new Date(filters.endDate).toLocaleDateString("id-ID")}`;
  doc.text(periodText, 105, y, { align: "center" });
  y += 10;

  // --- RINGKASAN ---
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Ringkasan Total", 15, y);
  y += 6;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Total Omzet: Rp ${reportData.summary.totalRevenue.toLocaleString(
      "id-ID"
    )}`,
    15,
    y
  );
  y += 5;
  doc.text(
    `Jumlah Transaksi: ${reportData.summary.totalTransactions} pesanan`,
    15,
    y
  );
  y += 10;
  doc.setLineWidth(0.5);
  doc.line(15, y, 195, y);
  y += 10;

  // --- LOOP UNTUK SETIAP TRANSAKSI ---
  reportData.transactions.forEach((tx, index) => {
    // Cek jika butuh halaman baru sebelum mencetak transaksi
    if (y > pageHeight - 60) {
      // 60 adalah perkiraan tinggi konten
      doc.addPage();
      y = 20; // Reset posisi y di halaman baru
    }

    // Info Transaksi Utama
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`Pesanan #${tx.orderNumber}`, 15, y);
    y += 6;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Tanggal: ${new Date(tx.orderDate).toLocaleDateString(
        "id-ID"
      )} | Pelanggan: ${
        tx.customer.name
      } | Total: Rp ${tx.totalAmount.toLocaleString("id-ID")}`,
      15,
      y
    );
    y += 8;

    // Sub-Tabel untuk Item
    const tableColumn = ["Item", "Qty", "Harga", "Diskon", "Total"];
    const tableRows: any[] = [];
    tx.items.forEach((item) => {
      const itemTotal = item.quantity * (item.unitPrice - (item.discount || 0));
      tableRows.push([
        item.productType,
        item.quantity,
        `Rp ${item.unitPrice.toLocaleString("id-ID")}`,
        `Rp ${(item.discount || 0).toLocaleString("id-ID")}`,
        `Rp ${itemTotal.toLocaleString("id-ID")}`,
      ]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: y,
      theme: "grid",
      styles: { fontSize: 8 },
      headStyles: { fillColor: [100, 116, 139], fontSize: 8 },
      columnStyles: {
        1: { halign: "right" },
        2: { halign: "right" },
        3: { halign: "right" },
        4: { halign: "right" },
      },
    });

    y = (doc as any).lastAutoTable.finalY + 10; // Update posisi y setelah sub-tabel
  });

  // --- SIMPAN FILE PDF ---
  const fileName = `laporan_penjualan_rinci_${filters.startDate}_sd_${filters.endDate}.pdf`;
  doc.save(fileName);
};
