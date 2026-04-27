"use client";

import { PaymentStatus, TableType, type Reservation } from "@prisma/client";
import { STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ReservationModal } from "@/components/ReservationModal";

export type TableWithReservation = {
	id: string;
	type: TableType;
	basePrice: number;
	capacity: number;
	reservation: Reservation | null;
};

const TABLE_LAYOUT: Record<string, { col: number; row: number }> = {
	B14: { col: 1, row: 2 },
	B12: { col: 3, row: 2 },
	B10: { col: 5, row: 2 },
	B15: { col: 1, row: 3 },
	B13: { col: 3, row: 3 },
	B11: { col: 5, row: 3 },
	B1: { col: 5, row: 5 },
	B2: { col: 5, row: 6 },
	B3: { col: 5, row: 7 },
	B4: { col: 5, row: 8 },
	B5: { col: 5, row: 9 },
	B8: { col: 1, row: 8 },
	B6: { col: 3, row: 8 },
	B9: { col: 1, row: 9 },
	B7: { col: 3, row: 9 },
	A16: { col: 7, row: 5 },
	A11: { col: 9, row: 5 },
	A6: { col: 11, row: 5 },
	A1: { col: 13, row: 5 },
	A17: { col: 7, row: 6 },
	A12: { col: 9, row: 6 },
	A7: { col: 11, row: 6 },
	A2: { col: 13, row: 6 },
	A18: { col: 7, row: 7 },
	A13: { col: 9, row: 7 },
	A8: { col: 11, row: 7 },
	A3: { col: 13, row: 7 },
	A19: { col: 7, row: 8 },
	A14: { col: 9, row: 8 },
	A9: { col: 11, row: 8 },
	A4: { col: 13, row: 8 },
	A20: { col: 7, row: 9 },
	A15: { col: 9, row: 9 },
	A10: { col: 11, row: 9 },
	A5: { col: 13, row: 9 },
};

export function SeatingChart({ tables }: { tables: TableWithReservation[] }) {
	return (
		<section className="space-y-4">
			<div className="grid gap-4 rounded-xl border border-[#9ECAD6]/60 bg-[#1f2937]/85 p-4 shadow-xl md:grid-cols-3">
				<LegendBlock
					label="Red VVIP (A Tables)"
					className="bg-[#B02029] text-[#FFEAEA]"
				/>
				<LegendBlock
					label="Yellow VIP (B Tables)"
					className="bg-[#d5a91b] text-slate-900"
				/>
				<div className="grid gap-1 text-xs text-[#FFEAEA]/85">
					<LegendStatus status={PaymentStatus.AVAILABLE} color="bg-slate-500" />
					<LegendExtraPerson />
					<LegendStatus status={PaymentStatus.BOOKED} color="bg-[#8B5A2B]" />
					<LegendStatus
						status={PaymentStatus.DEPOSIT_PAID}
						color="bg-sky-500"
					/>
					<LegendStatus
						status={PaymentStatus.FULLY_PAID}
						color="bg-emerald-500"
					/>
				</div>
			</div>

			<div className="overflow-x-auto rounded-2xl border border-[#9ECAD6]/60 bg-[#f6efe4] p-6">
				<div
					className="relative mx-auto grid min-w-[740px] gap-3.5"
					style={{
						gridTemplateColumns: "repeat(13, minmax(0, 1fr))",
						gridTemplateRows: "repeat(9, minmax(58px, auto))",
					}}
				>
					<StaticLabel label="Kitchen" className="col-[1/7] row-[1/2]" />
					<StaticZone
						label="Stage"
						className="col-[7/14] row-[1/4] w-full"
						black
					/>
					<StaticZone label="Bar" className="col-[1/4] row-[5/8]" black />

					{tables.map((table) => {
						const pos = TABLE_LAYOUT[table.id];
						if (!pos) return null;
						const status =
							table.reservation?.paymentStatus ?? PaymentStatus.AVAILABLE;

						return (
							<div
								key={table.id}
								style={{
									gridColumn: `${pos.col} / span 1`,
									gridRow: `${pos.row} / span 1`,
								}}
							>
								<ReservationModal table={table}>
									<button
										className={cn(
											"relative h-12 w-full rounded-[4px] border text-lg font-bold tracking-wide shadow-sm transition-transform hover:-translate-y-0.5",
											getSeatColorClasses(table, status),
										)}
									>
										{table.id}
										<StatusDot status={status} />
									</button>
								</ReservationModal>
							</div>
						);
					})}
				</div>

				<div className="mt-8 grid gap-6 border-t border-[#dccdb5] pt-6 text-center md:grid-cols-2">
					<div>
						<p className="text-3xl font-semibold italic text-[#B02029]">
							Red VVIP For 500000
						</p>
						<p className="mt-3 text-xl font-semibold text-slate-800">
							1 table = 5 pax
						</p>
						<p className="mt-1 text-2xl font-semibold text-slate-900">
							1 Extra = 35000
						</p>
					</div>
					<div>
						<p className="text-3xl font-semibold italic text-[#b8890f]">
							Yellow VIP For 400000
						</p>
						<p className="mt-3 text-xl font-semibold text-slate-800">
							1 table = 5 pax
						</p>
						<p className="mt-1 text-2xl font-semibold text-slate-900">
							1 Extra = 35000
						</p>
					</div>
				</div>
			</div>
		</section>
	);
}

