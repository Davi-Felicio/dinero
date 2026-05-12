-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "local_id" TEXT;

-- CreateTable
CREATE TABLE "sync_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "record_count" INTEGER NOT NULL,
    "conflicts" INTEGER NOT NULL DEFAULT 0,
    "error_message" TEXT,
    "synced_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sync_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sync_logs_user_id_synced_at_idx" ON "sync_logs"("user_id", "synced_at");

-- CreateIndex
CREATE INDEX "transactions_user_id_updated_at_idx" ON "transactions"("user_id", "updated_at");

-- CreateIndex
CREATE INDEX "transactions_user_id_local_id_idx" ON "transactions"("user_id", "local_id");
