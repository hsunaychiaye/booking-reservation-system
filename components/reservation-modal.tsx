"use client";

import { PaymentStatus, TableType } from "@prisma/client";
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
import { calculatePrice } from "@/lib/utils";
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
  const quote = calculatePrice(table.type, pax);

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
              <Input
                id={`pax-${table.id}`}
                name="pax"
                type="number"
                min={1}
                max={TABLE_RULES[table.type].maxPax}
                value={pax}
                onChange={(event) => setPax(Number(event.target.value || table.capacity))}
              />
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
                <input type="hidden" name="tableId" value={table.id} />
                <input
                  type="hidden"
                  name="paymentStatus"
                  value={
                    status === PaymentStatus.BOOKED
                      ? PaymentStatus.DEPOSIT_PAID
                      : PaymentStatus.FULLY_PAID
                  }
                />
                <Button type="submit" disabled={pending} className="w-full">
                  {status === PaymentStatus.BOOKED ? "Mark Deposit Paid" : "Mark Fully Paid"}
                </Button>
              </form>
            )}
            <form action={submitCancel}>
              <input type="hidden" name="tableId" value={table.id} />
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
  if (tableType === TableType.VVIP) {
    return <p className="text-xs text-[#FFEAEA]/75">VVIP supports up to 1 extra person at no fee.</p>;
  }
  const extra = Math.max(0, pax - 5);
  return (
    <p className="text-xs text-[#FFEAEA]/75">
      VIP extra rule: {extra} extra x 35,000 MMK if pax exceeds 5.
    </p>
  );
}

function ReservationInfo({ table }: { table: TableWithReservation }) {
  if (!table.reservation) return null;
  const reservation = table.reservation;

  return (
    <div className="rounded-md border border-[#9ECAD6]/50 bg-[#0f172a] p-4 text-sm text-[#FFEAEA]">
      <p>
        <span className="text-[#F5CBCB]">Customer:</span> {reservation.customerName}
      </p>
      <p>
        <span className="text-[#F5CBCB]">Phone:</span> {reservation.customerPhone}
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
      {reservation.notes && (
        <p>
          <span className="text-[#F5CBCB]">Notes:</span> {reservation.notes}
        </p>
      )}
    </div>
  );
}
