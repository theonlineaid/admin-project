"use client";

import { useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";

export type OrderForPdf = {
  orderNumber: string;
  createdAt: string;
  totalPrice: string;
  status: string;
  paymentStatus: string;
  notes: string | null;
  user: { name: string; email: string };
  shippingAddress: Record<string, string> | null;
  items: Array<{
    product: { name: string };
    quantity: number;
    price: string;
  }>;
};

function formatCurrency(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num);
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(new Date(dateStr));
}

export function DownloadInvoicePdf({ order }: { order: OrderForPdf }) {
  const [loading, setLoading] = useState(false);

  function handleDownload() {
    setLoading(true);
    try {
      const doc = new jsPDF();
      const pageWidth = 210; // A4 width in mm
      let y = 20;

      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("INVOICE", 20, y);
      y += 8;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`#${order.orderNumber}`, 20, y);
      doc.text(`Date: ${formatDate(order.createdAt)}`, pageWidth - 20, y, { align: "right" });
      y += 12;

      doc.setFont("helvetica", "bold");
      doc.text("Bill to", 20, y);
      y += 6;
      doc.setFont("helvetica", "normal");
      doc.text(order.user.name, 20, y);
      y += 5;
      doc.text(order.user.email, 20, y);
      y += 5;
      if (order.shippingAddress && (order.shippingAddress.street || order.shippingAddress.city)) {
        const addr = [
          order.shippingAddress.street,
          order.shippingAddress.city,
          order.shippingAddress.zip,
          order.shippingAddress.country,
        ]
          .filter(Boolean)
          .join(", ");
        doc.text(addr, 20, y);
        y += 5;
      }
      y += 10;

      const tableBody = order.items.map((item) => {
        const price = parseFloat(item.price);
        const amount = price * item.quantity;
        return [
          item.product.name,
          String(item.quantity),
          formatCurrency(price),
          formatCurrency(amount),
        ];
      });

      autoTable(doc, {
        startY: y,
        head: [["Product", "Qty", "Unit price", "Amount"]],
        body: tableBody,
        theme: "grid",
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        margin: { left: 20, right: 20 },
        columnStyles: {
          0: { cellWidth: "auto" },
          1: { cellWidth: 25, halign: "right" },
          2: { cellWidth: 35, halign: "right" },
          3: { cellWidth: 40, halign: "right" },
        },
      });

      const docWithTable = doc as jsPDF & { lastAutoTable?: { finalY: number } };
      const finalY = docWithTable.lastAutoTable?.finalY ?? y + 30;
      let nextY = finalY + 10;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("Total", pageWidth - 20 - 40, nextY, { align: "right" });
      doc.text(formatCurrency(order.totalPrice), pageWidth - 20, nextY, { align: "right" });
      nextY += 10;

      if (order.notes) {
        nextY += 5;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text("Notes:", 20, nextY);
        nextY += 5;
        const splitNotes = doc.splitTextToSize(order.notes, pageWidth - 40);
        doc.text(splitNotes, 20, nextY);
      }

      doc.save(`invoice-${order.orderNumber}.pdf`);
    } catch (e) {
      console.error(e);
      alert("Failed to generate PDF");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownload}
      disabled={loading}
    >
      <FileDown className="h-4 w-4 mr-2" />
      {loading ? "Generating..." : "Download PDF"}
    </Button>
  );
}
