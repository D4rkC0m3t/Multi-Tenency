import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QRCodeGeneratorProps {
  data: string;
  size?: number;
  style?: React.CSSProperties;
}

export function QRCodeGenerator({ data, size = 80, style }: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && data) {
      try {
        QRCode.toCanvas(canvasRef.current, data, {
          width: size,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#ffffff'
          }
        });
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    }
  }, [data, size]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        border: '1px solid #ddd',
        borderRadius: '4px',
        ...style
      }}
    />
  );
}

// Helper function to generate QR data for invoices
export function generateInvoiceQRData(invoice: {
  invoiceNo: string;
  date: string;
  customerName?: string;
  grandTotal: number;
  merchantName: string;
}) {
  const qrData = {
    invoice_no: invoice.invoiceNo,
    date: invoice.date,
    customer: invoice.customerName || 'Walk-in Customer',
    amount: invoice.grandTotal,
    merchant: invoice.merchantName,
    generated_at: new Date().toISOString()
  };
  
  return JSON.stringify(qrData);
}
