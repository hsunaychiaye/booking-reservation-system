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

export function getTodayDateInputValue() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateInputValue(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

export function getDateRangeFromInput(value: string) {
  const start = parseDateInputValue(value);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

export function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(parseDateInputValue(value));
}
