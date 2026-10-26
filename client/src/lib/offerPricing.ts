// Client-approved campaign prices per upper or lower arch.
// Edit these two numbers together when the practice approves new pricing.
export const PMMA_PRICE_AMOUNT = 14990;
export const ZIRCONIA_PRICE_AMOUNT = 17990;

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const PMMA_PRICE = usd.format(PMMA_PRICE_AMOUNT);
export const ZIRCONIA_PRICE = usd.format(ZIRCONIA_PRICE_AMOUNT);
export const UPGRADE_PRICE = usd.format(
  ZIRCONIA_PRICE_AMOUNT - PMMA_PRICE_AMOUNT
);
