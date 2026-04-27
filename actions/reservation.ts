"use server";

import { PaymentStatus, ReservationHistoryStatus, type Prisma, type TableType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { isAuthorizedEmail, normalizeEmail } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { calculatePrice, canFitPax } from "@/lib/utils";

async function assertAuthorized() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email || !isAuthorizedEmail(email)) {
    throw new Error("Unauthorized");
  }

  return normalizeEmail(email);
}

function toHistoryStatus(status: PaymentStatus) {
  if (status === PaymentStatus.BOOKED) return ReservationHistoryStatus.BOOKED;
  if (status === PaymentStatus.DEPOSIT_PAID) return ReservationHistoryStatus.DEPOSIT_PAID;
  return ReservationHistoryStatus.FULLY_PAID;
}

async function createHistoryEntry(
  tx: Prisma.TransactionClient,
  {
    tableId,
    tableType,
    reservationDate,
    customerName,
    customerPhone,
    pax,
    extraCharge,
    totalAmount,
    status,
    notes,
    changedByEmail,
  }: {
    tableId: string;
    tableType: TableType;
    reservationDate: Date;
    customerName?: string | null;
    customerPhone?: string | null;
    pax?: number | null;
    extraCharge?: number | null;
    totalAmount?: number | null;
    status: ReservationHistoryStatus;
    notes?: string | null;
    changedByEmail?: string | null;
  },
) {
  await tx.reservationHistory.create({
    data: {
      tableId,
      tableType,
      reservationDate,
      customerName,
      customerPhone,
      pax,
      extraCharge,
      totalAmount,
      status,
      notes,
      changedByEmail,
    },
  });
}

const createReservationSchema = z.object({
  tableId: z.string().min(2),
  customerName: z.string().trim().min(2),
  customerPhone: z.string().trim().min(6),
  pax: z.coerce.number().int().min(1),
  notes: z.string().trim().optional(),
});

export async function createReservation(formData: FormData) {
  const changedByEmail = await assertAuthorized();
  const payload = createReservationSchema.parse({
    tableId: formData.get("tableId"),
    customerName: formData.get("customerName"),
    customerPhone: formData.get("customerPhone"),
    pax: formData.get("pax"),
    notes: formData.get("notes") || undefined,
  });

  const table = await prisma.table.findUnique({
    where: { id: payload.tableId },
    include: { reservation: true },
  });

  if (!table) {
    throw new Error("Table not found.");
  }

  if (table.reservation) {
    throw new Error("This table is already reserved.");
  }
  if (!canFitPax(table.type, payload.pax)) {
    throw new Error("Pax exceeds table limit.");
  }

  const { extraCharge, totalAmount } = calculatePrice(table.type, payload.pax);
  await prisma.$transaction(async (tx) => {
    const reservation = await tx.reservation.create({
      data: {
        tableId: table.id,
        customerName: payload.customerName,
        customerPhone: payload.customerPhone,
        pax: payload.pax,
        extraCharge,
        totalAmount,
        paymentStatus: PaymentStatus.BOOKED,
        notes: payload.notes,
      },
    });

    await createHistoryEntry(tx, {
      tableId: table.id,
      tableType: table.type,
      reservationDate: reservation.reservationDate,
      customerName: reservation.customerName,
      customerPhone: reservation.customerPhone,
      pax: reservation.pax,
      extraCharge: reservation.extraCharge,
      totalAmount: reservation.totalAmount,
      status: ReservationHistoryStatus.BOOKED,
      notes: reservation.notes,
      changedByEmail,
    });
  });

  revalidatePath("/");
}

const updateStatusSchema = z.object({
  reservationId: z.string().min(2),
  paymentStatus: z.nativeEnum(PaymentStatus),
});

const PAYMENT_FLOW: Record<PaymentStatus, PaymentStatus[]> = {
  [PaymentStatus.AVAILABLE]: [PaymentStatus.BOOKED],
  [PaymentStatus.BOOKED]: [PaymentStatus.DEPOSIT_PAID],
  [PaymentStatus.DEPOSIT_PAID]: [PaymentStatus.FULLY_PAID],
  [PaymentStatus.FULLY_PAID]: [],
};

export async function updatePaymentStatus(formData: FormData) {
  const changedByEmail = await assertAuthorized();
  const payload = updateStatusSchema.parse({
    reservationId: formData.get("reservationId"),
    paymentStatus: formData.get("paymentStatus"),
  });

  const reservation = await prisma.reservation.findUnique({
    where: { id: payload.reservationId },
    include: {
      table: true,
    },
  });
  if (!reservation) {
    throw new Error("Reservation not found.");
  }

  const allowedTransitions = PAYMENT_FLOW[reservation.paymentStatus];
  if (!allowedTransitions.includes(payload.paymentStatus)) {
    throw new Error("Invalid payment transition.");
  }

  await prisma.$transaction(async (tx) => {
    const updatedReservation = await tx.reservation.update({
      where: { id: payload.reservationId },
      data: { paymentStatus: payload.paymentStatus },
    });

    await createHistoryEntry(tx, {
      tableId: reservation.tableId,
      tableType: reservation.table.type,
      reservationDate: reservation.reservationDate,
      customerName: updatedReservation.customerName,
      customerPhone: updatedReservation.customerPhone,
      pax: updatedReservation.pax,
      extraCharge: updatedReservation.extraCharge,
      totalAmount: updatedReservation.totalAmount,
      status: toHistoryStatus(payload.paymentStatus),
      notes: updatedReservation.notes,
      changedByEmail,
    });
  });

  revalidatePath("/");
}

const cancelSchema = z.object({
  reservationId: z.string().min(2),
});

export async function cancelReservation(formData: FormData) {
  const changedByEmail = await assertAuthorized();
  const payload = cancelSchema.parse({
    reservationId: formData.get("reservationId"),
  });

  const reservation = await prisma.reservation.findUnique({
    where: { id: payload.reservationId },
    include: {
      table: true,
    },
  });

  if (!reservation) {
    throw new Error("Reservation not found.");
  }

  await prisma.$transaction(async (tx) => {
    await createHistoryEntry(tx, {
      tableId: reservation.tableId,
      tableType: reservation.table.type,
      reservationDate: reservation.reservationDate,
      customerName: reservation.customerName,
      customerPhone: reservation.customerPhone,
      pax: reservation.pax,
      extraCharge: reservation.extraCharge,
      totalAmount: reservation.totalAmount,
      status: ReservationHistoryStatus.UNBOOKED,
      notes: reservation.notes,
      changedByEmail,
    });

    await tx.reservation.delete({
      where: { id: payload.reservationId },
    });
  });

  revalidatePath("/");
}
