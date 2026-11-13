/** Strip formatting and normalise Bangladeshi mobile numbers to the local 11-digit form. */
export function normalizePhone(input: string): string {
  let digits = input.replace(/[\s\-().]/g, "");
  if (digits.startsWith("+880")) digits = `0${digits.slice(4)}`;
  else if (digits.startsWith("880") && digits.length === 13) digits = `0${digits.slice(3)}`;
  return digits;
}

export function isValidBdMobile(input: string): boolean {
  return /^01[3-9]\d{8}$/.test(normalizePhone(input));
}
