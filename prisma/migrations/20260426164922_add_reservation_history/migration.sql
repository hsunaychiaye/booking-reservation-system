-- CreateEnum
CREATE TYPE "ReservationHistoryStatus" AS ENUM ('BOOKED', 'UNBOOKED', 'DEPOSIT_PAID', 'FULLY_PAID');

-- CreateTable
CREATE TABLE "ReservationHistory" (
    "id" TEXT NOT NULL,
    "tableId" TEXT NOT NULL,
    "tableType" "TableType" NOT NULL,
    "customerName" TEXT,
    "customerPhone" TEXT,
    "pax" INTEGER,
    "extraCharge" INTEGER,
    "totalAmount" INTEGER,
    "status" "ReservationHistoryStatus" NOT NULL,
    "notes" TEXT,
    "changedByEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReservationHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReservationHistory_createdAt_idx" ON "ReservationHistory"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "ReservationHistory_status_createdAt_idx" ON "ReservationHistory"("status", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "ReservationHistory" ADD CONSTRAINT "ReservationHistory_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table"("id") ON DELETE CASCADE ON UPDATE CASCADE;
