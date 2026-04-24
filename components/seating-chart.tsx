"use client";

import { PaymentStatus, TableType } from "@prisma/client";
import { PAYMENT_STATUS_COLORS, STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ReservationModal } from "@/components/ReservationModal";

type ReservationData = {
  id: string;
  customerName: string;
  customerPhone: string;
  pax: number;
  extraCharge: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  notes: string | null;
};

export type TableWithReservation = {
  id: string;
  type: TableType;
  basePrice: number;
  capacity: number;
  reservation: ReservationData | null;
};

const TABLE_LAYOUT: Record<string, { col: number; row: number }> = {
  B14: { col: 1, row: 2 },
  B12: { col: 3, row: 2 },
  B10: { col: 5, row: 2 },
  B15: { col: 1, row: 3 },
  B13: { col: 3, row: 3 },
  B11: { col: 5, row: 3 },
  B1: { col: 3, row: 5 },
  B2: { col: 3, row: 6 },
  B3: { col: 3, row: 7 },
  B4: { col: 3, row: 8 },
  B5: { col: 3, row: 9 },
  B8: { col: 1, row: 8 },
  B6: { col: 2, row: 8 },
  B9: { col: 1, row: 9 },
  B7: { col: 2, row: 9 },
  A16: { col: 5, row: 5 },
  A11: { col: 7, row: 5 },
  A6: { col: 9, row: 5 },
  A1: { col: 11, row: 5 },
  A17: { col: 5, row: 6 },
  A12: { col: 7, row: 6 },
  A7: { col: 9, row: 6 },
  A2: { col: 11, row: 6 },
  A18: { col: 5, row: 7 },
  A13: { col: 7, row: 7 },
  A8: { col: 9, row: 7 },
  A3: { col: 11, row: 7 },
  A19: { col: 5, row: 8 },
  A14: { col: 7, row: 8 },
  A9: { col: 9, row: 8 },
  A4: { col: 11, row: 8 },
  A20: { col: 5, row: 9 },
  A15: { col: 7, row: 9 },
  A10: { col: 9, row: 9 },
  A5: { col: 11, row: 9 },
};

export function SeatingChart({ tables }: { tables: TableWithReservation[] }) {
  return (
    <section className="space-y-4">
      <div className="grid gap-4 rounded-xl border border-[#9ECAD6]/60 bg-[#1f2937]/85 p-4 shadow-xl md:grid-cols-2">
        <Legend status={PaymentStatus.AVAILABLE} />
        <Legend status={PaymentStatus.BOOKED} />
        <Legend status={PaymentStatus.DEPOSIT_PAID} />
        <Legend status={PaymentStatus.FULLY_PAID} />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[#9ECAD6]/60 bg-[#111827]/80 p-4">
        <div
          className="relative mx-auto grid min-w-[820px] gap-3"
          style={{
            gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
            gridTemplateRows: "repeat(10, minmax(56px, auto))",
          }}
        >
          <StaticZone label="Kitchen" className="col-[1/7] row-[1/2]" />
          <StaticZone label="Stage" className="col-[9/13] row-[1/4]" />
          <StaticZone label="Bar" className="col-[1/3] row-[5/8]" />

          {tables.map((table) => {
            const pos = TABLE_LAYOUT[table.id];
            if (!pos) return null;
            const status = table.reservation?.paymentStatus ?? PaymentStatus.AVAILABLE;

            return (
              <div
                key={table.id}
                style={{ gridColumn: `${pos.col} / span 1`, gridRow: `${pos.row} / span 1` }}
              >
                <ReservationModal table={table}>
                  <button
                    className={cn(
                      "h-12 w-full rounded-md border text-sm font-semibold tracking-wide transition-transform hover:-translate-y-0.5",
                      table.type === TableType.VVIP && "ring-1 ring-[#F5CBCB]/50",
                      PAYMENT_STATUS_COLORS[status],
                    )}
                  >
                    {table.id}
                  </button>
                </ReservationModal>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Legend({ status }: { status: PaymentStatus }) {
  return (
    <div className="flex items-center gap-3 text-sm text-[#FFEAEA]">
      <span className={cn("h-3 w-3 rounded-full border", PAYMENT_STATUS_COLORS[status])} />
      <span>{STATUS_LABELS[status]}</span>
    </div>
  );
}

function StaticZone({ label, className }: { label: string; className: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl border border-[#9ECAD6]/50 bg-[#748DAE]/30 text-xl font-bold text-[#FFEAEA]/90",
        className,
      )}
    >
      {label}
    </div>
  );
}
