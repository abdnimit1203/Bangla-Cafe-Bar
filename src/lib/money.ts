import { minorUnitsToMajor } from "@classytic/primitives/money";
import { restaurantConfig } from "@/lib/config/restaurant";

/**
 * Display helper for integer minor-unit amounts coming from the API.
 * Never used for arithmetic the server is responsible for (totals, fees).
 */
export function formatMoney(
  amountMinor: number,
  currency: string,
  locale: string = restaurantConfig.locale,
): string {
  let major: number;
  try {
    major = minorUnitsToMajor(amountMinor, currency);
  } catch {
    major = amountMinor / 100;
  }
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
    }).format(major);
  } catch {
    return `${currency} ${major.toFixed(2)}`;
  }
}

export function formatMoneyValue(money: { amount: number; currency: string }): string {
  return formatMoney(money.amount, money.currency);
}
