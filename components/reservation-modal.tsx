"use client";

import { PaymentStatus, TableType } from "@prisma/client";
import { Minus, Plus } from "lucide-react";
import { startTransition, useState } from "react";
import { toast } from "sonner";
import {
  cancelReservation,
  createReservation,
  updatePaymentStatus,
} from "@/actions/reservation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { STATUS_LABELS, TABLE_RULES } from "@/lib/constants";
import { calculatePrice, formatDateLabel } from "@/lib/utils";
import type { TableWithReservation } from "@/components/seating-chart";

export function ReservationModal({
  children,
  table,
}: {
  children: React.ReactNode;
  table: TableWithReservation;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [pax, setPax] = useState<number>(table.reservation?.pax ?? table.capacity);
  const status = table.reservation?.paymentStatus ?? PaymentStatus.AVAILABLE;
  const maxPax = TABLE_RULES[table.type].maxPax;
  const quote = calculatePrice(table.type, pax);
  const depositAmount = getDepositAmount(table.basePrice);

  const setClampedPax = (nextPax: number) => {
    setPax(Math.min(maxPax, Math.max(1, nextPax)));
  };

  const submitCreate = (formData: FormData) => {
    setPending(true);
    startTransition(async () => {
      try {
        await createReservation(formData);
        toast.success(`${table.id} booked successfully.`);
        setOpen(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to reserve table.");
      } finally {
        setPending(false);
      }
    });
  };

  const submitStatus = (formData: FormData) => {
    setPending(true);
    startTransition(async () => {
      try {
        await updatePaymentStatus(formData);
        toast.success(`${table.id} payment status updated.`);
        setOpen(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to update status.");
      } finally {
        setPending(false);
      }
    });
  };

  const submitCancel = (formData: FormData) => {
    setPending(true);
    startTransition(async () => {
      try {
        await cancelReservation(formData);
        toast.success(`${table.id} reservation canceled.`);
        setOpen(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to cancel reservation.");
      } finally {
        setPending(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Table {table.id} ({table.type})
          </DialogTitle>
          <DialogDescription>
            Base: {table.basePrice.toLocaleString()} MMK / {table.capacity} pax
          </DialogDescription>
        </DialogHeader>

        {status === PaymentStatus.AVAILABLE ? (
          <form action={submitCreate} className="space-y-4">
            <input type="hidden" name="tableId" value={table.id} />
            <div className="grid gap-2">
              <Label htmlFor={`customer-${table.id}`}>Customer name</Label>
              <Input
                id={`customer-${table.id}`}
                name="customerName"
                required
                placeholder="Customer full name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`phone-${table.id}`}>Phone number</Label>
              <Input id={`phone-${table.id}`} name="customerPhone" required placeholder="09xxxxxx" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`pax-${table.id}`}>Pax</Label>
              <div className="grid grid-cols-[44px_minmax(0,1fr)_44px] gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 px-0"
                  disabled={pax <= 1}
                  onClick={() => setClampedPax(pax - 1)}
                  aria-label="Decrease pax"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  id={`pax-${table.id}`}
                  name="pax"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={maxPax}
                  value={pax}
                  className="h-11 text-center text-base font-semibold"
                  onChange={(event) => setClampedPax(Number(event.target.value || table.capacity))}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 px-0"
                  disabled={pax >= maxPax}
                  onClick={() => setClampedPax(pax + 1)}
                  aria-label="Increase pax"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-[#FFEAEA]/60">Maximum {maxPax} pax.</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`notes-${table.id}`}>Notes</Label>
              <Textarea id={`notes-${table.id}`} name="notes" placeholder="Optional notes..." />
            </div>
            <PricePreview tableType={table.type} pax={pax} />
            <div className="rounded-md border border-[#9ECAD6]/50 bg-[#0f172a] p-3 text-sm text-[#FFEAEA]">
              Total: {quote.totalAmount.toLocaleString()} MMK
              {quote.extraCharge > 0 && (
                <span className="ml-2 text-[#F5CBCB]">
                  (Extra: {quote.extraCharge.toLocaleString()} MMK)
                </span>
              )}
            </div>
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? "Saving..." : "Reserve Table"}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <ReservationInfo table={table} />
            {status !== PaymentStatus.FULLY_PAID && (
              <form action={submitStatus} className="space-y-3">
                <input type="hidden" name="reservationId" value={table.reservation!.id} />
                <input
                  type="hidden"
                  name="paymentStatus"
                  value={
                    status === PaymentStatus.BOOKED
                      ? PaymentStatus.DEPOSIT_PAID
                      : PaymentStatus.FULLY_PAID
                  }
                />
                {status === PaymentStatus.BOOKED ? (
                  <div className="rounded-md border border-sky-300/50 bg-sky-500/10 p-3 text-sm text-sky-100">
                    Deposit amount: {depositAmount.toLocaleString()} MMK
                  </div>
                ) : null}
                <Button type="submit" disabled={pending} className="w-full">
                  {status === PaymentStatus.BOOKED
                    ? `Mark Deposit Paid (${depositAmount.toLocaleString()} MMK)`
                    : "Mark Fully Paid"}
                </Button>
              </form>
            )}
            <form action={submitCancel}>
              <input type="hidden" name="reservationId" value={table.reservation!.id} />
              <Button type="submit" variant="danger" disabled={pending} className="w-full">
                Cancel Reservation
              </Button>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function PricePreview({ tableType, pax }: { tableType: TableType; pax: number }) {
  const extra = Math.max(0, pax - 5);
  const label = tableType === TableType.VVIP ? "VVIP" : "VIP";
  return (
    <p className="text-xs text-[#FFEAEA]/75">
      {label} extra rule: {extra} extra x 35,000 MMK if pax exceeds 5.
    </p>
  );
}

function getDepositAmount(basePrice: number) {
  return Math.floor(basePrice / 2);
}

function ReservationInfo({ table }: { table: TableWithReservation }) {
  if (!table.reservation) return null;
  const reservation = table.reservation;
  const depositAmount = getDepositAmount(table.basePrice);

  return (
    <div className="rounded-md border border-[#9ECAD6]/50 bg-[#0f172a] p-4 text-sm text-[#FFEAEA]">
      <p>
        <span className="text-[#F5CBCB]">Customer:</span> {reservation.customerName}
      </p>
      <p>
        <span className="text-[#F5CBCB]">Phone:</span> {reservation.customerPhone}
      </p>
      <p>
        <span className="text-[#F5CBCB]">Reservation Date:</span>{" "}
        {formatDateLabel(reservation.reservationDate.toISOString().slice(0, 10))}
      </p>
      <p>
        <span className="text-[#F5CBCB]">Pax:</span> {reservation.pax}
      </p>
      <p>
        <span className="text-[#F5CBCB]">Status:</span> {STATUS_LABELS[reservation.paymentStatus]}
      </p>
      <p>
        <span className="text-[#F5CBCB]">Total:</span> {reservation.totalAmount.toLocaleString()} MMK
      </p>
      {reservation.paymentStatus === PaymentStatus.BOOKED && (
        <p>
          <span className="text-[#F5CBCB]">Deposit Due:</span>{" "}
          {depositAmount.toLocaleString()} MMK
        </p>
      )}
      {reservation.paymentStatus === PaymentStatus.DEPOSIT_PAID && (
        <p>
          <span className="text-[#F5CBCB]">Remaining:</span>{" "}
          {Math.max(0, reservation.totalAmount - depositAmount).toLocaleString()} MMK
        </p>
      )}
      {reservation.notes && (
        <p>
          <span className="text-[#F5CBCB]">Notes:</span> {reservation.notes}
        </p>
      )}
    </div>
  );
}
