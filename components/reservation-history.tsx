"use client";

import { ReservationHistoryStatus, TableType } from "@prisma/client";
import { History } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HISTORY_STATUS_COLORS, HISTORY_STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const FILTERS = [
	"ALL",
	ReservationHistoryStatus.BOOKED,
	ReservationHistoryStatus.UNBOOKED,
	ReservationHistoryStatus.DEPOSIT_PAID,
	ReservationHistoryStatus.FULLY_PAID,
] as const;

type HistoryFilter = (typeof FILTERS)[number];

export type ReservationHistoryItem = {
	id: string;
	tableId: string;
	tableType: TableType;
	reservationDate: string;
	customerName: string | null;
	customerPhone: string | null;
	pax: number | null;
	extraCharge: number | null;
	totalAmount: number | null;
	status: ReservationHistoryStatus;
	notes: string | null;
	changedByEmail: string | null;
	createdAt: string;
};

const currencyFormatter = new Intl.NumberFormat("en-US");
const dateFormatter = new Intl.DateTimeFormat("en-US", {
	dateStyle: "medium",
	timeStyle: "short",
});

export function ReservationHistory({
	events,
	selectedDate,
}: {
	events: ReservationHistoryItem[];
	selectedDate: string;
}) {
	const [filter, setFilter] = useState<HistoryFilter>("ALL");

	const filteredEvents =
		filter === "ALL"
			? events
			: events.filter((event) => event.status === filter);

	return (
		<section className="rounded-2xl border border-[#9ECAD6]/60 bg-[#1f2937]/85 p-5 shadow-xl">
			<div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
				<div>
					<div className="flex items-center gap-2 text-[#FFEAEA]">
						<History className="h-5 w-5" />
						<h2 className="text-xl font-semibold">Reservation History</h2>
					</div>
					<p className="mt-1 text-sm text-[#FFEAEA]/70">
						Review booking, unbooking, deposit payment, and full payment
						updates.
					</p>
				</div>

				<form className="flex flex-wrap items-end gap-2">
					<div className="grid gap-1">
						<Input
							id="history-date"
							name="historyDate"
							type="date"
							defaultValue={selectedDate}
							className="h-9 min-w-44 border-[#9ECAD6]/60 bg-[#6c80ae] text-[#FFEAEA]"
						/>
					</div>
					<Button type="submit" variant="outline" className="h-9">
						Filter
					</Button>
					{selectedDate ? (
						<Button asChild variant="ghost" className="h-9">
							<a href="/">Clear</a>
						</Button>
					) : null}
				</form>
			</div>

			<div className="mt-4 flex flex-wrap gap-2">
				{FILTERS.map((option) => {
					const active = filter === option;
					const count =
						option === "ALL"
							? events.length
							: events.filter((event) => event.status === option).length;

					return (
						<Button
							key={option}
							type="button"
							variant={active ? "default" : "outline"}
							className={cn(
								"h-9 gap-2 px-3",
								!active &&
									"border-[#9ECAD6]/60 text-[#FFEAEA]/85 hover:bg-[#748DAE]/20",
							)}
							onClick={() => setFilter(option)}
						>
							<span>
								{option === "ALL" ? "All" : HISTORY_STATUS_LABELS[option]}
							</span>
							<span className="rounded-full bg-black/15 px-2 py-0.5 text-xs">
								{count}
							</span>
						</Button>
					);
				})}
			</div>

			<div className="mt-5 space-y-3">
				{filteredEvents.length === 0 ? (
					<div className="rounded-xl border border-dashed border-[#9ECAD6]/45 px-4 py-10 text-center text-sm text-[#FFEAEA]/70">
						No reservation history for this filter yet.
					</div>
				) : (
					filteredEvents.map((event) => (
						<article
							key={event.id}
							className="grid gap-3 rounded-xl border border-[#9ECAD6]/45 bg-[#0f172a]/70 px-4 py-4 md:grid-cols-[minmax(0,1fr)_auto]"
						>
							<div className="space-y-2">
								<div className="flex flex-wrap items-center gap-2">
									<span className="text-lg font-semibold text-[#FFEAEA]">
										{event.tableId}
									</span>
									<span
										className={cn(
											"rounded-full border px-2.5 py-1 text-xs font-semibold",
											HISTORY_STATUS_COLORS[event.status],
										)}
									>
										{HISTORY_STATUS_LABELS[event.status]}
									</span>
									<span className="text-xs uppercase tracking-wide text-[#FFEAEA]/50">
										{event.tableType}
									</span>
								</div>

								<div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#FFEAEA]/80">
									<span>Customer: {event.customerName ?? "-"}</span>
									<span>Phone: {event.customerPhone ?? "-"}</span>
									<span>Pax: {event.pax ?? "-"}</span>
									<span>
										Total:{" "}
										{event.totalAmount == null
											? "-"
											: `${currencyFormatter.format(event.totalAmount)} MMK`}
									</span>
								</div>

								<div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#FFEAEA]/60">
									<span>
										Extra Charge:{" "}
										{event.extraCharge == null
											? "-"
											: `${currencyFormatter.format(event.extraCharge)} MMK`}
									</span>
									<span>Changed by: {event.changedByEmail ?? "Unknown"}</span>
								</div>

								{event.notes ? (
									<p className="text-sm text-[#F5CBCB]">Notes: {event.notes}</p>
								) : null}
							</div>

							<div className="text-sm text-[#FFEAEA]/70 md:text-right">
								{dateFormatter.format(new Date(event.createdAt))}
							</div>
						</article>
					))
				)}
			</div>
		</section>
	);
}
