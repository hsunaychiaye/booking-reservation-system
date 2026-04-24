import { PaymentStatus, TableType } from "@prisma/client";

export const AUTHORIZED_EMAILS = [
  "testing@gmail.com",
  "admin2@domain.com",
  "admin3@domain.com",
] as const;

export const TABLE_RULES = {
  [TableType.VVIP]: {
    basePrice: 500_000,
    capacity: 5,
    maxPax: 6,
    extraFee: 0,
  },
  [TableType.VIP]: {
    basePrice: 400_000,
    capacity: 5,
    maxPax: 6,
    extraFee: 35_000,
  },
} as const;

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  [PaymentStatus.AVAILABLE]:
    "bg-slate-700/70 border-slate-500 text-[#FFEAEA] hover:bg-slate-700",
  [PaymentStatus.BOOKED]:
    "bg-sky-600/80 border-sky-400 text-[#FFEAEA] hover:bg-sky-600",
  [PaymentStatus.DEPOSIT_PAID]:
    "bg-amber-500/80 border-amber-300 text-slate-900 hover:bg-amber-500",
  [PaymentStatus.FULLY_PAID]:
    "bg-emerald-600/80 border-emerald-300 text-[#FFEAEA] hover:bg-emerald-600",
};

export const STATUS_LABELS: Record<PaymentStatus, string> = {
  [PaymentStatus.AVAILABLE]: "Available",
  [PaymentStatus.BOOKED]: "Booked",
  [PaymentStatus.DEPOSIT_PAID]: "Deposit Paid",
  [PaymentStatus.FULLY_PAID]: "Fully Paid",
};
