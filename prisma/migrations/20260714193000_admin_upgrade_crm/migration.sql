-- AlterTable AdminUser
ALTER TABLE "AdminUser" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "AdminUser" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable Customer
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "city" TEXT,
    "address" TEXT,
    "notes" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable ContactRequest
CREATE TABLE "ContactRequest" (
    "id" TEXT NOT NULL,
    "source" VARCHAR(30) NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'new',
    "sessionId" TEXT,
    "customerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable OrderEvent
CREATE TABLE "OrderEvent" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "eventType" VARCHAR(40) NOT NULL,
    "fromValue" TEXT,
    "toValue" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderEvent_pkey" PRIMARY KEY ("id")
);

-- AlterTable Order
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "customerId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Customer_email_key" ON "Customer"("email");
CREATE INDEX IF NOT EXISTS "Customer_phone_idx" ON "Customer"("phone");
CREATE INDEX IF NOT EXISTS "Customer_lastName_firstName_idx" ON "Customer"("lastName", "firstName");
CREATE INDEX IF NOT EXISTS "ContactRequest_status_idx" ON "ContactRequest"("status");
CREATE INDEX IF NOT EXISTS "ContactRequest_createdAt_idx" ON "ContactRequest"("createdAt");
CREATE INDEX IF NOT EXISTS "ContactRequest_customerId_idx" ON "ContactRequest"("customerId");
CREATE INDEX IF NOT EXISTS "OrderEvent_orderId_idx" ON "OrderEvent"("orderId");
CREATE INDEX IF NOT EXISTS "OrderEvent_createdAt_idx" ON "OrderEvent"("createdAt");
CREATE INDEX IF NOT EXISTS "Order_customerId_idx" ON "Order"("customerId");
CREATE INDEX IF NOT EXISTS "Order_createdAt_idx" ON "Order"("createdAt");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ContactRequest" ADD CONSTRAINT "ContactRequest_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OrderEvent" ADD CONSTRAINT "OrderEvent_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
