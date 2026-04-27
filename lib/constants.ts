import { PaymentStatus, ReservationHistoryStatus, TableType } from "@prisma/client";

export const AUTHORIZED_EMAILS = [
  "admin1@gmail.com",
  "admin2@gmail.com",
  "admin3@gmail.com",
] as const;

export const ADMIN_CREDENTIALS: Record<(typeof AUTHORIZED_EMAILS)[number], string> = {
  "admin1@gmail.com": "admin1",
  "admin2@gmail.com": "admin2",
  "admin3@gmail.com": "admin3",
};

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isAuthorizedEmail(email: string | null | undefined) {
  if (!email) return false;
  return AUTHORIZED_EMAILS.includes(normalizeEmail(email) as (typeof AUTHORIZED_EMAILS)[number]);
}

export const TABLE_RULES = {
  [TableType.VVIP]: {
    basePrice: 500_000,
    capacity: 5,
    maxPax: 6,
    extraFee: 35_000,
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
    "bg-orange-600/80 border-orange-300 text-white hover:bg-orange-600",
  [PaymentStatus.FULLY_PAID]:
    "bg-emerald-600/80 border-emerald-300 text-[#FFEAEA] hover:bg-emerald-600",
};

export const STATUS_LABELS: Record<PaymentStatus, string> = {
  [PaymentStatus.AVAILABLE]: "Available",
  [PaymentStatus.BOOKED]: "Booked",
  [PaymentStatus.DEPOSIT_PAID]: "Deposit Paid",
  [PaymentStatus.FULLY_PAID]: "Fully Paid",
};

export const HISTORY_STATUS_LABELS: Record<ReservationHistoryStatus, string> = {
  [ReservationHistoryStatus.BOOKED]: "Booked",
  [ReservationHistoryStatus.UNBOOKED]: "Unbooked",
  [ReservationHistoryStatus.DEPOSIT_PAID]: "Deposit Paid",
  [ReservationHistoryStatus.FULLY_PAID]: "Fully Paid",
};

export const HISTORY_STATUS_COLORS: Record<ReservationHistoryStatus, string> = {
  [ReservationHistoryStatus.BOOKED]:
    "border-sky-300/70 bg-sky-500/20 text-sky-100",
  [ReservationHistoryStatus.UNBOOKED]:
    "border-slate-400/70 bg-slate-500/20 text-slate-100",
  [ReservationHistoryStatus.DEPOSIT_PAID]:
    "border-orange-300/70 bg-orange-500/20 text-orange-100",
  [ReservationHistoryStatus.FULLY_PAID]:
    "border-emerald-300/70 bg-emerald-500/20 text-emerald-100",
};
