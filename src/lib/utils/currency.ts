export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(amount || 0);
};

export const formatNumberINR = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(amount || 0);
};

export const numberToIndianWords = (num: number): string => {
  if (isNaN(num) || num <= 0) return "Rupees Zero Only";

  const a = [
    "", "One ", "Two ", "Three ", "Four ", "Five ", "Six ", "Seven ", "Eight ", "Nine ",
    "Ten ", "Eleven ", "Twelve ", "Thirteen ", "Fourteen ", "Fifteen ", "Sixteen ", "Seventeen ", "Eighteen ", "Nineteen "
  ];
  const b = ["", "", "Twenty ", "Thirty ", "Forty ", "Fifty ", "Sixty ", "Seventy ", "Eighty ", "Ninety "];

  const inWords = (n: number): string => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + a[n % 10];
    if (n < 1000) return a[Math.floor(n / 100)] + "Hundred " + (n % 100 !== 0 ? "and " + inWords(n % 100) : "");
    return "";
  };

  let str = "";
  let val = Math.floor(num);
  const crore = Math.floor(val / 10000000);
  val %= 10000000;
  const lakh = Math.floor(val / 100000);
  val %= 100000;
  const thousand = Math.floor(val / 1000);
  val %= 1000;
  const hundred = Math.floor(val / 100);
  const remainder = val % 100;

  if (crore > 0) str += inWords(crore) + "Crore ";
  if (lakh > 0) str += inWords(lakh) + "Lakh ";
  if (thousand > 0) str += inWords(thousand) + "Thousand ";
  if (hundred > 0) str += inWords(hundred) + "Hundred ";
  if (remainder > 0) {
    if (str !== "") str += "and ";
    str += inWords(remainder);
  }

  const paise = Math.round((num - Math.floor(num)) * 100);
  let paiseStr = "";
  if (paise > 0) {
    paiseStr = ` and ${inWords(paise).trim()} Paise`;
  }

  return `Rupees ${str.trim()}${paiseStr} Only`;
};
