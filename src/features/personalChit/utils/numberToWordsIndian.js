// Utility function to convert numbers to Indian Rupees in words
export const numberToWordsIndian = (num) => {
  if (!num || isNaN(num) || Number(num) === 0) return "";

  const a = [
    "",
    "One ",
    "Two ",
    "Three ",
    "Four ",
    "Five ",
    "Six ",
    "Seven ",
    "Eight ",
    "Nine ",
    "Ten ",
    "Eleven ",
    "Twelve ",
    "Thirteen ",
    "Fourteen ",
    "Fifteen ",
    "Sixteen ",
    "Seventeen ",
    "Eighteen ",
    "Nineteen ",
  ];
  const b = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const formatNumber = (n) => {
    if (n < 20) return a[n];
    if (n < 100)
      return b[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + a[n % 10] : " ");
    if (n < 1000)
      return (
        a[Math.floor(n / 100)] +
        "Hundred " +
        (n % 100 !== 0 ? formatNumber(n % 100) : "")
      );
    return "";
  };

  let n = Math.floor(Number(num));
  if (n === 0) return "";

  let str = "";
  const crore = Math.floor(n / 10000000);
  n %= 10000000;
  const lakh = Math.floor(n / 100000);
  n %= 100000;
  const thousand = Math.floor(n / 1000);
  n %= 1000;

  if (crore > 0) str += formatNumber(crore) + "Crore ";
  if (lakh > 0) str += formatNumber(lakh) + "Lakh ";
  if (thousand > 0) str += formatNumber(thousand) + "Thousand ";
  if (n > 0) str += formatNumber(n);

  return str.trim() + " Rupees Only";
};
