-- Additive migration: existing visits, likes and comments remain intact.
ALTER TABLE "PortfolioVisitor" ADD COLUMN "blockedAt" TIMESTAMPTZ(3);
INSERT INTO "PortfolioVisitor" ("id") SELECT "visitorId" FROM "PortfolioComment" UNION SELECT "visitorId" FROM "PortfolioLike" ON CONFLICT DO NOTHING;
ALTER TABLE "PortfolioLike" ADD CONSTRAINT "PortfolioLike_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "PortfolioVisitor"("id") ON DELETE CASCADE;
ALTER TABLE "PortfolioComment"
 ADD COLUMN "scope" VARCHAR(20) NOT NULL DEFAULT 'portfolio',
 ADD COLUMN "projectId" UUID,
 ADD COLUMN "category" VARCHAR(40),
 ADD COLUMN "parentId" UUID,
 ADD COLUMN "status" VARCHAR(12) NOT NULL DEFAULT 'APPROVED',
 ADD COLUMN "authorRole" VARCHAR(10) NOT NULL DEFAULT 'VISITOR',
 ADD COLUMN "pinned" BOOLEAN NOT NULL DEFAULT false,
 ADD CONSTRAINT "PortfolioComment_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "PortfolioVisitor"("id") ON DELETE RESTRICT,
 ADD CONSTRAINT "PortfolioComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "PortfolioComment"("id") ON DELETE RESTRICT,
 ADD CONSTRAINT "PortfolioComment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL,
 ADD CONSTRAINT "PortfolioComment_status_check" CHECK ("status" IN ('APPROVED','PENDING','HIDDEN','DELETED')),
 ADD CONSTRAINT "PortfolioComment_role_check" CHECK ("authorRole" IN ('VISITOR','OWNER'));
CREATE INDEX "PortfolioComment_scope_status_parentId_createdAt_idx" ON "PortfolioComment"("scope","status","parentId","createdAt");
CREATE TABLE "CommentAttachment" (
 "id" UUID PRIMARY KEY, "visitorId" UUID NOT NULL REFERENCES "PortfolioVisitor"("id") ON DELETE CASCADE,
 "commentId" UUID REFERENCES "PortfolioComment"("id") ON DELETE CASCADE,
 "storageKey" VARCHAR(50) NOT NULL UNIQUE, "width" INT NOT NULL, "height" INT NOT NULL, "bytes" INT NOT NULL,
 "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "CommentAttachment_dimensions_check" CHECK ("width">0 AND "height">0 AND "bytes">0 AND "bytes"<=5242880)
);
CREATE INDEX "CommentAttachment_visitorId_commentId_createdAt_idx" ON "CommentAttachment"("visitorId","commentId","createdAt");
CREATE TABLE "CommunityReaction" (
 "id" UUID PRIMARY KEY, "visitorId" UUID NOT NULL REFERENCES "PortfolioVisitor"("id") ON DELETE CASCADE,
 "targetKey" VARCHAR(80) NOT NULL, "commentId" UUID REFERENCES "PortfolioComment"("id") ON DELETE CASCADE,
 "emoji" VARCHAR(16) NOT NULL, "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "CommunityReaction_target_check" CHECK (("targetKey"='portfolio' AND "commentId" IS NULL) OR ("commentId" IS NOT NULL AND "targetKey"="commentId"::text)),
 CONSTRAINT "CommunityReaction_emoji_check" CHECK ("emoji" IN ('❤️','🔥','🚀','👏','💡'))
);
CREATE UNIQUE INDEX "CommunityReaction_visitorId_targetKey_key" ON "CommunityReaction"("visitorId","targetKey");
CREATE INDEX "CommunityReaction_targetKey_emoji_idx" ON "CommunityReaction"("targetKey","emoji");
CREATE TABLE "CommentReport" (
 "id" UUID PRIMARY KEY, "visitorId" UUID NOT NULL REFERENCES "PortfolioVisitor"("id") ON DELETE CASCADE,
 "commentId" UUID NOT NULL REFERENCES "PortfolioComment"("id") ON DELETE CASCADE,
 "reason" VARCHAR(20) NOT NULL, "detail" VARCHAR(500), "status" VARCHAR(12) NOT NULL DEFAULT 'OPEN',
 "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "CommentReport_visitorId_commentId_key" ON "CommentReport"("visitorId","commentId");
CREATE INDEX "CommentReport_status_createdAt_idx" ON "CommentReport"("status","createdAt");
CREATE TABLE "ModerationAction" (
 "id" UUID PRIMARY KEY, "action" VARCHAR(20) NOT NULL, "commentId" UUID, "participantId" UUID,
 "actor" VARCHAR(20) NOT NULL DEFAULT 'OWNER', "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "ModerationAction_createdAt_idx" ON "ModerationAction"("createdAt");
