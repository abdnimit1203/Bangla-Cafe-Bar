"use client";

import { useState } from "react";
import QRCode from "qrcode";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export interface PassDetails {
  type: "reservation" | "order";
  referenceNumber: string;
  title: string;
  status: string;
  fields: Array<{ label: string; value: string }>;
  qrValue: string;
  note?: string;
}

export function PassActions({ details }: { details: PassDetails }) {
  const [downloadingImg, setDownloadingImg] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // 1. Direct PDF Download (Generates clean 1-page PDF of ONLY the booking/order slip)
  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a5",
      });

      const width = doc.internal.pageSize.getWidth();
      const height = doc.internal.pageSize.getHeight();

      // Top green brand banner (#233e2b)
      doc.setFillColor(35, 62, 43);
      doc.rect(0, 0, width, 32, "F");

      // Brand Name
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("BANGLA CAFE & BAR", 15, 14);

      // Subtitle
      doc.setTextColor(243, 156, 18); // Amber
      doc.setFontSize(9);
      doc.text(
        details.type === "reservation"
          ? "OFFICIAL TABLE RESERVATION PASS"
          : "OFFICIAL ORDER RECEIPT & PROOF",
        15,
        22
      );

      // Card outline
      doc.setDrawColor(230, 221, 206);
      doc.setLineWidth(0.4);
      doc.roundedRect(10, 38, width - 20, height - 48, 4, 4, "S");

      // Reference Number
      doc.setTextColor(34, 28, 23);
      doc.setFontSize(15);
      doc.setFont("helvetica", "bold");
      doc.text(details.referenceNumber, 16, 50);

      // Status badge
      const isCancelled = details.status.toLowerCase().includes("cancel");
      doc.setFillColor(isCancelled ? 248 : 227, isCancelled ? 226 : 239, isCancelled ? 221 : 227);
      doc.roundedRect(width - 45, 43, 30, 9, 3, 3, "F");
      doc.setTextColor(isCancelled ? 184 : 35, isCancelled ? 58 : 62, isCancelled ? 42 : 43);
      doc.setFontSize(8);
      doc.text(details.status.toUpperCase(), width - 30, 49, { align: "center" });

      // Divider
      doc.setDrawColor(230, 221, 206);
      doc.line(16, 56, width - 16, 56);

      // Details Table
      let y = 66;
      for (const field of details.fields) {
        doc.setTextColor(97, 86, 76);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(field.label, 16, y);

        doc.setTextColor(34, 28, 23);
        doc.setFont("helvetica", "bold");
        doc.text(field.value, width - 16, y, { align: "right" });

        y += 9;
      }

      // QR Code
      const qrDataUrl = await QRCode.toDataURL(details.qrValue, { width: 280, margin: 1 });
      const qrSize = 42;
      const qrX = (width - qrSize) / 2;
      const qrY = y + 8;

      doc.setFillColor(250, 247, 240);
      doc.roundedRect(qrX - 4, qrY - 4, qrSize + 8, qrSize + 8, 3, 3, "F");
      doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);

      // Scan instruction
      doc.setTextColor(97, 86, 76);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text("Scan this code at restaurant for quick entry / verification", width / 2, qrY + qrSize + 9, {
        align: "center",
      });

      // Footer
      doc.setDrawColor(230, 221, 206);
      doc.line(16, height - 20, width - 16, height - 20);
      doc.setTextColor(145, 132, 118);
      doc.setFontSize(8);
      doc.text("Gulshan 2, Dhaka • Phone: 01712-345678", width / 2, height - 15, { align: "center" });

      const cleanRef = details.referenceNumber.replace(/[^a-zA-Z0-9_-]/g, "_");
      doc.save(`BanglaCafe_${details.type}_${cleanRef}.pdf`);
    } catch (err) {
      console.error("PDF generation error:", err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  // 2. Isolated Slip Print (Prints ONLY the slip in an iframe, never the whole webpage)
  const handlePrintSlip = async () => {
    try {
      const qrDataUrl = await QRCode.toDataURL(details.qrValue, { width: 200, margin: 1 });
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "none";
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (!doc) return;

      const isCancelled = details.status.toLowerCase().includes("cancel");

      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${details.title} - ${details.referenceNumber}</title>
            <style>
              @page { size: auto; margin: 8mm; }
              body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                margin: 0;
                padding: 16px;
                color: #221c17;
                background: #fff;
              }
              .slip-card {
                max-width: 440px;
                margin: 0 auto;
                border: 2px solid #233e2b;
                border-radius: 14px;
                overflow: hidden;
              }
              .slip-header {
                background: #233e2b;
                color: #fff;
                padding: 16px 20px;
              }
              .slip-brand {
                font-size: 19px;
                font-weight: 800;
                letter-spacing: 0.04em;
                margin: 0;
              }
              .slip-subtitle {
                font-size: 10px;
                font-weight: 700;
                color: #f39c12;
                text-transform: uppercase;
                letter-spacing: 0.08em;
                margin-top: 3px;
              }
              .slip-body {
                padding: 20px;
              }
              .slip-ref-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid #e6ddce;
                padding-bottom: 10px;
                margin-bottom: 14px;
              }
              .slip-ref {
                font-size: 18px;
                font-weight: 800;
                margin: 0;
              }
              .slip-badge {
                display: inline-block;
                background: ${isCancelled ? "#f8e2dd" : "#e3efe3"};
                color: ${isCancelled ? "#b83a2a" : "#233e2b"};
                font-size: 11px;
                font-weight: 700;
                padding: 3px 10px;
                border-radius: 9999px;
                text-transform: uppercase;
              }
              .slip-field {
                display: flex;
                justify-content: space-between;
                padding: 6px 0;
                font-size: 13px;
                border-bottom: 1px dashed #f0ece3;
              }
              .slip-field-label {
                color: #61564c;
              }
              .slip-field-val {
                font-weight: 700;
              }
              .slip-qr-box {
                text-align: center;
                padding: 14px;
                background: #faf7f0;
                border-radius: 12px;
                margin-top: 14px;
              }
              .slip-qr {
                width: 120px;
                height: 120px;
                display: block;
                margin: 0 auto;
              }
              .slip-instruction {
                font-size: 11px;
                font-weight: 600;
                color: #61564c;
                margin-top: 6px;
              }
              .slip-footer {
                text-align: center;
                margin-top: 14px;
                font-size: 11px;
                color: #918476;
                border-top: 1px solid #e6ddce;
                padding-top: 10px;
              }
            </style>
          </head>
          <body>
            <div class="slip-card">
              <div class="slip-header">
                <h1 class="slip-brand">BANGLA CAFE &amp; BAR</h1>
                <div class="slip-subtitle">${
                  details.type === "reservation"
                    ? "Official Table Reservation Pass"
                    : "Official Order Receipt &amp; Proof"
                }</div>
              </div>
              <div class="slip-body">
                <div class="slip-ref-row">
                  <span class="slip-ref">${details.referenceNumber}</span>
                  <span class="slip-badge">${details.status}</span>
                </div>
                <div>
                  ${details.fields
                    .map(
                      (f) => `
                    <div class="slip-field">
                      <span class="slip-field-label">${f.label}</span>
                      <span class="slip-field-val">${f.value}</span>
                    </div>
                  `
                    )
                    .join("")}
                </div>
                <div class="slip-qr-box">
                  <img src="${qrDataUrl}" class="slip-qr" alt="QR Code" />
                  <div class="slip-instruction">Scan at restaurant for instant verification</div>
                </div>
                <div class="slip-footer">
                  Gulshan 2, Dhaka • Phone: 01712-345678
                </div>
              </div>
            </div>
          </body>
        </html>
      `);
      doc.close();

      iframe.contentWindow?.focus();
      setTimeout(() => {
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1500);
      }, 300);
    } catch (err) {
      console.error("Print slip error:", err);
    }
  };

  // 3. Download Image (PNG)
  const handleDownloadImage = async () => {
    setDownloadingImg(true);
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const width = 640;
      const height = 820;
      canvas.width = width;
      canvas.height = height;

      // Surface
      ctx.fillStyle = "#faf7f0";
      ctx.fillRect(0, 0, width, height);

      // Card
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#e6ddce";
      ctx.lineWidth = 2;
      roundRect(ctx, 24, 24, width - 48, height - 48, 20);
      ctx.fill();
      ctx.stroke();

      // Header Banner (Forest Green)
      ctx.fillStyle = "#233e2b";
      roundRect(ctx, 24, 24, width - 48, 110, { tl: 20, tr: 20, br: 0, bl: 0 });
      ctx.fill();

      // Brand Title
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 26px 'Playfair Display', Georgia, serif";
      ctx.fillText("BANGLA CAFE & BAR", 48, 70);

      ctx.fillStyle = "#d97724";
      ctx.font = "bold 13px system-ui, sans-serif";
      ctx.fillText(
        details.type === "reservation" ? "OFFICIAL TABLE RESERVATION PASS" : "OFFICIAL ORDER RECEIPT & PROOF",
        48,
        100
      );

      // Reference Number & Status
      ctx.fillStyle = "#221c17";
      ctx.font = "bold 24px system-ui, sans-serif";
      ctx.fillText(details.referenceNumber, 48, 175);

      // Status pill
      const isCancelled = details.status.toLowerCase().includes("cancel");
      ctx.fillStyle = isCancelled ? "#f8e2dd" : "#e3efe3";
      roundRect(ctx, width - 170, 150, 120, 32, 16);
      ctx.fill();
      ctx.fillStyle = isCancelled ? "#b83a2a" : "#233e2b";
      ctx.font = "bold 13px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(details.status.toUpperCase(), width - 110, 171);
      ctx.textAlign = "left";

      // Divider
      ctx.strokeStyle = "#e6ddce";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(48, 205);
      ctx.lineTo(width - 48, 205);
      ctx.stroke();

      // Details Rows
      let currentY = 245;
      for (const field of details.fields) {
        ctx.fillStyle = "#61564c";
        ctx.font = "14px system-ui, sans-serif";
        ctx.fillText(field.label, 48, currentY);

        ctx.fillStyle = "#221c17";
        ctx.font = "bold 15px system-ui, sans-serif";
        ctx.fillText(field.value, 200, currentY);

        currentY += 40;
      }

      // QR Code Box
      const qrDataUrl = await QRCode.toDataURL(details.qrValue, {
        width: 220,
        margin: 1,
        color: { dark: "#221c17", light: "#ffffff" },
      });
      const qrImg = new Image();
      await new Promise<void>((resolve, reject) => {
        qrImg.onload = () => resolve();
        qrImg.onerror = reject;
        qrImg.src = qrDataUrl;
      });

      const qrSize = 170;
      const qrX = (width - qrSize) / 2;
      const qrY = currentY + 15;

      ctx.fillStyle = "#f6f3ed";
      roundRect(ctx, qrX - 12, qrY - 12, qrSize + 24, qrSize + 24, 16);
      ctx.fill();
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

      // Scan instruction
      ctx.fillStyle = "#918476";
      ctx.font = "12px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Scan this code at restaurant for quick entry / verification", width / 2, qrY + qrSize + 30);
      ctx.fillText("Gulshan 2, Dhaka • Phone: 01712-345678", width / 2, qrY + qrSize + 48);

      const pngUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = pngUrl;
      const cleanRef = details.referenceNumber.replace(/[^a-zA-Z0-9_-]/g, "_");
      a.download = `BanglaCafe_${details.type}_${cleanRef}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error("Error generating image:", e);
    } finally {
      setDownloadingImg(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 pt-2">
      <Button
        variant="forest"
        size="sm"
        onClick={handleDownloadPdf}
        loading={downloadingPdf}
        className="shadow-soft-xs text-xs font-semibold"
      >
        <Icon name="download" size={14} />
        Download PDF
      </Button>

      <Button
        variant="secondary"
        size="sm"
        onClick={handleDownloadImage}
        loading={downloadingImg}
        className="shadow-soft-xs text-xs font-semibold"
      >
        <Icon name="receipt" size={14} />
        Download Image (PNG)
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={handlePrintSlip}
        className="shadow-soft-xs text-xs font-semibold text-ink-muted hover:text-ink"
      >
        <Icon name="clock" size={14} />
        Print Slip
      </Button>
    </div>
  );
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number | { tl: number; tr: number; br: number; bl: number }
) {
  const r =
    typeof radius === "number"
      ? { tl: radius, tr: radius, br: radius, bl: radius }
      : radius;

  ctx.beginPath();
  ctx.moveTo(x + r.tl, y);
  ctx.lineTo(x + w - r.tr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r.tr);
  ctx.lineTo(x + w, y + h - r.br);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r.br, y + h);
  ctx.lineTo(x + r.bl, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r.bl);
  ctx.lineTo(x, y + r.tl);
  ctx.quadraticCurveTo(x, y, x + r.tl, y);
  ctx.closePath();
}
