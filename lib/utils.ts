import { type ClassValue, clsx } from "clsx";
import { TableType } from "@prisma/client";
import { twMerge } from "tailwind-merge";
import { TABLE_RULES } from "@/lib/constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculatePrice(type: TableType, pax: number) {
  const rules = TABLE_RULES[type];
  const extraPax = Math.max(0, pax - rules.capacity);
  const extraCharge = extraPax * rules.extraFee;
  const totalAmount = rules.basePrice + extraCharge;

  return {
    extraCharge,
    totalAmount,
  };
}

export function canFitPax(type: TableType, pax: number) {
  const rules = TABLE_RULES[type];
  return pax > 0 && pax <= rules.maxPax;
}
