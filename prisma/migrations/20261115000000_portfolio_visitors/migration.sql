CREATE TABLE "PortfolioVisitor" (
  "id" UUID NOT NULL,
  "firstSeen" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastSeen" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PortfolioVisitor_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "PortfolioVisitor_firstSeen_idx" ON "PortfolioVisitor"("firstSeen");
CREATE INDEX "PortfolioVisitor_lastSeen_idx" ON "PortfolioVisitor"("lastSeen");
