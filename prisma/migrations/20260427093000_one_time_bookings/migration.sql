-- Restore one active reservation per table
DROP INDEX IF EXISTS "Reservation_tableId_reservationDate_key";

CREATE UNIQUE INDEX "Reservation_tableId_key"
ON "Reservation"("tableId");
