import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Box, Typography, Tooltip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { styled } from '@mui/material/styles';

interface InvoiceQRCodeProps {
  invoice: {
    number: string;
    date: string;
    total: number;
    gstin?: string;
    sellerName?: string;
    upiId?: string;
  };
  size?: number;
  includeUPI?: boolean;
}

const QRContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(2),
  backgroundColor: '#fff',
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  maxWidth: 'fit-content',
  margin: '0 auto',
}));

const CopyButton = styled('button')({
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  color: '#3b82f6',
  fontSize: '0.75rem',
  marginTop: '8px',
  '&:hover': {
    textDecoration: 'underline',
  },
});

export const InvoiceQRCode: React.FC<InvoiceQRCodeProps> = ({
  invoice,
  size = 120,
  includeUPI = true,
}) => {
  // Format date to DD-MM-YYYY
  const formattedDate = new Date(invoice.date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).replace(/\//g, '-');

  // Create invoice data string
  const invoiceData = {
    'Invoice No': invoice.number,
    'Date': formattedDate,
    'Seller': invoice.sellerName || 'KrishiSethu',
    'GSTIN': invoice.gstin || '',
    'Total Amount': `₹${invoice.total.toFixed(2)}`,
    'Status': 'Unpaid',
  };

  // Convert to string with line breaks
  const qrText = Object.entries(invoiceData)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');

  // Create UPI payment link if upiId is provided
  const upiLink = invoice.upiId 
    ? `upi://pay?pa=${encodeURIComponent(invoice.upiId)}&pn=${encodeURIComponent(invoice.sellerName || 'KrishiSethu')}&am=${invoice.total}&tn=${encodeURIComponent(invoice.number)}`
    : '';

  // Combine invoice data and UPI link if needed
  const qrContent = includeUPI && upiLink 
    ? `${qrText}\n\nPay Now: ${upiLink}`
    : qrText;

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You can add a toast notification here if needed
      console.log('Copied to clipboard');
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <QRContainer>
      <Box sx={{ textAlign: 'center', p: 2 }}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          Scan to Pay
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1
        }}>
          <QRCodeSVG
            value={upiLink || qrContent}
            size={size}
            level="H"
            includeMargin={true}
          />
          {upiLink && (
            <Tooltip title="Copy UPI ID">
              <CopyButton onClick={() => handleCopy(invoice.upiId || '')}>
                <ContentCopyIcon sx={{ fontSize: '0.9rem' }} />
                <span>Copy UPI ID</span>
              </CopyButton>
            </Tooltip>
          )}
        </Box>
      </Box>
      
      <Box sx={{ mt: 1 }}>
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          Invoice: {invoice.number}
        </Typography>
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          Amount: ₹{invoice.total.toFixed(2)}
        </Typography>
      </Box>
    </QRContainer>
  );
};

export default InvoiceQRCode;
