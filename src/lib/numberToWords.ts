// Number to words conversion utility for Indian currency
export const convertToWords = (amount: number): string => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convertHundreds = (num: number): string => {
    let result = '';
    
    if (num >= 100) {
      result += ones[Math.floor(num / 100)] + ' Hundred ';
      num %= 100;
    }
    
    if (num >= 20) {
      result += tens[Math.floor(num / 10)] + ' ';
      num %= 10;
    } else if (num >= 10) {
      result += teens[num - 10] + ' ';
      return result;
    }
    
    if (num > 0) {
      result += ones[num] + ' ';
    }
    
    return result;
  };

  if (amount === 0) return 'Zero Only';
  
  // Split into rupees and paise
  let rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  
  let result = '';
  
  if (rupees > 0) {
    if (rupees >= 10000000) { // Crores
      result += convertHundreds(Math.floor(rupees / 10000000)) + 'Crore ';
      rupees %= 10000000;
    }
    
    if (rupees >= 100000) { // Lakhs
      result += convertHundreds(Math.floor(rupees / 100000)) + 'Lakh ';
      rupees %= 100000;
    }
    
    if (rupees >= 1000) { // Thousands
      result += convertHundreds(Math.floor(rupees / 1000)) + 'Thousand ';
      rupees %= 1000;
    }
    
    if (rupees > 0) {
      result += convertHundreds(rupees);
    }
    
    result += 'Rupees ';
  }
  
  if (paise > 0) {
    result += 'and ' + convertHundreds(paise) + 'Paise ';
  }
  
  return result.trim() + ' Only';
};
