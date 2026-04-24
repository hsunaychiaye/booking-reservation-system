"use server";

import { PaymentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { AUTHORIZED_EMAILS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { calculatePrice, canFitPax } from "@/lib/utils";

async function assertAuthorized() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email || !AUTHORIZED_EMAILS.includes(email as (typeof AUTHORIZED_EMAILS)[number])) {
    throw new Error("Unauthorized");
  }
}

const createReservationSchema = z.object({
  tableId: z.string().min(2),
  customerName: z.string().trim().min(2),
  customerPhone: z.string().trim().min(6),
  pax: z.coerce.number().int().min(1),
  notes: z.string().trim().optional(),
});

export async function createReservation(formData: FormData) {
  await assertAuthorized();
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
  await prisma.reservation.create({
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

  revalidatePath("/");
}

const updateStatusSchema = z.object({
  tableId: z.string().min(2),
  paymentStatus: z.nativeEnum(PaymentStatus),
});

const PAYMENT_FLOW: Record<PaymentStatus, PaymentStatus[]> = {
  [PaymentStatus.AVAILABLE]: [PaymentStatus.BOOKED],
  [PaymentStatus.BOOKED]: [PaymentStatus.DEPOSIT_PAID],
  [PaymentStatus.DEPOSIT_PAID]: [PaymentStatus.FULLY_PAID],
  [PaymentStatus.FULLY_PAID]: [],
};

export async function updatePaymentStatus(formData: FormData) {
  await assertAuthorized();
  const payload = updateStatusSchema.parse({
    tableId: formData.get("tableId"),
    paymentStatus: formData.get("paymentStatus"),
  });

  const reservation = await prisma.reservation.findUnique({
    where: { tableId: payload.tableId },
  });
  if (!reservation) {
    throw new Error("Reservation not found.");
  }

  const allowedTransitions = PAYMENT_FLOW[reservation.paymentStatus];
  if (!allowedTransitions.includes(payload.paymentStatus)) {
    throw new Error("Invalid payment transition.");
  }

  await prisma.reservation.update({
    where: { tableId: payload.tableId },
    data: { paymentStatus: payload.paymentStatus },
  });

  revalidatePath("/");
}

const cancelSchema = z.object({
  tableId: z.string().min(2),
});

export async function cancelReservation(formData: FormData) {
  await assertAuthorized();
  const payload = cancelSchema.parse({
    tableId: formData.get("tableId"),
  });

  await prisma.reservation.delete({
    where: { tableId: payload.tableId },
  });

  revalidatePath("/");
}
