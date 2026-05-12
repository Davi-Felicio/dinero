-- AlterTable
ALTER TABLE "assets"
ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'BRL',
ADD COLUMN "logo_url" TEXT,
ADD COLUMN "sector" TEXT;

-- AlterTable
ALTER TABLE "portfolio_assets"
ALTER COLUMN "quantity" TYPE DECIMAL(65,30) USING "quantity"::DECIMAL;

-- CreateTable
CREATE TABLE "portfolio_transactions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" DECIMAL(65,30) NOT NULL,
    "unit_price" DECIMAL(65,30) NOT NULL,
    "costs" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(65,30) NOT NULL,
    "operation_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "portfolio_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "portfolio_transactions_user_id_operation_date_idx" ON "portfolio_transactions"("user_id", "operation_date");

-- CreateIndex
CREATE INDEX "portfolio_transactions_asset_id_idx" ON "portfolio_transactions"("asset_id");

-- AddForeignKey
ALTER TABLE "portfolio_transactions" ADD CONSTRAINT "portfolio_transactions_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
