// File: app/dashboard/pesanan/baru/page.tsx (Versi Final Lengkap & Bersih)

"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";
import toast from "react-hot-toast";

// --- DEFINISI TIPE DATA ---
type OrderItem = {
  id: number; // ID sementara untuk rendering
  productType: string;
  details: any;
  quantity: number;
  unitPrice: number;
  discount: number; // Diskon untuk item ini
  designFile?: File | null;
  mockupFile?: File | null;
};
type Customer = {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
};
type Promotion = {
  id: string;
  name: string;
  type: string;
  value: number;
  isActive: boolean;
};
type FieldDefinition = {
  id: string;
  label: string;
  name: string;
  type: string;
  options: string[];
  placeholder: string | null;
};
type ProductType = {
  id: string;
  name: string;
  fieldDefinitions: FieldDefinition[];
};

// Helper component
const InputGroup = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="mb-4">
    <label className="block mb-1 text-sm font-medium text-slate-700">
      {label}
    </label>
    {children}
  </div>
);

export default function BuatPesananBaruPage() {
  const router = useRouter();

  // --- STATE MANAGEMENT ---
  const [items, setItems] = useState<OrderItem[]>([]); // Ini adalah "keranjang belanja" kita
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);

  const [currentItem, setCurrentItem] = useState<Partial<OrderItem>>({
    quantity: 1,
    unitPrice: 0,
    discount: 0,
    details: {},
  });
  const [selectedProductType, setSelectedProductType] =
    useState<ProductType | null>(null);
  const [currentSizeCategory, setCurrentSizeCategory] = useState("Dewasa");

  const [selectedCustomerId, setSelectedCustomerId] = useState("new");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [paidAmount, setPaidAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [selectedPromoId, setSelectedPromoId] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState("");

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoadingData(true);
      try {
        const [promotionsRes, customersRes, productTypesRes] =
          await Promise.all([
            fetch("/api/promotions"),
            fetch("/api/customers"),
            fetch("/api/product-types"),
          ]);
        if (!promotionsRes.ok) throw new Error("Gagal memuat data promosi");
        if (!customersRes.ok) throw new Error("Gagal memuat data pelanggan");
        if (!productTypesRes.ok) throw new Error("Gagal memuat jenis produk");

        const promotionsData = await promotionsRes.json();
        const customersData = await customersRes.json();
        const productTypesData = await productTypesRes.json();

        setPromotions(promotionsData);
        setCustomers(customersData);
        setProductTypes(productTypesData);
      } catch (err: any) {
        toast.error(err.message);
        setError(err.message);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchInitialData();
  }, []);

  // --- FORM HANDLERS ---
  const handleAddItem = () => {
    if (
      !currentItem.productType ||
      !currentItem.quantity ||
      currentItem.unitPrice === undefined
    ) {
      toast.error("Jenis produk, kuantitas, dan harga satuan harus diisi.");
      return;
    }
    setItems([...items, { ...currentItem, id: Date.now() } as OrderItem]);
    setCurrentItem({ quantity: 1, unitPrice: 0, discount: 0, details: {} });
    setSelectedProductType(null);
    toast.success("Item berhasil ditambahkan ke pesanan!");
  };

  const handleRemoveItem = (itemId: number) => {
    setItems(items.filter((item) => item.id !== itemId));
  };

  const handleProductTypeChange = (id: string) => {
    const product = productTypes.find((pt) => pt.id === id);
    setSelectedProductType(product || null);
    setCurrentItem({
      productType: product?.name || "",
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      details: {},
    });
  };

  const handleCurrentItemDetails = (key: string, value: any) => {
    setCurrentItem((prev) => ({
      ...prev,
      details: { ...(prev.details || {}), [key]: value },
    }));
  };

  const handleCurrentItemSize = (size: string, value: string) => {
    setCurrentItem((prev) => ({
      ...prev,
      details: {
        ...(prev.details || {}),
        sizes: {
          ...(prev.details?.sizes || {}),
          [size.toLowerCase()]: value,
        },
      },
    }));
  };

  // Efek untuk auto-update kuantitas total pada item yang sedang dibuat
  useEffect(() => {
    if (
      currentItem.productType === "Pesan Kaos Jadi" &&
      currentItem.details?.sizes
    ) {
      const totalQty = Object.values(currentItem.details.sizes).reduce(
        (sum: number, qty: any) => sum + (parseInt(qty) || 0),
        0
      );
      setCurrentItem((prev) => ({ ...prev, quantity: totalQty }));
    }
  }, [currentItem.details?.sizes, currentItem.productType]);

  // --- LOGIKA KALKULASI BIAYA BARU ---
  const subtotalAfterItemDiscount = items.reduce((sum, item) => {
    const priceAfterItemDiscount = (item.unitPrice || 0) - (item.discount || 0);
    return sum + priceAfterItemDiscount * item.quantity;
  }, 0);

  let subtotalDiscountAmount = 0;
  const selectedPromo = promotions.find((p) => p.id === selectedPromoId);
  if (selectedPromo) {
    if (selectedPromo.type === "PERCENTAGE") {
      subtotalDiscountAmount =
        subtotalAfterItemDiscount * (selectedPromo.value / 100);
    } else if (selectedPromo.type === "FIXED_AMOUNT") {
      subtotalDiscountAmount = selectedPromo.value;
    }
  }
  const totalAmount = subtotalAfterItemDiscount - subtotalDiscountAmount;

  // --- FUNGSI SUBMIT UTAMA ---
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Keranjang pesanan masih kosong.");
      return;
    }
    setIsSubmitting(true);
    setError("");

    try {
      const uploadedItems = await Promise.all(
        items.map(async (item) => {
          let designFileUrl = null,
            mockupFileUrl = null;
          if (item.designFile) {
            const { data, error } = await supabase.storage
              .from("desain-pesanan")
              .upload(
                `desain/${Date.now()}-${item.designFile.name}`,
                item.designFile
              );
            if (error)
              throw new Error(`Gagal upload file desain: ${error.message}`);
            designFileUrl = supabase.storage
              .from("desain-pesanan")
              .getPublicUrl(data.path).data.publicUrl;
          }
          if (item.mockupFile) {
            const { data, error } = await supabase.storage
              .from("desain-pesanan")
              .upload(
                `mockup/${Date.now()}-${item.mockupFile.name}`,
                item.mockupFile
              );
            if (error)
              throw new Error(`Gagal upload file mockup: ${error.message}`);
            mockupFileUrl = supabase.storage
              .from("desain-pesanan")
              .getPublicUrl(data.path).data.publicUrl;
          }

          const { id, designFile, mockupFile, ...restOfItem } = item;
          return {
            ...restOfItem,
            details: {
              ...item.details,
              ...(designFileUrl && { designFileUrl }),
              ...(mockupFileUrl && { mockupFileUrl }),
            },
          };
        })
      );

      const paymentStatus =
        paidAmount >= totalAmount && totalAmount > 0
          ? "LUNAS"
          : paidAmount > 0
          ? "DP"
          : "BELUM_BAYAR";
      const orderData = {
        customerName,
        customerPhone,
        customerAddress,
        dueDate,
        totalAmount,
        paidAmount,
        paymentMethod,
        paymentStatus,
        notes,
        items: uploadedItems,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message);
      }

      toast.success("Pesanan baru berhasil dibuat!");
      router.push("/dashboard/pesanan");
    } catch (err: any) {
      toast.error(err.message);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomerId(customerId);
    if (customerId === "new") {
      setCustomerName("");
      setCustomerPhone("");
      setCustomerAddress("");
    } else {
      const selected = customers.find((c) => c.id === customerId);
      if (selected) {
        setCustomerName(selected.name);
        setCustomerPhone(selected.phone || "");
        setCustomerAddress(selected.address || "");
      }
    }
  };

  if (isLoadingData) return <p>Memuat data formulir...</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800">Buat Pesanan Baru</h1>
      <form onSubmit={handleSubmit} className="mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* KOLOM KIRI & TENGAH */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4">
                Informasi Pelanggan
              </h3>
              <InputGroup label="Pilih Pelanggan">
                <select
                  className="w-full p-2 border rounded"
                  value={selectedCustomerId}
                  onChange={(e) => handleCustomerSelect(e.target.value)}
                >
                  <option value="new">-- Pelanggan Baru --</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} - {customer.phone}
                    </option>
                  ))}
                </select>
              </InputGroup>
              {selectedCustomerId === "new" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <InputGroup label="Nama Pelanggan Baru">
                    <input
                      className="w-full p-2 border rounded"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                    />
                  </InputGroup>
                  <InputGroup label="Nomor Telepon/WA Baru">
                    <input
                      className="w-full p-2 border rounded"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      required
                    />
                  </InputGroup>
                  <div className="md:col-span-2">
                    <InputGroup label="Alamat Pelanggan Baru">
                      <textarea
                        className="w-full p-2 border rounded"
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        rows={2}
                      ></textarea>
                    </InputGroup>
                  </div>
                </div>
              )}
              <div className="mt-4">
                <InputGroup label="Tanggal Selesai (Deadline)">
                  <input
                    className="w-full p-2 border rounded"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </InputGroup>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4">
                Keranjang Pesanan
              </h3>
              {items.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">
                  Belum ada item ditambahkan.
                </p>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-start p-3 bg-slate-50 rounded-lg"
                    >
                      <div>
                        <p className="font-semibold">{item.productType}</p>
                        <p className="text-sm text-slate-600">
                          {item.quantity} x Rp{" "}
                          {(
                            (item.unitPrice || 0) - (item.discount || 0)
                          ).toLocaleString("id-ID")}
                          {item.discount > 0 && (
                            <span className="line-through ml-2 text-slate-400">
                              Rp {item.unitPrice.toLocaleString("id-ID")}
                            </span>
                          )}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-500 hover:text-red-700 font-bold"
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4">
                Tambah Item ke Pesanan
              </h3>
              <InputGroup label="Jenis Produk">
                <select
                  className="w-full p-2 border rounded"
                  value={selectedProductType?.id || ""}
                  onChange={(e) => handleProductTypeChange(e.target.value)}
                >
                  <option value="">-- Pilih Jenis --</option>
                  {productTypes.map((pt) => (
                    <option key={pt.id} value={pt.id}>
                      {pt.name}
                    </option>
                  ))}
                </select>
              </InputGroup>

              {selectedProductType && (
                <div className="mt-4 pt-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedProductType.fieldDefinitions.map((field) => (
                      <InputGroup key={field.id} label={field.label}>
                        {field.type === "TEXT" && (
                          <input
                            type="text"
                            placeholder={field.placeholder || ""}
                            className="w-full p-2 border rounded"
                            onChange={(e) =>
                              handleCurrentItemDetails(
                                field.name,
                                e.target.value
                              )
                            }
                          />
                        )}
                        {field.type === "NUMBER" && (
                          <input
                            type="number"
                            placeholder={field.placeholder || ""}
                            className="w-full p-2 border rounded"
                            onChange={(e) =>
                              handleCurrentItemDetails(
                                field.name,
                                e.target.value
                              )
                            }
                          />
                        )}
                        {field.type === "TEXTAREA" && (
                          <textarea
                            rows={3}
                            placeholder={field.placeholder || ""}
                            className="w-full p-2 border rounded"
                            onChange={(e) =>
                              handleCurrentItemDetails(
                                field.name,
                                e.target.value
                              )
                            }
                          />
                        )}
                        {field.type === "FILE" && (
                          <input
                            type="file"
                            className="w-full p-2 border rounded"
                            onChange={(e) =>
                              setCurrentItem((prev) => ({
                                ...prev,
                                [field.name === "mockupFile"
                                  ? "mockupFile"
                                  : "designFile"]: e.target.files
                                  ? e.target.files[0]
                                  : null,
                              }))
                            }
                          />
                        )}
                        {field.type === "DROPDOWN" && (
                          <select
                            className="w-full p-2 border rounded"
                            onChange={(e) =>
                              handleCurrentItemDetails(
                                field.name,
                                e.target.value
                              )
                            }
                          >
                            <option value="">-- Pilih {field.label} --</option>
                            {field.options.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        )}
                      </InputGroup>
                    ))}
                  </div>
                  <hr className="my-4" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InputGroup label="Kuantitas">
                      <input
                        type="number"
                        className="w-full p-2 border rounded"
                        value={currentItem.quantity || 1}
                        onChange={(e) =>
                          setCurrentItem({
                            ...currentItem,
                            quantity: parseInt(e.target.value) || 1,
                          })
                        }
                      />
                    </InputGroup>
                    <InputGroup label="Harga Satuan">
                      <input
                        type="number"
                        className="w-full p-2 border rounded"
                        value={currentItem.unitPrice || 0}
                        onChange={(e) =>
                          setCurrentItem({
                            ...currentItem,
                            unitPrice: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </InputGroup>
                    <InputGroup label="Diskon per Item (Rp)">
                      <input
                        type="number"
                        className="w-full p-2 border rounded"
                        value={currentItem.discount || 0}
                        onChange={(e) =>
                          setCurrentItem({
                            ...currentItem,
                            discount: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </InputGroup>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="mt-2 px-4 py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600"
                  >
                    + Tambahkan ke Pesanan
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* KOLOM KANAN */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4">
                Rincian Biaya
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal (setelah diskon item):</span>
                  <span>
                    Rp {subtotalAfterItemDiscount.toLocaleString("id-ID")}
                  </span>
                </div>
                <InputGroup label="Diskon Tambahan">
                  <select
                    className="w-full p-2 border rounded"
                    value={selectedPromoId}
                    onChange={(e) => setSelectedPromoId(e.target.value)}
                  >
                    <option value="">-- Tanpa Diskon Tambahan --</option>
                    {promotions
                      .filter((p) => p.isActive)
                      .map((promo) => (
                        <option key={promo.id} value={promo.id}>
                          {promo.name}
                        </option>
                      ))}
                  </select>
                </InputGroup>
                {subtotalDiscountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Diskon Tambahan:</span>
                    <span>
                      - Rp {subtotalDiscountAmount.toLocaleString("id-ID")}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                  <span>Total:</span>
                  <span>Rp {totalAmount.toLocaleString("id-ID")}</span>
                </div>
              </div>
              <hr className="my-4" />
              <InputGroup label="Uang Muka (DP)">
                <input
                  className="w-full p-2 border rounded"
                  type="number"
                  value={paidAmount}
                  onChange={(e) =>
                    setPaidAmount(parseFloat(e.target.value) || 0)
                  }
                />
              </InputGroup>
              <InputGroup label="Metode Pembayaran">
                <select
                  className="w-full p-2 border rounded"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="Cash">Cash</option>
                  <option value="Transfer">Transfer</option>
                  <option value="QRIS">QRIS</option>
                </select>
              </InputGroup>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4">
                Catatan & Aksi
              </h3>
              <InputGroup label="Catatan Tambahan">
                <textarea
                  className="w-full p-2 border rounded"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                ></textarea>
              </InputGroup>
              {error && <p className="text-red-500 mb-2">{error}</p>}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-blue-500 text-white font-bold rounded hover:bg-blue-600 disabled:bg-blue-300"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Pesanan"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