function LegendBlock({
	label,
	className,
}: {
	label: string;
	className: string;
}) {
	return (
		<div
			className={cn(
				"rounded-md border border-black/20 px-3 py-2 text-sm font-semibold",
				className,
			)}
		>
			{label}
		</div>
	);
}

function LegendStatus({
	status,
	color,
}: {
	status: PaymentStatus;
	color: string;
}) {
	return (
		<div className="flex items-center gap-2">
			<span className={cn("h-2.5 w-2.5 rounded-full", color)} />
			<span>{STATUS_LABELS[status]}</span>
		</div>
	);
}

function LegendExtraPerson() {
	return (
		<div className="flex items-center gap-2">
			<span className="h-2.5 w-2.5 rounded-full border-2 border-black bg-transparent" />
			<span>Black border = Extra person</span>
		</div>
	);
}

function StaticLabel({
	label,
	className,
}: {
	label: string;
	className: string;
}) {
	return (
		<div
			className={cn(
				"flex items-center justify-center text-4xl font-semibold text-slate-800",
				className,
			)}
		>
			{label}
		</div>
	);
}

function StaticZone({
	label,
	className,
	black = false,
}: {
	label: string;
	className: string;
	black?: boolean;
}) {
	return (
		<div
			className={cn(
				"flex items-center justify-center rounded-md border text-4xl font-semibold shadow-md",
				black
					? "border-slate-700 bg-slate-950 text-white"
					: "border-[#9ECAD6]/50 bg-[#748DAE]/30 text-[#FFEAEA]/90",
				className,
			)}
		>
			{label}
		</div>
	);
}

function StatusDot({ status }: { status: PaymentStatus }) {
	if (status === PaymentStatus.AVAILABLE) return null;
	const color =
		status === PaymentStatus.BOOKED
			? "bg-[#8B5A2B]"
			: status === PaymentStatus.DEPOSIT_PAID
				? "bg-sky-500"
				: "bg-emerald-500";
	return (
		<span
			className={cn(
				"absolute -right-1 -top-1 h-3 w-3 rounded-full border border-white",
				color,
			)}
		/>
	);
}

function getSeatColorClasses(
	table: TableWithReservation,
	status: PaymentStatus,
) {
	const hasExtraPax = Boolean(
		table.reservation && table.reservation.pax > table.capacity,
	);
	const typeColor =
		table.type === TableType.VVIP ? "text-[#B02029]" : "text-[#d5a91b]";

	if (status !== PaymentStatus.AVAILABLE) {
		return cn(
			"bg-[#6B6D70] opacity-90",
			typeColor,
			hasExtraPax ? "border-black ring-3 ring-black" : "border-[#6B6D70]",
		);
	}

	return table.type === TableType.VVIP
		? "border-[#B02029] bg-[#B02029] text-[#FFEAEA]"
		: "border-[#b68f18] bg-[#d5a91b] text-slate-900";
}
