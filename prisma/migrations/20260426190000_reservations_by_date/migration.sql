-- Add reservation dates for date-based dashboard views
ALTER TABLE "Reservation"
ADD COLUMN "reservationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "ReservationHistory"
ADD COLUMN "reservationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Replace the one-reservation-per-table rule with one-reservation-per-table-per-date
DROP INDEX "Reservation_tableId_key";

CREATE UNIQUE INDEX "Reservation_tableId_reservationDate_key"
ON "Reservation"("tableId", "reservationDate");

CREATE INDEX "Reservation_reservationDate_idx"
ON "Reservation"("reservationDate");

CREATE INDEX "ReservationHistory_reservationDate_createdAt_idx"
ON "ReservationHistory"("reservationDate", "createdAt" DESC);
