CREATE TABLE "PortfolioLike" (
  "visitorId" UUID PRIMARY KEY,
  "liked" BOOLEAN NOT NULL DEFAULT true
);
CREATE TABLE "PortfolioComment" (
  "id" UUID PRIMARY KEY,
  "visitorId" UUID NOT NULL,
  "name" VARCHAR(60) NOT NULL,
  "avatar" VARCHAR(16) NOT NULL,
  "topic" VARCHAR(80) NOT NULL,
  "message" VARCHAR(2000) NOT NULL,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "PortfolioComment_createdAt_id_idx" ON "PortfolioComment"("createdAt", "id");
CREATE INDEX "PortfolioComment_visitorId_createdAt_idx" ON "PortfolioComment"("visitorId", "createdAt");
